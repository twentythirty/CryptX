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

    const NO_USER_MAIL = 'nouser@cryptx.io',
        USER_EMAIL = 'test@cryptx.io';
    const NO_ROLE_ID = 55,
        ROLE_ID = 35;
    const FIRST_NAME = 'Johny',
        LAST_NAME = 'Smith';

    const inviteService = require('./../../services/InvitationService');
    const User = require("../../models").User;
    const Role = require("../../models").Role;
    const UserInvitation = require('../../models').UserInvitation;

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

                let role = new Role({
                    id: id,
                    name: 'Test Role'
                });

                return Promise.resolve(role);
            }
        });

        sinon.stub(UserInvitation, 'create').callsFake(data => {
            
            let invitation = new UserInvitation(data);
            
            return Promise.resolve(invitation);
        });

        done();
    });

    afterEach(done => {

        User.findOne.restore();
        Role.findById.restore();
        UserInvitation.create.restore();

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

        it('save a valid invitation', done => {

            return inviteService.createInvitation({
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
                    done(ex);
                }
            });
        });
    });

    describe('and the method getValidInvitation shall', () => {

        it("exist", function () {
            chai.expect(inviteService.getValidInvitation).to.exist;
        });

        
    });
});