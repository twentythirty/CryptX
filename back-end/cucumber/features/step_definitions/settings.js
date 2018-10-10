const {
    Given,
    When,
    Then
} = require('cucumber');
const chai = require('chai');
const {
    expect
} = chai;

const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const World = require('../support/global_world');

Given(/^the setting "(.*)" is set to (\d*)$/, function(setting, value) {


    const settigs_map = {
        'base trade fuzzyness': 'TRADE_BASE_FUZYNESS'
    };

    const settings_field = settigs_map[setting];

    expect(settings_field, `There is no mapping for setting "${setting}"`).to.be.not.undefined;
    expect(SYSTEM_SETTINGS[settings_field], `Settings field "${settings_field}" does not exist`).to.be.not.undefined;

    if(!isNaN(value)) value = parseFloat(value);
    
    if(_.isEmpty(World._defaultSettings)) World._default_settings = _.clone(SYSTEM_SETTINGS);
    SYSTEM_SETTINGS[settings_field] = value;

});