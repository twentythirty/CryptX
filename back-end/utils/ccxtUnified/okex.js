
const ccxtUtils = require('../CCXTUtils');

const api_id = "okex"; 
const _connector = ccxtUtils.getConnector(api_id);

/** This exchange uses cost(amount we want to spend) instead of amount to buy cryptocurrency. Cost will be deducted from
 * base asset and amount of asset we get will be calculated by exchange.
 * 
 * @param {*} external_instrument_id - eg. "XRP/BTC" or "EOS/ETH"
 * @param {*} side - word "buy" or "sell".
 * @param {*} order - whole execution order object.
 * @returns {promise} - Example result
 * {
 *   id: '123',
 *   timestamp: 1532938747205,
 *   datetime: '2018-07-30T08:19:07.205Z',
 *   lastTradeTimestamp: undefined,
 *   status: undefined,
 *   symbol: 'XRP/BTC',
 *   type: 'market',
 *   side: 'buy',
 *   price: 0.00001,
 *   amount: 2.123456798,
 *   filled: undefined,
 *   remaining: undefined,
 *   cost: undefined,
 *   trades: undefined,
 *   fee: undefined
 * }
 */
const createMarketOrder = async function (external_instrument_id, side, execution_order) {
  console.log(`Creating market order to ${api_id}
  Instrument - ${external_instrument_id}
  Order type - ${order_type}
  Order side - ${side}
  Total quantity - ${execution_order.total_quantity}
  Price - ${execution_order.price}`);
  const order_type = "market";

  return false; //_connector.createOrder(external_instrument_id, order_type, side, execution_order.total_quantity, execution_order.price);
}
module.exports.createMarketOrder = createMarketOrder;

// add additional methods if needed