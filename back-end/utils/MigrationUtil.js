'use strict';


/**
 * Recursively remove supplied columns for the given table using the queryInterface
 * @param queryInterface 
 * @param table_name
 * @param cols 
 */
const remove_cols_recur = (queryInterface, table_name, cols) => {
    //guard against empty collection
    if (!cols || cols.length == 0) {
        return null;
    }

    //process first col in collection
    return queryInterface.removeColumn(table_name, _.head(cols)).then(done => {
        //recur on remaining cols in the async
        if (_.tail(cols).length == 0) {
            return done;
        } else {
            return remove_cols_recur(queryInterface, _.tail(cols));
        }
    });
};
module.exports.remove_cols_recur = remove_cols_recur;

/**
 * Create configured migration file object for a specific set of settings keys and types
 * keys correspond to those in the DEFAULT_SETTINGS object
 * 
 * migration configures itself to only insert missing settings by first checking existing ones.
 * @param  settings_keys 
 * @param  settings_types 
 */
const migration_for_settings = (settings_keys, settings_types) => {

    //transform settings to array of forms [[key,val,type], ...]
    const settings_triples = _.zipWith(
        _.toPairs(_.pick(DEFAULT_SETTINGS, settings_keys)),
        settings_types,
        (settings_pair, type) => {
            return [
                settings_pair[0],
                settings_pair[1],
                type
            ]
        }
    );
    //use existing settings to check for duplicates and not insert them (otherwise PG throws error)
    const Setting = require('../models').Setting;
    return {
        up: (queryInterface, Sequelize) => {
            return Setting.findAll().then(settings => {
                const active_keys = _.map(settings, 'key');
                return _.filter(settings_triples, triplet => !active_keys.includes(triplet[0]))
            }).then(new_triples => {
                if (new_triples.length == 0) {
                    return []
                } else {
                    return queryInterface.bulkInsert('setting', _.map(new_triples, triplet => {
                        return {
                            key: triplet[0],
                            value: triplet[1],
                            type: triplet[2]
                        }
                    }))
                }
            })
        },
        down: (queryInterface, Sequelize) => {
            return queryInterface.bulkDelete('setting', {
                where: {
                    key: settings_keys
                }
            })
        }
    }
};
module.exports.migration_for_settings = migration_for_settings;