'use strict';

const Sequelize = require('../models').Sequelize;
const Op = Sequelize.Op;


function to_conj_obj(key, value = {}) {

    let key_obj = {};
    //simple case, value supplied is just a series of vals
    if (typeof value !== 'object') {
        key_obj[key] = value;
    } else {
        if (!value.expression) {
            //still simple case without expression
            key_obj[key] = value.value;
        } else {
            key_obj[key] = {
                [Op[value.expression]]: value.value
            }
        }
    }

    return key_obj;
}

function accum_where_obj(filters) {
    return _.reduce(filters, (accum, value, key) => {
        return Object.assign(accum, to_conj_obj(key, value))
    }, {});
}

function accum_where_col(filters) {
    return _.reduce(filters, (accum, value) => {
        accum.push(to_conj_obj(value.field, value));
        return accum;
    }, []);
}

/**
 * Works with filter POST objects
 * like 
 * "filter": {
 *  "prop": {
 *      "value": 5, 
 *      "expression": "gt"
 *  },
 * "prop2": {
 *      "value": [5, 85]
 *  },
 *  "and": [
 * {
 * "field": "first_name",
 * "value": "77"
 * }
 * ],
 * "or": []
 * }
 **/
module.exports = (filter_obj = {}) => {

    let final_clause = {};

    //process special clauses
    ['and', 'or', 'not'].forEach(clause => {

        const clause_obj = filter_obj[clause];
        if (clause_obj) {
            final_clause[Op[clause]] = accum_where_col(clause_obj);
            delete filter_obj[clause];
        }
    });

    //put remaining keys as AND fields (if any)
    if (Object.keys(filter_obj)) {
        final_clause = Object.assign(final_clause, accum_where_obj(filter_obj));
    }
    
    return final_clause;
}