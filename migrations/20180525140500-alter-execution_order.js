'use strict';

const remove_cols_recur = (queryInterface, cols) => {
    //guard against empty collection
    if (!cols || cols.length == 0) {
        return null;
    }

    //process first col in collection
    return queryInterface.removeColumn('execution_order', _.head(cols)).then(done => {
        //recur on remaining cols in the async
        if (_.tail(cols).length == 0) {
            return done;
        } else {
            return remove_cols_recur(queryInterface, _.tail(cols));
        }
    });
};

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('execution_order', 'exchange_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'exchange',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        }).then(done => {
            return queryInterface.addColumn('execution_order', 'external_identifier', {
                type: Sequelize.STRING
            })
        }).then(done => {

            return queryInterface.addColumn('execution_order', 'side', {
                type: Sequelize.SMALLINT
            })
        }).then(done => {

            return queryInterface.addColumn('execution_order', 'time_in_force', {
                type: Sequelize.DATE
            })
        })
    },
    down: (queryInterface, Sequelize) => {
        return remove_cols_recur(queryInterface, [
            'time_in_force',
            'side',
            'external_identifier',
            'exchange_id'
        ]);
    }
};