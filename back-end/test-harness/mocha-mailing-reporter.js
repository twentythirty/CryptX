'use strict';
module.exports = MailingReporter;

/**
 * Mocha tests reporter designed with Heroku builds in mind. 
 * 
 * Collects failing tests info and generates email for those who need to know
 * Those who need to know are described in the TEST_FAIL_MAILS heroku config variable
 */
function MailingReporter(tests_runner) {

    let passed = 0,
        failed = 0;
    //store info about failed tests here
    let failed_tests = []

    tests_runner.on('start', () => {
        console.log('\n\n***RUNNING MOCHA TESTS***\n\n')
    })

    //if a test passes
    tests_runner.on('pass', function (test) {
        passed++;
        console.log('MOCHA: pass: %s', test.fullTitle());
    });

    //a test failed
    tests_runner.on('fail', function (test, err) {
        failed++;
        console.log('MOCHA: fail: %s -- error: %s', test.fullTitle(), err.message);
        failed_tests.push({
            title: test.fullTitle(),
            error: err.message
        })
    });

    //all testing has ended, flush failures to email
    tests_runner.on('end', function () {
        console.log('MOCHA: end: %d/%d', passed, passed + failed);
        if (!failed) {
            console.log('MOCHA: Tests ended OK!');
        }

        tests_runner.test_results = {
            passed,
            failed,
            failed_tests
        }
            
        console.log(`MOCHA: Generated info for ${failed}/${passed + failed} fails... ${failed > 0? 'WILL SEND EMAIL WITH MOCHA!' : 'NO MOCHA IN EMAIL!'}`);
    })

}