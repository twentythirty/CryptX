'use strict';

const Asset = require('../models').Asset;
const Exchange = require('../models').Exchange;
const ExchangeAccount = require('../models').ExchangeAccount;

const createExchangeAccount = async (account_type, asset_id, exchange_id, address) => {
    if (
        !account_type ||
        !asset_id ||
        !exchange_id ||
        !address
    ) TE('Creating an exchange account requires to specify an account type, asset id, exchange id and wallet address');

    const account_types = Object.values(MODEL_CONST.EXCHANGE_ACCOUNT_TYPES);

    if (!account_types.includes(account_type)) TE(`Invalid account type`);
    
    let [err, result] = await to(Promise.all([
        Asset.count({
            where: { id: asset_id }
        }),
        Exchange.count({
            where: { id: exchange_id }
        }),
        ExchangeAccount.count({
            where: {
                account_type, 
                asset_id, 
                exchange_id, 
                address
            }
        })
    ]));

    if (err) TE(err.message);

    const [ found_asset, found_exchange, found_account ] = result;

    if (!found_asset) TE(`Asset not found with id ${asset_id}`);
    if (!found_exchange) TE(`Exchange not found with id ${exchange_id}`);
    if (found_account) TE(`Exchange account already exists with the specified parameters`);

    return ExchangeAccount.create({
        account_type,
        asset_id,
        exchange_id,
        address
    });

};
module.exports.createExchangeAccount = createExchangeAccount;