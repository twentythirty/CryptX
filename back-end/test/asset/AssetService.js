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
});