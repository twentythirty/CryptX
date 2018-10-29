'use strict';

const chai = require('chai');
const i18n = require('../../../public/fe/i18n/en.json');


const descriptionToJobFile = {
    'synchronize coins list': 'coins-list-sync',
    'generate execution orders': 'exec-order-generator',
    'fetch instrument volumes': 'exchange-volume-fetcher',
    'fetch instruments ask/bid prices': 'exchange-ask-bid-fetcher',
    'place execution orders on exchanges': 'cucumber-exchange-order-placer',
    'calculate market history': 'market-history-calc',
    'update recipe order statuses': 'recipe-order-status-changer',
    'asset liquidity check': 'asset-liquidity-checker',
    'asset price age check': 'asset-price-age-checker',
    'withdraw approved transfers': 'approved-transfer-withdraw',
    'transfer status updater': 'transfer-status-updater'
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
                check_value = _.get(this.i18n, check_value) || check_value;
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

/**
 * Function to extract certain fields from the timeline when names don't match.
 * Mainly used to have more user friendly names in the scenario
 */
module.exports.extractTimeLineField = (card, object, field) => {

    const not_created_map = {
        recipe_run: 'recipes.recipe_runs_not_created',
        recipe_deposits: 'deposits.deposits_not_created',
        recipe_orders: 'investment.no_orders',
        execution_orders: 'investment.no_execution_orders'
    };

    let result;
    switch(field) {

        case 'status':
            result = _.get(object, 'status') || _.get(object, 'approval_status');
            if(result) result = _.get(i18n, result);
            else result = _.get(i18n, not_created_map[card]);
            break;

        case 'amount':
            result = _.get(object, 'amount') || _.get(object, 'count');
            if(result) result = String(result);
            break;

        case 'time':
            result = _.get(object, 'started_timestamp') || _.get(object, 'creation_timestamp') || _.get(object, 'created_timestamp') ||  _.get(object, 'timestamp');
            if(result) result = new Date(result).toString().split('GMT')[0].trim();
            break;

        case 'strategy':
            result = _.get(object, 'strategy_type') || _.get(object, 'strategy');
            if(result) result = _.get(i18n, result);
            break;

    }

    if(!result) return null;

    return result;

};

const number_word_map = {
    no: 0,
    none: 0,
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10
};
module.exports.numberStringToArray = (number_string) => {

    let array_of_numbers = number_string.split(/,|and|or/).map(s => s.trim().toLowerCase());

    array_of_numbers = array_of_numbers.map(number => {

        if(isNaN(number)) number = number_word_map[number];

        return parseInt(number);

    });

    return array_of_numbers;

};

const interval_map = {
    ms: 1,
    seconds: 1000,
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    months: 30 * 24 * 60 * 60 * 1000
}
module.exports.speechToInterval = string_interval => {

    let [ number, interval_type ] = string_interval.split(' ');
    number = parseInt(number);
    interval_type = interval_map[interval_type];

    return number * interval_type;

};

module.exports.matchErrors = (expected_errors, received_error) => {

    for(let error of expected_errors) {

        error = error.split(' ');
        received_error = received_error.split(' ');

        for(let index = 0; index < error.length; index++) {

            let word = error[index];
            
            switch(word) {
            
                case '{number}':
                    let matching_word = received_error[index];
                    if(!isNaN(matching_word)) error[index] = received_error[index];
                    break;

                case '{string}':
                    error[index] = received_error[index];
                    break;
            
            }
        
        }

        error = error.join(' ');
        received_error = received_error.join(' ');

        if(error === received_error) return true;

    }

    return false;

};