'use strict';

const ExchangeService = require('../services/ExchangeService');

const Exchange = require('../models').Exchange;
const ExchangeAccount = require('../models').ExchangeAccount;

const getExchanges = async function (req, res) {
  
  let [err, result] = await to(Exchange.findAndCountAll(req.seq_query));

  if (err) return ReE(res, err, 422);

  let { rows: exchanges, count} = result;

  return ReS(res, {
    exchanges: exchanges.map(e => e.toWeb()),
    count
  })
}
module.exports.getExchanges = getExchanges;

const createExchangeAccount = async (req, res) => {
  const exchange_id = parseInt(req.params.exchange_id); 
  const { account_type, asset_id, address } = req.body;

  const [ err, exchange_account ] = await to(ExchangeService.createExchangeAccount(account_type, asset_id, exchange_id, address));
  if(err) return ReE(res, err.message, 422);

  return ReS(res, { exchange_account });

};
module.exports.createExchangeAccount= createExchangeAccount;