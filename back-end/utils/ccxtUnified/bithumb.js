
const ccxtUtils = require('../CCXTUtils');

const api_id = "bithumb"; 
const _connector = ccxtUtils.getConnector(api_id);

/** This exchange has not been tested yet...
 * 
 * @param {string} external_instrument_id - eg. "XRP/BTC" or "EOS/ETH"
 * @param {string} side - word "buy" or "sell".
 * @param {object} order - whole execution order object.
 * @returns {promise} - Example result
 * {
 *   ???
 * }
 */
const createMarketOrder = async function (external_instrument_id, side, execution_order) {
  console.log(`Creating market order for ${api_id}`);

  return _connector.createOrder(external_instrument_id, order_type, side, execution_order.total_quantity, execution_order.price);
}
module.exports.createMarketOrder = createMarketOrder;

// add additional methods if needed