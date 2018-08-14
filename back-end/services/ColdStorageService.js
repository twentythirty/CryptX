'use strict';

const ColdStorageCustodian = require('../models').ColdStorageCustodian;
const { fn: seq_fn, where: seq_where, col: seq_col } = require('../models').sequelize; 

const { logAction } = require('../utils/ActionLogUtil');

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