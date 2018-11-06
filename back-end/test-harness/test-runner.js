'use strict';

const
    Mocha = require('mocha'),
    MailReporter = require('./mocha-mailing-reporter'),
    CucumberRuntime = require('./cucumber-runtime-runner.js'),
    fs = require('fs'),
    path = require('path'),
    basename = path.basename(__filename);

/**
 * Return absolute paths to all files starting from directory `dir`, 
 * recursively.
 * optionally accepts `filter(filename)` to limit what files get added
 * 
 * Adapted from thread: https://gist.github.com/kethinov/6658166#gistcomment-1295057
 */
const walkSync = (dir, filter = (path) => true, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {

        filelist = fs.statSync(path.join(dir, file)).isDirectory() ?
            walkSync(path.join(dir, file), filter, filelist) :
            (
                filter(file) ?
                filelist.concat(path.join(dir, file)) :
                filelist
            );

    });
    return filelist;
}

const running_this = process.argv[1].split(/\//).pop() === basename;

if (!running_this) {
    console.log(`Created to run as a standalone script!`);
    process.exit(0);
}

if (process.argv.length <= 3) {
    console.log(`Not all tests base paths speicifed! Usage: node <path to this> <base mocha tests dir> <base cucumber features dir>`)
    process.exit(1);
}

// Instantiate a Mocha instance with required timeout and mail generating reporter
var mocha = new Mocha({
    timeout: 20000,
    reporter: MailReporter
});

var baseMochaTestsDir = process.argv[2];

// Add each .js file to the mocha instance
const mocha_tests_list = walkSync(baseMochaTestsDir,
    (file) => {
        // Only keep the .js files
        return file.substr(-3) === '.js';
    }, [])

mocha_tests_list.forEach(function (absolutePath) {
    mocha.addFile(absolutePath);
});

let tests_info = {
    mocha: {},
    cucumber: {},
    total_failed: 0,
    total: 0,
    all_good: function () {
        return _.isEmpty(this.mocha.failed_tests) && _.isEmpty(this.cucumber.failed_tests)
    }
}

let mocha_reporter;

const mocha_then_cucumber = async (mocha_failures) => {

    //record number of failues and passes for futrue email
    tests_info.mocha = mocha_reporter.test_results;
    tests_info.total_failed += mocha_reporter.test_results.failed;
    tests_info.total += mocha_reporter.test_results.failed + mocha_reporter.test_results.passed;

    const baseCucumberFeaturesDir = process.argv[3];

    const cucumber_test_results = CucumberRuntime.run(baseCucumberFeaturesDir);

    tests_info.cucumber = cucumber_test_results;
    tests_info.total_failed += cucumber_test_results.failed;
    tests_info.total += cucumber_test_results.failed + cucumber_test_results.passed;

    await generateBuildResultsRecord(tests_info).catch(err => {
        console.error('Could not generate build results record due to: %o', err)
        console.error('Process error at audit step, exit irregular...')
        return process.exit(5);
    });

    if (tests_info.curr_status == BUILD_RESULTS_STATUSES.FAILED) {
        console.info("Tests have failues, sending failed email...")
        await generateTestsFailedMail(tests_info);
    } else {
        //this is the first success after failures
        if (tests_info.prev_status == BUILD_RESULTS_STATUSES.FAILED) {
            console.info("Tests have recovered! Sending build OK email...")
            await generateBuildNormalMail(tests_info);
        }
    }

    const all_good = tests_info.all_good();

    process.exit(all_good ? 0 : 1);
};

// Run mocha tests.
mocha_reporter = mocha.run(mocha_then_cucumber);


const generateBuildResultsRecord = async (tests_info) => {

    const Sequelize = require('sequelize');

    //build a sequelize config and import model
    const sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: CONFIG.db_dialect,
        dialectOptions: {
            ssl: (process.env.DB_USE_SSL || 'false') == 'true'
        },
        operatorsAliases: false,
        logging: console.log
    })
    const BuildResults = sequelize.import('../models/build_results.js');

    const prev_build = await BuildResults.findOne({
        order: [
            ['recorded_at', 'DESC']
        ]
    })

    const current_build = BuildResults.build({
        status: tests_info.all_good() ? BUILD_RESULTS_STATUSES.PASSED : BUILD_RESULTS_STATUSES.FAILED,
        recorded_at: new Date(),
        passed: tests_info.total - tests_info.total_failed,
        failed: tests_info.total_failed
    })

    tests_info.prev_status = (prev_build ? prev_build.status : BUILD_RESULTS_STATUSES.PASSED) || BUILD_RESULTS_STATUSES.PASSED
    tests_info.curr_status = current_build.status

    return await current_build.save();
}

const generateBuildNormalMail = async (tests_info) => {

    if (!tests_info.all_good()) {
        console.log(`There are ${tests_info.total_failed} failed tests! Won't send build OK mail!`)
        return
    }

    const subject = 'Build back to normal'
    const build_back_mail = `
        All tests have passed and the build has returned to normal.
    `

    return await sendMail(subject, build_back_mail)
}


const generateTestsFailedMail = async (tests_info) => {

    if (tests_info.all_good()) {
        console.log(`No failed tests! Not sending anything!`)
        return
    }

    const subject = 'Build tests failed!';
    const failure_mail = `
        A recent push has <b>broken the build!</b>. <br/>
        Failing tests:
        ${_.isEmpty(tests_info.mocha.failed_tests) ? '' : `
        <h2>Mocha (${tests_info.mocha.failed})</h2>
        <ul style="padding-left: 1em; list-style-type: circle; ">
            ${tests_info.mocha.failed_tests.map(failed_obj => `<li style="padding: 0.5em 0em; line-height: 1.5">${failed_obj.title}<br/><span style="color: red;">${failed_obj.error}<span></li>`).join('\n')}
        </ul>
        `}
        ${_.isEmpty(tests_info.cucumber.failed_tests) ? '' : `
        <h2>Cucumber (${tests_info.cucumber.failed})</h2>
        <ul style="padding-left: 1em; list-style-type: circle; ">
            ${tests_info.cucumber.failed_tests.map(failed_obj => `<li style="padding: 0.5em 0em; line-height: 1.5">${failed_obj.title}<br/><span style="color: red;">${failed_obj.error}<span></li>`).join('\n')}
        </ul>
        <br/>
        `}
        <p>Total failed: ${tests_info.total_failed}/${tests_info.total}</p>
        <p>Heroku will keep serving the previous deploy until this is fixed. <br/>
        Thank you in advance.
    `

    return await sendMail(subject, failure_mail)
}


const sendMail = async (subject, html_body) => {

    const recipients = (process.env.TEST_RESULTS_MAILS || '').split(',').filter(email => email.length > 0)

    const MAIL_FROM = 'system@cryptx.io';
    if (!process.env.SENDGRID_API_KEY) {
        console.log(`cant send ${tests_info.total_failed} failures to ${recipients} due to missing API key!`)
        return
    } else if (!recipients.length) {
        console.log(`cant send ${tests_info.total_failed} failures due to NO RECIPIENTS!`)
        return
    }
    const msg = {
        to: recipients,
        from: MAIL_FROM,
        subject: subject,
        html: html_body
    };

    console.info(`Sending "${subject}" email to ${recipients}...`)

    const send_grid = require('@sendgrid/mail')
    send_grid.setApiKey(process.env.SENDGRID_API_KEY);

    return send_grid.sendMultiple(msg).then((result) => {
        console.log(`Email '${subject}' send to ${recipients} OK`);
        return result;
    }).catch(err => {
        if (err.response) {
            const errors = (err.response.body.errors.map(error => error.message).join("\n")); // all error messages joined in string
            console.error(`EMAIL ERROR: ${errors}!`);
        } else {
            console.error('EMAIL ERROR: %o!', err);
        }
    });

}