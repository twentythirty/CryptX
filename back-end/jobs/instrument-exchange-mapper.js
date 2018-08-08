"use strict";

const ccxtUtils = require('../utils/CCXTUtils');

module.exports.SCHEDULE = -1;
module.exports.NAME = "IE_MAP";
module.exports.JOB_BODY = async (config, log) => {

    const models = config.models;
    const Instrument = models.Instrument;
    const InstrumentExchangeMapping = models.InstrumentExchangeMapping;
    const sequelize = models.sequelize;
    const Op = models.Sequelize.Op;

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

        return Promise.all([bare_instruments_promise, all_connectors_promise])
    }).then(instruments_connectors => {

        const [instruments, connectors] = instruments_connectors;

        console.log(`Trying to map ${instruments.length} instruments against ${Object.keys(connectors).length} connectors...`)

        let new_mappings = [];

        _.forEach(instruments, instrument => {

            _.forEach(connectors, (connector, exchange_id) => {
                
                const market = connector.markets[instrument.symbol];

                if (market != null && market.active) {

                    new_mappings.push({
                        external_instrument_id: market.symbol,
                        tick_size: market.limits.amount.min || 0,
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