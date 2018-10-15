'use strict';

const MAX_NUM_FORMAT_DECIMALS = 28;
/**
 * Transforms `where_clause` string into digestable SQL by prepending the WHERE keyword if the string
 * has content
 * 
 * Otherwise returns an empty string not to confuse the SQL engine.
 */
const whereOrEmpty = (where_clause) => `${_.isEmpty(where_clause)? '' : `WHERE ${where_clause}`}`;
module.exports.whereOrEmpty = whereOrEmpty;

/**
 * Adds `addition` to existing WHERE clause list being built for later query.
 * 
 * if there is no addition, returns the current `where_clause`.
 * 
 * If there is no current clause, returns `addition`.
 * 
 * Otherwise, uses an AND junction.
 */
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

/**
 * generate an SQL snippet that selects the sum offield_expr values from table table_expr
 */
const selectSum = (field_expr, table_expr, where_clause = '') => {

    return `SELECT SUM(${field_expr})
            FROM ${table_expr}
            ${whereOrEmpty(where_clause)}
    `
}
module.exports.selectSum = selectSum;

/**
 * generate an SQL snippet that selects the sum of a field and trim the trailing zeroes
 */
const selectSumTrim = (field_expr, table_expr, where_clause = '', trailing_decimals_raw = 2) => {

    let trailing_decimals = trailing_decimals_raw;
    if (!_.isNumber(trailing_decimals) || trailing_decimals < 0) {
        //bad values or negatives interpreted as max length
        trailing_decimals = MAX_NUM_FORMAT_DECIMALS;
    }

    return `SELECT CAST(to_char(SUM(${field_expr}), 'FM99999999990.${_.repeat('9', trailing_decimals)}') AS NUMERIC)
            FROM ${table_expr}
            ${whereOrEmpty(where_clause)}
    `
}
module.exports.selectSumTrim = selectSumTrim;

/**
 * generate an SQL snippet that selects data values of columns in the fields array from table table_expr
 */
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
 * surround passed SELECT... expressions with parens and another SELECT statement to make it SQL-engine ready
 * applies aliases to the queries to ensure return fields
 */
const joinQueryParts = (query_parts, aliases) => {

    const mapping = _.zipObject(aliases, query_parts)
    return `SELECT\n${_.join(_.map(mapping, (query_part, alias) => `(${query_part}) AS ${alias}`), ',\n')};`
}
module.exports.joinQueryParts = joinQueryParts;
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
    return `${selectCount(`(${selectDistinct(field_expr, table_expr, where_clause)}) AS ${res_alias}`, res_alias)}`
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
 * Supplied `args_mappings` map should be structures as a series of key=function items.
 * The key is a `field_name` while the value is a single-arg function that returns
 * the args required for the template as an object of key-value-pairs
 * 
 * Any field names not mention in the args_mappings map will be considered having the field `value` as their only translation arg.
 * @param footer_objs 
 * @param table_name 
 * @param args_mappings
 */
const addFooterLabels = (footer_objs, table_name, args_mappings = {}) => {

    return _.map(footer_objs, footer_obj => {

        let template_args = {};

        if (args_mappings[footer_obj.name]) {
            template_args = args_mappings[footer_obj.name](footer_obj.value)
        } else {
            template_args = {
                [footer_obj.name]: footer_obj.value
            }
        }

        return Object.assign({}, footer_obj, {
            template: `${table_name}.footer.${footer_obj.name}`,
            args: template_args
        })
    });
}
module.exports.addFooterLabels = addFooterLabels;