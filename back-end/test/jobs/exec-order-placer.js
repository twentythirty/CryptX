'use strict';

let app = require("../../app");
let chai = require("chai");
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
const sinon = require("sinon");

chai.use(chaiAsPromised);

const ccxt = require('ccxt');

const execOrderPlacer = require('../../jobs/exchange-order-placer');

const RecipeOrder = require('../../models').RecipeOrder;
const RecipeOrderGroup = require('../../models').RecipeOrderGroup;
const Instrument = require('../../models').Instrument;
const ExecutionOrder = require('../../models').ExecutionOrder;
const InstrumentExchangeMapping = require('../../models').InstrumentExchangeMapping;
const Exchange = require('../../models').Exchange;


describe("Execution Order Placer job", () => {

  let stubbed_config = {
    models: {
      RecipeOrder: RecipeOrder,
      RecipeOrderGroup: RecipeOrderGroup,
      ExecutionOrder: ExecutionOrder,
      Instrument: Instrument,
      InstrumentExchangeMapping,
      Exchange
    },
    ccxt: ccxt
  };

  before(done => {
    app.dbPromise.then(migrations => {
      console.log('Migrations: %o', migrations);

      done();
      });
  });

  after(done => {

      done();
  });

  let EXCHANGE_IDS = [...Array(6)].map((value, index) => index + 1);
  
  let INSTRUMENT = { id: 3,
    symbol: 'XRP/BTC',
    transaction_asset_id: 28,
    quote_asset_id: 2
  };

  let EXEC_ORDER = {
    id: 4,
    external_identifier: null,
    side: 999,
    type: 71,
    price: '0.01',
    total_quantity: '5',
    status: 61,
    placed_timestamp: null,
    completed_timestamp: null,
    time_in_force: null,
    recipe_order_id: 2,
    instrument_id: 3,
    exchange_id: 6,
    failed_attempts: 0
  };

  let INSTRUMENT_EXCHANGE_MAP = {
    external_instrument_id: 'XRP/BTC',
    tick_size: '0.00000001',
    exchange_id: 5,
    instrument_id: 10
  }

  let EXCHANGE_INFO = {
    id: 5, 
    name: 'Mock_Exchange',
    api_id: 'binance'
  }

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

  const EXEC_ORDERS_PER_EXCHANGE = 3;

  beforeEach(() => {
    sinon.stub(ccxt, EXCHANGE_INFO.api_id).callsFake((data) => {
      let exchange = Object.assign({}, CCXT_EXCHANGE);

      sinon.stub(exchange, 'createOrder').callsFake((...args) => {
        // should help understand what properties have in them: https://github.com/ccxt/ccxt/wiki/Manual#order-structure
        let [symbol, order_type, order_side, amount, price] = args;
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

      return exchange;
    });

    sinon.stub(ExecutionOrder, 'findAll').callsFake(() => {
      let execution_orders = [...Array(EXCHANGE_IDS.length * EXEC_ORDERS_PER_EXCHANGE)]
        .map((value, index) => {
          let result = /* Object.assign({}, EXEC_ORDER); */new ExecutionOrder(EXEC_ORDER);
          result.exchange_id = Math.floor(index / EXEC_ORDERS_PER_EXCHANGE) + 1;
          result.Instrument = Object.assign({}, INSTRUMENT);

          sinon.stub(result, 'save').returns(Promise.resolve(result));
          /* result.save = () => Promise.resolve(result); */

          return result;
        });

      return Promise.resolve(execution_orders);
    });

    sinon.stub(InstrumentExchangeMapping, "findOne").callsFake((args) => {
      let mapping = new InstrumentExchangeMapping(
        Object.assign(INSTRUMENT_EXCHANGE_MAP, {
          exchange_id: args.exchange_id,
          instrument_id: args.instrument_id
        })
      );

      return Promise.resolve(mapping);
    });

    sinon.stub(Exchange, 'findOne').callsFake((args) => {
      let exchange = new Exchange(Object.assign(EXCHANGE_INFO, {
        id: args.exchange_id
      }));

      return Promise.resolve(exchange);
    });
  })

  afterEach(() => {
    ccxt[EXCHANGE_INFO.api_id].restore();
    ExecutionOrder.findAll.restore();
    InstrumentExchangeMapping.findOne.restore();
    Exchange.findOne.restore();
  });

  it("job body shall exist", () => {
    chai.expect(execOrderPlacer.JOB_BODY).to.exist;
  });

  it('call required methods to get data needed', () => {
      
    return execOrderPlacer.JOB_BODY(stubbed_config, console.log).then(result => {
      let orders_with_data = result;

      chai.assert.isTrue(ExecutionOrder.findAll.called);
      chai.assert.isTrue(InstrumentExchangeMapping.findOne.called);
      chai.assert.isTrue(Exchange.findOne.called);
      chai.expect(orders_with_data).to.satisfy((orders) => {
        return orders.every(order => {
          return order[0].save.called;
        })
      }, "Every order was updated and saved");
      
    });
  });

  it('increment failed_attempts counter after order placement failed', () => {
    ccxt[EXCHANGE_INFO.api_id].restore();

    sinon.stub(ccxt, EXCHANGE_INFO.api_id).callsFake(() => {
      let exchange = Object.assign({}, CCXT_EXCHANGE);

      sinon.stub(exchange, 'createOrder').callsFake(() => {
        return Promise.reject();
      })
      
      return exchange;
    });

    return execOrderPlacer.JOB_BODY(stubbed_config, console.log).then(result => {
      let orders_with_data = result;

      chai.expect(orders_with_data).to.satisfy(data => {
        return data.every(failed_order => {
          return chai.expect(failed_order[0].failed_attempts).to.be.equal(EXEC_ORDER.failed_attempts + 1);
        });
      });
    });
  });
});