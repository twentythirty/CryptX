"use strict";

const ccxtUtils = require('../utils/CCXTUtils');

module.exports.SCHEDULE = -1;
module.exports.NAME = "IE_MAP";
module.exports.JOB_BODY = async (config, log) => {

    const models = config.models;
    const Instrument = models.Instrument;
    const InstrumentExchangeMapping = models.InstrumentExchangeMapping;
    const sequelize = models.sequelize;
    const Sequelize = models.Sequelize;
    const Op = Sequelize.Op;

    return sequelize.query(`SELECT DISTINCT instrument_id from instrument_exchange_mapping`, {
        type: sequelize.QueryTypes.SELECT
    }).then(instrument_ids => {

        const instrument_ids_flat = _.map(instrument_ids, 'instrument_id')

        console.log(`Ignoring ${instrument_ids.length} instruments ids since they are already mapped...`)

        //fetch instruments without exisitng mappings
        const bare_instruments_promise = Instrument.findAll({
            where: {
                id: {
                    [Op.notIn]: instrument_ids_flat
                }
            }
        });
        const all_connectors_promise = ccxtUtils.allConnectors();

        const connectors_filter_promise = sequelize.query(`SELECT DISTINCT exchange_id FROM exchange_account`, {
            type: sequelize.QueryTypes.SELECT
        }).then(exchange_ids => {
            return _.map(exchange_ids, 'exchange_id')
        });

        return Promise.all([
            bare_instruments_promise, 
            connectors_filter_promise,
            all_connectors_promise
        ])
    }).then(instruments_connectors => {

        const [instruments, filter, all_connectors] = instruments_connectors;

        console.log(`Trying to map ${instruments.length} instruments against ${Object.keys(all_connectors).length} connectors...`)
        console.log(`filter: ${JSON.stringify(filter)}`)
        const remaining_connectors = _.pickBy(all_connectors, (connector, exchange_id) => filter.includes(parseInt(exchange_id)));
        console.log(`Reducing connectors to ${Object.keys(remaining_connectors).length} due to lack of exchange accounts...`)

        let new_mappings = [];

        _.forEach(instruments, instrument => {

            _.forEach(remaining_connectors, (connector, exchange_id) => {
                
                const market = connector.markets[instrument.symbol];

                if (market != null && market.active) {

                    new_mappings.push({
                        external_instrument_id: market.symbol,
                        tick_size: Decimal(1).div(Decimal(10).pow(market.precision.amount || 0)).toString(),
                        instrument_id: instrument.id,
                        exchange_id: exchange_id
                    })

                    console.log(`Adding new mapping for ${instrument.symbol} on exchange ${connector.name}...`);
                } else {
                    console.log(`Skipping adding ${instrument.symbol} on exchange ${connector.name}, becuase no market/inactive!`);
                }
            })
        });
        console.log(`inserting ${new_mappings.length} new mappings...`)
        if (new_mappings.length > 0) {
            return InstrumentExchangeMapping.bulkCreate(new_mappings)
        } else {
            return Promise.resolve([])
        }
    });

};