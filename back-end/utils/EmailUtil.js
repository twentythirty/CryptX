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

//Currently used by new assets, but might be used later by something else
const DELAYED_EMAILS = {};
const BUILD_UPS = {};

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

module.exports.passwordChangeNotification = (details) => {

    return `
    <p>Dear ${details.full_name},</p>
    <p>Your password has been successfully changed.</p>
    <p>IP address: <b>${details.ip_address}</b><br/>
    Datetime: <i>${details.change_time}</i><br/>
    </p>
    <p>If you did not make this change or if you believe an unauthorized person made a change on your account, please immediately contact the system administrator.<br/>
    </p>
    <p>CryptX team</p>
    `
}

module.exports.newAssetsNotification = assets => {

    return `
        <b>Attention!</b>
        <p>The following assets were added to the system:</p>
        <br>
        <p>${
            assets.map(asset => `${asset.symbol} (${asset.long_name})`).join(', ')
        }</p>
    `;

}

/**
 * Because of the current nature of how assets are created, we can't get a full list of new Assets,
 * therefore to efficiently send them, a list will be built up and sent after some time when the
 * function stops receiving new assets. 
 * @param {Object} new_asset New asset that was recently added.
 */
module.exports.prepareNewAssetNotification = async new_asset => {

    const { sequelize } = require('../models');

    const subject = 'New Assets';
    const category = 'new_assets';
    const delay = 5000;

    if(!BUILD_UPS[category]) BUILD_UPS[category] = [];

    BUILD_UPS[category].push(new_asset);

    clearTimeout(DELAYED_EMAILS[category]);

    DELAYED_EMAILS[category] = setTimeout(async () => {

        const [ err, users ] = await to(sequelize.query(`
            SELECT DISTINCT ON(u.email) u.email, p.code
            FROM "user" AS u
            JOIN user_role AS ur ON u.id = ur.user_id
            JOIN "role" AS r ON ur.role_id = r.id
            JOIN role_permission AS rp ON r.id = rp.role_id
            JOIN permission AS p ON rp.permission_id = p.id
            WHERE p.code = '${PERMISSIONS.RECEIVE_NOTIFICATION_ABOUT_NEW_ASSETS}'
        `, { type: sequelize.QueryTypes.SELECT }));

        if(err) {
            console.log('Error occured when trying to fetch user email with new asset notification permission:');
            console.error(err.message);
            return;
        }
        //If there are no appropriate users, ends the execution here.
        if(!users.length) return;

        const emails = users.map(user => user.email);

        const content = this.newAssetsNotification(BUILD_UPS[category]);

        delete BUILD_UPS[category];

        this.sendMail(emails, subject, content);

    }, delay);

};

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