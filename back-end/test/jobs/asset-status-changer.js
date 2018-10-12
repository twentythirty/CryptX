'use strict';

let app = require("../../app");
let chai = require("chai");
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
const sinon = require("sinon");

chai.use(chaiAsPromised);

const assetStatusChanger = require('../../jobs/asset-liquidity-checker');

const sequelize = require('../../models').sequelize;
const AssetStatusChange = require('../../models').AssetStatusChange;

describe("Asset status changer job", () => {

  let stubbed_config = {
    models: {
      AssetStatusChange: AssetStatusChange,
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


  let ASSET_LIQUIDITY = {
    id: 1,
    symbol: 'LTC',
    long_name: 'Litecoin',
    is_base: false,
    is_deposit: false,
    periodicity_in_days: 7,
    exchange_id: 1,
    minimum_volume: 10000,
    avg_volume: 10001, // volume bigger then minimum required volume
    status: INSTRUMENT_STATUS_CHANGES.Graylisting
  }

  let GRAYLISTED_COMMENT = "Doesn't meet liquidity requirements"
  let WHITELISTED_COMMENT = "Meets liquidity requirements";

  beforeEach(() => {
  
    sinon.stub(AssetStatusChange, 'bulkCreate').callsFake((args) => {
      
      return Promise.resolve(args);
    });
  })

  afterEach(() => {
    if (sequelize.query.restore) sequelize.query.restore();
    AssetStatusChange.bulkCreate.restore();
  });

  it("job body shall exist", () => {
    return chai.expect(assetStatusChanger.JOB_BODY).to.exist;
  });

  it("shall throw if it can't fetch asset information", () => {
    sinon.stub(sequelize, 'query').returns(Promise.reject());

    return chai.assert.isRejected(assetStatusChanger.JOB_BODY(stubbed_config, console.log));
  });

  it("shall not continue if no liquidity requirements are found", () => {
    sinon.stub(sequelize, 'query').returns(Promise.resolve([]));

    return assetStatusChanger.JOB_BODY(stubbed_config, console.log).then(result => {

      chai.assert.isArray(result);
      chai.expect(result.length).to.be.equal(0);
    })
  });

  it("status shall change to graylisted if asset is whitelited and not change if theres no volume data", () => {
    sinon.stub(sequelize, 'query').callsFake(() => {
      let assets = [
        Object.assign({}, ASSET_LIQUIDITY, {
          minimum_volume: 10000,
          avg_volume: null, // volume bigger then minimum required volume
          status: INSTRUMENT_STATUS_CHANGES.Whitelisting
        }),

        Object.assign({}, ASSET_LIQUIDITY, {
          minimum_volume: 10000,
          avg_volume: null, // volume bigger then minimum required volume
          status: INSTRUMENT_STATUS_CHANGES.Graylisting
        })
      ];

      return Promise.resolve(assets);
    });

    return assetStatusChanger.JOB_BODY(stubbed_config, console.log).then(result => {

      chai.assert.isArray(result);
      result.every(r => chai.expect(r.comment).to.be.eq(GRAYLISTED_COMMENT));
      result.every(r => chai.expect(r.type).to.be.eq(INSTRUMENT_STATUS_CHANGES.Graylisting));
    });
  })

  it("shall change asset status to whitelisted if asset is graylisted and meets liquidity requirement in atleast one of exchanges", () => {
    sinon.stub(sequelize, 'query').callsFake(() => {
      let assets = [...Array(5)].map(() => {
        return Object.assign({}, ASSET_LIQUIDITY, {
          minimum_volume: 10000,
          avg_volume: 9000, // volume bigger then minimum required volume
          status: INSTRUMENT_STATUS_CHANGES.Graylisting
        });
      });

      assets[assets.length] = Object.assign({}, ASSET_LIQUIDITY, {
        minimum_volume: 10000,
        avg_volume: 15000, // volume bigger then minimum required volume
        status: INSTRUMENT_STATUS_CHANGES.Graylisting
      });

      return Promise.resolve(assets);
    });

    return assetStatusChanger.JOB_BODY(stubbed_config, console.log).then(result => {
      let status_change = _.first(result);

      chai.assert.isObject(status_change);
      chai.expect(status_change.id).to.be.eq(status_change.id);
      chai.expect(status_change.comment).to.be.eq(WHITELISTED_COMMENT);
      chai.expect(status_change.type).to.be.eq(INSTRUMENT_STATUS_CHANGES.Whitelisting);
    });
  });

  it("status shall not change if asset is whitelisted and passes liquidity requirements", () => {
    sinon.stub(sequelize, 'query').callsFake(() => {
      let assets = [...Array(5)].map(() => {
        return Object.assign({}, ASSET_LIQUIDITY, {
          minimum_volume: 10000,
          avg_volume: 9000, // volume bigger then minimum required volume
          status: INSTRUMENT_STATUS_CHANGES.Whitelisting
        });
      });

      assets[assets.length] = Object.assign({}, ASSET_LIQUIDITY, {
        minimum_volume: 10000,
        avg_volume: 15000, // volume bigger then minimum required volume
        status: INSTRUMENT_STATUS_CHANGES.Whitelisting
      });

      return Promise.resolve(assets);
    });

    return assetStatusChanger.JOB_BODY(stubbed_config, console.log).then(result => {
      let status_change = _.first(result);

      chai.assert.isUndefined(status_change);
    });
  });

  it("shall change status to graylisted if asset is whitelisted and doesn't meet requirements", () => {
    sinon.stub(sequelize, 'query').callsFake(() => {
      let assets = [...Array(5)].map(() => {
        return Object.assign({}, ASSET_LIQUIDITY, {
          minimum_volume: 10000,
          avg_volume: 9999, // volume smaller than minimum requirement
          status: INSTRUMENT_STATUS_CHANGES.Whitelisting
        });
      });

      return Promise.resolve(assets);
    });

    return assetStatusChanger.JOB_BODY(stubbed_config, console.log).then(result => {
      let status_change = _.first(result);

      chai.assert.isObject(status_change);
      chai.expect(status_change.id).to.be.eq(status_change.id);
      chai.expect(status_change.comment).to.be.eq(GRAYLISTED_COMMENT);
      chai.expect(status_change.type).to.be.eq(INSTRUMENT_STATUS_CHANGES.Graylisting);
    });
  });

  it("status shall not change if asset is graylisted and doesn't meet liquidity requirements", () => {
    sinon.stub(sequelize, 'query').callsFake(() => {
      let assets = [...Array(5)].map(() => {
        return Object.assign({}, ASSET_LIQUIDITY, {
          minimum_volume: 10000,
          avg_volume: 9999, // volume smaller than minimum requirement
          status: INSTRUMENT_STATUS_CHANGES.Graylisting
        });
      });

      return Promise.resolve(assets);
    });

    return assetStatusChanger.JOB_BODY(stubbed_config, console.log).then(result => {
      let status_change = _.first(result);

      chai.assert.isUndefined(status_change);
    });
  });
});