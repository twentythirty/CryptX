'use strict';
//global constants
const send_grid = require('@sendgrid/mail')
send_grid.setApiKey(process.env.SENDGRID_API_KEY);

const INVITE_BASE_URL = 'https://cryptx-app-staging.heroku.com/v1/users/invite?token='

module.exports.invitationMailHTML = (first_name, last_name, invitation) => {

    return `
    <p>Hello, ${first_name} ${last_name}!</p>
    <br/>
    <p>We are HAPPY to invite you into the <b>CryptX</b> investment runners family!
    <p>To create your account and start managing investments, please follow this invitation link:<br/>
    ${INVITE_BASE_URL + invitation.token} <br/></p>
    <p>This invitation will expire in 7 days (at <u>${invitation.token_expiry_timestamp}</u>).</p>
    <br/>
    Have a good day,<br/>
    CryptX Team
    `;
}


module.exports.sendMail = async (to, subject, content, is_html = true) => {

    let msg = {
        to: to,
        from: CONFIG.EMAIL_FROM,
        subject: subject
    };
    if (is_html) {
        msg.html = content;
    } else {
        mgs.text = content;
    };
    console.log('Sending email %o', msg);

    return send_grid.send(msg).then((result) => {
        console.log(`Email '${subject}' send to ${to} OK`);

        return result;
    }).catch(err => {

        console.error('EMAIL ERROR %o!', err);
        TE(err);
    });
};