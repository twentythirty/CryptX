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
        ROLE_IDS = [35, 1, 5];
    const ROLES = ROLE_IDS.map(role => new Role({
        id: role,
        name: 'Test Role'
    }));
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

        sinon.stub(User, 'create').callsFake(user_data => {
            let user = new User(user_data);
            /* user.setRoles = function () { return Promise.resolve(user); }; */
            sinon.stub(user, "save").returns(Promise.resolve(user));
            sinon.stub(user, "setRoles").returns(Promise.resolve(user));

            return Promise.resolve(user);
        });

        sinon.stub(Role, 'findAll').callsFake(query => {
            if (query.where.id === NO_ROLE_ID) {
                return Promise.resolve(null);
            } else {

                return Promise.resolve(ROLES);
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
            Role.findAll,
            UserInvitation.create,
            UserInvitation.findOne,
            User.create
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

    describe('and the method createUserAndInvitation shall', () => {

        it("exist", function () {
            chai.expect(inviteService.createUserAndInvitation).to.exist;
        });

        it('refuse to create an invitation for exisiting user email', () => {

            inviteService.createUserAndInvitation({}, ROLE_IDS, '', '', USER_EMAIL).should.be.rejected;
        });

        it('refuse to create an invitation with missing roles', () => {

            inviteService.createUserAndInvitation({}, NO_ROLE_ID, '', '', NO_USER_MAIL).should.be.rejected;
        });

        it('create user and save a valid invitation', (done) => {

            inviteService.createUserAndInvitation({
                id: 9
            }, ROLE_IDS, FIRST_NAME, LAST_NAME, NO_USER_MAIL).then(data => {
                try {
                    let [user, invitation] = data;
                    // user created
                    chai.expect(User.create.called).to.be.true;
                    // user data matches what we expect
                    chai.expect(user.first_name).to.be.eq(FIRST_NAME);
                    chai.expect(user.last_name).to.be.eq(LAST_NAME);
                    chai.expect(user.email).to.be.eq(NO_USER_MAIL);

                    chai.expect(invitation).to.be.a('object');
                    //invitation created not used
                    chai.expect(invitation.was_used).to.eq(false);
                    //with new token
                    chai.expect(invitation.token).to.not.be.null;
                    //future expiry
                    chai.expect(invitation.token_expiry_timestamp).to.be.above(new Date());
                    //correct data
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
            chai.expect(inviteService.setUpProfile).to.exist;
        });

        //no need to retest getting valid invite - tested above
        it('create a user with associated invitation info and role', done => {
            let invite = new UserInvitation({
                id: INVITE_ID,
                token: TEST_TOKEN,
                token_expiry_timestamp: FUTURE_EXPIRY,
                was_used: false,
                email: NO_USER_MAIL
            });
            let password = 'pwd';

            sinon.stub(invite, 'save').callsFake(() => {
                return Promise.resolve(invite);
            });
            //test with bad role id
            sinon.stub(UserInvitation, 'findOne').callsFake(options => {
                let invitation = invite;
                invitation.user = new User({});
                sinon.stub(invitation.user, 'save').returns(Promise.resolve(invitation.user));
                return Promise.resolve(invitation);
            });

            inviteService.setUpProfile(INVITE_ID, password).then(user => {
                try {
                    chai.expect(user).to.be.a('object');
                    //assert method calles
                    chai.assert.isTrue(UserInvitation.findOne.called);
                    //chai.assert.isTrue(Role.findById.calledWith(ROLE_IDS));
                    //chai.assert.isTrue(user.setRoles.calledWith(ROLES));
                    chai.assert.isTrue(user.save.called);

                    //assert user data based on invite
                    chai.expect(user.password).to.be.eq(password);

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