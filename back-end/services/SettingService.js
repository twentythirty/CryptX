'use strict';

const Setting = require('../models').Setting;
const workflowConstants = require('../config/workflow_constants');

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

  workflowConstants.refreshSettingValues();

  return setting;
}
module.exports.changeSettingValue = changeSettingValue;

const getAllSettings = async function () {

  let [err, settings] = await to(Setting.findAll());
  if (err) TE(err.message);

  return settings;
};
module.exports.getAllSettings = getAllSettings;
