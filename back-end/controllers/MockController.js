'use strict';

const adminViewService = require('../services/AdminViewsService');

const fetchColLOV = async function (req, res) {
  let lov = await adminViewService.fetchMockHeaderLOV();

  return ReS(res, {
    lov
  });
};
module.exports.fetchColLOV = fetchColLOV;

const create_mock_footer = function (keys, name) {
  // delete this function after mock data is replaced
  let footer = [...Object.keys(keys)].map((key, index) => {
    return {
      "name": key,
      "value": 999,
      "template": name + ".footer." + key,
      "args": {
          [key]: 999
      }
    }
  });
  return footer;
};
module.exports.create_mock_footer = create_mock_footer;

const getExchanges = async function (req, res) {
  
  // mock data below
  let exchanges = [...Array(7)].map((a, index) => ({
    id: index + 1,
    name: "Bitstamp"
  }));

  return ReS(res, {
    exchanges,
    count: exchanges.length
  })
}
module.exports.getExchanges = getExchanges;
