'use strict';
//global constants
const send_grid = require('@sendgrid/mail')
send_grid.setApiKey(process.env.SENDGRID_API_KEY);

const environment_base_url = () => {

    if (process.env.NODE_ENV == 'test') {
        return 'https://cryptx-app-staging.herokuapp.com';
    }
    if (process.env.NODE_ENV == 'production') {
        return 'https://cryptx-app.herokuapp.com';
    }

    return 'http://localhost:3000';
}

const BASE_URL = environment_base_url();

/**
 * This link leads email readers to a URL of the Angular FE application.
 * 
 * 
 * The application will then load a view and make a POST call with 
 * the supplied token to the REST API, which lets the FE show 
 * token-encoded info of hte future user. 
 *
 *  
 * When the user have submitted the remaining info, a different link is called with that submitted info
 * and the ID of the invitation that corresponds to this token, ensuring a bit of obfuscation from
 * short-term sniffers.
 */
const INVITE_BASE_URL = `${BASE_URL}/#/invitation?token=`

module.exports.invitationMailHTML = (invitation) => {

    return `
    <p>Hello ${invitation.full_name},</p>
    <br/>
    <br/>
    <p>Administrator of CryptX has sent you an invitation to join the team. To accept the invitation, please use the following link:<br/>
    <p><a href="${INVITE_BASE_URL + invitation.token}">${INVITE_BASE_URL + invitation.token}</a> <br/></p>
    <br/>
    Have a good day,<br/>
    CryptX Team
    `;
}

const RESET_PASSWORD_BASE_URL = `${BASE_URL}/#/password_reset?token=`;
module.exports.passwordResetMailHTML = (details) => {

    return `
    <p>Hello ${details.first_name} ${details.last_name},
    <br/>
    <p>Password reset request was made for your account.</p>
    <p>To reset you password, please use this link:</p>
    <p><a href="${RESET_PASSWORD_BASE_URL + details.token}">${RESET_PASSWORD_BASE_URL + details.token}</a></p>
    <p>This link to reset your password is going to be valid for 1 hour.
    `;
}

module.exports.send_grid = send_grid;

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

    //use either "send" or "sendMultiple" method if sending several emails at once
    let method = Array.isArray(to)? 'sendMultiple' : 'send';
    return send_grid[method](msg).then((result) => {
        console.log(`Email '${subject}' send to ${to} OK`);

        return result;
    }).catch(err => {
        console.error('EMAIL ERROR %o!', err);
        TE(err.response.body.errors.map(error => error.message).join(" ")); // return all error messages joined in string
    });
};