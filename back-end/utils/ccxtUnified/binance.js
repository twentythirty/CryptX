
const ccxtUtils = require('../CCXTUtils');

const api_id = "binance"; 
const _connector = ccxtUtils.getConnector(api_id);

const createMarketOrder = async function (external_instrument_id, side, order/*whole execution order*/) {
  const order_type = "market";
  console.log("Creating market order for binance");
  
  /* exchange.createOrder(external_instrument_id, order_type, side, order.total_quantity, order.price) */
  return "order placed";
}
module.exports.createMarketOrder = createMarketOrder;