'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('setting', [{
      key: 'MARKETCAP_LIMIT_PERCENT',
      value: SYSTEM_SETTINGS.MARKETCAP_LIMIT_PERCENT,
      type: SETTING_DATA_TYPES.Float
    }, {
      key: 'INDEX_LCI_CAP',
      value: SYSTEM_SETTINGS.INDEX_LCI_CAP,
      type: SETTING_DATA_TYPES.Integer
    }, {
      key: 'INDEX_MCI_CAP',
      value: SYSTEM_SETTINGS.INDEX_LCI_CAP,
      type: SETTING_DATA_TYPES.Integer
    }]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('setting', {
      where: {
        key: [
          'MARKETCAP_LIMIT_PERCENT',
          'INDEX_LCI_CAP',
          'INDEX_MCI_CAP'
        ]
      }
    });
  }
};