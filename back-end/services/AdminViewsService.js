'use strict';


const sequelize = require('../models').sequelize;
const builder = require('../utils/AdminViewUtils');

const fetchUsersViewFooter = async () => {

    const simple_fields = {
        first_name: 'first_name',
        last_name: 'last_name',
        email: 'email', 
        created_timestamp: 'created_timestamp::date'
    }

    const query_parts = _.concat(_.map(simple_fields, (field_expr, alias) => {
        //using public.user, since pg has a default user table and its very different
        return builder.selectCountDistinct(field_expr, alias, 'public.user')
    }), 
    //attach the more fancy footer column query as-is to avoid convoluted parametrization
    `(SELECT SUM(a)
    FROM
      (SELECT CASE WHEN is_active THEN 1 ELSE 0 END as a
       FROM public.USER) AS active_users) AS is_active`)

    const footer_values = (await sequelize.query(`SELECT\n${_.join(query_parts, ',\n')};`))[0];

    return builder.queryReturnRowToFooterObj(footer_values);
}
module.exports.fetchUsersViewFooter = fetchUsersViewFooter;