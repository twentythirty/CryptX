"use strict";

let app = require("../../app");
let chai = require("chai");
let asPromised = require('chai-as-promised');
let should = chai.should();
const sinon = require("sinon");

chai.use(asPromised);

describe('InstrumentService testing:', () => {

    const MOCK_ASSET_1 = {
        id: 77,
        symbol: 'MOCK1'
    }
    const MOCK_ASSET_2 = {
        id: 455,
        symbol: 'MOCK2'
    }
    const MOCK_INSTRUMENT = {
        id: 3,
        symbol: `${MOCK_ASSET_1.symbol}/${MOCK_ASSET_2.symbol}`,
        transaction_asset_id: MOCK_ASSET_1.id,
        quote_asset_id: MOCK_ASSET_2.id
    }
    const MOCK_ASSETS = [MOCK_ASSET_1, MOCK_ASSET_2];

    //ensure working DB before test
    before(done => {

        app.dbPromise.then(migrations => {
            console.log("Migrations: %o", migrations);
            sinon.stub(Asset, 'findAll').callsFake(options => {

                if (_.isArray(options.where.id)) {
                    return Promise.resolve(_.filter(MOCK_ASSETS, asset => options.where.id.includes(asset.id)));
                } else {
                    return Promise.resolve(_.find(MOCK_ASSETS, asset => asset.id == options.where.id));
                }
            });
            sinon.stub(InstrumentExchangeMapping, 'build').callsFake(options => {

                let mock_mapping = new InstrumentExchangeMapping(options);

                sinon.stub(mock_mapping, 'save').callsFake(nothing => {

                    return Promise.resolve(mock_mapping);
                });

                return mock_mapping;
            })

            done();
        });
    });

    after(done => {
        _.forEach([
            Asset.findAll,
            InstrumentExchangeMapping.build
        ], model => {
            if (model.restore) {
                model.restore();
            }
        });

        done();
    });

    const instrumentService = require('../../services/InstrumentsService');
    const Instrument = require('../../models').Instrument;
    const InstrumentExchangeMapping = require('../../models').InstrumentExchangeMapping;
    const Asset = require('../../models').Asset;
    const ccxtUtils = require('../../utils/CCXTUtils');

    describe(' the method createInstrument shall ', done => {

        it('exist', () => {
            chai.expect(instrumentService.createInstrument).to.exist;
        });

        it(`reject when at least one of passed ids is null `, () => {

            return Promise.all(_.map([
                [MOCK_ASSET_1.id, null],
                [null, MOCK_ASSET_2.id],
                [null, null]
            ], pair => {
                chai.assert.isRejected(instrumentService.createInstrument(...pair))
            }))
        });

        it('reject reject when at least one of the asset ids doesnt work', () => {

            return Promise.all(_.map([
                [MOCK_ASSET_1.id + 5, MOCK_ASSET_2.id],
                [MOCK_ASSET_1.id, MOCK_ASSET_2.id + 7],
                [MOCK_ASSET_1.id + 1, MOCK_ASSET_2.id + 1]
            ], pair => {
                chai.assert.isRejected(instrumentService.createInstrument(...pair))
            }))
        });

        it('reject when the provided instrument already exists', () => {

            sinon.stub(Instrument, 'findOne').callsFake(options => {

                return Promise.resolve(MOCK_INSTRUMENT)
            });

            return chai.assert.isRejected(instrumentService.createInstrument(...(_.map(MOCK_ASSETS, 'id')))).then(rejected => {

                Instrument.findOne.restore();
                return rejected
            });
        });

        it('create a proper instrument when all conditions are met', () => {

            sinon.stub(Instrument, 'findOne').callsFake(options => {

                return Promise.resolve(null)
            });
            sinon.stub(Instrument, 'create').callsFake(options => {

                return Promise.resolve(options)
            });

            return chai.assert.isFulfilled(instrumentService.createInstrument(...(_.map(MOCK_ASSETS, 'id')))).then(fulfill => {

                Instrument.findOne.restore();
                Instrument.create.restore();

                chai.expect(fulfill.transaction_asset_id).to.eq(MOCK_ASSET_1.id);
                chai.expect(fulfill.quote_asset_id).to.eq(MOCK_ASSET_2.id);
                chai.expect(fulfill.symbol).to.eq(`${MOCK_ASSET_1.symbol}/${MOCK_ASSET_2.symbol}`);

                return fulfill
            });
        })

    });


    describe(' the method addInstrumentExchangeMappings shall ', () => {

        it('exist', () => {
            chai.expect(instrumentService.addInstrumentExchangeMappings).to.exist;
        });

        it('reject bad args', () => {

            return Promise.all(_.map([
                [null, []],
                [66, {}],
                [null, {}]
            ], params => chai.assert.isRejected(instrumentService.addInstrumentExchangeMappings(...params))));
        });


        it('reject saving mappings when an exchange lacks an identifier', () => {

            sinon.stub(ccxtUtils, 'getConnector').callsFake(exchange_id => {

                return Promise.resolve({
                    markets: {}
                })
            });

            return chai.assert.isRejected(instrumentService.addInstrumentExchangeMappings(_.random(100, false), [{
                exchange_id: _.random(200, false),
                external_instrument_id: MOCK_INSTRUMENT.symbol
            }])).then(rejected => {

                ccxtUtils.getConnector.restore();

                return rejected;
            });
        });


        it('create a mapping when params are correct', () => {

            sinon.stub(ccxtUtils, 'getConnector').callsFake(exchange_id => {

                return Promise.resolve({
                    markets: {
                        [MOCK_INSTRUMENT.symbol]: {
                            limits: {
                                amount: {
                                    min: MOCK_ASSET_2.id
                                }
                            }
                        }
                    }
                })
            });

            return chai.assert.isFulfilled(instrumentService.addInstrumentExchangeMappings(_.random(100, false), [{
                exchange_id: _.random(200, false),
                external_instrument_id: MOCK_INSTRUMENT.symbol
            }])).then(fulfilled => {

                ccxtUtils.getConnector.restore();

                chai.assert.isArray(fulfilled);
                chai.expect(fulfilled[0].external_instrument_id).to.eq(MOCK_INSTRUMENT.symbol);
                chai.expect(fulfilled[0].tick_size).to.eq(MOCK_ASSET_2.id);

                return fulfilled;
            });
        });

    });
});