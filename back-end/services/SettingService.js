'use strict';
const Setting = require('../models').Setting;

/** Changes value of specified setting.
 * 
 * @param {*} setting_id - integer, id of setting
 * @param {*} setting_value - string/float/int
 */
const changeSettingValue = async function (setting_id, setting_value) {

    let [err, setting] = await to(Setting.findById(setting_id));
    if (err) TE(err.message);
    if (!setting) TE("Couldn't find setting");

    setting.value = setting_value;
    [err, setting] = await to(setting.save());

    refreshSettingValues();

    return setting;
}
module.exports.changeSettingValue = changeSettingValue;

const getAllSettings = async function () {

    let [err, settings] = await to(Setting.findAll({
        where: {
            key: Object.keys(DEFAULT_SETTINGS)
        }
    }));
    if (err) TE(err.message);

    return settings;
};
module.exports.getAllSettings = getAllSettings;

/** Is used to parse values depending on what their data type is defined by constant
 * in SETTING_DATA_TYPES variable
 */
const parseValue = function (value, type) {
    let parsedValue;
    switch (type) {
        case SETTING_DATA_TYPES.Integer:
            parsedValue = parseInt(value, 10);
            break;
        case SETTING_DATA_TYPES.Float:
            parsedValue = parseFloat(value);
            break;
        case SETTING_DATA_TYPES.String:
            parsedValue = value;
            break;
        case SETTING_DATA_TYPES.Boolean:
            if (String(a) == "true")
                parsedValue = true;
            else
                parsedValue = false;
            break;
        default:
            parsedValue = value;
    }

    return parsedValue;
};

/** Takes values from DB table Setting and defines them in global SYSTEM_SETTING variable.
 *  This function should be called after editing values of system settings.
 */
const refreshSettingValues = async () => {
    let settings = await getAllSettings();
    //try parse settings from DB, use default object to check all settings are present
    if (settings.length) {
        const mapped_settings = _.keyBy(settings, 'key');
        _.forEach(DEFAULT_SETTINGS, (value, key) => {
            const setting = mapped_settings[key];
            try {
                if (setting == null) {
                    TE(`No setting found for key ${key}!`)
                }
                SYSTEM_SETTINGS[setting.key] = parseValue(setting.value, setting.type);
            } catch (err) {
                console.error(`Error parsing DB setting at ${key} (if missing try adding ${key}=${value}): ${err}. ...`)
                TE(err)
            }

        });
    } else {
        TE("Couldn't get settings values");
    }
};
module.exports.refreshSettingValues = refreshSettingValues;