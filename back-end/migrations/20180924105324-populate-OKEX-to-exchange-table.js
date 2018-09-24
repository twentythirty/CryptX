'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('exchange', [{
      name: 'OKEx',
      api_id: 'okex'
    }]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('exchange', { name: 'OKEx' });
  }
};
