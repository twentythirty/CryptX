'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {

        return queryInterface.createTable('instrument_liquidity_history', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            exchange_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'exchange',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'NO ACTION'
            },
            instrument_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'instrument',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'NO ACTION'
            },
            volume: {
                type: Sequelize.DECIMAL,
                allowNull: false
            }
        });
    },
    down: (queryInterface, Sequelize) => {

        return queryInterface.dropTable('instrument_liquidity_history');
    }
};