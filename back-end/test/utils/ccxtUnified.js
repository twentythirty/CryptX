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
  let ColdStorageTransfer = require('../../models').ColdStorageTransfer;
  let InstrumentService = require('../../services/InstrumentsService');
  let sequelize = require('../../models').sequelize;

  let SUPPORTED_EXCHANGES = [
    "binance",
    "bitfinex",
    /* "hitbtc2",
    "huobipro", */ // Huobi and okex take cost(how much we want to spend) instead of amount. We need to store cost in order to make them work.
    "okex"
  ];

  let EXEC_ORDER = {
    id: 4,
    external_identifier: null,
    side: 999,
    type: 71,
    price: '0',
    spend_amount: 0.004,
    total_quantity: '0',
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
    createOrder: function () {},
    fetchTicker: function () {},
    fetchTickers: function () {},
    withdraw: function() {}
  };


  before((done) => {
    sinon.stub(ccxtUtils, 'getThrottle').callsFake(id => {
      const throttle = {
        throttled: (d, fn, ...args) => Promise.resolve(fn(...args)),
        throttledUnhandled: (fn, ...args) => Promise.resolve(fn(...args))
      }

      return Promise.resolve(throttle);
    });

    done();
  })

  after((done) => {
    if (ccxtUtils.getThrottle.restore) ccxtUtils.getThrottle.restore();
    done();
  })


  beforeEach((done) => {
    sinon.stub(ccxtUtils, "getConnector").callsFake((name) => {
      let connector = Object.assign({}, CCXT_EXCHANGE, {
        id: name,
        markets: {
          'XRP/BTC': {
            limits: {
              amount: { min: 0.1, max: 1000 },
              price: { min: 0.0001, max: 1 },
              cost: { min: 0.1, max: 1000 }
            }
          }
        }
      });

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

      sinon.stub(connector, 'fetchTicker').callsFake((symbol) => {
        let response = {
          symbol: 'LTC/BTC',
          timestamp: 1541763133393,
          bid: 0.008159,
          bidVolume: 57,
          ask: 0.008161,
          askVolume: 0.12
        };  

        return Promise.resolve(response);
      });

      return Promise.resolve(connector);
    });

    done();
  });

  afterEach((done) => {
    if (ccxtUtils.getConnector.restore) ccxtUtils.getConnector.restore();
    if (sequelize.query.restore) sequelize.query.restore();

    done();
  });

  it("shall return exchange methods", () => {
    SUPPORTED_EXCHANGES.forEach(async (exchange) =>  {
      let exchange_methods = await ccxtUnified.getExchange(exchange);
      chai.expect(exchange_methods).to.not.be.false;
    });
  });

  it("shall return exchange with createMarketOrder method", () => {
    SUPPORTED_EXCHANGES.forEach(async (exchange) => {
      let ex = await ccxtUnified.getExchange(exchange);
      chai.expect(ex).to.have.property('createMarketOrder');
    });
  });

  it("shall place market order", () => {
    let objects = [];
    return Promise.all(
      SUPPORTED_EXCHANGES.map(async (exchange) =>  {
        let ex = await ccxtUnified.getExchange(exchange);
        await ex.isReady();

        let exec_order = new ExecutionOrder(EXEC_ORDER);
        objects.push(ex);

        sinon.stub(exec_order, "save").returns(() => Promise.resolve(exec_order));

        sinon.stub(ex, 'adjustQuantity').callsFake(
          async (symbol, sell_amount, price, recipe_order_id) => {
            let quantity = sell_amount / price;

            return [quantity, sell_amount];
          }
        );
        
        return ex.createMarketOrder("XRP/BTC", "sell", exec_order);
      })
    ).then(result => {
      chai.expect(objects).to.satisfy((objects) => {
        return objects.every(object => {
          return chai.expect(object._connector.createOrder.called).to.be.true;
        })
      });
    })
  });

  it("shall adjust quantity according to exchange tick size", () => {
    let objects = [];
    const spend = 0.005, price = 0.00013242, min_qnt = 1;

    sinon.stub(sequelize, 'query').callsFake(args => {
      
      return Promise.resolve({
        spend_amount: 0.02,
        spent: 0.005
      });
    });

    return Promise.all(
      SUPPORTED_EXCHANGES.map(async (exchange) =>  {
        let ex = await ccxtUnified.getExchange(exchange);
        await ex.isReady();

        let exec_order = new ExecutionOrder(EXEC_ORDER);
        objects.push(ex);

        sinon.stub(exec_order, "save").returns(() => Promise.resolve(exec_order));

        sinon.stub(ex, 'getSymbolLimits').returns(Promise.resolve({
          amount: { min: min_qnt, max: 1000},
          spend: { min: min_qnt * price, max: this.amount * price }
        }));
        
        return ex.adjustQuantity("XRP/BTC", spend, price, 1);
      })
    ).then(result => {
      chai.expect(result).to.satisfy((result) => {
        return result.every(adjustment => {
          let [quantity, spend_amount] = adjustment;
          
          return parseFloat(quantity) % 1 == 0 &&
            spend_amount == Decimal(quantity).mul(price).toString();
        })
      });
    })
  });


  it("shall adjust order to fill next order amount if it's less than minimum trade limit", () => {
    let objects = [];
    const spend = 1, price = 1, min_qnt = 0.8;

    sinon.stub(sequelize, 'query').callsFake(args => {
      
      return Promise.resolve({
        spend_amount: 2.5,
        spent: 1
      });
    });

    return Promise.all(
      SUPPORTED_EXCHANGES.map(async (exchange) =>  {
        let ex = await ccxtUnified.getExchange(exchange);
        await ex.isReady();

        sinon.stub(ex, 'getSymbolLimits').returns(Promise.resolve({
          amount: { min: min_qnt, max: 1000 },
          spend: { min: min_qnt * price, max: this.amount * price }
        }));
        
        return ex.adjustQuantity("XRP/BTC", spend, price, 1);
      })
    ).then(result => {
      chai.expect(result).to.satisfy((result) => {
        return result.every(adjustment => {
          let [quantity, spend_amount] = adjustment;
          
          return quantity == 1.5 && spend_amount == 1.5;
        })
      });
    })
  });

  it("shall adjust order to fill next order amount if it's less than minimum trade limit", () => {
    let objects = [];

    sinon.stub(InstrumentService, 'getPriceBySymbol').callsFake(args => {
      
      return Promise.resolve({ask_price: 0.001});
    });

    return Promise.all(
      SUPPORTED_EXCHANGES.map(async (exchange) =>  {
        let ex = await ccxtUnified.getExchange(exchange);
        await ex.isReady();
        
        return ex.getSymbolLimits("XRP/BTC");
      })
    ).then(result => {
      chai.expect(result).to.satisfy((result) => {
        return result.every(limit => {
          return 'spend' in limit
        })
      });
    })
  });

  it('shall adjust the amount to the correct multiple if it receives error from Binance', async () => {

    const error = new Error('binance {"msg":"The STEEM amount must be an integer multiple of 0.001","success":false,"objs":["STEEM",0.001]}');
    const amount = 72.18516518;

    ccxtUtils.getConnector.restore();
    sinon.stub(ccxtUtils, 'getConnector').callsFake(async id => {
      return {
        id: 'binance',
        async withdraw(symbol, size) {
          if(parseFloat(size) === amount) throw error;
          else return {};
        }
      }
    });

    const transfer = new ColdStorageTransfer({
      amount: amount
    });

    transfer.setDataValue('asset', 'BTC');
    transfer.setDataValue('address', 'BT1231313sfsdfs123123C');

    const exchange = await ccxtUnified.getExchange('binance');

    await exchange.withdraw(transfer);

    chai.expect(transfer.amount).to.equal(72.185);

  });

  describe('and the method transferFunds shall', () => {

    afterEach(done => {

      if(ccxtUtils.getConnector.restore) ccxtUtils.getConnector.restore();

      done();
    });

    it('shall do nothing if the receiving balance has more than needed', async () => {

      const transfer = {
        from: 'wallet',
        to: 'spot',
        currencies: [{
          currency: 'BTC',
          amount: 10
        }, {
          currency: 'ETH',
          amount: 100
        }]
      }

      if(ccxtUtils.getConnector.restore) ccxtUtils.getConnector.restore();
      sinon.stub(ccxtUtils, 'getConnector').callsFake(async id => {

        return {
          id: 'okex',
          async fetchBalance() {
            let balance = { free: {} };
            transfer.currencies.map(c => {
              balance.free[c.currency] = c.amount + _.random(0, 1)
            });
            return balance;
          }
        }

      });

      const exchange = await ccxtUnified.getExchange('okex');
      await exchange.isReady();

      const results = await exchange.transferFunds(transfer);

      for(let result of results) chai.expect(result).to.be.undefined;

    });

    it('shall request the correct amount to be transfered', async () => {

      const transfer = {
        from: 'wallet',
        to: 'spot',
        currencies: [{
          currency: 'BTC',
          amount: 10
        }, {
          currency: 'ETH',
          amount: 100
        }]
      }

      if(ccxtUtils.getConnector.restore) ccxtUtils.getConnector.restore();
      sinon.stub(ccxtUtils, 'getConnector').callsFake(async id => {

        return {
          id: 'okex',
          async fetchBalance(options = {}) {
            let balance = { free: {} };
            if(options.type === transfer.to) {
              transfer.currencies.map(c => {
                balance.free[c.currency] = c.amount / 2;
              });
            }
            else {
              transfer.currencies.map(c => {
                balance.free[c.currency] = c.amount;
              });
            }
            return balance;
          },
          async transferFunds(currency, from, to, amount) {
            return { currency, from, to, amount }
          }
        }

      });

      const exchange = await ccxtUnified.getExchange('okex');
      await exchange.isReady();

      const results = await exchange.transferFunds(transfer);

      for(let result of results) {
        
        const matching_transfer = transfer.currencies.find(c => c.currency === result.currency);

        chai.expect(result.from).to.equal(transfer.from);
        chai.expect(result.to).to.equal(transfer.to);
        chai.expect(result.amount).to.equal(matching_transfer.amount / 2);

      }

    });

  });

});