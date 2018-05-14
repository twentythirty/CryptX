'use strict';

const send_grid = require('@sendgrid/mail')(process.env.SENDGRID_API_KEY);

module.exports.sendMail = (to, subject, content, is_html = true) => {

    let msg = {
        to: to,
        from: EMAIL_FROM,
        sibject: subject
    };
    if (is_html) {
        msg.html = content;
    } else {
        mgs.text = content;
    };

    send_grid.send(msg).then((result) => {
        console.log(`Email send success with ${result}`);
    }).catch((err) => {
        TE(err);
    });;
};