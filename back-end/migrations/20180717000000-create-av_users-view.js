'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.query(`CREATE OR REPLACE VIEW av_users (
            id,
            first_name,
            last_name,
            email,
            created_timestamp,
            is_active
        )
        AS
        (SELECT
            id,
            first_name,
            last_name,
            email, 
            created_timestamp,
            case when is_active = true then 'users.entity.active'
            else 'users.entity.inactive' end as is_active
        FROM public.user)`);
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.query('DROP VIEW av_users');
    }
};