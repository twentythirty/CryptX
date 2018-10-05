'use strict';

const chai = require('chai');


const descriptionToJobFile = {
    'synchronize coins list': 'coins-list-sync',
    'generate execution orders': 'exec-order-generator',
    'fetch instrument volumes': 'exchange-volume-fetcher',
    'fetch instruments ask/bid prices': 'exchange-ask-bid-fetcher',
    'place execution orders on exchanges': 'cucumber-exchange-order-placer',
    'calculate market history': 'market-history-calc',
    'update recipe order statuses': 'recipe-order-status-changer'
}

/**
 * Resolve the description sentence to a local map of job files and complete the job using system models
 * and console.log
 * @param {String} description the sentence to match a job file to
 * @param {Object} custom_config extra configuration to be put in the config job map
 */
module.exports.finishJobByDescription = async function(description, custom_config = {}) {

    const jobFileName = descriptionToJobFile[description];

    chai.assert.isDefined(jobFileName, `No valid job filename found for description "${description}"!`)

    const job = require(`../../../jobs/${jobFileName}`);
    const models = require('../../../models');
    const config = Object.assign({ models }, custom_config);

    return await job.JOB_BODY(config, console.log);
};


/**
 * Iterate over a set of table-view style records with column names as keys and compare them to an exmaple table
 * Comparison rules will automatically convert name constants into i18n names and dates in JSON representations.
 * Numerical fields are compared numerically to avoid formatting error-related problems.
 * 
 * NOTE: comparing internationalized names requires access to the World Context, so if this feature is required,
 * the function will need `bind(this)` to work.
 * @param {object[]} view_table_data The set of records to iterate over and compate to the example set
 * @param {object[]} example_table_data The set of example records to comapre the view set to
 * @param {object} pre_check_transform Set of mappings of colname to 1 arg function that produces the resulting record value to check
 * us to add any missing formatting that the view mandates (like prefix for a status constants for example)
 */
module.exports.compareViewTables = function(view_table_data, example_table_data, pre_check_transform = {}) {

    _.forEach(view_table_data, (view_record, idx) => {

        const example_record = example_table_data[idx];
        chai.assert.isObject(example_record, `No exmaple record found at data record ${idx}`);

        _.forEach(Object.keys(example_record), prop_name => {
            let check_value = view_record[prop_name];
            if (pre_check_transform[prop_name]) {
                check_value = pre_check_transform[prop_name](check_value);
            }
            let example = example_record[prop_name];
            //string might be translation, try that if values arent already equal
            if (check_value != example_record[prop_name] && _.isString(check_value)) {
                check_value = _.get(this.i18n, check_value);
            }
            //if value is missing but should be a number, it can be equated to 0 
            //along with exampel being tested
            //point is to test view data, not recreate entire FE formatting ruleset
            if (check_value == null && _.isNumber(parseFloat(example))) {
                check_value = 0;
                example = 0;
            }
            //if the check_value is a date, then we convert to JSON for comparison
            if (check_value != null && _.isDate(check_value)) {
                check_value = check_value.toJSON();
            }
            chai.assert.equal(check_value, example, `View record ${idx} porperty ${prop_name} is not equal to example!`);
        });
    });
};