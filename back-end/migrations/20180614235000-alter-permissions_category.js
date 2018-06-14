'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        const PermissionsCategory = require('../models').PermissionsCategory;
        //create permissions categories table
        return queryInterface.addColumn('permissions_category', 'order_idx', {
            type: Sequelize.SMALLINT,
            allowNull: true
        }).then(done => {
            //initial order idx is equal to id
            return PermissionsCategory.findAll({});
        }).then(categories => {
            return Promise.all(categories.map(category => {
                category.order_idx = category.id;
                return category.save();
            }));
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('permissions_category', 'order_idx');
    }
};