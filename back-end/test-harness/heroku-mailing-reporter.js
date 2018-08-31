'use strict';
var mocha = require('mocha');
module.exports = MailingReporter;

/**
 * Mocha tests reporter designed with Heroku builds in mind. 
 * 
 * Collects failing tests info and generates email for those who need to know
 */
function MailingReporter(tests_runner) {

    const MAIL_SUBJECT = 'Build tests failed!';
    const MAIL_FROM = 'system@cryptx.io';

    const recipients = (process.env.TEST_FAIL_MAILS || '').split(',').filter(email => email.length > 0)

    mocha.reporters.Base.call(this, tests_runner);
    let passed = 0,
        failed = 0;
    //store info about failed tests here
    let failed_tests = []

    //if a test passes
    tests_runner.on('pass', function (test) {
        passed++;
        console.log('pass: %s', test.fullTitle());
    });

    //a test failed
    tests_runner.on('fail', function (test, err) {
        failed++;
        console.log('fail: %s -- error: %s', test.fullTitle(), err.message);
        failed_tests.push({
            title: test.fullTitle(),
            error: err.message
        })
    });

    //all testing has ended, flush failures to email
    tests_runner.on('end', function () {
        console.log('end: %d/%d', passed, passed + failed);
        if (!failed) {
            console.log('Tests ended OK!');
        }

        //there were failed tests and we have poeple to tell it about
        if (failed && recipients.length > 0 && process.env.SENDGRID_API_KEY) {

            const send_grid = require('@sendgrid/mail');
            send_grid.setApiKey(process.env.SENDGRID_API_KEY);

            const failure_mail = `
                A recent push has <b>broken the build!<b>. Failing tests:
                <ul style="padding-left: 1em; list-style-type: circle; ">
                    ${failed_tests.map(failed_obj => `<li style="padding: 0.5em 0em; line-height: 1.5">${failed_obj.title}<br/><span color="red">${failed_obj.error}<span></li>`)}
                </ul>
                <br/>
                <p>Total failed: ${failed}/${passed + failed}</p>
                <p>Heroku will keep serving previous deploy until this is fixed. <br/>
                Thank you in advance.
            `

            const msg = {
                to: recipients,
                from: MAIL_FROM,
                subject: MAIL_SUBJECT,
                html: failure_mail
            };

            send_grid.sendMultiple(msg).then((result) => {
                console.log(`Email '${MAIL_SUBJECT}' sent to ${recipients} OK: %o`, result);
                process.exit(failed);
            }).catch(err => {
                console.error('EMAIL ERROR %o!', err);
                process.exit(failed);
            })


            console.log(`Sent ${failed}/${passed + failed} fails email to ${recipients.length} recipients: ${recipients}`);
        } else {
            //check conditions if failing to send
            if (failed) {
                if (!process.env.SENDGRID_API_KEY) {
                    console.log(`cant send ${failed} failures to ${recipients} due to missing API key!`)
                } else if (!recipients.length) {
                    console.log(`cant send ${failed} failures due to NO RECIPIENTS!`)
                }
            }
        }
    })

}