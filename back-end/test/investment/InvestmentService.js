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
  const InvestmentAssetConversion = require('./../../models').InvestmentAssetConversion;
  const ColdStorageAccount = require('./../../models').ColdStorageAccount;
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
  let BASE_ASSET_PRICES = [
    { id: 2, symbol: "BTC", price: "7500" },
    { id: 312, symbol: "ETH", price: "550" }
  ];
  let DEPOSIT_ASSETS = {
    'USD': { id: 1, symbol: 'USD', long_name: "US Dollar", is_deposit: true, is_base: false },
    'BTC': { id: 2, symbol: 'BTC', long_name: "Bitcoin", is_deposit: true, is_base: true },
    'ETH': { id: 312, symbol: 'ETH', long_name: "Ethereum", is_deposit: true, is_base: true }
  }
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

  let INVESTMENT_RUN = {
    id: INVESTMENT_RUN_ID,
    investment_run_asset_group_id: 1,
    strategy_type: STRATEGY_TYPE
  };

  let ASSETS = [{
    id: 1,
    is_base: false,
    is_deposit: true,
    symbol: 'USD'
  },{
    id: 2,
    is_base: true,
    is_deposit: true,
    symbol: 'BTC'
  },{
    id: 3,
    is_base: true,
    is_deposit: true,
    symbol: 'ETH'
  }]
  let EXCHANGE = {
    name: "TestEx",
    id: 544,
    api_id: 'testex'
  };


  let RECIPE_RUN_DETAILS = [{
    recipe_run_id: 1,
    transaction_asset_id: ASSETS[0].id,
    transaction_asset: ASSETS[0],
    quote_asset: ASSETS[1],
    target_exchange_id: EXCHANGE.id,
    target_exchange: EXCHANGE,
    quote_asset_id: ASSETS[1].id,
    RecipeRunDetailInvestments: [{
      asset_id: ASSETS[0].id,
      amount: 1
    }]
  }];

  beforeEach(() => {
    sinon.stub(InvestmentRun, 'create').callsFake((data) => {
      let investment_run = new InvestmentRun(data);

      sinon.stub(investment_run, 'save').returns(investment_run);

      return Promise.resolve(data);
    })

    sinon.stub(InvestmentRun, 'findOne').callsFake(investment_run_id => {
      let investment_run = new InvestmentRun(INVESTMENT_RUN);

      investment_run.InvestmentAmounts = [
        {
          id: 1,
          investment_run_id: investment_run_id,
          asset_id: DEPOSIT_ASSETS.USD.id,
          amount: 1000000
        }, {
          id: 2,
          investment_run_id: investment_run_id,
          asset_id: DEPOSIT_ASSETS.BTC.id,
          amount: 1000
        },
        {
          id: 3,
          investment_run_id: investment_run_id,
          asset_id: DEPOSIT_ASSETS.ETH.id,
          amount: 1000
        }
      ].map(ia => {
        ia.Asset  = {
          symbol: "Symbol",
          long_name: "Name"
        }

        return ia;
      });

      return Promise.resolve(investment_run);
    });

    sinon.stub(assetService, 'getBaseAssetPrices').callsFake(() => {
      return Promise.resolve(BASE_ASSET_PRICES);
    });

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

      investment_run.InvestmentAmounts = [
        { asset_id: DEPOSIT_ASSETS.USD.id, amount: 5664798.12312 }
      ].map(ia => {
        ia.Asset  = {
          symbol: "Symbol",
          long_name: "Name"
        }
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

      recipe_run.InvestmentRun = new InvestmentRun(INVESTMENT_RUN);

      sinon.stub(recipe_run, 'save').returns(Promise.resolve(recipe_run));

      return Promise.resolve(recipe_run);
    });

    sinon.stub(RecipeRun, 'create').callsFake(recipe_run => {
      recipe_run = new RecipeRun(recipe_run);

      sinon.stub(recipe_run, 'toJSON').returns(Promise.resolve(recipe_run));
      sinon.stub(recipe_run, 'save').returns(recipe_run);

      return Promise.resolve(recipe_run);
    });

    sinon.stub(RecipeRunDetail, 'bulkCreate').callsFake(recipe_runs => {
      recipe_runs = recipe_runs.map(recipe_run => new RecipeRun(recipe_run)); 

      return Promise.resolve(recipe_runs);
    });

    sinon.stub(RecipeRunDetail, 'create').callsFake(details => {
      return Promise.resolve(details);
    });

    sinon.stub(RecipeRunDetail, 'findAll').callsFake(options => {
      return Promise.resolve(RECIPE_RUN_DETAILS);
    });

    sinon.stub(ordersService, 'generateApproveRecipeOrders').callsFake((id) => {
      return Promise.resolve();
    });

    sinon.stub(depositSerive, 'generateRecipeRunDeposits').callsFake(recipe => {
      return Promise.resolve([]);
    });

    sinon.stub(assetService, 'getDepositAssets').callsFake(() => {
      let assets = _.keys(DEPOSIT_ASSETS).map(symbol => {
        return new Asset(DEPOSIT_ASSETS[symbol]);
      })

      return Promise.resolve(assets);
    });

    sinon.stub(sequelize, 'transaction').callsFake((options, statement) => {
      if(_.isFunction(options)) statement = options;
      return Promise.resolve(statement());
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

    sinon.stub(InvestmentAssetConversion, 'bulkCreate').callsFake(conversions => {
      return Promise.all(conversions);
    });

    sinon.stub(Asset, 'findAll').callsFake(options => {
      return Promise.resolve(ASSETS);
    });

    sinon.stub(ColdStorageAccount, 'findAll').callsFake(async options => {

      return RECIPE_RUN_DETAILS.map(detail => {
        return {
          asset_id: detail.transaction_asset_id
        };
      });

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
    RecipeRunDetail.findAll.restore();
    ordersService.generateApproveRecipeOrders.restore();
    depositSerive.generateRecipeRunDeposits.restore();
    assetService.getDepositAssets.restore();
    assetService.getBaseAssetPrices.restore();
    InvestmentRunAssetGroup.findById.restore();
    InvestmentRunAssetGroup.create.restore();
    GroupAsset.bulkCreate.restore();
    InvestmentAssetConversion.bulkCreate.restore();
    Asset.findAll.restore();
    ColdStorageAccount.findAll.restore();
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
      /* sinon.stub(sequelize, 'transaction').callsFake(investment_create => {
        return Promise.resolve(investment_create());
      }); */

      InvestmentRun.findOne.restore();

      sinon.stub(InvestmentRun, 'findOne').callsFake(options => {
        return Promise.resolve(null);
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
      
      /* sinon.stub(sequelize, 'transaction').callsFake(investment_create => {
        return Promise.resolve(investment_create());
      }); */

      InvestmentRun.findOne.restore();

      sinon.stub(InvestmentRun, 'findOne').callsFake(options => {
        return Promise.resolve(null);
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

    it('shall reject if there are missing cold storage accounts', () => {

      ColdStorageAccount.findAll.restore();
      sinon.stub(ColdStorageAccount, 'findAll').callsFake(async options => {

        return [];
  
      });

      return chai.assert.isRejected(investmentService.changeRecipeRunStatus(
        USER_ID, RECIPE_RUN_ID, RECIPE_STATUS_CHANGE, RECIPE_APPROVAL_COMMENT
      ));

    });

    it('shall change required values', () => {

      sinon.stub(sequelize, 'query').callsFake(query => {

          return Promise.resolve([
            {
              tx_asset_id: ASSETS[0].id,
              quote_asset_id: ASSETS[1].id,
              symbol: '?',
              exchange_id: RECIPE_RUN_DETAILS[0].target_exchange_id
            }
          ])

      });

      return investmentService.changeRecipeRunStatus(
        USER_ID, RECIPE_RUN_ID, RECIPE_STATUS_CHANGE, RECIPE_APPROVAL_COMMENT
      ).then(recipe_run => {
        sequelize.query.restore();
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
            "transaction_asset_id": 60,
            "quote_asset_id": 2,
            "exchange_id": 5,
            "investment_percentage": "5",
            "detail_investment": [
              {
                "asset_id": 2,
                "amount": "0.86644453030371221208",
                "amount_usd": "5534.88015125"
              }
            ]
          },
          {
            "transaction_asset_id": 149,
            "quote_asset_id": 2,
            "exchange_id": 5,
            "investment_percentage": "5",
            "detail_investment": [
              {
                "asset_id": 2,
                "amount": "0.86644453030371221208",
                "amount_usd": "5534.88015125"
              }
            ]
          },
          {
            "transaction_asset_id": 168,
            "quote_asset_id": 312,
            "exchange_id": 1,
            "investment_percentage": "5",
            "detail_investment": [
              {
                "asset_id": 312,
                "amount": "29.397459341928801901",
                "amount_usd": "5534.88015125"
              }
            ]
          },
          {
            "transaction_asset_id": 367,
            "quote_asset_id": 312,
            "exchange_id": 7,
            "investment_percentage": "5",
            "detail_investment": [
              {
                "asset_id": 312,
                "amount": "3.9125406580711980986",
                "amount_usd": "736.64337375"
              },
              { "asset_id": 1, "amount": "4798.2367775", "amount_usd": "4798.2367775" }
            ]
          },
          {
            "transaction_asset_id": 388,
            "quote_asset_id": 2,
            "exchange_id": 5,
            "investment_percentage": "5",
            "detail_investment": [
              {
                "asset_id": 2,
                "amount": "0.86644453030371221208",
                "amount_usd": "5534.88015125"
              }
            ]
          },
          {
            "transaction_asset_id": 395,
            "quote_asset_id": 312,
            "exchange_id": 7,
            "investment_percentage": "5",
            "detail_investment": [
              {
                "asset_id": 1,
                "amount": "5534.88015125",
                "amount_usd": "5534.88015125"
              }
            ]
          },
          {
            "transaction_asset_id": 416,
            "quote_asset_id": 2,
            "exchange_id": 1,
            "investment_percentage": "5",
            "detail_investment": [
              {
                "asset_id": 2,
                "amount": "0.86644453030371221208",
                "amount_usd": "5534.88015125"
              }
            ]
          },
          {
            "transaction_asset_id": 502,
            "quote_asset_id": 2,
            "exchange_id": 1,
            "investment_percentage": "5",
            "detail_investment": [
              {
                "asset_id": 2,
                "amount": "0.86644453030371221208",
                "amount_usd": "5534.88015125"
              }
            ]
          },
          {
            "transaction_asset_id": 553,
            "quote_asset_id": 312,
            "exchange_id": 5,
            "investment_percentage": "5",
            "detail_investment": [
              {
                "asset_id": 1,
                "amount": "5534.88015125",
                "amount_usd": "5534.88015125"
              }
            ]
          },
          {
            "transaction_asset_id": 587,
            "quote_asset_id": 2,
            "exchange_id": 5,
            "investment_percentage": "5",
            "detail_investment": [
              {
                "asset_id": 2,
                "amount": "0.86644453030371221208",
                "amount_usd": "5534.88015125"
              }
            ]
          },
          {
            "transaction_asset_id": 663,
            "quote_asset_id": 312,
            "exchange_id": 7,
            "investment_percentage": "5",
            "detail_investment": [
              {
                "asset_id": 1,
                "amount": "5534.88015125",
                "amount_usd": "5534.88015125"
              }
            ]
          },
          {
            "transaction_asset_id": 676,
            "quote_asset_id": 312,
            "exchange_id": 1,
            "investment_percentage": "5",
            "detail_investment": [
              {
                "asset_id": 1,
                "amount": "5534.88015125",
                "amount_usd": "5534.88015125"
              }
            ]
          },
          {
            "transaction_asset_id": 761,
            "quote_asset_id": 312,
            "exchange_id": 2,
            "investment_percentage": "5",
            "detail_investment": [
              {
                "asset_id": 1,
                "amount": "5534.88015125",
                "amount_usd": "5534.88015125"
              }
            ]
          },
          {
            "transaction_asset_id": 826,
            "quote_asset_id": 312,
            "exchange_id": 7,
            "investment_percentage": "5",
            "detail_investment": [
              {
                "asset_id": 1,
                "amount": "5534.88015125",
                "amount_usd": "5534.88015125"
              }
            ]
          },
          {
            "transaction_asset_id": 982,
            "quote_asset_id": 2,
            "exchange_id": 7,
            "investment_percentage": "5",
            "detail_investment": [
              {
                "asset_id": 2,
                "amount": "0.86644453030371221208",
                "amount_usd": "5534.88015125"
              }
            ]
          },
          {
            "transaction_asset_id": 995,
            "quote_asset_id": 2,
            "exchange_id": 1,
            "investment_percentage": "5",
            "detail_investment": [
              {
                "asset_id": 2,
                "amount": "0.86644453030371221208",
                "amount_usd": "5534.88015125"
              }
            ]
          },
          {
            "transaction_asset_id": 1098,
            "quote_asset_id": 2,
            "exchange_id": 1,
            "investment_percentage": "5",
            "detail_investment": [
              {
                "asset_id": 2,
                "amount": "0.86644453030371221208",
                "amount_usd": "5534.88015125"
              }
            ]
          },
          {
            "transaction_asset_id": 1327,
            "quote_asset_id": 312,
            "exchange_id": 1,
            "investment_percentage": "5",
            "detail_investment": [
              {
                "asset_id": 1,
                "amount": "5534.88015125",
                "amount_usd": "5534.88015125"
              }
            ]
          },
          {
            "transaction_asset_id": 1422,
            "quote_asset_id": 312,
            "exchange_id": 1,
            "investment_percentage": "5",
            "detail_investment": [
              {
                "asset_id": 1,
                "amount": "5534.88015125",
                "amount_usd": "5534.88015125"
              }
            ]
          },
          {
            "transaction_asset_id": 1866,
            "quote_asset_id": 2,
            "exchange_id": 1,
            "investment_percentage": "5",
            "detail_investment": [
              {
                "asset_id": 2,
                "amount": "0.72199922726659009124",
                "amount_usd": "4612.15813875"
              }
            ]
          },
          {
            "transaction_asset_id": 1866,
            "quote_asset_id": 312,
            "exchange_id": 1,
            "investment_percentage": "5",
            "detail_investment": [
              { "asset_id": 1, "amount": "922.7220125", "amount_usd": "922.7220125" }
            ]
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
      )).then(() => {
        chai.assert.isTrue(RecipeRun.create.notCalled);
      });
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

      /* sinon.stub(sequelize, 'transaction').callsFake(transaction => {
        return Promise.resolve(transaction());
      }); */

      return investmentService.createRecipeRun(USER_ID, INVESTMENT_RUN_ID)
        .then(recipe_run => {
          chai.assert.isTrue(RecipeRun.findOne.called);
          chai.assert.isTrue(investmentService.changeInvestmentRunStatus.called);
          chai.assert.isTrue(investmentService.generateRecipeDetails.called);
          chai.assert.isTrue(RecipeRun.create.called);
        });
    });
  });

  describe('and method generateRecipeDetails shall', () => {
    let recipe_detail_sum_used_assets = recipe_details => {
      let used_investment_amounts = _.map(
          _.groupBy(
            _.flatten(recipe_details.map(d => d.detail_investment)),
            d => d.asset_id
          ),
          grouped_by_base => {
            let used = Decimal(0);
            _.forEach(grouped_by_base, s => { used = used.add(Decimal(s.amount)); });
            used = used.toNumber();
            return ({
              asset_id: grouped_by_base[0].asset_id,
              amount: used
            });
          }
        );
      return used_investment_amounts;
    };

    let recipe_detail_calculate_total_percentage = (recipe_details) =>
      recipe_details.map(d => d.investment_percentage)
        .reduce((acc, val) => acc.add(Decimal(val)), Decimal(0))
        .toNumber();

    let prep_investment_amounts = (deposits) => 
      deposits.map(dep => {
        dep.Asset = _(DEPOSIT_ASSETS).values().find(dep_asset => dep_asset.id == dep.asset_id);
  
        return dep;
      });

    beforeEach(() => {
      sinon.stub(assetService, 'getAssetGroupWithData').callsFake((recipe_run_id) => {
        let instruments = [
          {
            "id": 553,
            "symbol": "MKR",
            "long_name": "Maker",
            "quote_asset_id": 2,
            "instrument_id": 3841,
            "exchange_id": 5,
            "nvt": 1423.5908183763754,
            "volume": 111.46,
            "volume_usd": 36747.347714,
            "ask_price": 0.0517,
            "bid_price": 0.0506,
            "price_usd": 329.6909,
            "status": 400
          },
          {
            "id": 553,
            "symbol": "MKR",
            "long_name": "Maker",
            "quote_asset_id": 312,
            "instrument_id": 3842,
            "exchange_id": 5,
            "nvt": 1423.5908183763754,
            "volume": 45.94,
            "volume_usd": 15083.7071436,
            "ask_price": 1.759,
            "bid_price": 1.734,
            "price_usd": 328.33494,
            "status": 400
          },
          {
            "id": 553,
            "symbol": "MKR",
            "long_name": "Maker",
            "quote_asset_id": 2,
            "instrument_id": 3841,
            "exchange_id": 2,
            "nvt": 1423.5908183763754,
            "volume": 2.5,
            "volume_usd": 834.4145075,
            "ask_price": 0.052339,
            "bid_price": 0.050406,
            "price_usd": 333.765803,
            "status": 400
          },
          {
            "id": 553,
            "symbol": "MKR",
            "long_name": "Maker",
            "quote_asset_id": 312,
            "instrument_id": 3842,
            "exchange_id": 2,
            "nvt": 1423.5908183763754,
            "volume": 0.61158609,
            "volume_usd": 202.26631300734493,
            "ask_price": 1.7718,
            "bid_price": 1.7181,
            "price_usd": 330.724188,
            "status": 400
          },
          {
            "id": 367,
            "symbol": "DCR",
            "long_name": "Decred",
            "quote_asset_id": 2,
            "instrument_id": 3835,
            "exchange_id": 7,
            "nvt": 314.42052425060086,
            "volume": 5294.828283448519,
            "volume_usd": 186113.34123909424,
            "ask_price": 0.005512,
            "bid_price": 0.005445,
            "price_usd": 35.150024,
            "status": 400
          },
          {
            "id": 367,
            "symbol": "DCR",
            "long_name": "Decred",
            "quote_asset_id": 312,
            "instrument_id": 3836,
            "exchange_id": 7,
            "nvt": 314.42052425060086,
            "volume": 2994.1674035304313,
            "volume_usd": 104356.18121002715,
            "ask_price": 0.18672,
            "bid_price": 0.185593,
            "price_usd": 34.8531552,
            "status": 400
          },
          {
            "id": 149,
            "symbol": "BCN",
            "long_name": "Bytecoin",
            "quote_asset_id": 2,
            "instrument_id": 3825,
            "exchange_id": 5,
            "nvt": 110.70930975269502,
            "volume": 699830900,
            "volume_usd": 1317871.23303829,
            "ask_price": 2.953e-7,
            "bid_price": 2.952e-7,
            "price_usd": 0.0018831281,
            "status": 400
          },
          {
            "id": 149,
            "symbol": "BCN",
            "long_name": "Bytecoin",
            "quote_asset_id": 2,
            "instrument_id": 3825,
            "exchange_id": 1,
            "nvt": 110.70930975269502,
            "volume": 414942331,
            "volume_usd": 793826.1734361,
            "ask_price": 3e-7,
            "bid_price": 2.9e-7,
            "price_usd": 0.0019131,
            "status": 400
          },
          {
            "id": 149,
            "symbol": "BCN",
            "long_name": "Bytecoin",
            "quote_asset_id": 312,
            "instrument_id": 3826,
            "exchange_id": 1,
            "nvt": 110.70930975269502,
            "volume": 75098860,
            "volume_usd": 143263.481781672,
            "ask_price": 0.00001022,
            "bid_price": 0.00001013,
            "price_usd": 0.0019076652,
            "status": 400
          },
          {
            "id": 149,
            "symbol": "BCN",
            "long_name": "Bytecoin",
            "quote_asset_id": 312,
            "instrument_id": 3826,
            "exchange_id": 5,
            "nvt": 110.70930975269502,
            "volume": 5205600,
            "volume_usd": 9911.1084192,
            "ask_price": 0.0000102,
            "bid_price": 0.00001,
            "price_usd": 0.001903932,
            "status": 400
          },
          {
            "id": 60,
            "symbol": "DGB",
            "long_name": "DigiByte",
            "quote_asset_id": 312,
            "instrument_id": 3824,
            "exchange_id": 7,
            "nvt": 96.77459844752693,
            "volume": 18434805.72,
            "volume_usd": 468738.58263840014,
            "ask_price": 0.00013622,
            "bid_price": 0.00012802,
            "price_usd": 0.0254268252,
            "status": 400
          },
          {
            "id": 60,
            "symbol": "DGB",
            "long_name": "DigiByte",
            "quote_asset_id": 2,
            "instrument_id": 3824,
            "exchange_id": 7,
            "nvt": 96.77459844752693,
            "volume": 18434805.72,
            "volume_usd": 468738.58263840014,
            "ask_price": 0.00013622,
            "bid_price": 0.00012802,
            "price_usd": 0.0254268252,
            "status": 400
          }
        ]

        return Promise.resolve(instruments);
      });

    });
    
    afterEach(() => {
      assetService.getAssetGroupWithData.restore();
    });

    it('shall exist', () => {
      return chai.expect(investmentService.generateRecipeDetails).to.exist;
    });

    it("shall throw if can't get base asset prices", () => {
      if(assetService.getBaseAssetPrices.restore)
        assetService.getBaseAssetPrices.restore();

      sinon.stub(assetService, 'getBaseAssetPrices').returns(Promise.reject());
      return chai.assert.isRejected(investmentService.generateRecipeDetails(INVESTMENT_RUN_ID, STRATEGY_TYPE));
    });

    it("shall throw if can't get base asset prices", () => {
      if(assetService.getDepositAssets.restore)
        assetService.getDepositAssets.restore();

      sinon.stub(assetService, 'getDepositAssets').returns(Promise.reject());
      return chai.assert.isRejected(investmentService.generateRecipeDetails(INVESTMENT_RUN_ID, STRATEGY_TYPE));
    });

    it("shall throw if can't get find investment run with its investment amounts", () => {
      if (InvestmentRun.findOne.restore)
        InvestmentRun.findOne.restore();

      sinon.stub(InvestmentRun, 'findOne').returns(Promise.resolve());

      return chai.assert.isRejected(
        investmentService.generateRecipeDetails(INVESTMENT_RUN_ID, STRATEGY_TYPE)
      ).then(recipe => {
        chai.assert.isTrue(InvestmentRun.findOne.called);
      });
    });

    it("shall throw if can't get investment asset group data", () => {
      if(assetService.getAssetGroupWithData.restore)
        assetService.getAssetGroupWithData.restore();

      sinon.stub(assetService, 'getAssetGroupWithData').returns(Promise.reject([]));

      return chai.assert.isRejected(investmentService.generateRecipeDetails(INVESTMENT_RUN_ID, STRATEGY_TYPE));
    });

    it("should calculate recipe run details singe USD deposit", () => {
      let investment_amounts = prep_investment_amounts([
        { asset_id: DEPOSIT_ASSETS.USD.id, amount: 5664798.12312 }
      ]);

      if (InvestmentRun.findOne.restore)
        InvestmentRun.findOne.restore();

      sinon.stub(InvestmentRun, 'findOne').callsFake(arg => {
        let investment_run = new InvestmentRun(INVESTMENT_RUN);
        investment_run.InvestmentAmounts = investment_amounts;

        return Promise.resolve(investment_run);
      });

      return investmentService.generateRecipeDetails(INVESTMENT_RUN_ID, STRATEGY_TYPE)
      .then(recipe_details => {

        chai.expect(recipe_detail_sum_used_assets(recipe_details)).to.eql(
          investment_amounts.map(a => _.pick(a, ['asset_id', 'amount'])),
          "Recipe details don't use all of investment deposit amounts"
        );

        chai.expect(recipe_detail_calculate_total_percentage(recipe_details)).to.be.equal(100);
      });
    });

    it("should calculate recipe run details singe BTC deposit", () => {
      let investment_amounts = prep_investment_amounts([
        { asset_id: DEPOSIT_ASSETS.BTC.id, amount: 6455.1332 }
      ]);

      if (InvestmentRun.findOne.restore)
        InvestmentRun.findOne.restore();

      sinon.stub(InvestmentRun, 'findOne').callsFake(arg => {
        let investment_run = new InvestmentRun(INVESTMENT_RUN);
        investment_run.InvestmentAmounts = investment_amounts;

        return Promise.resolve(investment_run);
      });

      return investmentService.generateRecipeDetails(INVESTMENT_RUN_ID, STRATEGY_TYPE)
      .then(recipe_details => {

        chai.expect(recipe_detail_sum_used_assets(recipe_details)).to.eql(
          investment_amounts.map(a => _.pick(a, ['asset_id', 'amount'])),
          "Recipe details don't use all of investment deposit amounts"
        );

        chai.expect(recipe_detail_calculate_total_percentage(recipe_details)).to.be.equal(100);
      });
    });

    it("should calculate recipe run details singe ETH deposit", () => {
      let investment_amounts = prep_investment_amounts([
        { asset_id: DEPOSIT_ASSETS.ETH.id, amount: 6654.313564 }
      ]);

      if (InvestmentRun.findOne.restore)
        InvestmentRun.findOne.restore();

      sinon.stub(InvestmentRun, 'findOne').callsFake(arg => {
        let investment_run = new InvestmentRun(INVESTMENT_RUN);
        investment_run.InvestmentAmounts = investment_amounts;

        return Promise.resolve(investment_run);
      });

      return investmentService.generateRecipeDetails(INVESTMENT_RUN_ID, STRATEGY_TYPE)
      .then(recipe_details => {
        
        chai.expect(recipe_detail_sum_used_assets(recipe_details)).to.eql(
          investment_amounts.map(a => _.pick(a, ['asset_id', 'amount'])),
          "Recipe details don't use all of investment deposit amounts"
        );

        chai.expect(recipe_detail_calculate_total_percentage(recipe_details)).to.be.equal(100);
      });
    });

    it("should calculate recipe run details with USD and BTC deposits", () => {
      let investment_amounts = prep_investment_amounts([
        { asset_id: DEPOSIT_ASSETS.USD.id, amount: 3218947 },
        { asset_id: DEPOSIT_ASSETS.BTC.id, amount: 311 }
      ]);

      if (InvestmentRun.findOne.restore)
        InvestmentRun.findOne.restore();

      sinon.stub(InvestmentRun, 'findOne').callsFake(arg => {
        let investment_run = new InvestmentRun(INVESTMENT_RUN);
        investment_run.InvestmentAmounts = investment_amounts;

        return Promise.resolve(investment_run);
      });

      return investmentService.generateRecipeDetails(INVESTMENT_RUN_ID, STRATEGY_TYPE)
      .then(recipe_details => {
        
        chai.expect(recipe_detail_sum_used_assets(recipe_details)).to.eql(
          investment_amounts.map(a => _.pick(a, ['asset_id', 'amount'])),
          "Recipe details don't use all of investment deposit amounts"
        );

        chai.expect(recipe_detail_calculate_total_percentage(recipe_details)).to.be.equal(100);
      });
    });

    it("should calculate recipe run details with USD and ETH deposits", () => {
      let investment_amounts = prep_investment_amounts([
        { asset_id: DEPOSIT_ASSETS.USD.id, amount: 11321564 },
        { asset_id: DEPOSIT_ASSETS.ETH.id, amount: 88173.3151654 }
      ]);

      if (InvestmentRun.findOne.restore)
        InvestmentRun.findOne.restore();

      sinon.stub(InvestmentRun, 'findOne').callsFake(arg => {
        let investment_run = new InvestmentRun(INVESTMENT_RUN);
        investment_run.InvestmentAmounts = investment_amounts;

        return Promise.resolve(investment_run);
      });

      return investmentService.generateRecipeDetails(INVESTMENT_RUN_ID, STRATEGY_TYPE)
      .then(recipe_details => {
        chai.expect(recipe_detail_sum_used_assets(recipe_details)).to.eql(
          investment_amounts.map(a => _.pick(a, ['asset_id', 'amount'])),
          "Recipe details don't use all of investment deposit amounts"
        );

        chai.expect(recipe_detail_calculate_total_percentage(recipe_details)).to.be.equal(100);
      });
    });

    it("should calculate recipe run details with BTC and ETH deposits", () => {
      let investment_amounts = prep_investment_amounts([
        { asset_id: DEPOSIT_ASSETS.BTC.id, amount: 451.7764451931 },
        { asset_id: DEPOSIT_ASSETS.ETH.id, amount: 14456.1128797 }
      ]);

      if (InvestmentRun.findOne.restore)
        InvestmentRun.findOne.restore();

      sinon.stub(InvestmentRun, 'findOne').callsFake(arg => {
        let investment_run = new InvestmentRun(INVESTMENT_RUN);
        investment_run.InvestmentAmounts = investment_amounts;

        return Promise.resolve(investment_run);
      });

      return investmentService.generateRecipeDetails(INVESTMENT_RUN_ID, STRATEGY_TYPE)
      .then(recipe_details => {
        chai.expect(recipe_detail_sum_used_assets(recipe_details)).to.eql(
          investment_amounts.map(a => _.pick(a, ['asset_id', 'amount'])),
          "Recipe details don't use all of investment deposit amounts"
        );

        chai.expect(recipe_detail_calculate_total_percentage(recipe_details)).to.be.equal(100);
      });
    });

    it("should calculate recipe run details with USD, BTC and ETH deposits", () => {
      let investment_amounts = prep_investment_amounts([
        { asset_id: DEPOSIT_ASSETS.USD.id, amount: 1297654.115679879811342313 },
        { asset_id: DEPOSIT_ASSETS.BTC.id, amount: 145.12333134623141234124 },
        { asset_id: DEPOSIT_ASSETS.ETH.id, amount: 5851.22133464861234123423 }
      ]);

      if (InvestmentRun.findOne.restore)
        InvestmentRun.findOne.restore();

      sinon.stub(InvestmentRun, 'findOne').callsFake(arg => {
        let investment_run = new InvestmentRun(INVESTMENT_RUN);
        investment_run.InvestmentAmounts = investment_amounts;

        return Promise.resolve(investment_run);
      });

      return investmentService.generateRecipeDetails(INVESTMENT_RUN_ID, STRATEGY_TYPE)
      .then(recipe_details => {

        chai.expect(recipe_detail_sum_used_assets(recipe_details)).to.eql(
          investment_amounts.map(a => _.pick(a, ['asset_id', 'amount'])),
          "Recipe details don't use all of investment deposit amounts"
        );

        chai.expect(recipe_detail_calculate_total_percentage(recipe_details)).to.be.equal(100);
      });
    });
    
    it("shall throw if it can't acquire all needed amount of some asset", () => {
      let investment_amounts = prep_investment_amounts([
        { asset_id: DEPOSIT_ASSETS.BTC.id, amount: 7 },
        { asset_id: DEPOSIT_ASSETS.ETH.id, amount: 5851.22133464861234123423 }
      ]);

      if (assetService.getAssetGroupWithData.restore)
        assetService.getAssetGroupWithData.restore();
        
      sinon.stub(assetService, 'getAssetGroupWithData').callsFake((recipe_run_id) => {
        let instruments = [
          {
            "id": 553,
            "symbol": "MKR",
            "long_name": "Maker",
            "quote_asset_id": 2,
            "instrument_id": 3841,
            "exchange_id": 5,
            "nvt": 1423.5908183763754,
            "volume": 111.46,
            "volume_usd": 36747.347714,
            "ask_price": 0.0517,
            "bid_price": 0.0506,
            "price_usd": 329.6909,
            "status": 400
          },
          {
            "id": 553,
            "symbol": "MKR",
            "long_name": "Maker",
            "quote_asset_id": 2,
            "instrument_id": 3841,
            "exchange_id": 2,
            "nvt": 1423.5908183763754,
            "volume": 2.5,
            "volume_usd": 834.4145075,
            "ask_price": 0.052339,
            "bid_price": 0.050406,
            "price_usd": 333.765803,
            "status": 400
          },
          {
            "id": 367,
            "symbol": "DCR",
            "long_name": "Decred",
            "quote_asset_id": 2,
            "instrument_id": 3835,
            "exchange_id": 7,
            "nvt": 314.42052425060086,
            "volume": 5294.828283448519,
            "volume_usd": 186113.34123909424,
            "ask_price": 0.005512,
            "bid_price": 0.005445,
            "price_usd": 35.150024,
            "status": 400
          },
          {
            "id": 367,
            "symbol": "DCR",
            "long_name": "Decred",
            "quote_asset_id": 312,
            "instrument_id": 3836,
            "exchange_id": 7,
            "nvt": 314.42052425060086,
            "volume": 2994.1674035304313,
            "volume_usd": 104356.18121002715,
            "ask_price": 0.18672,
            "bid_price": 0.185593,
            "price_usd": 34.8531552,
            "status": 400
          },
          {
            "id": 149,
            "symbol": "BCN",
            "long_name": "Bytecoin",
            "quote_asset_id": 2,
            "instrument_id": 3825,
            "exchange_id": 5,
            "nvt": 110.70930975269502,
            "volume": 699830900,
            "volume_usd": 1317871.23303829,
            "ask_price": 2.953e-7,
            "bid_price": 2.952e-7,
            "price_usd": 0.0018831281,
            "status": 400
          },
          {
            "id": 149,
            "symbol": "BCN",
            "long_name": "Bytecoin",
            "quote_asset_id": 2,
            "instrument_id": 3825,
            "exchange_id": 1,
            "nvt": 110.70930975269502,
            "volume": 414942331,
            "volume_usd": 793826.1734361,
            "ask_price": 3e-7,
            "bid_price": 2.9e-7,
            "price_usd": 0.0019131,
            "status": 400
          },
          {
            "id": 149,
            "symbol": "BCN",
            "long_name": "Bytecoin",
            "quote_asset_id": 312,
            "instrument_id": 3826,
            "exchange_id": 1,
            "nvt": 110.70930975269502,
            "volume": 75098860,
            "volume_usd": 143263.481781672,
            "ask_price": 0.00001022,
            "bid_price": 0.00001013,
            "price_usd": 0.0019076652,
            "status": 400
          },
          {
            "id": 149,
            "symbol": "BCN",
            "long_name": "Bytecoin",
            "quote_asset_id": 312,
            "instrument_id": 3826,
            "exchange_id": 5,
            "nvt": 110.70930975269502,
            "volume": 5205600,
            "volume_usd": 9911.1084192,
            "ask_price": 0.0000102,
            "bid_price": 0.00001,
            "price_usd": 0.001903932,
            "status": 400
          },
          {
            "id": 60,
            "symbol": "DGB",
            "long_name": "DigiByte",
            "quote_asset_id": 312,
            "instrument_id": 3824,
            "exchange_id": 7,
            "nvt": 96.77459844752693,
            "volume": 18434805.72,
            "volume_usd": 468738.58263840014,
            "ask_price": 0.00013622,
            "bid_price": 0.00012802,
            "price_usd": 0.0254268252,
            "status": 400
          },
          {
            "id": 60,
            "symbol": "DGB",
            "long_name": "DigiByte",
            "quote_asset_id": 2,
            "instrument_id": 3824,
            "exchange_id": 7,
            "nvt": 96.77459844752693,
            "volume": 18434805.72,
            "volume_usd": 468738.58263840014,
            "ask_price": 0.00013622,
            "bid_price": 0.00012802,
            "price_usd": 0.0254268252,
            "status": 400
          }
        ]

        return Promise.resolve(instruments);
      });

      if (InvestmentRun.findOne.restore)
        InvestmentRun.findOne.restore();

      sinon.stub(InvestmentRun, 'findOne').callsFake(arg => {
        let investment_run = new InvestmentRun(INVESTMENT_RUN);
        investment_run.InvestmentAmounts = investment_amounts;

        return Promise.resolve(investment_run);
      });

      return chai.assert.isRejected(
        investmentService.generateRecipeDetails(INVESTMENT_RUN_ID, STRATEGY_TYPE)
      ).then(recipe_details => {

      });
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

      sinon.stub(sequelize, 'query').callsFake(async (query, options) => {

        if(query.match('execution_order')) {
          let exec_order_statuses = [{
            status: 61,
            count: 1000
          }];
  
          if(options.replacements.rog_id == 1)
            exec_order_statuses.push({
              status: 66,
              count: 1
            });
  
          return exec_order_statuses;
        }

        else if(query.match('cold_storage_transfer')) {

          if(options.replacements.recipe_run_id !== 5) return [];

          return [{
            status: COLD_STORAGE_ORDER_STATUSES.Pending,
            count: _.random(1, 10)
          },{
            status: COLD_STORAGE_ORDER_STATUSES.Approved,
            count: _.random(1, 10)
          },{
            status: COLD_STORAGE_ORDER_STATUSES.Sent,
            count: _.random(1, 10)
          },{
            status: COLD_STORAGE_ORDER_STATUSES.Completed,
            count: _.random(1, 10)
          }]
        }

        else return [];
        
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

    it('it should count cold storage transfers and return with status SENT', () => {
      return investmentService.getInvestmentRunTimeline(INVESTMENT_ID.EXEC_ORDERS_EXECUTING).then(result => {
        chai.assert.isNumber(result.cold_storage_transfers.count);
        chai.expect(result.cold_storage_transfers.status).to.be.equal('cold_storage_transfers_timeline.status.93');
      });
    });

  });

  describe('and method generateInvestmentAssetGroup shall', () => {

    before(() => {
      sinon.stub(assetService, 'getStrategyAssets').callsFake((strategy_type) => {
        if (strategy_type < 0) return Promise.reject();

        let cap_usd = _.random(10, 30, false);
        let market_share = 0.01;

        let assets = [...Array(50)].map((val, index) => {
          let status = index % 10 != 0 ? INSTRUMENT_STATUS_CHANGES.Whitelisting : INSTRUMENT_STATUS_CHANGES.Blacklisting;
          
          return {
            id: index + 1,
            capitalization_usd: cap_usd * index,
            avg_share: market_share * index,
            status: status
          };
        });
        let all = _.partition(assets, (a) => a.status != INSTRUMENT_STATUS_CHANGES.Whitelisting);

        return Promise.resolve(all);
      });
    });

    after(() => {
      assetService.getStrategyAssets.restore();
    });

    const generateInvestmentAssetGroup = investmentService.generateInvestmentAssetGroup;

    it('exist', () => {
      
      chai.expect(generateInvestmentAssetGroup).to.be.not.undefined;

    });

    it('reject if the an invalid strategy_type is passed', () => {

      return chai.assert.isRejected(generateInvestmentAssetGroup(1, -1));

    });

    it('generate correct asset mixes for the appropriate strategy types', () => {

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
        }

      });

    });

  });
});