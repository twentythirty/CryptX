"use strict";

let app = require("../../app");
let chai = require("chai");
let asPromised = require('chai-as-promised');
let should = chai.should();
const sinon = require("sinon");

chai.use(asPromised);

describe('InvestmentService testing:', () => {

  //ensure working DB before test
  before(done => {

      app.dbPromise.then(migrations => {
          console.log("Migrations: %o", migrations);
          done();
      })
  });

  
  const investmentService = require('./../../services/InvestmentService');
  const assetService = require('./../../services/AssetService');
  const ordersService = require('./../../services/OrdersService');
  const depositSerive = require('./../../services/DepositService');
  const InvestmentRun = require('./../../models').InvestmentRun;
  const InvestmentAmount = require('./../../models').InvestmentAmount;
  const RecipeRun = require('./../../models').RecipeRun;
  const RecipeRunDetail = require('./../../models').RecipeRunDetail;
  const Asset = require('./../../models').Asset;
  const InvestmentRunAssetGroup = require('./../../models').InvestmentRunAssetGroup;
  const GroupAsset = require('./../../models').GroupAsset;
  const sequelize = require('./../../models').sequelize


  let USER_ID = 1;
  let INVESTMENT_RUN_ID = 1;
  let RECIPE_RUN_ID = 1;
  let STRATEGY_TYPE = STRATEGY_TYPES.LCI;
  let IS_SIMULATED = true;
  let RECIPE_STATUS = INVESTMENT_RUN_STATUSES.RecipeRun;
  let RECIPE_STATUS_CHANGE = RECIPE_RUN_STATUSES.Approved;
  let RECIPE_APPROVAL_COMMENT = 'Approving recipe';
  let ASSET_GROUP_ID = 1;
  let DEPOSIT_ASSET_SYMBOLS = ['USD', 'BTC', 'ETH'];
  let DEPOSIT_AMOUNTS = [
    {
      symbol: 'USD',
      amount: 1000
    },
    {
      symbol: 'BTC',
      amount: 1000
    },
    {
      symbol: 'ETH',
      amount: 1000
    }
  ];

  beforeEach(() => {
    sinon.stub(InvestmentRun, 'create').callsFake((data) => {
      let investment_run = new InvestmentRun(data);

      sinon.stub(investment_run, 'save').returns(investment_run);

      return Promise.resolve(data);
    })

    sinon.stub(InvestmentRun, 'findOne').returns(Promise.resolve());
    sinon.stub(InvestmentRun, 'count').callsFake(options => {
      return Promise.resolve(0);
    });
    sinon.stub(InvestmentRun, 'findById').callsFake(id => {
      let investment_run = new InvestmentRun({
        id: id,
        strategy_type: STRATEGY_TYPE,
        is_simulated: IS_SIMULATED,
        user_created_id: USER_ID,
        started_timestamp: new Date,
        updated_timestamp: new Date,
        status: INVESTMENT_RUN_STATUSES.Initiated
      });

      sinon.stub(investment_run, 'save').returns(
        Promise.resolve(investment_run)
      );

      return Promise.resolve(investment_run);
    });

    sinon.stub(InvestmentRun, 'update').callsFake((update, options) => {
      return Promise.resolve([1]);
    })

    sinon.stub(RecipeRun, 'findOne').callsFake((query) => {
      return Promise.resolve();
    });

    sinon.stub(RecipeRun, 'findById').callsFake(id => {
      let recipe_run = new RecipeRun({
        id: id,
        created_timestamp: new Date(),
        investment_run_id: INVESTMENT_RUN_ID,
        user_created_id: USER_ID,
        approval_status: RECIPE_RUN_STATUSES.Pending,
        approval_comment: ''
      });

      sinon.stub(recipe_run, 'save').returns(Promise.resolve(recipe_run));

      return Promise.resolve(recipe_run);
    });

    sinon.stub(RecipeRun, 'create').callsFake(recipe_run => {
      recipe_run = new RecipeRun(recipe_run);
      sinon.stub(recipe_run, 'toJSON').returns(Promise.resolve(recipe_run));

      return Promise.resolve(recipe_run);
    });

    sinon.stub(RecipeRunDetail, 'bulkCreate').callsFake(recipe_runs => {
      recipe_runs = recipe_runs.map(recipe_run => new RecipeRun(recipe_run)); 

      return Promise.resolve(recipe_runs);
    });

    sinon.stub(RecipeRunDetail, 'create').callsFake(details => {
      return Promise.resolve(details);
    });

    sinon.stub(ordersService, 'generateApproveRecipeOrders').callsFake((id) => {
      return Promise.resolve();
    });

    sinon.stub(depositSerive, 'generateRecipeRunDeposits').callsFake(recipe => {
      return Promise.resolve([]);
    });

    sinon.stub(assetService, 'getDepositAssets').callsFake(() => {
      let assets = DEPOSIT_ASSET_SYMBOLS.map(symbol => {
        return new Asset({
          id: 1, 
          symbol,
          is_deposit: true
        })
      })

      return Promise.resolve(assets);
    });

    sinon.stub(InvestmentRunAssetGroup, 'findById').callsFake(id => {
      return Promise.resolve({
        id, user_id: USER_ID, strategy_type: STRATEGY_TYPE
      });
    });

    sinon.stub(InvestmentRunAssetGroup, 'create').callsFake(group => {
      return Promise.resolve(_.assign(group, { id: _.random(1, 10000) }));
    });

    sinon.stub(GroupAsset, 'bulkCreate').callsFake(assets => {
      let id = 1;
      return Promise.resolve(assets.map(asset => _.assign(asset, { id: id++ }) ));
    });

  });

  afterEach(() => {
    InvestmentRun.create.restore();
    InvestmentRun.findOne.restore();
    InvestmentRun.count.restore();
    InvestmentRun.findById.restore();
    InvestmentRun.update.restore();
    RecipeRun.findOne.restore();
    RecipeRun.create.restore();
    RecipeRun.findById.restore();
    RecipeRunDetail.create.restore();
    RecipeRunDetail.bulkCreate.restore();
    ordersService.generateApproveRecipeOrders.restore();
    depositSerive.generateRecipeRunDeposits.restore();
    assetService.getDepositAssets.restore();
    InvestmentRunAssetGroup.findById.restore();
    InvestmentRunAssetGroup.create.restore();
    GroupAsset.bulkCreate.restore();
    if(sequelize.transaction.restore) sequelize.transaction.restore();
    if(sequelize.query.restore) sequelize.query.restore();
  });


  describe('and method createInvestmentRun shall', function () {

    it('shall exist', () => {
      chai.expect(investmentService.createInvestmentRun).to.exist;
    });

    it('shall reject bad strategy types', () => {
      return chai.assert.isRejected(investmentService.createInvestmentRun(
        USER_ID, -1, IS_SIMULATED, DEPOSIT_AMOUNTS, ASSET_GROUP_ID
      ));
    });

    it('shall call required DB model methods', () => {
      sinon.stub(sequelize, 'transaction').callsFake(investment_create => {
        return Promise.resolve(investment_create());
      });

      return investmentService.createInvestmentRun(
        USER_ID, STRATEGY_TYPE, IS_SIMULATED, DEPOSIT_AMOUNTS, ASSET_GROUP_ID
      ).then(investment_run => {
        chai.assert.isTrue(InvestmentRun.count.called);
        chai.assert.isTrue(InvestmentRun.create.called);
        chai.assert.isTrue(sequelize.transaction.called);
        chai.assert.isTrue(assetService.getDepositAssets.called);
      });
    });

    it('shall reject already existing investment run of same type and not simulated', ()=> {
      if(InvestmentRun.count.restore)
        InvestmentRun.count.restore();

      sinon.stub(InvestmentRun, 'count').callsFake(query => {
        return Promise.resolve(1);
      });

      return chai.assert.isRejected(investmentService.createInvestmentRun(
        USER_ID, STRATEGY_TYPE, false, DEPOSIT_AMOUNTS, ASSET_GROUP_ID
      ));
    })

    it('shall reject investment run without any deposit amounts', () => {
      return chai.assert.isRejected(investmentService.createInvestmentRun(
        USER_ID, STRATEGY_TYPE, false, [], ASSET_GROUP_ID
      ));
    });

    it('shall reject investment run with invalid deposit assets', () => {

      return chai.assert.isRejected(investmentService.createInvestmentRun(
        USER_ID, STRATEGY_TYPE, false, [{
          symbol: "DOGE",
          amount: 10000
        }], ASSET_GROUP_ID
      ));
    });

    it('shall reject investment run with deposit less then 0', () => {

      return chai.assert.isRejected(investmentService.createInvestmentRun(
        USER_ID, STRATEGY_TYPE, false, [{
          symbol: "USD",
          amount: -1
        }], ASSET_GROUP_ID
      ));
    });

    it('shall reject if the asset mix strategy type does not match the new investment run strategy type', () => {

      return chai.assert.isRejected(investmentService.createInvestmentRun(
        USER_ID, STRATEGY_TYPES.MCI, IS_SIMULATED, DEPOSIT_AMOUNTS, ASSET_GROUP_ID
      ));

    });

    it('shall create new investment run and its investment amounts if everything is good', () => {
      
      sinon.stub(sequelize, 'transaction').callsFake(investment_create => {
        return Promise.resolve(investment_create());
      });

      return investmentService.createInvestmentRun(
        USER_ID, STRATEGY_TYPE, IS_SIMULATED, DEPOSIT_AMOUNTS, ASSET_GROUP_ID
      ).then(investment_run => {
        chai.expect(investment_run.strategy_type).to.be.eq(STRATEGY_TYPE);
        chai.expect(investment_run.is_simulated).to.be.eq(IS_SIMULATED);
        chai.expect(investment_run.user_created_id).to.be.eq(USER_ID);
        chai.expect(investment_run.status).to.be.eq(INVESTMENT_RUN_STATUSES.Initiated);
        chai.expect(investment_run.investment_run_asset_group_id).to.be.eq(ASSET_GROUP_ID);
        chai.assert.isArray(investment_run.InvestmentAmounts);
      });
    });
  });


  describe('and method changeInvestmentRunStatus shall', () => {
    beforeEach(() => {
      if(investmentService.changeInvestmentRunStatus.restore)
        investmentService.changeInvestmentRunStatus.restore();

      sinon.stub(investmentService, 'findInvestmentRunFromAssociations').callsFake((args) => {
        let investment_run = new InvestmentRun({
          id: 1,
          strategy_type: STRATEGY_TYPE,
          is_simulated: IS_SIMULATED,
          user_created_id: USER_ID,
          started_timestamp: new Date,
          updated_timestamp: new Date,
          status: INVESTMENT_RUN_STATUSES.Initiated
        });

        sinon.stub(investment_run, 'save').returns(
          Promise.resolve(investment_run)
        );

        return Promise.resolve(investment_run);
      });
    });

    afterEach(() => {
      investmentService.findInvestmentRunFromAssociations.restore();
    });

    it('shall exist', () => {
      return chai.expect(investmentService.changeInvestmentRunStatus).to.exist;
    });

    it('shall reject bad status numbers', () => {
      return chai.assert.isRejected(investmentService.changeInvestmentRunStatus(
        INVESTMENT_RUN_ID, -1
      ));
    });

    it('shall throw if investment run is not found', () => {
      if (InvestmentRun.findById.restore)
        InvestmentRun.findById.restore();

      sinon.stub(InvestmentRun, 'findById').callsFake(id => {
        return Promise.resolve();
      });

      return chai.assert.isRejected(investmentService.changeInvestmentRunStatus(
        INVESTMENT_RUN_ID, RECIPE_STATUS
      ))
    });

    it('shall update status and timestamp', () => {
      return investmentService.changeInvestmentRunStatus(
        INVESTMENT_RUN_ID, RECIPE_STATUS
      ).then(investment_run => {
        chai.expect(investment_run.status).to.be.eq(INVESTMENT_RUN_STATUSES.RecipeRun);
      });
    });

    it('shall search investment run through associations if object is given', () => {
      let assoc = { recipe_order_id: 1 };
      return investmentService.changeInvestmentRunStatus(
        assoc, RECIPE_STATUS
      ).then(investment_run => {
        let v = investmentService.findInvestmentRunFromAssociations.called;
        chai.assert.isTrue(investmentService.findInvestmentRunFromAssociations.called);
        let v2 = investmentService.findInvestmentRunFromAssociations.calledWith(assoc);
        chai.assert.isTrue(investmentService.findInvestmentRunFromAssociations.calledWith(assoc));
      });
    });
  });

  describe('and method changeRecipeRunStatus shall', () => {

    it('shall exist', () => {
      return chai.expect(investmentService.changeRecipeRunStatus).to.exist;
    });

    it('shall reject bad status number', () => {
      return chai.assert.isRejected(investmentService.changeRecipeRunStatus(
        USER_ID, RECIPE_RUN_ID, -1, RECIPE_APPROVAL_COMMENT
      ));
    });

    it('shall reject when comment is not provided', () => {
      return chai.assert.isRejected(investmentService.changeRecipeRunStatus(
        USER_ID, RECIPE_RUN_ID, RECIPE_STATUS
      ));
    });

    it('shall reject when when recipe run not found', () => {
      if(RecipeRun.findById.restore)
        RecipeRun.findById.restore();
      sinon.stub(RecipeRun, 'findById').returns(Promise.resolve());

      return chai.assert.isRejected(investmentService.changeRecipeRunStatus(
        USER_ID, RECIPE_RUN_ID, RECIPE_STATUS, RECIPE_APPROVAL_COMMENT
      ));
    });

    it('shall change required values', () => {
      return investmentService.changeRecipeRunStatus(
        USER_ID, RECIPE_RUN_ID, RECIPE_STATUS_CHANGE, RECIPE_APPROVAL_COMMENT
      ).then(recipe_run => {
        // check if values changed correctly
        chai.expect(recipe_run.approval_status).to.be.eq(RECIPE_STATUS_CHANGE);
        chai.expect(recipe_run.approval_user_id).to.be.eq(USER_ID);
        chai.expect(recipe_run.approval_comment).to.be.eq(RECIPE_APPROVAL_COMMENT);
        
        //check if generateApproveRecipeOrders was not called (this is not done seperately)
        chai.assert.isFalse(
          ordersService.generateApproveRecipeOrders.calledWith(RECIPE_RUN_ID)
        );
      });
    });
  });

  describe('and method createRecipeRun shall', () => {
    beforeEach(() => {
      sinon.stub(investmentService, 'generateRecipeDetails').callsFake(() => {
        return Promise.resolve([
          {
            id: 1,
            symbol: "BTC",
            suggested_action: {
              id: 1,
              recipe_run_id: RECIPE_RUN_ID,
              transaction_asset_id: 1,
              quote_asset_id: 2,
              target_exchange_id: 3,
              investment_percentage: 100
            }
          }
        ]);
      });
    });

    afterEach(() => {
      investmentService.generateRecipeDetails.restore();
    });

    it('shall exist', () => {
      return chai.expect(investmentService.createRecipeRun).to.exist;
    })

    it('shall throw if investment run already has a recipe pending approval', () => {
      if (RecipeRun.findOne.restore) 
        RecipeRun.findOne.restore();
      
      sinon.stub(RecipeRun, 'findOne').callsFake((query) => {
        return Promise.resolve({
          created_timestamp: new Date(),
          investment_run_id: query.where.investment_run_id,
          user_created_id: USER_ID,
          approval_status: RECIPE_RUN_STATUSES.Pending,
          approval_comment: ''
        });
      });

      return chai.assert.isRejected(investmentService.createRecipeRun(
        USER_ID, INVESTMENT_RUN_ID
      ));
    });

    it('shall throw if investment run already has an approved recipe run', () => {
      if (RecipeRun.findOne.restore) 
        RecipeRun.findOne.restore();
      
      sinon.stub(RecipeRun, 'findOne').callsFake((query) => {
        return Promise.resolve({
          created_timestamp: new Date(),
          investment_run_id: query.where.investment_run_id,
          user_created_id: USER_ID,
          approval_status: RECIPE_RUN_STATUSES.Approved,
          approval_comment: ''
        });
      });

      return chai.assert.isRejected(investmentService.createRecipeRun(
        USER_ID, INVESTMENT_RUN_ID
      ));
    });

    it('shall call required methods', () => {

      sinon.stub(sequelize, 'transaction').callsFake(transaction => {
        return Promise.resolve(transaction());
      });

      return investmentService.createRecipeRun(USER_ID, INVESTMENT_RUN_ID)
        .then(recipe_run => {
          chai.assert.isTrue(RecipeRun.findOne.called);
          chai.assert.isTrue(investmentService.changeInvestmentRunStatus.called);
          chai.assert.isTrue(investmentService.generateRecipeDetails.called);
          chai.assert.isTrue(RecipeRun.create.called);
          chai.assert.isTrue(RecipeRunDetail.bulkCreate.called);
        });
    });
  });

  describe('and method generateRecipeDetails shall', () => {
    beforeEach(() => {
      sinon.stub(assetService, 'getStrategyAssets').returns(
        Promise.resolve([
          {
            id: 28,
            symbol: "XRP",
            long_name: 'Ripple',
            is_base: false,
            is_deposit: false,
            avg_share: 7.120
          },
          {
            id: 30,
            symbol: "NMC",
            long_name: 'NameCoin',
            is_base: false,
            is_deposit: false,
            avg_share: 5.5
          }
        ])
      );
      sinon.stub(Asset, 'findAll').callsFake(() => {
        let assets = [{
            id: 2,
            symbol: "BTC",
            is_base: true
          },
          {
            id: 312,
            symbol: "ETH",
            is_base: true
          }];

        assets.map(a => {
          a.toJSON = function () {
            return this;
          };
        })

        return Promise.resolve(assets);
      });

      sinon.stub(assetService, 'getBaseAssetPrices').callsFake(() => {
        return Promise.resolve([
          {symbol: "BTC", price: "7500" },
          {symbol: "ETH", price: "550" }
        ]);
      });

      sinon.stub(assetService, 'getAssetInstruments').callsFake((asset_id) => {
        let instruments = [
          { // use exchange with id 1 as a cheapest example
            instrument_id: 1,
            quote_asset_id: asset_id,
            transaction_asset_id: 2,
            exchange_id: 1,
            average_volume: 2000,
            min_volume_requirement: 1500,
            ask_price: 0.00008955,
            bid_price: 0.00008744
          },
          {
            instrument_id: 1,
            quote_asset_id: asset_id,
            transaction_asset_id: 2,
            exchange_id: 2,
            average_volume: 2000,
            min_volume_requirement: 1500,
            ask_price: 0.00009100,
            bid_price: 0.00008700
          },
          {
            instrument_id: 2,
            quote_asset_id: 2,
            transaction_asset_id: asset_id,
            exchange_id: 3,
            average_volume: 2000,
            min_volume_requirement: 1500,
            ask_price: 11363.636363636, // 1 / 0.00008800
            bid_price: 11111.111111111, // 1 / 0.00009000 
          }
        ];

        // when query asset with id 30, add cheapest way to acquire through sell order
        if(asset_id == 30)
          instruments.push({
            instrument_id: 2,
            quote_asset_id: 2,
            transaction_asset_id: asset_id,
            exchange_id: 4,
            average_volume: 2000,
            min_volume_requirement: 1500,
            ask_price: 13363.636363636, // 1 / 0.00008800
            bid_price: 11235.95505618, // 1 / 0.00008900 
          });

        return Promise.resolve(instruments);
      });

      sinon.stub(assetService, "getInstrumentLiquidityRequirements").callsFake((...params) => {
        let requirement = [{
          avg_vol: 30000,
          instrument_id: params.instrument_id,
          exchange_id: params.exchange_id,
          minimum_volume: 10000,
          periodicity_in_days: 7
        }];

        return requirement;
      });
    });
    
    afterEach(() => {
      assetService.getStrategyAssets.restore();
      Asset.findAll.restore();
      assetService.getBaseAssetPrices.restore();
      assetService.getAssetInstruments.restore();
      assetService.getInstrumentLiquidityRequirements.restore()
    });

    it('shall exist', () => {
      return chai.expect(investmentService.generateRecipeDetails).to.exist;
    });

    it("shall stop if can't get base assets", () => {
      if(Asset.findAll.restore)
      Asset.findAll.restore();

      sinon.stub(Asset, 'findAll').returns(Promise.resolve());
      return chai.assert.isRejected(investmentService.generateRecipeDetails(STRATEGY_TYPE));
    });

    it("shall call getAssetInstruments to get best way to acquire asset", () => {
      return investmentService.generateRecipeDetails(STRATEGY_TYPE)
        .then(recipe => {
          chai.assert.isTrue(assetService.getAssetInstruments.called);
          chai.expect(recipe).to.satisfy(data => {
            return data.every(a => a.suggested_action.transaction_asset_id == a.id);
          }, 'Asset to be acquired should be in transaction_asset_id');
        });
    });

    it("shall return investment percentage for an asset", () => {
      return investmentService.generateRecipeDetails(STRATEGY_TYPE)
        .then(recipe => {
          chai.expect(recipe).to.satisfy(data => {
            return data.every(
              a => typeof a.investment_percentage==="number" && a.investment_percentage <= 100
            );
          }, 'Investment percentage should be set and be a number');
        });
    });

    it("shall throw if no instrument found for an asset", () => {
      if (assetService.getAssetInstruments.restore)
        assetService.getAssetInstruments.restore();

      sinon.stub(assetService, 'getAssetInstruments').callsFake(() => {
        return Promise.resolve([]);
      });

      return chai.expect(investmentService.generateRecipeDetails(STRATEGY_TYPE))
        .eventually.to.be.rejected;
    });

    it("shall throw if none of exchanges satisfy liquidity requirements of instrument", () => {
      if (assetService.getAssetInstruments.restore)
        assetService.getAssetInstruments.restore();

      sinon.stub(assetService, 'getAssetInstruments').callsFake((asset_id) => {
        let instruments = [
          { // doesn't satisfy liquidity requirement
            instrument_id: 1,
            quote_asset_id: asset_id,
            transaction_asset_id: 2,
            exchange_id: 1,
            ask_price: 0.00008955,
            bid_price: 0.00008744
          },
          {
            instrument_id: 1,
            quote_asset_id: asset_id,
            transaction_asset_id: 2,
            exchange_id: 2,
            ask_price: 0.00009100,
            bid_price: 0.00008700
          },
          {
            instrument_id: 2,
            quote_asset_id: 2,
            transaction_asset_id: asset_id,
            exchange_id: 3,
            ask_price: 11363.636363636, // 1 / 0.00008800
            bid_price: 11111.111111111, // 1 / 0.00009000 
          }
        ];

        return Promise.resolve(instruments);
      });

      if (assetService.getInstrumentLiquidityRequirements.restore)
        assetService.getInstrumentLiquidityRequirements.restore();

      sinon.stub(assetService, "getInstrumentLiquidityRequirements").callsFake((...params) => {
        let requirement = {
          avg_vol: 30000,
          instrument_id: params.instrument_id,
          exchange_id: params.exchange_id,
          minimum_volume: 50000,
          periodicity_in_days: 7
        };

        return requirement;
      });

      return chai.assert.isRejected(investmentService.generateRecipeDetails(STRATEGY_TYPE));
    });
  });

  describe('and method getInvestmentRunTimeline shall', () => {
    let INVESTMENT_RUN = {
      id: 2,
      strategy_type: 101,
      is_simulated: true,
      user_created_id: 2,
      started_timestamp: new Date(),
      updated_timestamp: new Date(),
      status: 301,
      deposit_usd: 150
    };

    let RECIPE_RUN = {
      id: 5,
      created_timestamp: new Date(),
      approval_status: 43,
      approval_timestamp: new Date(),
      approval_comment: "Approved",
      investment_run_id: 15,
      user_created_id: 2,
      approval_user_id: 2
    };

    let RECIPE_ORDER_GROUP = {
      id: 0,
      recipe_run_id: 2,
      approval_status: 81,
      created_timestamp: new Date()
    };

    let RECIPE_DEPOSIT = {
      id: 4,
      amount: "3800",
      asset_id: 2,
      completion_timestamp: new Date(),
      creation_timestamp: new Date(),
      depositor_user_id: 2,
      recipe_run_id: 5,
      status: 151,
      target_exchange_account_id: 3
    };

    let RECIPE_ORDER = {
      id:12,
      instrument_id:1,
      price:"2",
      quantity:"6",
      recipe_order_group_id:2,
      side:999,
      status:51,
      target_exchange_id:2
    };

    let EXECUTION_ORDER = {
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
      failed_attempts: 4
    };

    const INVESTMENT_ID = { // is used for building certain type of object
      NORMAL: 1,
      NO_RECIPES: 2,
      NO_DEPOSITS: 3,
      NO_ORDERS: 4,
      NO_EXEC_ORDERS: 5,
      DEPOSIT_PENDING: 6,
      DEPOSIT_COMPLETED: 7,
      ORDERS_PENDING: 8,
      ORDERS_COMPLETED: 9,
      ORDERS_EXECUTING: 10,
      EXEC_ORDERS_FAILED: 11,
      EXEC_ORDERS_FILLED: 12,
      EXEC_ORDERS_EXECUTING: 13
    };
    let RECIPE_RUNS_COUNT = 5;
    let DEPOSITS_PER_RECIPE = 5;
    let ORDER_GROUPS_PER_RECIPE = 5;
    let ORDERS_PER_GROUP = 50;
    let EXECUTION_ORDERS_PER_ORDER = 1;

    beforeEach(() => {
      sinon.stub(investmentService, 'getWholeInvestmentRun').callsFake((inv_id) => {
        let whole_investment = Object.assign({}, INVESTMENT_RUN);

        if(inv_id == INVESTMENT_ID.EXEC_ORDERS_FILLED) whole_investment.status = 308; 
        if(inv_id == INVESTMENT_ID.EXEC_ORDERS_EXECUTING) whole_investment.status = 307; 

        whole_investment.RecipeRuns = [...Array(inv_id != INVESTMENT_ID.NO_RECIPES ? RECIPE_RUNS_COUNT : 0)].map(() => {
          let recipe_runs = Object.assign({}, RECIPE_RUN);

          recipe_runs.RecipeRunDeposits = [...Array(inv_id != INVESTMENT_ID.NO_DEPOSITS ? DEPOSITS_PER_RECIPE : 0)].map(
            (depo, depo_index) => {
              let deposit = Object.assign(RECIPE_DEPOSIT);
              if (inv_id == INVESTMENT_ID.DEPOSIT_PENDING)
                deposit.status = 150; // Pending, assigned to first deposit only
              else 
                deposit.status = 151; // Completed
              return deposit;
            }
          );

          recipe_runs.RecipeOrderGroups = [...Array(ORDER_GROUPS_PER_RECIPE)].map(
            () => {
              let recipe_order_group = Object.assign({}, RECIPE_ORDER_GROUP);
              recipe_order_group.id = 0;
              if(inv_id == INVESTMENT_ID.EXEC_ORDERS_FAILED) recipe_order_group.id = 1;
              if(inv_id == INVESTMENT_ID.NO_EXEC_ORDERS) 
                recipe_order_group.id = 2;

              recipe_order_group.RecipeOrders = [...Array(inv_id != 4 ? ORDERS_PER_GROUP : 0)].map(
                (ord, order_index) => {
                  let order = Object.assign({}, RECIPE_ORDER);
                  if(inv_id == INVESTMENT_ID.ORDERS_EXECUTING) order.status = 52; // Executing, assigned to first deposit only
                  if(inv_id == INVESTMENT_ID.ORDERS_PENDING) order.status = 51; // Pending
                  if(inv_id == INVESTMENT_ID.ORDERS_COMPLETED) order.status = 53; // Completed

                  /* // Execution orders not needed now
                  order.ExecutionOrders = [...Array(inv_id != 5 ? EXECUTION_ORDERS_PER_ORDER : 0)].map(
                    () => {
                      let exec_order = Object.assign({}, EXECUTION_ORDER);
                      if(inv_id == INVESTMENT_ID.EXEC_ORDERS_FAILED) exec_order.status = 66;
                      
                      return exec_order;
                    }
                  ); */

                  return order;
                }
              );

              return recipe_order_group;
            }
          );

          return recipe_runs;
        });

        whole_investment.toJSON = () => {
          delete whole_investment.toJSON;
          return whole_investment;
        }
        return Promise.resolve(whole_investment);
      });

      sinon.stub(sequelize, 'query').callsFake((query, options) => {
        let exec_order_statuses = [{
          status: 61,
          count: 1000
        }];

        if(options.replacements.rog_id == 1)
          exec_order_statuses.push({
            status: 66,
            count: 1
          });

        return Promise.resolve(exec_order_statuses);
      });
    });

    afterEach(() => {
      investmentService.getWholeInvestmentRun.restore();
      sequelize.query.restore();
    })

    it('it should throw if investment run is not found', () => {
      if(investmentService.getWholeInvestmentRun.restore)
        investmentService.getWholeInvestmentRun.restore();

      sinon.stub(investmentService, 'getWholeInvestmentRun').returns(Promise.resolve(null));

      return chai.assert.isRejected(investmentService.getInvestmentRunTimeline(INVESTMENT_RUN_ID));
    })

    it('it should return investment run if investment run is found', () => {

      return investmentService.getInvestmentRunTimeline(INVESTMENT_RUN_ID).then(result => {
        chai.assert.isObject(result.investment_run);
        /* chai.expect(result.investment_run).to.be.equal(INVESTMENT_RUN); */
      });
    })

    it('it should return null in recipe property if there are no recipe runs', () => {

      return investmentService.getInvestmentRunTimeline(INVESTMENT_ID.NO_RECIPES).then(result => {
        chai.assert.isNull(result.recipe_run);
      });
    })

    it('it should return null in deposits property if deposits not found', () => {

      return investmentService.getInvestmentRunTimeline(INVESTMENT_ID.NO_DEPOSITS).then(result => {
        chai.assert.isNull(result.recipe_deposits);
      });
    })

    it('it should return null in orders property if there are no orders', () => {

      return investmentService.getInvestmentRunTimeline(INVESTMENT_ID.NO_DEPOSITS).then(result => {
        chai.assert.isNull(result.recipe_orders);
      });
    })

   /*  it('it should return null in execution orders property if there are no orders', () => {

      return investmentService.getInvestmentRunTimeline(INVESTMENT_ID.NO_EXEC_ORDERS).then(result => {
        chai.assert.isNull(result.execution_orders);
      });
    }) */

    it('it should count recipe deposits and have status PENDING if at least one of deposits have status PENDING', () => {

      return investmentService.getInvestmentRunTimeline(INVESTMENT_ID.DEPOSIT_PENDING).then(result => {
        chai.assert.isNumber(result.recipe_deposits.count);
        chai.expect(result.recipe_deposits.status).to.be.equal('deposits.status.150');
      });
    });

    it('it should count recipe deposits and have status COMPLETED if all of deposits have status COMPLETED', () => {

      return investmentService.getInvestmentRunTimeline(INVESTMENT_ID.DEPOSIT_COMPLETED).then(result => {
        chai.assert.isNumber(result.recipe_deposits.count);
        chai.expect(result.recipe_deposits.status).to.be.equal('deposits.status.151');
      });
    });

    it('it should count recipe orders and have status PENDING if all related orders have status PENDING', () => {

      return investmentService.getInvestmentRunTimeline(INVESTMENT_ID.ORDERS_PENDING).then(result => {
        chai.assert.isNumber(result.recipe_orders.count);
        chai.expect(result.recipe_orders.status).to.be.equal('order.status.51');
      });
    });

    it('it should count recipe orders and have status COMPLETED if all related orders have status COMPLETED', () => {

      return investmentService.getInvestmentRunTimeline(INVESTMENT_ID.ORDERS_COMPLETED).then(result => {
        chai.assert.isNumber(result.recipe_orders.count);
        chai.expect(result.recipe_orders.status).to.be.equal('order.status.53');
      });
    });

    it('it should count recipe orders and have status EXECUTION if atleast one of related orders have status EXECUTING', () => {

      return investmentService.getInvestmentRunTimeline(INVESTMENT_ID.ORDERS_EXECUTING).then(result => {
        chai.assert.isNumber(result.recipe_orders.count);
        chai.expect(result.recipe_orders.status).to.be.equal('order.status.52');
      });
    });

/*     it('it should count execution orders and return status FAILED if at least one of orders have status FAILED', () => {

      return investmentService.getInvestmentRunTimeline(INVESTMENT_ID.EXEC_ORDERS_FAILED).then(result => {
        chai.assert.isNumber(result.execution_orders.count);
        chai.expect(result.execution_orders.status).to.be.equal('execution_orders_timeline.status.66');
      });
    }); */

    it('it should count execution orders and return status FILLED if investment run status is ORDERSFILLED', () => {

      return investmentService.getInvestmentRunTimeline(INVESTMENT_ID.EXEC_ORDERS_FILLED).then(result => {
        chai.assert.isNumber(result.execution_orders.count);
        chai.expect(result.execution_orders.status).to.be.equal('execution_orders_timeline.status.63');
      });
    });

    it('it should count execution orders and return status EXECUTING if investment run status is EXECUTING', () => {

      return investmentService.getInvestmentRunTimeline(INVESTMENT_ID.EXEC_ORDERS_EXECUTING).then(result => {
        chai.assert.isNumber(result.execution_orders.count);
        chai.expect(result.execution_orders.status).to.be.equal('execution_orders_timeline.status.62');
      });
    });
  });

  describe('and method generateInvestmentAssetGroup shall', () => {

    let cap_usd = _.random(10, 30, false);
    let market_share = 0.01;

    const ASSETS = [];

    for(let i = 1 ; i <= 100 ; i++) {

      const new_asset = {
        id: i,
        capitalization_usd: cap_usd * i,
        avg_share: market_share * i,
        status: _.random(400, 402, false)
      };

      ASSETS.push(new_asset);

    }

    const generateInvestmentAssetGroup = investmentService.generateInvestmentAssetGroup;

    it('exist', () => {
      
      chai.expect(generateInvestmentAssetGroup).to.be.not.undefined;

    });

    it('reject if the an invalid strategy_type is passed', () => {

      return chai.assert.isRejected(generateInvestmentAssetGroup(1, -1));

    });

    it('generate correct asset mixes for the appropriate strategy types', () => {

      sinon.stub(sequelize, 'transaction').callsFake(transaction => Promise.resolve(transaction()));
      sinon.stub(sequelize, 'query').callsFake(query => Promise.resolve(_.reverse(_.sortBy(ASSETS, 'capitalization_usd'))));

      return Promise.all([
        generateInvestmentAssetGroup(USER_ID, STRATEGY_TYPES.MCI),
        generateInvestmentAssetGroup(USER_ID, STRATEGY_TYPES.LCI)
      ]).then(promise_result => {

        for(let i = 0; i < promise_result.length; i++) {

          const result = promise_result[i];

          chai.expect(result.length).to.equal(2);
        
          const [ group, assets ] = result;
  
          chai.expect(group.user_id).to.equal(USER_ID);
          chai.expect(group.created_timestamp).to.be.a('date');
  
          for(let asset of assets) {
  
            const matching_asset = ASSETS.find(a => a.id === asset.asset_id);
  
            chai.expect(matching_asset).to.be.not.undefined;
            
            chai.expect(asset.investment_run_asset_group_id).to.equal(group.id);
            chai.expect(asset.status).to.equal(matching_asset.status);
  
          }

        }

        const [ [ mci_group, mci_assets ], [ lci_group, lci_assets ] ] = promise_result;

        const difference = _.differenceBy(lci_assets, mci_assets, 'asset_id');

        chai.expect(difference.length).to.equal(SYSTEM_SETTINGS.INDEX_LCI_CAP);

      });

    });

  });
});