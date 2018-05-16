'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {

        return queryInterface.renameColumn(
            'execution_order_fill',
            'fill_timestamp',
            'timestamp'
        ).then(done => {

            return queryInterface.renameColumn(
                'execution_order_fill',
                'filled_quantity',
                'quantity'
            );
        }).then(done => {

            return queryInterface.addColumn(
                'execution_order_fill',
                'price', {
                    type: Sequelize.DECIMAL
                });
        });
    },
    down: (queryInterface, Sequelize) => {

        return queryInterface.removeColumn(
            'execution_order_fill',
            'price'
        ).then( done => {

            return queryInterface.renameColumn(
                'execution_order_fill',
                'quantity',
                'filled_quantity'
            )
        }).then( done => {

            return queryInterface.renameColumn(
                'execution_order_fill',
                'timestamp',
                'fill_timestamp'
            );
        });
    }
};