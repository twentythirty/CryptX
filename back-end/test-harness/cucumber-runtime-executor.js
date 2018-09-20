'use strict';

const
    Cucumber = require('cucumber'),
    ConfigurationBuilder = require('cucumber/lib/cli/configuration_builder'),
    EventEmitter = require('events'),
    fs = require('fs');

let failed_tests = []
let passed = 0,
    failed = 0;

let test_results = {};

let results_path = '';

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
                //account for status of a recipe being 'undefied' and therefore no error message
                //but still a failure
                error: data.result.exception ? data.result.exception.message : data.result.status
            })
        }
    });
    
    eventEmitter.on('test-run-finished', () => {
        
        //tally up everything into the returnable object
        test_results.passed = passed;
        test_results.failed = failed;
        test_results.failed_tests = failed_tests;

        console.log('Writing results \n%o\n To file %s', test_results, results_path)

        fs.writeFileSync(results_path, JSON.stringify(test_results), 'utf-8');
        
        console.log(`CUCUMBER: Generated info for ${failed}/${passed + failed} fails... ${failed > 0? 'WILL SEND EMAIL WITH CUCUMBER!' : 'NO CUCUMBER IN EMAIL!'}`);
    });
}

const perform = async (cwd, features_base_path, results_path_arg) => {

    console.log(`
    Perfoming with:
    cwd: ${cwd}
    features path: ${features_base_path}
    results_path: ${results_path_arg}
    `);
    results_path = results_path_arg;
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

    await cucumberRuntime.start();
    process.exit(0);
}

perform(process.argv[2], process.argv[3], process.argv[4])