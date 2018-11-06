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
  const AssetStatusChange = require('./../../models').AssetStatusChange;
  const Asset = require('./../../models').Asset;
  const User = require('./../../models').User;


  describe('and method getStrategyAssets shall', function () {

    let ASSET_MARKET_SHARE = 6;

    beforeEach(() => {
      sinon.stub(sequelize, "query").callsFake((query_str, args) => {
        let assets = [
            ...Array(args.replacements.limit_count)
          ].map((value, index) => ({
          id: index + args.replacements.offset_count,
          status: (index % 10 != 0 ? INSTRUMENT_STATUS_CHANGES.Whitelisting : INSTRUMENT_STATUS_CHANGES.Blacklisting), // every 10th asset blacklisted
          avg_share: ASSET_MARKET_SHARE
        }));

        return Promise.resolve(assets);
      });
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

    it('shall throw it no assets would be returned', () => {
      if (sequelize.query.restore()) sequelize.query.restore();

      sinon.stub(sequelize, "query").returns(Promise.resolve([]));

      return chai.assert.isRejected(AssetService.getStrategyAssets(STRATEGY_TYPES.LCI));
    });

    it('shall throw when no assets found', () => {
      if (sequelize.query.restore()) sequelize.query.restore();

      sinon.stub(sequelize, "query").returns(Promise.reject());

      return chai.assert.isRejected(AssetService.getStrategyAssets(STRATEGY_TYPES.LCI));
    });

    it('shall return assets with total sum of market share less then or equal MARKETCAP_LIMIT_PERCENT value', () => {
      return AssetService.getStrategyAssets(STRATEGY_TYPES.LCI).then(result => {
        let [included, excluded] = result;

        /* should include max amount of assets with total marketshare percentage less then MARKETCAP_LIMIT_PERCENT */
        let possible_len = Math.floor(SYSTEM_SETTINGS.MARKETCAP_LIMIT_PERCENT / ASSET_MARKET_SHARE);

        chai.assert.isArray(included);
        chai.assert.isArray(excluded);
        chai.expect(included.length).to.be.lte(possible_len);
        chai.expect(_.sumBy(included, a=> a.avg_share)).to.be.lte(SYSTEM_SETTINGS.MARKETCAP_LIMIT_PERCENT);

        chai.expect(included).to.satisfy((assets) => { // check if all are whitelisted
          return assets.every(asset => asset.status === INSTRUMENT_STATUS_CHANGES.Whitelisting);
        }, `Includes blacklisted assets`);
        chai.expect(excluded).to.satisfy((assets) => { // check if all are not whitelisted
          return assets.every(asset => asset.status !== INSTRUMENT_STATUS_CHANGES.Whitelisting);
        }, `Includes whitelisted assets`);
      })
    });

    it('shall not return more than max amount of assets for LCI portfolio', () => {

      if (sequelize.query.restore) sequelize.query.restore();

      sinon.stub(sequelize, "query").callsFake((query_str, args) => {
        let assets = [
            ...Array(args.replacements.limit_count)
          ].map((value, index) => ({
          id: index + args.replacements.offset_count,
          status: (index % 10 != 0 ? INSTRUMENT_STATUS_CHANGES.Whitelisting : INSTRUMENT_STATUS_CHANGES.Blacklisting), // every 10th asset blacklisted
          avg_share: 1
        }));

        return Promise.resolve(assets);
      });

      return AssetService.getStrategyAssets(STRATEGY_TYPES.LCI).then(result => {
        let [included, excluded] = result;

        chai.assert.isArray(included);
        chai.assert.isArray(excluded);
        // max amount of LCI assets
        chai.expect(included.length).to.be.lte(SYSTEM_SETTINGS.INDEX_LCI_CAP);
        chai.expect(_.sumBy(included, a=> a.avg_share)).to.be.lte(SYSTEM_SETTINGS.MARKETCAP_LIMIT_PERCENT);

        chai.expect(included).to.satisfy((assets) => { // check if all are whitelisted
          return assets.every(asset => asset.status === INSTRUMENT_STATUS_CHANGES.Whitelisting);
        }, `Includes blacklisted assets`);
        chai.expect(excluded).to.satisfy((assets) => { // check if all are not whitelisted
          return assets.every(asset => asset.status !== INSTRUMENT_STATUS_CHANGES.Whitelisting);
        }, `Includes whitelisted assets`);
      })
    });

    it('shall return correct number of assets for MCI portfolio', () => {
      return AssetService.getStrategyAssets(STRATEGY_TYPES.MCI).then(result => {
        let [included, excluded] = result;

        chai.assert.isArray(included);
        chai.assert.isArray(excluded);
        chai.expect(included.length).to.be.equal(SYSTEM_SETTINGS.INDEX_MCI_CAP);
        chai.expect(included).to.satisfy((assets) => { // check if all are whitelisted
          return assets.every(asset => asset.status === INSTRUMENT_STATUS_CHANGES.Whitelisting);
        }, `Includes blacklisted assets`);
        chai.expect(excluded).to.satisfy((assets) => { // check if all are not whitelisted
          return assets.every(asset => asset.status !== INSTRUMENT_STATUS_CHANGES.Whitelisting);
        }, `Includes whitelisted assets`);
      })
    }); 

    it('shall not return same assets for LCI and MCI portfolios', () => {
      return Promise.all([
        AssetService.getStrategyAssets(STRATEGY_TYPES.LCI),
        AssetService.getStrategyAssets(STRATEGY_TYPES.MCI)
      ]).should.eventually.satisfy((assets) => {
        let [[lci], [mci]] = assets; // destructure only first elements of array
        
        return lci.every(lci_asset => {
          return !mci.map(mci_asset => mci_asset.id).includes(lci_asset.id);
        });
      }, "LCI and MCI returned same assets");
    });
  });

  describe('and method changeStatus shall', () => {

    const changeStatus = AssetService.changeStatus;

    const VALID_WHITELISTING = {
      type: INSTRUMENT_STATUS_CHANGES.Whitelisting,
      comment: 'Is alll gud'
    };

    const VALID_BLACKLISTING = {
      type: INSTRUMENT_STATUS_CHANGES.Blacklisting,
      comment: 'This is bad'
    };

    const VALID_GRAYLISTING = {
      type: INSTRUMENT_STATUS_CHANGES.Graylisting,
      comment: 'It\'s alright'
    };

    const MOCK_USER_1 = {
      id: 1,
      first_name: 'Test',
      last_name: '1',
      logAction: User.prototype.logAction
    }

    const MOCK_ASSET_1 = {
      id: 1,
      symbol: 'DOGE'
    };
    const MOCK_ASSET_2 = {
      id: 2,
      symbol: 'OGRE'
    };
    const MOCK_ASSETS = [MOCK_ASSET_1, MOCK_ASSET_2];

    const MOCK_STATUS_1 = {
      id: 1,
      asset_id: 2,
      type: INSTRUMENT_STATUS_CHANGES.Blacklisting
    }
    const MOCK_STATUSES = [MOCK_STATUS_1];

    before(done => {

      sinon.stub(Asset, 'findById').callsFake(id => {
        const asset = MOCK_ASSETS.find(a => a.id === id);
        return Promise.resolve(asset || null);
      });

      sinon.stub(AssetStatusChange, 'findOne').callsFake(options => {
        const { asset_id } = options.where;
        const status = MOCK_STATUSES.find(a => a.asset_id === asset_id);
        return Promise.resolve(status || null);
      });

      sinon.stub(AssetStatusChange, 'create').callsFake(status => {
        return Promise.resolve(Object.assign({ id: _.random(false) }, status));
      });

      done();
    });

    after(done => {

      Asset.findById.restore();
      AssetStatusChange.findOne.restore();
      AssetStatusChange.create.restore();

      done();
    });

    it('exists', () => {
      return chai.expect(changeStatus).to.be.not.undefined;
    });

    it('reject if new status type is not valid', () => {
      return chai.assert.isRejected(changeStatus(1, { type: -1, comment: 'Hello' }));
    });

    it('reject if new status comment is not valid', () => {
      return chai.assert.isRejected(changeStatus(1, { type: INSTRUMENT_STATUS_CHANGES.Graylisting, comment: null }));
    });

    it('reject if it does not find an asset', () => {
      return chai.assert.isRejected(changeStatus(-1, VALID_BLACKLISTING));
    });

    it('reject Whitelisting if there is no status changes in db, as assetsare Whitelisted by default', () => {
      return chai.assert.isRejected(changeStatus(MOCK_ASSET_1.id, VALID_WHITELISTING));
    });

    it('reject if new status type is the same as the newest status change type of asset', () => {
      return chai.assert.isRejected(changeStatus(MOCK_ASSET_2.id, VALID_BLACKLISTING));
    });

    it('create a new status change if everything is correct', () => {
      return changeStatus(MOCK_ASSET_1.id, VALID_GRAYLISTING).then(status => {

        chai.expect(status).to.be.an('object');
        chai.expect(status.id).to.be.a('number');
        chai.expect(status.timestamp).to.be.a('date');
        chai.expect(status.comment).to.equal(VALID_GRAYLISTING.comment);
        chai.expect(status.type).to.equal(VALID_GRAYLISTING.type);
        chai.expect(status.asset_id).to.equal(MOCK_ASSET_1.id);
        chai.expect(status.user_id).to.be.null;

      });
    });

    it('create a new status change and assign a user to it if it was provided', () => {
      return changeStatus(MOCK_ASSET_1.id, VALID_BLACKLISTING, MOCK_USER_1).then(status => {

        chai.expect(status).to.be.an('object');
        chai.expect(status.id).to.be.a('number');
        chai.expect(status.timestamp).to.be.a('date');
        chai.expect(status.comment).to.equal(VALID_BLACKLISTING.comment);
        chai.expect(status.type).to.equal(VALID_BLACKLISTING.type);
        chai.expect(status.asset_id).to.equal(MOCK_ASSET_1.id);
        chai.expect(status.user_id).to.equal(MOCK_USER_1.id);

      });
    });

  });

});