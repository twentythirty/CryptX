'use strict';


const whereOrEmpty = (where_clause) => `${_.isEmpty(where_clause)? '' : `WHERE ${where_clause}`}`;
module.exports.whereOrEmpty = whereOrEmpty;

const addToWhere = (where_clause = '', addition = '') => {

    if (_.isEmpty(where_clause)) {
        return addition || '';
    }
    if (_.isEmpty(addition)) {
        return where_clause || '';
    }

    return `${where_clause} AND ${addition}`;
}
module.exports.addToWhere = addToWhere;

/**
 * generate an SQL snippet that selects count fo rows from table table_expr
 */
const selectCount = (table_expr, alias = 'count', where_clause = '') => {

    return `SELECT count(*) AS ${alias}
            FROM ${table_expr}
            ${whereOrEmpty(where_clause)}
    `
}
module.exports.selectCount = selectCount;

const selectDataRows = (fields = [], table_expr, where_clause = '') => {

    return `SELECT ${fields? _.join(fields, ',\n') : '*'} FROM ${table_expr}
            ${whereOrEmpty(where_clause)}`
}
module.exports.selectDataRows = selectDataRows;

/**
 * generate an SQL snippet that selects distinct values on field_expr from table table_expr
 */
const selectDistinct = (field_expr, table_expr, where_clause = '') => {

    return `SELECT DISTINCT ${field_expr}
            FROM ${table_expr}
            ${whereOrEmpty(where_clause)}
    `
}
module.exports.selectDistinct = selectDistinct;
/** 
    Build chains of query parts like 
    ```
    (SELECT count(*)
    FROM
    (SELECT DISTINCT field_expr
        FROM table_expr
        WHERE ...
    ) AS ALIAS) AS ALIAS
    ```
    these simple distinct counts make up many footer columns so its better to easily generate them.
    the query chosen is DB-specific:

    in Postgres, doing 
    ```
    SELECT count(*) 
    FROM (SELECT DISTINCT ...) 
    ```
    
    is a lot faster than
    doing a direct `SELECT COUNT(DISTINCT...)`, so we go for the latter 

    (Why: https://www.postgresql.org/message-id/CAONnt+72Mtg6kyAFDTHXFWyPPY-QRbAtuREak+64Lm1KN1c-wg@mail.gmail.com)
*/
const selectCountDistinct = (field_expr, res_alias, table_expr, where_clause = '') => {
    return `(${selectCount(`(${selectDistinct(field_expr, table_expr, where_clause)}) AS ${res_alias}`)}) AS ${res_alias}`
}
module.exports.selectCountDistinct = selectCountDistinct;

/**
 * Transform a direct sequelize-style SQL rows mapping into a footer object
 * suitable for controller response.
 * 
 * the argument should be a collection with the first row being the relevant return value,
 * its value aliases will be taken as `name` keys and the values themselves as `value` keys
 * 
 */
const queryReturnRowToFooterObj = (return_rows_col) => {

    return _.map(_.toPairs(_.first(return_rows_col)), pair => {

        return {
            name: pair[0],
            value: pair[1]
        }
    });
}
module.exports.queryReturnRowToFooterObj = queryReturnRowToFooterObj;


/**
 * Adds labels to supplied footer object name/value pairs.
 * 
 * Supplied `raw_mappings` map should be structures as a series of key=function items.
 * The key is a `field_name` while the value is a single-arg function that returns
 * the correct raw label representation from the value received
 * 
 * Any field names not mention in the raw mappings map will be considered having translation
 * keys by default.
 * @param footer_objs 
 * @param table_name 
 * @param raw_mappings 
 */
const addFooterLabels = (footer_objs, table_name, raw_mappings = {}) => {

    return _.map(footer_objs, footer_obj => {
        if (raw_mappings[footer_obj.name]) {
            return Object.assign({}, footer_obj, {
                raw: true,
                label: raw_mappings[footer_obj.name](footer_obj.value)
            })
        } else {
            return Object.assign({}, footer_obj, {
                raw: false,
                label: `${table_name}.footer.${footer_obj.name}`
            })
        }
    });
}
module.exports.addFooterLabels = addFooterLabels;