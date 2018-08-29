'use strict';

require('../config/validators.js');


//validate request body according to rules
module.exports.post_body_validator = (req, res, next) => {

    //ensure this is POST
    if (!req.method === 'POST') {
        return next();
    }

    //hopefully guaranteed body since this is a POST
    const body = req.body;

    //cant apply validation rules to empty objects, 
    //if an empty body is invalid it will be stopped further down the chain
    if (_.isEmpty(body)) {
        return next();
    }

    //check keys on objects, arrays are skipped for now
    if (_.isPlainObject(body)) {
        //fetch correct validator
        const validator = _.find(VALIDATORS, (rules, pathExp) => {
            return req.path.match(new RegExp(pathExp))
        })
        //no validators set up for this path
        if (validator == null) {
            return next();
        }

        console.log(`Validating path ${req.path} with ${Object.keys(validator).length} rules...`);

        //get errors for all fields and remove nulls
        const obj_errors = _.filter(_.map(
            body,
            (value, field_name) => valueError(validator, field_name, value)
        ), err => err != null);

        if (!_.isEmpty(obj_errors)) {
            return ReE(res, {
                type: 'validator_errors',
                issues: obj_errors
            }, 422);
        }
    }

    return next();
};

/**
 * Get object representing field name, value and rule its breaking
 * Returns null if all is good
 * @param validator 
 * @param field_name 
 * @param value 
 */
const valueError = (validator, field_name, value) => {

    const rule = validator[field_name];

    //no rule found means its valid
    if (rule == null) {
        return null
    }
    const check = isValidValue(rule, value);

    if (!check) {
        return {
            field_name,
            value,
            rule
        }
    }

    return null;
}

/**
 * Check if vlaue is vlaid according to a globally defined simple ruleset
 * @param rule 
 * @param  value 
 */
const isValidValue = (rule, value) => {
    //guard against empty rule
    if (rule == null) {
        return true;
    }

    switch(rule) {

        case RULE_NAMES.STRING_NOT_BLANK:
            //check if value is a non-null actual string and has non-whitespace
            return notBlank(value)
        case RULE_NAMES.STRING_IS_EMAIL:
            //check if value is NOT_BLANK and valid email (contains @ symbol somewhere not in the start)
            return notBlank(value) && value.includes('@', 1)
        case RULE_NAMES.COL_NOT_EMPTY:
            //check if value is not null, is object/array and has elements in it
            return _.isObjectLike(value) && !_.isEmpty(value)
        case RULE_NAMES.NUM_POS:
            const parsed = Number.parseInt(value);
            //check the value is a number and apositive integer (an ID)
            return _.isFinite(parsed) && parsed > 0
        case RULE_NAMES.BOOL_PROP:
            //check the value to be boolean or parseable to it
            const word = String(value).toLowerCase();
            return word === 'true' || word === 'false'
        //if rule unknown we log it and move on    
        default:
            console.log(`Unknown rule ${rule} while checking value ${value}, skipping...`);
            return true;
    }
}

const notBlank = (s) => _.isString(s) && s.trim();