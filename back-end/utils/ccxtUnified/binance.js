
const ccxtUtils = require('../CCXTUtils');

const api_id = "binance"; 
const _connector = ccxtUtils.getConnector(api_id);

/** This exchange takes amount of asset we want to buy to purchase that amount. Base asset will cost
 * will be calculated and deducted from balance. Order response returns amount of asset purchased, no
 * fee information.
 * 
 * @param {string} external_instrument_id - eg. "XRP/BTC" or "EOS/ETH"
 * @param {string} side - word "buy" or "sell".
 * @param {object} order - whole execution order object.
 * @returns {promise} - Example result
 * {
 *   id: '123',
 *   timestamp: 1532444115700,
 *   datetime: '2018-07-24T14:55:15.700Z',
 *   lastTradeTimestamp: undefined,
 *   symbol: 'XRP/BTC',
 *   type: 'market',
 *   side: 'buy',
 *   price: 0,
 *   amount: 1,
 *   cost: 0,
 *   filled: 1,
 *   remaining: 0,
 *   status: 'closed',
 *   fee: undefined,
 *   trades: undefined
 * }
 */
const createMarketOrder = async function (external_instrument_id, side, execution_order) {
  console.log(`Creating market order for ${api_id}`);
  const order_type = "market";

  return _connector.createOrder(external_instrument_id, order_type, side, execution_order.total_quantity, execution_order.price);
}
module.exports.createMarketOrder = createMarketOrder;

// add additional methods if needed