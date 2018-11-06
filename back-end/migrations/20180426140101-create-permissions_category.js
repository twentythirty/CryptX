'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {

        //create permissions categories table
        return queryInterface.createTable('permissions_category', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            }
        }).then(done => {
            //add foreign key column to permissions
            return queryInterface.addColumn('permission', 'category_id', {
                type: Sequelize.INTEGER,
                references: {
                    model: "permissions_category",
                    key: "id"
                },
                onUpdate: "cascade",
                onDelete: "cascade"
            });
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('permission', 'category_id').then(done => {

           return queryInterface.dropTable('permissions_category');
        });
    }
};