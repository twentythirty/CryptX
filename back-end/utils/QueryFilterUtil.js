'use strict';

const Sequelize = require('../models').Sequelize;
const sequelize = require('../models').sequelize;
const Op = Sequelize.Op;

/**
 * Works with filter POST objects that have the `filter` key with this structure:
 * 
 * ```
 
 * 	"filter": {
 * 		"prop": {
 * 			"value": 5,
 * 			"expression": "gt"
 * 		},
 * 		"prop2": {
 * 			"value": [5, 85]
 * 		},
 * 		"and": [{
 * 			"field": "first_name",
 * 			"value": "77"
 * 		}],
 * 		"or": []
 * 	}
 
 * ```
 * 
 * Transforms that structure into an object format understood by the `Sequelize` library 
 * for making model-based entity queries
 **/
const toSequelizeWhere = (filter_obj_ext = {}) => {

    let final_clause = {};

    //checks if the filter obj is null or undefined
    if (filter_obj_ext == null) {
        return final_clause;
    }

    //make a defensive copy of passed arg
    let filter_obj = Object.assign({}, filter_obj_ext);

    //process special clauses
    let mappings = {};
    ({
        data_obj: filter_obj,
        mappings
    } = consume_special_keys(
        filter_obj, ['and', 'or', 'not'],
        (k, v) => accum_where_col(v)
    ));

    //add transformed mappings to final clause (mappings initially has simple keys, not Ops)
    final_clause = Object.assign(final_clause, _.mapKeys(mappings, (v, k) => Op[k]));

    //put remaining keys as AND fields (if any)
    if (Object.keys(filter_obj)) {
        final_clause = Object.assign(final_clause, accum_where_obj(filter_obj));
    }

    return final_clause;
}
module.exports.toSequelizeWhere = toSequelizeWhere;

/**
 * Works with filter POST objects that have the `filter` key with this structure:
 * 
 * ```
 
 * 	"filter": {
 * 		"prop": {
 * 			"value": 5,
 * 			"expression": "gt"
 * 		},
 * 		"prop2": {
 * 			"value": [5, 85]
 * 		},
 * 		"and": [{
 * 			"field": "first_name",
 * 			"value": "77"
 * 		}],
 * 		"or": []
 * 	}
 
 * ```
 * 
 * Transforms that structure into raw SQL conditions of a WHERE clause,
 * for making direct DB calls.
 **/
const toWhereSQL = (filter_obj_ext) => {
    let final_sql = "";

    if (filter_obj_ext == null) {
        return final_sql;
    }

    //defensive arg copy in case it gets modified
    let filter_obj = Object.assign({}, filter_obj_ext);
    let mappings_and_or = {},
        mappings_not = {};

    //process special keys
    ({
        data_obj: filter_obj,
        mappings: mappings_and_or
    } = consume_special_keys(
        filter_obj, ['and', 'or'],
        (k, v) => join_clause_expressions(v, k.toUpperCase())
    ));
    ({
        data_obj: filter_obj,
        mappings: mappings_not
    } = consume_special_keys(
        filter_obj, ['not'],
        (k, v) => join_clause_expressions(v, 'AND', k.toUpperCase())
    ));

    //add all special keys into main sql string with parentheses around whole thing
    final_sql = add_to_where(final_sql, paren(
        _.join(
            _.concat([], Object.values(mappings_and_or), Object.values(mappings_not)),
            ' AND '
        )
    ));

    //process regular keys
    final_sql = add_to_where(final_sql, _.join(
        _.map(filter_obj, (val, k) => paren(expr_to_sql(k, val))),
        ' AND '
    ))

    return final_sql;
}
module.exports.toWhereSQL = toWhereSQL;



// -------------
// 
// HELPERS
//  
// -----------

/**
 * transforms key and value into a sequelize-ready object to be conjugated with others
 */
function to_conj_obj(key, value = {}) {

    let key_obj = {};

    /*  if (value.type) {
         value.value = parseDataType(value.type, value.value);
     } */
    //simple case, value supplied is just a series of vals 
    //array is also an object so thats an extra check
    if (typeof value !== 'object' || Array.isArray(value)) {
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
    return _.reduce(
        //filter out nulls before applying filter
        filter_nulls(filters),
        (accum, value) => {
            accum.push(to_conj_obj(value.field, value));
            return accum;
        }, []
    );
}

const join_clause_expressions = (expressions_col, joiner_clause, negation = false) => {

    return paren(
        _.join(
            _.map(
                filter_nulls(expressions_col), expr => {
                return `${expr_to_sql(expr.field, expr, negation)}`.trim()
            }), ` ${joiner_clause} `
        )
    );
}

/**
 * Uses `consumer` to perform processing on a key from `key_list` that was found
 * inside object `data_obj`. 
 * `consumer` args are ```(key, data_obj[key])```.
 * After consumer has run, this **deletes** the key from the working copy of `data_obj`.
 * 
 * Returns modified copy of `data_obj` without consumed keys and 
 * `mappings` of results from applying `consumer` to every found key-value pair.
 * @param data_obj 
 * @param key_list 
 * @param consumer 
 */
const consume_special_keys = (data_obj, key_list, consumer = (k, v) => null) => {

    let mappings = {};
    //shrt circuit empty input
    if (_.isEmpty(data_obj) || _.isEmpty(key_list)) {
        return {
            data_obj,
            mappings
        }
    }

    const data_obj_internal = Object.assign({}, data_obj);
    //process special clauses
    key_list.forEach(key => {

        const key_data = data_obj_internal[key];
        if (key_data) {
            mappings[key] = consumer(key, key_data);
            delete data_obj_internal[key];
        }
    });

    return {
        data_obj: data_obj_internal,
        mappings
    }
}



function parse_data_type(data_type, value) {
    let parsed_value;

    switch (data_type) {
        case 'timestamp':
            parsed_value = new Date(parseInt(value)).toISOString();
            break;
        case 'date':
            parsed_value = new Date(value).toISOString();
            break;
        case 'number':
            parsed_value = parseFloat(value);
            break;
        case 'boolean':
            parsed_value = (String(value).toLowerCase() === 'true'); //Based on: https://stackoverflow.com/questions/263965/how-can-i-convert-a-string-to-boolean-in-javascript
            break;
        case 'string':
        default:
            parsed_value = value;
    }

    return parsed_value;
}

/**
 * returns a string that contains a pair of parentheses around `expr`. 
 * if `expr` evaluates to a blank string, returns nothing (empty string)
 * @param expr 
 */
const paren = (expr) => {
    const evaluated = `${expr}`.trim();
    return evaluated.length > 0 ? `(${evaluated})` : ''
}

/**
 * Format `value` in an SQL friendly way not to break queries.
 * 
 * arrays are transformed into their paretheses forms
 * 
 * strings are escaped
 * 
 * others get passed as-is
 * @param value 
 */
const format_for_sql = (value) => {
    if (_.isNull(value)) {
        return `NULL`;
    }
    if (_.isArray(value)) {
        return `${paren(_.join(_.map(value, format_for_sql), ', '))}`
    }

    return `${sequelize.escape(value)}`;
}

/**
 * Add `addition` to the current forming WHERE clause specified by `current_where`, 
 * sans keyword itself.
 * 
 * if the `current_where` clause is not empty, there needs to be an AND connector between it and 
 * `addition` to make valid SQL. This method ensures that.
 * @param  current_where 
 * @param  addition 
 */
const add_to_where = (current_where, addition) => {
    if (_.isEmpty(addition)) {
        return current_where
    }
    if (_.isEmpty(current_where)) {
        return addition
    }

    return `${current_where} AND ${addition}`
}


const expr_to_sql = (field_name, expr_obj, negation = false) => {

    //supplied thing is an atom of some kind - string, array, value or null
    if (!_.isPlainObject(expr_obj)) {
        return atom_to_sql_expression(field_name, expr_obj, negation);
    }

    //supplied obj might have a custom data type, better parse
    if (expr_obj.type) {
        expr_obj.value = parse_data_type(expr_obj.type, expr_obj.value);
    }

    //supplied thing is really an object, lets try to use its value/expression keys
    if (!expr_obj.expression) {
        //no expression passed in, treat like atom
        return atom_to_sql_expression(field_name, expr_obj.value, negation)
    } else {
        //create SQL with expression
        return `${field_name} ${expression_op_to_sql(expr_obj.expression, negation)} ${format_for_sql(expr_obj.value)}`
    }
}

/**
 * Create WHERE clause expression for a single atomic value specified 
 * by `atom`. Atomic values are arrays, null or primitives.
 * @param left_side 
 * @param atom 
 * @param negation if `true` will make the condition be about averting value
 */
const atom_to_sql_expression = (left_side, atom, negation = false) => {
    //no value supplied, we want to say value should be null
    if (atom == null) {
        return `${left_side} IS ${negation? 'NOT ': ''}NULL`
    }
    //suplied atom is array - check if value is in in
    if (_.isArray(atom)) {
        //skip this clause if the passed array is empty, 
        //otherwise SQL will 1. fail or 2. always return nothing
        if (_.isEmpty(atom)) {
            return '';
        } else {
            return `${left_side} ${negation? 'NOT ': ''}IN ${format_for_sql(atom)}`
        }
    }
    //supplied atom is a single value - compare directly
    return `${left_side} ${negation? '!' : ''}= ${format_for_sql(atom)}`

}

/**
 * Translate provided expression code into SQL. 
 * 
 * Negation of an expression may change
 * what operator is used
 * @param  expression_op 
 * @param  negation 
 */
const expression_op_to_sql = (expression_op, negation = false) => {

    const expr = (expression_op? expression_op : '').trim().toLowerCase();
    
    switch (expr) {

        case 'lt':
            return negation ? '>=' : '<';
        case 'lte':
            return negation ? '>' : '<=';
        case 'gt':
            return negation ? '<=' : '>';
        case 'gte':
            return negation ? '<' : '>=';
        case 'in':
            return negation ? 'NOT IN' : 'IN';
        case 'notin':
            return negation ? 'IN' : 'NOT IN';
        case 'like':
            return negation ? 'NOT LIKE' : 'LIKE';
        case 'ilike':
            return negation ? 'NOT iLIKE' : 'iLIKE';
        default:
            return `${negation? 'NOT ' : ''}${sequelize.escape(expression_op)}`
    }
}

/**
 * Returns all non-null elements of col for processing
 * @param col 
 */
const filter_nulls = (col) => {

    if (_.isEmpty(col)) {
        return []
    }

    return _.filter(col, elem => elem != null);
}