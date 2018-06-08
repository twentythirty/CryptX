'use strict';

module.exports = {

    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('recipe_order', 'price', {
            type: Sequelize.DECIMAL,
            allowNull: false
        }).then(done => {

            return queryInterface.addColumn('recipe_order', 'quantity', {
                type: Sequelize.DECIMAL,
                allowNull: false
            });
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('recipe_order', 'price')
        .then(done => {
            return queryInterface.removeColumn('recipe_order', 'quantity')
        });
    }
};