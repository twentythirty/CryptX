'use strict';

module.exports = (sequelize, DataTypes) => {

    var InstrumentStatusChange = sequelize.define(
        'InstrumentStatusChange', {
            timestamp: DataTypes.DATE,
            comment: {
                type: DataTypes.TEXT('medium'),
                allowNull: true
            },
            type: DataTypes.SMALLINT
        },
        modelProps(
            'instrument_status_change',
            'This table describes changes that ocurred to instrument availability'
        )
    );

    InstrumentStatusChange.associate = function(models) {

        InstrumentStatusChange.belongsTo(models.Instrument);
        InstrumentStatusChange.belongsTo(models.User);
    };

    return InstrumentStatusChange;
};