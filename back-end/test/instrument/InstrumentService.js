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
    const MOCK_EXISTING_REQUIREMENT_1 = {
        id: 1,
        instrument_id: 1,
        minimum_volume: 1000,
        periodicity_in_days: 7,
        exchange: null,
        _previous_values: {
            instrument_id: 1,
            minimum_volume: 1000,
            periodicity_in_days: 7,
            exchange: null
        },
        save: function(){
            const update = Object.assign({}, this);
            Object.assign(this, this._previous_values);
            return Promise.resolve(update);
        },
        destroy: async () => {
            return Promise.resolve(this);
        }
    };
    const MOCK_EXISTING_REQUIREMENT_2 = {
        id: 2,
        instrument_id: 2,
        minimum_volume: 2000,
        periodicity_in_days: 5,
        exchange: 1,
        _previous_values: {
            instrument_id: 2,
            minimum_volume: 2000,
            periodicity_in_days: 5,
            exchange: 1
        },
        save: function(){
            const update = Object.assign({}, this);
            Object.assign(this, this._previous_values);
            return Promise.resolve(update);
        },
        destroy: async () => {
            return Promise.resolve(this);
        }
    };

    const MOCK_EXISTING_REQUIREMENTS = [ MOCK_EXISTING_REQUIREMENT_1, MOCK_EXISTING_REQUIREMENT_2 ];

    const MOCK_REQUIREMENT_1 = {
        instrument_id: 1,
        periodicity: _.random(7, 21, false),
        minimum_circulation: _.random(),
        exchange_id: 1
    };
    const MOCK_REQUIREMENT_2 = {
        instrument_id: 2,
        periodicity: _.random(7, 21, false),
        minimum_circulation: _.random(),
        exchange_id: 1
    };
    const MOCK_REQUIREMENT_3 = {
        instrument_id: 3,
        periodicity: _.random(7, 21, false),
        minimum_circulation: _.random()
    };
    const MOCK_REQUIREMENT_4 = {
        instrument_id: 2,
        periodicity: _.random(7, 21, false),
        minimum_circulation: _.random(),
        exchange_id: 2
    };
    const MOCK_REQUIREMENT_5 = {
        instrument_id: 2,
        periodicity: _.random(7, 21, false),
        minimum_circulation: _.random(),
        exchange_id: null
    };

    const MOCK_MAPPING_1 = {
        exchange_id: 1,
        instrument_id: 1,
        destroy: async () => {
            return Promise.resolve(null);
        }
    };
    const MOCK_MAPPING_2 = {
        exchange_id: 2,
        instrument_id: 2,
        destroy: async () => {
            return Promise.resolve(null);
        }
    };
    const MOCK_MAPPINGS = [MOCK_MAPPING_1, MOCK_MAPPING_2];

    const MOCK_EXCHANGE_1 = {
        id: 1,
        name: 'Binance'
    };
    const MOCK_EXCHANGE_2 = {
        id: 2,
        name: 'Kraken'
    };
    const MOCK_EXCHANGES = [MOCK_EXCHANGE_1, MOCK_EXCHANGE_2];

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
            sinon.stub(InstrumentLiquidityRequirement, 'findAll').callsFake(options => {
                const { instrument_id } = options.where;

                switch(instrument_id) {
                    case 1:
                        return Promise.resolve([MOCK_EXISTING_REQUIREMENT_1]);
                    case 2:
                        return Promise.resolve([MOCK_EXISTING_REQUIREMENT_2]);
                    default:
                        return Promise.resolve([]);
                }
            });

            sinon.stub(InstrumentLiquidityRequirement, 'findById').callsFake(id => {
                let requirement = MOCK_EXISTING_REQUIREMENTS.find(r => r.id === id);
                if(!requirement) requirement = null;
                else {
                    if(requirement.destroy.restore) requirement.destroy.restore();
                    sinon.stub(requirement, 'destroy').callsFake(function() {
                        return Promise.resolve(this);
                    });
                }

                return Promise.resolve(requirement);
            });

            sinon.stub(InstrumentLiquidityRequirement, 'create').callsFake(requirement => {
                return Promise.resolve(Object.assign({ id: 4 }, requirement));
            })

            sinon.stub(InstrumentExchangeMapping, 'findOne').callsFake(options => {
                const { exchange_id, instrument_id } = options.where;
                const mapping = MOCK_MAPPINGS.find(m => (m.instrument_id === instrument_id && m.exchange_id === exchange_id));

                if(mapping) {
                    if(mapping.destroy.restore) MOCK_MAPPING_1.destroy.restore();
                    sinon.stub(mapping, 'destroy').callsFake(() => {
                        return Promise.resolve(null);
                    });
                }

                return Promise.resolve(mapping);
            });

            sinon.stub(InstrumentExchangeMapping, 'destroy').callsFake(async () => {
                return;
            });

            sinon.stub(InstrumentExchangeMapping, 'bulkCreate').callsFake(async records => records);

            sinon.stub(sequelize, 'transaction').callsFake(async (options, transaction) => {
                if(_.isFunction(options)) transaction = options;
                return transaction();
            });

            done();
        });
    });

    after(done => {
        _.forEach([
            Asset.findAll,
            InstrumentExchangeMapping.build,
            InstrumentExchangeMapping.findOne,
            InstrumentExchangeMapping.destroy,
            InstrumentExchangeMapping.bulkCreate,
            InstrumentLiquidityRequirement.findAll,
            InstrumentLiquidityRequirement.create,
            sequelize.transaction
        ], model => {
            if (model.restore) {
                model.restore();
            }
        });

        done();
    });

    const instrumentService = require('../../services/InstrumentsService');
    const Exchange = require('../../models').Exchange;
    const Instrument = require('../../models').Instrument;
    const InstrumentExchangeMapping = require('../../models').InstrumentExchangeMapping;
    const InstrumentLiquidityRequirement = require('../../models').InstrumentLiquidityRequirement;
    const Asset = require('../../models').Asset;
    const sequelize = require('../../models').sequelize;
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

        before(done => {
            sinon.stub(Exchange, "findAll").callsFake(query => {
                return Promise.resolve(MOCK_EXCHANGES);
            });

            sinon.stub(InstrumentExchangeMapping, 'findAll').callsFake(options => {

                return Promise.resolve(MOCK_MAPPINGS);
            });

            done();
        });

        after(done => {
            Exchange.findAll.restore();
            InstrumentExchangeMapping.findAll.restore();
            done();
        });

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

        it('reject if the same exchange was passed multiple times', () => {
            return chai.assert.isRejected(instrumentService.addInstrumentExchangeMappings(1, [MOCK_MAPPING_1, MOCK_MAPPING_1]));
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

    describe(' the method createLiquidityRequirement shall ', () => {

        it('exists', () => {
            chai.expect(instrumentService.createLiquidityRequirement).to.exist;
        });

        it('reject bad args', () => {
            return Promise.all(_.map([
                ['ads', -1, '321'],
                [null, 123, 123],
                [43, 'a', 2],
                [45, -1, 5],
                [46, 2, {}]
            ], args => {
                chai.assert.isRejected(instrumentService.createLiquidityRequirement(...args));
            }));
        });

        it('reject saving when a requirement exists for all exchanges', () => {
            return chai.assert.isRejected(instrumentService.createLiquidityRequirement(...Object.values(MOCK_REQUIREMENT_1)));
        });

        it('reject saving when a requirement exists for a specific exchange', () => {
            return chai.assert.isRejected(instrumentService.createLiquidityRequirement(...Object.values(MOCK_REQUIREMENT_2)));
        });
        it('reject saving when attempting to create a requiremnt for all exchanges while there are already ones for specific exchanges', function() {
            return chai.assert.isRejected(instrumentService.createLiquidityRequirement(...Object.values(MOCK_REQUIREMENT_5)));
        });

        it('create a requirement when it does not exist', () => {
            return chai.assert.isFulfilled(instrumentService.createLiquidityRequirement(...Object.values(MOCK_REQUIREMENT_3))
            .then(requirement => {

                chai.assert.isObject(requirement);
                chai.expect(requirement.instrument_id).to.equal(MOCK_REQUIREMENT_3.instrument_id);
                chai.expect(requirement.minimum_volume).to.equal(MOCK_REQUIREMENT_3.minimum_circulation);
                chai.expect(requirement.periodicity_in_days).to.equal(MOCK_REQUIREMENT_3.periodicity);
                chai.expect(requirement.exchange).to.be.null;

                return requirement;

            }));
        });

        it('create a requirement when one already exists, but for a different exchange', () => {
            return chai.assert.isFulfilled(instrumentService.createLiquidityRequirement(...Object.values(MOCK_REQUIREMENT_4))
            .then(requirement => {

                chai.assert.isObject(requirement);
                chai.expect(requirement.instrument_id).to.equal(MOCK_REQUIREMENT_4.instrument_id);
                chai.expect(requirement.minimum_volume).to.equal(MOCK_REQUIREMENT_4.minimum_circulation);
                chai.expect(requirement.periodicity_in_days).to.equal(MOCK_REQUIREMENT_4.periodicity);
                chai.expect(requirement.exchange).to.equal(MOCK_REQUIREMENT_4.exchange_id);

                return requirement;

            }));
        });

    });

    describe(' method editLiqudityRequirement shall', () => {

        const { editLiquidityRequirement } = instrumentService;

        it('exist', () => {
            return chai.expect(editLiquidityRequirement).to.be.not.undefined;
        });

        it('return null if the requirement does not exist', () => {

            return editLiquidityRequirement(-1).then(result => {

                chai.expect(result).to.be.null;

            });

        });
        
        it('reject if provided exchange is not mapped', () => {

            return chai.assert.isRejected(editLiquidityRequirement(MOCK_EXISTING_REQUIREMENT_1.id, 7, 1000, -1));

        });

        it('only update the provided values', () => {

            const PERIODICTY = 18;
            const MINIMUM_CIRCULATION = 69000;
            const SPECIFIC_EXCHANGE = MOCK_EXCHANGE_1.id;
            const ALL_EXCHANGES = null;

            return Promise.all(_.map([
                [MOCK_EXISTING_REQUIREMENT_1.id, PERIODICTY, undefined, undefined],
                [MOCK_EXISTING_REQUIREMENT_1.id, undefined, MINIMUM_CIRCULATION, undefined],
                [MOCK_EXISTING_REQUIREMENT_1.id, undefined, undefined, SPECIFIC_EXCHANGE],
                [MOCK_EXISTING_REQUIREMENT_2.id, PERIODICTY, undefined, ALL_EXCHANGES],
                [MOCK_EXISTING_REQUIREMENT_2.id, PERIODICTY, MINIMUM_CIRCULATION, undefined],
                [MOCK_EXISTING_REQUIREMENT_2.id, undefined, undefined, ALL_EXCHANGES]
            ], params => {
                return editLiquidityRequirement(...params).then(result => {

                    chai.expect(result).to.be.not.undefined;
                    let original_requirement = null;

                    for(let [index, param] of params.entries()){
                        
                        if(index === 0) original_requirement = MOCK_EXISTING_REQUIREMENTS.find(r => r.id === param);

                        switch(index) {
                            
                            case 0:
                                chai.expect(result.id).to.equal(param);
                                break;

                            case 1:
                                if(_.isUndefined(param)) chai.expect(result.periodicity_in_days).to.equal(original_requirement.periodicity_in_days);
                                else chai.expect(result.periodicity_in_days).to.equal(param);
                                break;

                            case 2:
                                if(_.isUndefined(param)) chai.expect(result.minimum_volume).to.equal(original_requirement.minimum_volume);
                                else chai.expect(result.minimum_volume).to.equal(param);
                                break;

                            case 3:
                                if(_.isUndefined(param)) chai.expect(result.exchange).to.equal(original_requirement.exchange);
                                else chai.expect(result.exchange).to.equal(param);
                                break;
                        }

                    }

                });
            }));

        });

    });

    describe(' method deleteLiquidityRequirement shall', () => {

        const { deleteLiquidityRequirement } = instrumentService;

        it('exist', () => {
            return chai.expect(deleteLiquidityRequirement).to.be.not.undefined;
        });

        it('shall return null if the requirement was not found', () => {

            return deleteLiquidityRequirement(-1).then(result => {
                
                chai.expect(result).to.be.null;
            
            });

        });

        it('call destroy() if the requirement was found', () => {

            return deleteLiquidityRequirement(MOCK_EXISTING_REQUIREMENT_1.id).then(result => {

                chai.expect(result).to.be.an('object');
                chai.expect(result.destroy.calledOnce).to.be.true;

            });

        });

    });

    describe(' method deleteExchangeMapping shall', () => {

        const deleteExchangeMapping = instrumentService.deleteExchangeMapping;

        it('exist', () => {
            return chai.expect(deleteExchangeMapping).to.be.not.undefined;
        });

        it('reject if at least one argument is missing or invalid', () => {
            return Promise.all(_.map([
                [null],
                [1, []],
                [{}],
                ['aaa', 1]
            ], params => {
                chai.assert.isRejected(deleteExchangeMapping(...params));
            }));
        });

        it('return null if it does not find the mapping', () => {
            return deleteExchangeMapping(0, 0).then(mapping => {

                chai.expect(mapping).to.be.null;

            });
        });

        it('call destroy() if it finds the mapping', () => {

            const { instrument_id, exchange_id } = MOCK_MAPPINGS[0];

            return deleteExchangeMapping(instrument_id, exchange_id).then(mapping => {

                chai.expect(mapping).to.be.an('object');
                chai.expect(mapping.destroy.calledOnce).to.be.true;

            });

        });

    });

    describe('method getInstrumentIdentifiersFromCCXT shall', () => {
        let ID = 2;
        beforeEach(() => {
            sinon.stub(Exchange, "findAll").callsFake(query => {
                let exchanges = _.times(
                    _.isEmpty(query) ? 5 : 1
                ).map(e => {
                    return new Exchange({
                        id: query.where.id,
                        api_id: "some_id"
                    });
                })
    
                return Promise.resolve(exchanges);
            })

            sinon.stub(ccxtUtils, 'getConnector').callsFake((id) => {
                let con =  {
                    markets: {
                        "XRP/BTC": {},
                        "LTC/BTC": {},
                        "EOS/BTC": {}
                    }
                }
                return con;
            });
        });
        
        afterEach(() => {
            Exchange.findAll.restore();
            ccxtUtils.getConnector.restore();
        });

        it('exist', () => {
            chai.expect(instrumentService.getInstrumentIdentifiersFromCCXT).to.exist;
        });

        it('shall get exchange by id', () => {
            return instrumentService.getInstrumentIdentifiersFromCCXT(ID).then(async (data) => {
                let exhangeFindAllResult = await Exchange.findAll.returnValues[0];
                chai.assert.isTrue(exhangeFindAllResult.length == 1);
            });
        });

        it('shall filter out identifiers if a query is provided', () => {
            return instrumentService.getInstrumentIdentifiersFromCCXT(ID, 'x').then(identifiers => {

                chai.expect(identifiers.length).to.equal(1);
                chai.expect(identifiers[0]).to.equal('XRP/BTC');

            });
        });
    });
});