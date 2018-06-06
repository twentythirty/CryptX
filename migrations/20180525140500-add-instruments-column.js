'use strict';

const sequelize = require('../models').sequelize;
const Asset = require('../models').Asset;

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('instrument', 'symbol', {
            type: Sequelize.STRING
        }).then(done => {
            //add symbols to existing instrument rows
            //by all instruments (done in generic SELECT because model props changes since then)
            return sequelize.query(`SELECT * FROM instrument`, {
                type: sequelize.QueryTypes.SELECT
            })
        }).then(instruments => {
            //...finding the relevant assets...
            return Promise.all([
                Promise.resolve(instruments),
                Asset.findAll({
                    where: {
                        //joined list of base and target asset ids, to fetch all relevant ones
                        id: (_.map(instruments, 'base_asset_id').concat(_.map(instruments, 'target_asset_id')))
                    }
                })
            ])
        }).then(data => {
            //...putting symbols together with instruments
            const [instruments, assets] = data;
            const assets_map = _.keyBy(assets, 'id');

            const symbol_updates = _.map(instruments, instrument => {

                const base_asset = assets_map[instrument.base_asset_id];
                const target_asset = assets_map[instrument.target_asset_id];
                const symbol = `${base_asset.symbol}/${target_asset.symbol}`;

                return {id: instrument.id, symbol: symbol};
            })

            return Promise.all(_.map(symbol_updates, symbol_update => {
                //bulkUpdate doesnt support updating many values for many rows, but we cant use the model, so do this inefficiently
                return queryInterface.bulkUpdate('instrument', { symbol: symbol_update.symbol }, { id: symbol_update.id });
            }));
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('instrument', 'symbol');
    }
};