"use strict";

let app = require("../../app");
let chai = require("chai");
let asPromised = require('chai-as-promised');
let should = chai.should();
const sinon = require("sinon");

chai.use(asPromised);

describe('AssetService testing', () => {

  //ensure working DB before test
  before(done => {

      app.dbPromise.then(migrations => {
          console.log("Migrations: %o", migrations);
          done();
      })
  });

  
  const AssetService = require('./../../services/AssetService');
  const sequelize = require('./../../models').sequelize;
  const Asset = require('./../../models').Asset;
  const AssetStatusChange = require('./../../models').AssetStatusChange;
  const Exchange = require('./../../models').Exchange;
  const ExchangeAccount = require('./../../models').ExchangeAccount;


  describe('and method getStrategyAssets shall', function () {
    let assets = [
        ...Array(500)
      ].map((value, index) => ({
      id: index,
      avg_share: 1
    }));

    beforeEach(() => {
      sinon.stub(sequelize, "query").returns(Promise.resolve(assets));
    })

    afterEach(() => {
      sequelize.query.restore();
    });

    it('exist', () => {
      chai.expect(AssetService.getStrategyAssets).to.exist;
    });

    it('shall throw when provided with bad strategy value', () => {
      let incorrect_strategy = -1;
      return chai.assert.isRejected(AssetService.getStrategyAssets(incorrect_strategy));
    });

    it('shall return correct number of assets different assets', () => {
      return Promise.all([
        AssetService.getStrategyAssets(STRATEGY_TYPES.LCI),
        AssetService.getStrategyAssets(STRATEGY_TYPES.MCI)
      ]).should.eventually.satisfy((assets) => {
        let [lci, mci] = assets;

        return lci.length == SYSTEM_SETTINGS.INDEX_LCI_CAP &&
          mci.length == SYSTEM_SETTINGS.INDEX_MCI_CAP &&
          !lci.some(lci_asset => { // check if they don't contain same assets
            return mci.map(mci_asset => mci_asset.id).includes(lci_asset.id);
          });
      }, "Doesn't return correct number of assets");
    });
  });

  describe('and method createExchangeAccount shall', () => {

    const { Trading, Withdrawal } = MODEL_CONST.EXCHANGE_ACCOUNT_TYPES

    before(done => {

      sinon.stub(Asset, 'count').callsFake(options => {
        const asset_id = options.where.id;

        switch(asset_id) {
          case 1:
            return Promise.resolve(1);
          default: 
            return Promise.resolve(0);
        }
      });

      sinon.stub(Exchange, 'count').callsFake(options => {
        const exchange_account = options.where.id;

        switch(exchange_account) {
          case 1:
            return Promise.resolve(1);
          default: 
            return Promise.resolve(0);
        }
      });

      sinon.stub(ExchangeAccount, 'count').callsFake(options => {
        const type = options.where.type;

        switch(type) {
          case Withdrawal:
            return Promise.resolve(1);
          default: 
            return Promise.resolve(0);
        }
      });

      sinon.stub(ExchangeAccount, 'create').callsFake(options => {
        return Promise.resolve(options);
      });

      done();

    });

    after(done => {
      Asset.count.restore();
      Exchange.count.restore();
      ExchangeAccount.count.restore();
      ExchangeAccount.create.restore();

      done();
    });

    it('exist', () => {
      chai.expect(AssetService.createExchangeAccount).to.not.be.undefined;
    });

    it('reject if the any of the arguments are missing', () => {
      return Promise.all(_.map([
        [1],
        [1, 2],
        [1, 2, 3],
        [null, 2, 3, '$h23k2j4h24h2k342k4h3']
      ], params => {
          chai.assert.isRejected(AssetService.createExchangeAccount(...params))
      }))
    });

    it('reject if the account type is not a valid id number', () => {
      return chai.assert.isRejected(AssetService.createExchangeAccount(1, 2, 3, 4));
    });

    it('reject if the asset does not exist', () => {
      return chai.assert.isRejected(AssetService.createExchangeAccount(Trading, 2, 1, '111'));
    });

    it('reject if the exchange does not exist', () => {
      return chai.assert.isRejected(AssetService.createExchangeAccount(Trading, 1, 2, '111'));
    });

    it('reject if the exchange account with same params already exists', () => {
      return chai.assert.isRejected(AssetService.createExchangeAccount(Withdrawal, 1, 1, '111'));
    });

    it('create a new Exchange Account if all of the params are valid', () => {
      return chai.assert.isFulfilled(AssetService.createExchangeAccount(Trading, 1, 1, '1231232323')
        .then(account => {
          chai.expect(account.type).to.equal(Trading);
          chai.expect(account.asset_id).to.equal(1);
          chai.expect(account.exchange_id).to.equal(1);
          chai.expect(account.external_identifier).to.equal('1231232323')
        }));
    });

  });


});