'use strict';

const
    Cucumber = require('cucumber'),
    ConfigurationBuilder = require('cucumber/lib/cli/configuration_builder'),
    EventEmitter = require('events');

let failed_tests = []
let passed = 0,
    failed = 0;

let test_results = {};

const get_configuration = async (argv, cwd) => {
    const fullArgv = argv;
    return new ConfigurationBuilder.default({
        argv: fullArgv,
        cwd
    }).build()
}

const get_support_code_library = ({
    supportCodeRequiredModules,
    supportCodePaths,
    cwd
}) => {
    supportCodeRequiredModules.map(module => require(module))
    Cucumber.supportCodeLibraryBuilder.reset(cwd)
    supportCodePaths.forEach(codePath => require(codePath))
    return Cucumber.supportCodeLibraryBuilder.finalize()
}

const setup_event_hooks = (eventEmitter) => {

    eventEmitter.on('test-run-started', () => {
        console.log('\n\n***RUNNING CUCUMBER TESTS***\n\n')
    });

    eventEmitter.on('test-case-started', data => {
        console.log(`Begin test %s : %s`, data.sourceLocation.uri, data.sourceLocation.line);
    });

    eventEmitter.on('test-case-finished', data => {

        console.log('finished test case result: %o', data);

        if (data.result.status == 'passed') {
            passed += 1
        } else {
            failed += 1
            const source = data.sourceLocation
            failed_tests.push({
                title: `${source.uri}:${source.line}`,
                error: data.result.exception.message
            })
        }
    });
    
    eventEmitter.on('test-run-finished', () => {
        
        //tally up everything into the returnable object
        test_results.passed = passed;
        test_results.failed = failed;
        test_results.failed_tests = failed_tests;

        console.log(`CUCUMBER: Generated info for ${failed}/${passed + failed} fails... ${failed > 0? 'WILL SEND EMAIL WITH CUCUMBER!' : 'NO CUCUMBER IN EMAIL!'}`);
    });
}

const run = async (features_base_path) => {

    const cwd = process.cwd();
    const eventBroadcaster = new EventEmitter();
    setup_event_hooks(eventBroadcaster);
    const cucumberConfig = await get_configuration(['node', 'cucumber-js', `${cwd}/${features_base_path}`, '--exit'], cwd);
    cucumberConfig.cwd = cwd;
    const supportCodeLibrary = get_support_code_library(cucumberConfig)
    const testCases = await Cucumber.getTestCasesFromFilesystem({
        cwd,
        eventBroadcaster,
        featureDefaultLanguage: cucumberConfig.featureDefaultLanguage,
        featurePaths: cucumberConfig.featurePaths,
        order: cucumberConfig.order,
        pickleFilter: new Cucumber.PickleFilter(cucumberConfig.pickleFilterOptions),
    })

    const cucumberRuntime = new Cucumber.Runtime({
        eventBroadcaster,
        options: cucumberConfig.runtimeOptions,
        supportCodeLibrary,
        testCases
    })

    return cucumberRuntime.start();
}

module.exports.run = run;
module.exports.test_results = test_results;