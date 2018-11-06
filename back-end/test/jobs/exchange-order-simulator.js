'use strict';

let app = require("../../app");
let chai = require("chai");
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
const sinon = require("sinon");

chai.use(chaiAsPromised);

const ccxt = require('ccxt');
const ccxtUnified = require('../../utils/ccxtUnified');

const execOrderSimulator = require('../../jobs/exchange-order-simulator');

const sequelize = require('../../models').sequelize;
const ExecutionOrder = require('../../models').ExecutionOrder;
const InstrumentExchangeMapping = require('../../models').InstrumentExchangeMapping;
const Exchange = require('../../models').Exchange;


describe("Execution Order Simulator job", () => {

  let stubbed_config = {
    models: {
      ExecutionOrder: ExecutionOrder,
      sequelize
    }
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


  let EXEC_ORDER = {
    id: 4,
    external_identifier: null,
    side: 999,
    type: 71,
    price: '0.01',
    total_quantity: '5',
    spend_amount: 0.005,
    status: 61,
    placed_timestamp: null,
    completed_timestamp: null,
    time_in_force: null,
    recipe_order_id: 2,
    instrument_id: 3,
    exchange_id: 6,
    failed_attempts: 0
  };


  beforeEach(() => {

    sinon.stub(sequelize, 'query').callsFake(() => {
      let execution_orders = [...Array(10)]
        .map((value, index) => {
          let result = new ExecutionOrder(EXEC_ORDER);

          result.dataValues.ask_price = 0.0001;

          sinon.stub(result, 'save').returns(Promise.resolve(result));

          return result;
        });

      return Promise.resolve(execution_orders);
    });
  })

  afterEach(() => {
    sequelize.query.restore();
  });

  it("job body shall exist", () => {
    return chai.expect(execOrderSimulator.JOB_BODY).to.exist;
  });

  it('shall query execution orders', () => {
    
    return execOrderSimulator.JOB_BODY(stubbed_config, console.log).then(result => {
      chai.assert.isTrue(sequelize.query.called);
    });
  });

  it('shall changes and saves all execution orders', () => {
    
    return execOrderSimulator.JOB_BODY(stubbed_config, console.log).then(result => {
      chai.expect(result).to.satisfy(exec_orders => {
        return exec_orders.every(order => order.status == MODEL_CONST.EXECUTION_ORDER_STATUSES.InProgress) &&
          exec_orders.every(order => order.external_identifier == 'SIM-' + order.id);
      })
    });
  });

});