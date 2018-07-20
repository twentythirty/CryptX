'use strict';

const Instrument = require('../models').Instrument;
const Asset = require('../models').Asset;



const createInstrument = async (transaction_asset_id, quote_asset_id) => {

    if (transaction_asset_id == null || quote_asset_id == null ) {
        TE(`Provided null transaction or quote asset ids!`);
    }
    
    const instrument_assets = await Asset.findAll({
        where: {
            id: [transaction_asset_id, quote_asset_id]
        }
    });
    //check that both assets exist
    if (instrument_assets.length < 2) {
        TE(`Suppleid asset ids ${transaction_asset_id} and ${quote_asset_id} dont all correspond to actual assets!`);
    }
    const assets_by_id = _.keyBy(instrument_assets, 'id');
    //check that an instrument with the same assets doesnt already exist
    const old_instrument = await Instrument.findOne({
        where: {
            transaction_asset_id: transaction_asset_id,
            quote_asset_id: quote_asset_id
        }
    });
    if (old_instrument != null) {
        TE(`Instrument ${old_instrument.symbol} already exists!!`);
    }

    const instrument_symbol = `${assets_by_id[transaction_asset_id].symbol}/${assets_by_id[quote_asset_id].symbol}`;

    const [err, instrument] = await to(Instrument.create({
        transaction_asset_id: transaction_asset_id,
        quote_asset_id: quote_asset_id,
        symbol: instrument_symbol
    }));

    if (err != null) {
        TE(`error occurred creating instrument ${instrument_symbol}!: ${err}`)
    }

    return instrument;    
};
module.exports.createInstrument = createInstrument;


