'use strict';

const ccxtUtils = require('../CCXTUtils');

const binance = require('./binance');
const bitfinex = require('./bitfinex');
const huobipro = require('./huobipro');
const hitbtc2 = require('./hitbtc2');
const okex = require('./okex');
const kraken = require('./kraken');


const exchanges_supported = {
  binance,
  bitfinex,
  hitbtc2,
  huobipro, // Huobi and okex take cost(how much we want to spend) instead of amount. We need to store cost in order to make them work.
  okex,
  kraken
};

const getExchange = async function (exchange_key) {
  let [err, ccxtExchange] = await to(ccxtUtils.getConnector(exchange_key));
  if (err) TE(err.message);

  if( ccxtExchange && exchanges_supported.hasOwnProperty(ccxtExchange.id)) {
    let exchange = exchanges_supported[ccxtExchange.id];
    
    return new exchange(ccxtExchange);
  } else {
    TE(`Exchange ${exchange_key} not found in unified exchanges!`);
  }
}
module.exports.getExchange = getExchange;