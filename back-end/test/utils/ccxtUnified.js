let chai = require("chai");
let chaiAP = require('chai-as-promised');
let should = chai.should();
const sinon = require('sinon');
const app = require('../../app');
const ccxt = require('ccxt');
const ccxtUtils = require('../../utils/CCXTUtils');
const ccxtUnified = require('../../utils/ccxtUnified');

chai.use(chaiAP);

describe('CCXTUnified', () => {

  let test_exchange;
  let test_connector;

  before(done => {

    app.dbPromise.then(migrations => {

      
    }).then(exchange => {

      done();
    });
  });

  let ExecutionOrder = require('../../models').ExecutionOrder;

  let SUPPORTED_EXCHANGES = [
    "binance",
    "bitfinex",
    "hitbtc2",
    /* "bithumb", */ // doesn't work with BTC & ETH
/*     "huobipro", // Huobi and okex take cost(how much we want to spend) instead of amount. We need to store cost in order to make them work.
    "okex" */
  ];

  let EXEC_ORDER = {
    id: 4,
    external_identifier: null,
    side: 999,
    type: 71,
    price: '0.0001',
    total_quantity: '0.0001',
    status: 61,
    placed_timestamp: null,
    completed_timestamp: null,
    time_in_force: null,
    recipe_order_id: 2,
    instrument_id: 3,
    exchange_id: 6,
    failed_attempts: 4
  };

  let CCXT_EXCHANGE = { 
    has: {
      CORS: false,
      publicAPI: true,
      privateAPI: true,
      cancelOrder: true,
      cancelOrders: false,
      createDepositAddress: false,
      createOrder: true,
      createMarketOrder: true,
      createLimitOrder: true,
      deposit: false,
      editOrder: 'emulated',
      fetchBalance: true,
      fetchBidsAsks: true,
      fetchClosedOrders: true,
      fetchCurrencies: false,
      fetchDepositAddress: true,
      fetchFundingFees: true,
      fetchL2OrderBook: true,
      fetchMarkets: true,
      fetchMyTrades: true,
      fetchOHLCV: true,
      fetchOpenOrders: true,
      fetchOrder: true,
      fetchOrderBook: true,
      fetchOrderBooks: false,
      fetchOrders: true,
      fetchTicker: true,
      fetchTickers: true,
      fetchTrades: true,
      fetchTradingFees: false,
      fetchTradingLimits: false,
      withdraw: true
    },
    createOrder: function () {}
  };

  beforeEach(() => {
    sinon.stub(ccxtUtils, "getConnector").callsFake((name) => {
      let connector = Object.assign({}, CCXT_EXCHANGE);

      sinon.stub(connector, 'createOrder').callsFake((...args) => {
        // should help understand what properties have in them: https://github.com/ccxt/ccxt/wiki/Manual#order-structure
        let [symbol, order_type, order_side, amount, price, params] = args;
        let filled = 2.5;
        
        let exchange_response = {
          info: {},
          id: 999999,
          timestamp: 1530781500378,
          datetime: '2018-07-05T09:05:00.378Z',
          lastTradeTimestamp: undefined,
          symbol: symbol,
          type: order_type,
          side: order_side,
          price: price,
          amount: amount,
          filled: filled, // amount filled.
          cost: filled * price, // 'cost' = 'filled' * 'price'
          remaining: amount - filled, // amount remaining to be filled, same as 'remaining' = 'amount' - 'filled'
          status: 'open', // possible: 'open', 'closed', 'canceled'
          fee: undefined
        }
  
        return Promise.resolve(exchange_response);
      });

      return connector;
    });

    
  });

  afterEach(() => {
    ccxtUtils.getConnector.restore();
  });

  it("shall return exchange methods", () => {
    SUPPORTED_EXCHANGES.forEach(exchange => {
      let exchange_methods = ccxtUnified.getExchange(exchange);
      chai.expect(exchange_methods).to.not.be.false;
    });
  });

  it("shall return exchange with createMarketOrder method", () => {
    SUPPORTED_EXCHANGES.forEach(exchange => {
      let ex = new (ccxtUnified.getExchange(exchange))();
      chai.expect(ex).to.have.property('createMarketOrder');
    });
  });

  it("shall place market order", () => {
    let objects = [];
    return Promise.all(
      SUPPORTED_EXCHANGES.map(exchange => {
        let ex = new (ccxtUnified.getExchange(exchange))();
        let exec_order = new ExecutionOrder(EXEC_ORDER);
        objects.push(ex);

        sinon.stub(exec_order, "save").returns(() => Promise.resolve(exec_order));
        
        return ex.createMarketOrder("XRP/BTC", "sell", EXEC_ORDER);
      })
    ).then(result => {
      chai.expect(objects).to.satisfy((objects) => {
        return objects.every(object => {
          return chai.expect(object._connector.createOrder.called).to.be.true;
        })
      });
    })
  });
});