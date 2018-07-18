'use strict';

const adminViewService = require('../services/AdminViewsService');

const fetchColLOV = async function (req, res) {
  let lov = await adminViewService.fetchMockHeaderLOV();

  return ReS(res, {
    lov
  });
};
module.exports.fetchColLOV = fetchColLOV;


const getExchanges = async function (req, res) {
  
  // mock data below
  let exchanges = [...Array(7)].map((a, index) => ({
    id: index + 1,
    name: "Bitstamp"
  }));

  return ReS(res, {
    exchanges,
    count: exchanges.count
  })
}
module.exports.getExchanges = getExchanges;