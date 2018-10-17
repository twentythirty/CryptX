'use strict';

const MVP_EXCHANGES = ['Binance','OKEx','Bitfinex']

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('exchange', 'is_mappable', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }).then(done => {

      //setup the MVP exchanges
      return queryInterface.sequelize.query(`
        UPDATE exchange SET is_mappable=true WHERE name IN (:mvp_names)
      `, { 
        replacements: {
          mvp_names: MVP_EXCHANGES
        }
      })
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('exchange', 'is_mappable');
  }
};
