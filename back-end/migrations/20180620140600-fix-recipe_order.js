'use strict';

module.exports = {

    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('recipe_order', 'recipe_order_group_id', {
            type: Sequelize.INTEGER,
            references: {
                model: "recipe_order_group",
                key: "id"
            },
            onUpdate: "NO ACTION",
            onDelete: "NO ACTION"
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('recipe_order', 'recipe_order_group_id');
    }
};