'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {

        return queryInterface.removeColumn(
            'execution_order',
            'instrument_id'
        ).then(done => {

            return queryInterface.addColumn(
                'execution_order',
                'price', {
                    type: Sequelize.DECIMAL
                }
            )
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn(
            'execution_order',
            'price'
        ).then(done => {

            return queryInterface.addColumn(
                'execution_order',
                'instrument_id', {
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'instrument',
                        key: 'id'
                    },
                    onUpdate: 'cascade',
                    onDelete: 'cascade'
                }
            )
        });
    }
};