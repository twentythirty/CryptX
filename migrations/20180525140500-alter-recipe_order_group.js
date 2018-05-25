'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('recipe_order_group', 'recipe_run_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'recipe_run',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('recipe_order_group', 'recipe_run_id');
    }
};