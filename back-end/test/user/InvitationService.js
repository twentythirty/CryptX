"use strict";

let app = require("../../app");
let chai = require("chai");
let asPromised = require('chai-as-promised');
let should = chai.should();
const sinon = require("sinon");

chai.use(asPromised);

describe('InvitationService testing', () => {

    //ensure working DB before test
    before(done => {

        app.dbPromise.then(migrations => {
            console.log("Migraitions: %o", migrations);
            done();
        })
    });

    const inviteService = require('./../../services/InvitationService');
    const User = require("../../models").User;
    const Role = require("../../models").Role;
    const UserInvitation = require('../../models').UserInvitation;

    const NO_USER_MAIL = 'nouser@cryptx.io',
        USER_EMAIL = 'test@cryptx.io';
    const TEST_TOKEN = 'test-token',
        INVITE_ID = 455;
    const FUTURE_EXPIRY = new Date(new Date().getTime() * 2);
    const NO_ROLE_ID = 55,
        ROLE_ID = 35;
    const ROLE = new Role({
        id: ROLE_ID,
        name: 'Test Role'
    });
    const FIRST_NAME = 'Johny',
        LAST_NAME = 'Smith';

    let invitationStub;

    beforeEach(done => {

        sinon.stub(User, 'findOne').callsFake(options => {

            if (options.where.email === NO_USER_MAIL) {
                return Promise.resolve(null);
            } else {

                let user = new User({
                    email: options.where.email
                })

                return Promise.resolve(user);
            }
        });

        sinon.stub(Role, 'findById').callsFake(id => {
            if (id === NO_ROLE_ID) {
                return Promise.resolve(null);
            } else {

                return Promise.resolve(ROLE);
            }
        });

        sinon.stub(UserInvitation, 'create').callsFake(data => {

            let invitation = new UserInvitation(data);

            return Promise.resolve(invitation);
        });

        done();
    });

    afterEach(done => {

        [
            User.findOne,
            Role.findById,
            UserInvitation.create,
            UserInvitation.findOne
        ].forEach(model => {
            if (model.restore) {
                model.restore();
            }
        });

        done();
    });

    it("the service shall exist", function () {
        chai.expect(inviteService).to.exist;
    });

    describe('and the method createInvitation shall', () => {

        it("exist", function () {
            chai.expect(inviteService.createInvitation).to.exist;
        });

        it('refuse to create an invitation for exisiting user email', () => {

            inviteService.createInvitation({}, ROLE_ID, '', '', USER_EMAIL).should.be.rejected;
        });

        it('refuse to create an invitation for missing role', () => {

            inviteService.createInvitation({}, NO_ROLE_ID, '', '', NO_USER_MAIL).should.be.rejected;
        });

        it('save a valid invitation', (done) => {

            inviteService.createInvitation({
                id: 9
            }, ROLE_ID, FIRST_NAME, LAST_NAME, NO_USER_MAIL).then(invitation => {
                try {
                    chai.expect(invitation).to.be.a('object');
                    //invitation created not used
                    chai.expect(invitation.was_used).to.eq(false);
                    //with new token
                    chai.expect(invitation.token).to.not.be.null;
                    //future expiry
                    chai.expect(invitation.token_expiry_timestamp).to.be.above(new Date());
                    //correct data
                    chai.expect(invitation.role_id).to.eq(ROLE_ID);
                    chai.expect(invitation.email).to.eq(NO_USER_MAIL);
                    //this was saved
                    sinon.assert.called(UserInvitation.create);
                    done();
                } catch (ex) {
                    throw ex;
                }
            });
        });
    });

    describe('and the method getValidInvitation shall', () => {

        it("exist", function () {
            chai.expect(inviteService.getValidInvitation).to.exist;
        });

        it('search for an unused valid invitation', done => {
            let invite = new UserInvitation({
                token: TEST_TOKEN,
                token_expiry_timestamp: FUTURE_EXPIRY,
                was_used: false,
                first_name: FIRST_NAME,
                last_name: LAST_NAME,
                email: USER_EMAIL,
                role_id: NO_ROLE_ID
            });
            sinon.stub(invite, 'save');
            //test with bad role id
            sinon.stub(UserInvitation, 'findOne').callsFake(options => {
                return Promise.resolve(invite);
            });

            inviteService.getValidInvitation(TEST_TOKEN).catch(error => {
                try {
                    //was searched
                    chai.assert.isTrue(UserInvitation.findOne.called);
                    //existing user error
                    chai.expect(error.message).to.include(USER_EMAIL);
                    //timestamp changed and saved due to existing user
                    chai.assert.isTrue(invite.save.called);
                    chai.expect(invite.token_expiry_timestamp.getTime()).is.lte(new Date().getTime());
                    done();
                } catch(ex) {
                    done(ex);
                }
            });
        });
    });

    describe('and the method createUserByInvite shall', () => {

        it("exist", function () {
            chai.expect(inviteService.createUserByInvite).to.exist;
        });

        //no need to retest getting valid invite - tested above
        it('create a user with associated invitaiton info and role', done => {
            let invite = new UserInvitation({
                id: INVITE_ID,
                token: TEST_TOKEN,
                token_expiry_timestamp: FUTURE_EXPIRY,
                was_used: false,
                first_name: FIRST_NAME,
                last_name: LAST_NAME,
                email: NO_USER_MAIL,
                role_id: ROLE_ID
            });
            sinon.stub(invite, 'save').callsFake(() => {
                return Promise.resolve(invite);
            });
            //test with bad role id
            sinon.stub(UserInvitation, 'findOne').callsFake(options => {
                return Promise.resolve(invite);
            });
            sinon.stub(User, 'create').callsFake(data => {
                let user = new User(data);
                sinon.stub(user, 'setRoles');
                return Promise.resolve(user);
            });

            inviteService.createUserByInvite(INVITE_ID, 'pwd').then(user => {
                try {
                    chai.expect(user).to.be.a('object');
                    //assert method calles
                    chai.assert.isTrue(UserInvitation.findOne.called);
                    chai.assert.isTrue(Role.findById.calledWith(ROLE_ID));
                    chai.assert.isTrue(User.create.called);
                    chai.assert.isTrue(user.setRoles.calledWith([ROLE]));

                    //assert user data based on invite
                    chai.expect(user.first_name).to.be.eq(FIRST_NAME);
                    chai.expect(user.last_name).to.be.eq(LAST_NAME);
                    chai.expect(user.email).to.be.eq(NO_USER_MAIL);

                    //assert invite altered
                    chai.assert.isTrue(invite.save.called);
                    chai.assert.isTrue(invite.was_used);

                    done();
                } catch (ex) {
                    done(ex);  
                }
            });
        });
    });
});