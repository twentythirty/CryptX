'use strict';

module.exports = (sequelize, DataTypes) => {
    var BuildResults = sequelize.define(
        'BuildResults', {
            status: {
                type: DataTypes.SMALLINT,
                allowNull: false
            },
            recorded_at: {
                type: DataTypes.DATE,
                allowNull: false
            },
            passed: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            failed: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            }
        },
        modelProps(
            'build_results',
            'This table describes the finished state of a specific build'
        )
    );

    return BuildResults;
};