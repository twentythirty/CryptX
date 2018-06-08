'use_strict';

let chai = require("chai");
let should = chai.should();
const mailer = require('../../utils/EmailUtil');
const sinon = require('sinon');
const UserInvitation = require('../../models').UserInvitation;

describe('EmailUtil', () => {

    const INVITATION = new UserInvitation({
        token: 'test-token',
        first_name: 'John',
        last_name: 'Smith',
        email: 'john@cryptx.io'
    });
    let single_send, multi_send;

    //mock mailer sending to ensure no sending actually occurs
    before(done => {
        single_send = sinon.stub(mailer.send_grid, 'send').callsFake(msg => {
            console.log(`called SendGrid sending with message ${msg}`);
            return Promise.resolve();
        });
        mutli_send = sinon.stub(mailer.send_grid, 'sendMultiple').callsFake(msg => {
            console.log(`called SendGrid sending mutiple with message ${msg}`);
            return Promise.resolve();
        });
        done();
    });

    it(' shall provide mail utility functions', () => {
        chai.expect(mailer.invitationMailHTML).to.be.a('function');
        //cant check if async is a proper function
        chai.expect(mailer.sendMail).to.exist;
    });

    it(' shall generate an invitaition mail that includes invitation info', () => {

        const mailHTML = mailer.invitationMailHTML(INVITATION);
        chai.expect(mailHTML).is.a('string');
        //check presence of INVITATION Props in mail
        [INVITATION.first_name, INVITATION.last_name, INVITATION.token].forEach(prop => {
            chai.expect(mailHTML).to.have.string(prop, `Invitation prop ${prop} not found in mail HTML!`);
        });
    });

    it (' shall call correct mail sender based on recipients', done => {

        mailer.sendMail('one@mail.com', 'subject', 'message').then( _ => {
            sinon.assert.called(single_send);

            mailer.sendMail(['one', 'two'], 'subject', 'test').then(_ => {
                sinon.assert.called(mutli_send);

                mailer.send_grid.send.restore();
                mailer.send_grid.sendMultiple.restore();
                done();
            });
        });
    });
});