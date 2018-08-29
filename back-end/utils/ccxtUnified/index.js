'use strict';

const binance = require('./binance');
const bitfinex = require('./bitfinex');
const huobipro = require('./huobipro');
const bithumb = require('./bithumb');
const hitbtc2 = require('./hitbtc2');
const okex = require('./okex');

const exchanges_supported = {
  binance: binance,
  bitfinex,
  hitbtc2/* ,
  bithumb, */
/*   huobipro, // Huobi and okex take cost(how much we want to spend) instead of amount. We need to store cost in order to make them work.
  okex */
};

const getExchange = function (exchange_key) {

  if( exchanges_supported.hasOwnProperty(exchange_key) )
    return exchanges_supported[exchange_key];
  else {
    TE(`Exchange ${exchange_key} not found in unified exchanges!`);
  }
}
module.exports.getExchange = getExchange;