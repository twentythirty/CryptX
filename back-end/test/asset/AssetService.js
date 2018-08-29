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