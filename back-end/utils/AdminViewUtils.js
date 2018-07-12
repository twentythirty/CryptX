'use strict';


/**
 * generate an SQL snippet that selects count fo rows from table table_expr
 */
const selectCount = (table_expr) => {

    return `SELECT count(*)
            FROM ${table_expr}`
}
module.exports.selectCount = selectCount;
/**
 * generate an SQL snippet that selects distinct values on field_expr from table table_expr
 */
const selectDistinct = (field_expr, table_expr) => {

    return `SELECT DISTINCT ${field_expr}
            FROM ${table_expr}`
}
module.exports.selectDistinct = selectDistinct;
/** 
    Build chains of query parts like 
    (SELECT count(*)
    FROM
    (SELECT DISTINCT field_expr
        FROM table_expr) AS ALIAS) AS ALIAS

    these simple distinct counts make up many footer columns so its better to easily generate them.
    the query chosen is DB-specific:

    in Postgres, doing SELECT count(*) from (select distinct ...) is a lot faster than
    doing a direct SELECT COUNT(DISTINCT...), so we go for the latter 

    (info why here: https://www.postgresql.org/message-id/CAONnt+72Mtg6kyAFDTHXFWyPPY-QRbAtuREak+64Lm1KN1c-wg@mail.gmail.com)
*/
const selectCountDistinct = (field_expr, res_alias, table_expr) => {
    return `(${selectCount(`(${selectDistinct(field_expr, table_expr)}) AS ${res_alias}`)}) AS ${res_alias}`
}
module.exports.selectCountDistinct = selectCountDistinct;

/**
 * Transform a direct sequelize-style SQL rows mapping into a footer object
 * suitable for controller response.
 * 
 * the argument should be a collection with the first row being the relevant return value,
 * its value aliases will be taken as `name` keys and the values themselves as `value` keys
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