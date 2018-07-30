'use strict';

const Exchange = require('../models').Exchange;

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
