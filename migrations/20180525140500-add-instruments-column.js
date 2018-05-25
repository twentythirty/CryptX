'use strict';

const Instrument = require('../models').Instrument;
const Asset = require('../models').Asset;

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('instrument', 'symbol', {
            type: Sequelize.STRING
        }).then(done => {
            //add symbols to existing instrument rows
            //by fetching them all...
            return Instrument.findAll()
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

            return Promise.all(_.map(instruments, instrument => {

                const base_asset = assets_map[instrument.base_asset_id];
                const target_asset = assets_map[instrument.target_asset_id];
                instrument.symbol = `${base_asset.symbol}/${target_asset.symbol}`;

                return instrument.save();
            }));
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('instrument', 'symbol');
    }
};