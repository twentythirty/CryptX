'use strict';

const
    os = require('os'),
    fs = require('fs'),
    path = require('path'),
    child = require('child_process');

const run = (features_base_path) => {

    const cwd = process.cwd();
    const results_path = path.join(os.tmpdir(), 'results.json');
    const cmd = `NODE_ENV=cucumber node ${path.join(__dirname, 'cucumber-runtime-executor.js')} ${cwd} ${features_base_path} ${results_path}`;
    console.log(`Executing command: ${cmd}`);
    const result = child.execSync(cmd);
    console.log(`Process done with results: ${result}`);

    const test_results = JSON.parse(fs.readFileSync(results_path))

    return test_results;
}
module.exports.run = run;