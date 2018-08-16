'use strict';

const ColdStorageCustodian = require('../models').ColdStorageCustodian;
const ColdStorageAccount = require('../models').ColdStorageAccount;

const Asset = require('../models').Asset;

const { fn: seq_fn, where: seq_where, col: seq_col } = require('../models').sequelize; 

const { logAction } = require('../utils/ActionLogUtil');

const non_crypto_assets = ['USD'];

const createCustodian = async (name) => {
    
    if(!_.isString(name) || _.isEmpty(name)) {
        TE(`Custodian name must bit a valid, non-empty string`);
    }
    
    let [ err, existing_custodian ] = await to(ColdStorageCustodian.count({
        where: seq_where(seq_fn('lower', seq_col('name')), seq_fn('lower', name))
    }));

    if(err) TE(err.message);
    if(existing_custodian) TE(`Custodian with the name "${name}" already exists`);

    let custodian = null;
    [ err, custodian ] = await to(ColdStorageCustodian.create({ name }));

    if(err) TE(err.message);

    return custodian;
};
module.exports.createCustodian = createCustodian;

const createColdStorageAccount = async (strategy_type, asset_id, cold_storage_custodian_id, address, tag = null) => {
    
    if(
        !_.isNumber(strategy_type) ||
        !_.isNumber(asset_id) || 
        !_.isNumber(cold_storage_custodian_id) ||
        !_.isString(address) ||
        (!_.isEmpty(tag) && !_.isString(tag))
    ) TE(`Type, asset id, custodian id or account address is not valid or not provided`);

    if(!Object.values(STRATEGY_TYPES).includes(strategy_type)) TE(`Strategy type "${strategy_type}" is not valid`);

    let [ err, result ] = await to(Promise.all([
        Asset.findById(asset_id),
        ColdStorageCustodian.findById(cold_storage_custodian_id)
    ]));

    if(err) TE(err.message);

    const [ found_asset, found_custodian ] = result;

    if(!found_asset) TE(`Asset with id ${asset_id} was not found`);
    if(non_crypto_assets.includes(found_asset.symbol)) TE(`Asset "${found_asset.symbol}" is not a cryptocurrency`);
    
    if(!found_custodian) TE(`Custodian with id ${cold_storage_custodian_id} was not found`);

    let account = null;
    [ err, account ] = await to(ColdStorageAccount.create({
        strategy_type,
        asset_id,
        cold_storage_custodian_id,
        address,
        tag
    }));

    if(err) TE(err.message);

    return account;

};
module.exports.createColdStorageAccount = createColdStorageAccount;