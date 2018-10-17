'use strict';

const ExchangeService = require('../services/ExchangeService');

const Exchange = require('../models').Exchange;
const ExchangeAccount = require('../models').ExchangeAccount;

const getExchanges = async function (req, res) {
  //return partial list of exchanges if ignore_unmappable is present
  let seq_query = req.seq_query || { where: {} };
  const fetch_exclusive = req.query.ignore_unmappable == 'true' || false;
  if (fetch_exclusive) {
    seq_query.where.is_mappable = true;
  } else {
    delete seq_query.where.is_mappable;
  }
  
  let [err, result] = await to(Exchange.findAndCountAll(seq_query));

  if (err) return ReE(res, err, 422);

  let { rows: exchanges, count} = result;

  return ReS(res, {
    exchanges: exchanges.map(e => e.toWeb()),
    count
  })
}
module.exports.getExchanges = getExchanges;

const createExchangeAccount = async (req, res) => {

  const { exchange_id } = req.params; 
  const { account_type, asset_id, address, is_active } = req.body;

  const [ err, exchange_account ] = await to(ExchangeService.createExchangeAccount(account_type, asset_id, exchange_id, address, is_active));
  if(err) return ReE(res, err.message, 422);

  return ReS(res, { exchange_account });

};
module.exports.createExchangeAccount= createExchangeAccount;