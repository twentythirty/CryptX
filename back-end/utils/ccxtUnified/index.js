'use strict';

const binance = require('./binance');
const bitfinex = require('./bitfinex');
const huobipro = require('./huobipro');

const exchanges = {
  binance,
  bitfinex,
  huobipro
};

const getExchange = function (exchange_key) {

  if( exchanges.hasOwnProperty(exchange_key) )
    return exchanges[exchange_key];
  else return false;
}
module.exports.getExchange = getExchange;