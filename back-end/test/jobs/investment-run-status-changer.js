'use strict';

let app = require("../../app");
let chai = require("chai");
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
const sinon = require("sinon");

chai.use(chaiAsPromised);

const investmentStatusChanger = require('../../jobs/investment-run-status-changer');

const sequelize = require('../../models').sequelize;
const InvestmentRun = require('../../models').InvestmentRun;
const RecipeRun = require('../../models').RecipeRun;
const RecipeOrder = require('../../models').RecipeOrder;
const RecipeOrderGroup = require('../../models').RecipeOrderGroup;


describe("Investment run status changer job should", () => {

  let stubbed_config = {
    models: {
      InvestmentRun,
      RecipeRun,
      RecipeOrder,
      RecipeOrderGroup,
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

  let INVESTMENT_RUN = {
    id: 1,
    started_timestamp: new Date("Fri Jun 29 2018 09:57:04 GMT+0300 (EEST)"),
    updated_timestamp: new Date("Fri Jun 29 2018 09:57:04 GMT+0300 (EEST)"),
    completed_timestamp: null,
    user_created_id: 2,
    strategy_type: 102,
    is_simulated: false,
    status: INVESTMENT_RUN_STATUSES.OrdersExecuting,
    deposit_usd: "399",
  }

  let RECIPE_RUN = {
    id: 1,
    investment_run_id: INVESTMENT_RUN.id,
    created_timestamp: new Date(),
    user_created_id: 1,
    approval_comment: '',
    approval_status: RECIPE_RUN_STATUSES.Approved,
  };

  let RECIPE_ORDER_GROUP = {
    approval_status: RECIPE_ORDER_GROUP_STATUSES.Approved,
  };

  let RECIPE_ORDERS = {
    status: RECIPE_ORDER_STATUSES.Completed
  };

  beforeEach(() => {
    sinon.stub(InvestmentRun, "findAll").callsFake(() => {
      let investment_runs = [new InvestmentRun(INVESTMENT_RUN)];

      investment_runs.every(investment_run => {
        sinon.stub(investment_run, "save").returns(Promise.resolve(investment_run));
      })

      return Promise.resolve(investment_runs);
    })

    sinon.stub(RecipeRun, "findOne").callsFake(() => {
      let recipe_run = new RecipeRun(RECIPE_RUN);

      let recipe_order_group = Object.assign({}, RECIPE_ORDER_GROUP);

      recipe_order_group.RecipeOrders = [...Array(10)].map((val, index) => {
        return Object.assign({}, RECIPE_ORDERS);
      });

      recipe_run.RecipeOrderGroups = [
        recipe_order_group
      ];

      sinon.stub(recipe_run, 'save').returns(Promise.resolve(recipe_run));

      return Promise.resolve(recipe_run);
    });
  });

  afterEach(() => {
    InvestmentRun.findAll.restore();
    RecipeRun.findOne.restore();
  });

  it("job body shall exist", () => {
    return chai.expect(investmentStatusChanger.JOB_BODY).to.exist;
  });

  it('change investment run status if all of its orders have status complete', () => {
      
    return investmentStatusChanger.JOB_BODY(stubbed_config, console.log).then(investment_run => {
      
      chai.expect(investment_run[0].status).to.be.equal(INVESTMENT_RUN_STATUSES.OrdersFilled);
    });
  });

  it('not change investment run status if aleast one order is incomplete', () => {
    if (RecipeRun.findOne.restore)
      RecipeRun.findOne.restore();

    sinon.stub(RecipeRun, "findOne").callsFake(() => {
      let recipe_run = new RecipeRun(RECIPE_RUN);

      let recipe_order_group = Object.assign({}, RECIPE_ORDER_GROUP);

      recipe_order_group.RecipeOrders = [...Array(10)].map((val, index) => {
        return Object.assign({}, RECIPE_ORDERS);
      });

      // change first order status to 
      recipe_order_group.RecipeOrders[0].status = INVESTMENT_RUN_STATUSES.OrdersExecuting;

      recipe_run.RecipeOrderGroups = [
        recipe_order_group
      ];

      sinon.stub(recipe_run, 'save').returns(Promise.resolve(recipe_run));

      return Promise.resolve(recipe_run);
    });
    
    return investmentStatusChanger.JOB_BODY(stubbed_config, console.log).then(investment_run => {
      
      chai.expect(investment_run[0].status).to.not.be.equal(INVESTMENT_RUN_STATUSES.OrdersFilled);
    });
  });
});