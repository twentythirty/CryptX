'use strict';

const SettingService = require('../services/SettingService');

const changeSettingValue = async function (req, res) {

  let setting_id = req.params.setting_id,
    setting_value = req.body.setting_value;

  let [err, setting] = await to(SettingService.changeSettingValue(setting_id, setting_value));
  if (err) ReE(res, err.message, 422);

  return ReS(res, {
    setting
  });
};
module.exports.changeSettingValue = changeSettingValue;

const getAllSettings = async function (req, res) {

  let [err, settings] = await to(SettingService.getAllSettings());
  if (err) ReE(res, err.message, 422);

  return ReS(res, {
    settings
  });
};
module.exports.getAllSettings = getAllSettings;