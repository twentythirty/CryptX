'use strict';

let app = require("../../app");
let chai = require("chai");
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
const sinon = require("sinon");

chai.use(chaiAsPromised);

const ccxt = require('ccxt');
const ccxtUnified = require('../../utils/ccxtUnified');

const execOrderPlacer = require('../../jobs/exchange-order-placer');

const sequelize = require('../../models').sequelize;
const RecipeOrder = require('../../models').RecipeOrder;
const RecipeOrderGroup = require('../../models').RecipeOrderGroup;
const Instrument = require('../../models').Instrument;
const ExecutionOrder = require('../../models').ExecutionOrder;
const InstrumentExchangeMapping = require('../../models').InstrumentExchangeMapping;
const Exchange = require('../../models').Exchange;
const InvestmentRun = require('../../models').InvestmentRun;


describe("Execution Order Placer job", () => {

  let stubbed_config = {
    models: {
      RecipeOrder: RecipeOrder,
      RecipeOrderGroup: RecipeOrderGroup,
      ExecutionOrder: ExecutionOrder,
      Instrument: Instrument,
      InstrumentExchangeMapping,
      Exchange,
      InvestmentRun,
      sequelize
    },
    ccxtUnified,
    fail_ids: []
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
    spend_amount: 0.01,
    status: 61,
    placed_timestamp: null,
    completed_timestamp: null,
    time_in_force: null,
    recipe_order_id: 2,
    instrument_id: 3,
    exchange_id: 6,
    failed_attempts: 4
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
    createOrder: function () {},
    fetchTicker: function () {},
    fetchTickers: function () {},
  };

  let INVESTMENT_RUN = {
    id: 1,
    started_timestamp: new Date("Fri Jun 29 2018 09:57:04 GMT+0300 (EEST)"),
    updated_timestamp: new Date("Fri Jun 29 2018 09:57:04 GMT+0300 (EEST)"),
    completed_timestamp: null,
    user_created_id: 2,
    strategy_type: 102,
    is_simulated: false,
    status: 302,
    deposit_usd: "399",
  }

  const EXEC_ORDERS_PER_EXCHANGE = 3;
  let ALL_STUBBED_EXCHANGES = [];

  beforeEach(() => {
    /* sinon.stub(ccxt, EXCHANGE_INFO.api_id).callsFake((data) => {
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

      ALL_STUBBED_EXCHANGES.push(exchange);

      return exchange;
    }); */

    sinon.stub(sequelize, 'query').callsFake(() => {
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
      mapping.Exchange = EXCHANGE_INFO;

      return Promise.resolve(mapping);
    });

    sinon.stub(Exchange, 'findOne').callsFake((args) => {
      let exchange = new Exchange(EXCHANGE_INFO);

      return Promise.resolve(exchange);
    });

    /* sinon.stub(sequelize, 'query').returns(Promise.resolve(
      new InvestmentRun( INVESTMENT_RUN )
    )); */

    sinon.stub(ccxtUnified, "getExchange").callsFake((exch) => {
      let exchange = class StubExchangeClass {

        constructor () {
          this.api_id = 'stub';
          this._connector = Object.assign({}, CCXT_EXCHANGE);
        };

        isReady() {
          return Promise.resolve();
        };

        createMarketOrder (external_instrument_id, side, execution_order) {
          this.isReady();
          const order_type = "market";
          let filled = 2.5, price = execution_order.price, amount = execution_order.total_quantity;
        
          let exchange_response = {
            info: {},
            id: 999999,
            timestamp: 1530781500378,
            datetime: '2018-07-05T09:05:00.378Z',
            lastTradeTimestamp: undefined,
            symbol: external_instrument_id,
            type: order_type,
            side: side,
            price: price,
            amount: amount,
            filled: filled, // amount filled.
            cost: filled * price, // 'cost' = 'filled' * 'price'
            remaining: amount - filled, // amount remaining to be filled, same as 'remaining' = 'amount' - 'filled'
            status: 'open', // possible: 'open', 'closed', 'canceled'
            fee: undefined
          };

          return Promise.resolve(Object.assign({}, exchange_response));
        };
      }
      
      return Promise.resolve(new exchange());
    });
  })

  afterEach(() => {
    /* ccxt[EXCHANGE_INFO.api_id].restore(); */
    ccxtUnified.getExchange.restore();
    /* ExecutionOrder.findAll.restore(); */
    InstrumentExchangeMapping.findOne.restore();
    Exchange.findOne.restore();
    sequelize.query.restore();
    ALL_STUBBED_EXCHANGES = [];
  });

  it("job body shall exist", () => {
    return chai.expect(execOrderPlacer.JOB_BODY).to.exist;
  });

  it('call required methods to get data needed', () => {
      
    return execOrderPlacer.JOB_BODY(stubbed_config, console.log).then(result => {
      let orders_with_data = result;

      chai.assert.isTrue(sequelize.query.called);
      chai.assert.isTrue(InstrumentExchangeMapping.findOne.called);
      /* chai.assert.isTrue(Exchange.findOne.called); */
      chai.expect(orders_with_data).to.satisfy((orders) => {
        return orders.every(order => {
          return order[0].save.called;
        })
      }, "Every order was updated and saved");
      
    });
  });

  it('increment failed_attempts counter after order placement failed', () => {
    if (ccxtUnified.getExchange.restore())
      ccxtUnified.getExchange.restore();

    sinon.stub(ccxtUnified, "getExchange").callsFake((exch) => {
      let exchange = class StubExchangeClass {

        constructor () {
          this.api_id = 'stub';
          this._connector = Object.assign({}, CCXT_EXCHANGE);
        };

        isReady() {
          return Promise.resolve();
        };

        async createMarketOrder (external_instrument_id, side, execution_order) {
          return Promise.reject({
            message: "Placing order failed stub"
          });
        };
      }

      return Promise.resolve(new exchange);
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

  it('execution order status should change to failed if failed_attempts reaches threshold', () => {
    if (ccxtUnified.getExchange.restore())
      ccxtUnified.getExchange.restore();
      
    sinon.stub(ccxtUnified, "getExchange").callsFake((exch) => {
      let exchange = class StubExchangeClass {

        constructor () {
          this.api_id = 'stub';
          this._connector = Object.assign({}, CCXT_EXCHANGE);
        };

        isReady() {
          return this.ready;
        };

        async createMarketOrder (external_instrument_id, side, execution_order) {
          return Promise.reject({
            message: "Place order fail stub"
          });
        };
      }

      return Promise.resolve(new exchange);
    });
    
    return execOrderPlacer.JOB_BODY(stubbed_config, console.log).then(result => {
      let orders_with_data = result;

      chai.expect(orders_with_data).to.satisfy(data => {
        return data.every(failed_order => {
          return chai.expect(failed_order[0].status).to.be.equal(EXECUTION_ORDER_STATUSES.Failed);
        });
      });
    });
  });

/*   it('not send order to exchanges if order is simulated', () => {
    if (sequelize.query.restore) sequelize.query.restore();

    sinon.stub(sequelize, 'query').returns(Promise.resolve(
      Object.assign(new InvestmentRun( INVESTMENT_RUN ), { is_simulated: true })
    ));

    return execOrderPlacer.JOB_BODY(stubbed_config, console.log).then(result => {
      chai.expect(ALL_STUBBED_EXCHANGES).to.satisfy((stubbed_exchanges) => {
        return stubbed_exchanges.every(stubbed_exchange => {
          return chai.expect(stubbed_exchange.createOrder.notCalled).to.be.true;
        });
      })
    });
  }); */

});