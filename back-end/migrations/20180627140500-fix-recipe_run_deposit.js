'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {

        return queryInterface.addColumn('recipe_run_deposit', 'asset_id', {
            type: Sequelize.INTEGER,
            references: {
              model: "asset",
              key: "id"
            },
            onUpdate: "cascade",
            onDelete: "cascade"
          }).then(done => {

            return queryInterface.renameColumn('recipe_run_deposit', 'target_exchange_account', 'target_exchange_account_id');
          });

    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('execution_order', 'asset_id');
    }
};