require('./config');     //instantiate configuration variables
require('./model_constants'); //instantiate model constants
require('./workflow_constants'); //instantiate workflow constants
require('./../global_functions'); //global functions for model defs
require("./system_permissions"); //instantiate global permissions lists

//DATABASE
const models = require("./../models");
//sync migrations
require('./../migrator');
let dbPromise = models.sequelize.authenticate().then(() => {
    console.log('Connected to SQL database:', process.env.DATABASE_URL);
    console.log('Performing startup migration...');
    return migratorPerform();
}).then((migrations) => {
    let settingsService = require('../services/SettingService');
    return settingsService.refreshSettingValues();
}).catch(err => {
        console.error('Unable prepare RDBMS for app:', process.env.DATABASE_URL, err);
        process.exit(2);
});

module.exports = {
    models: models,
    dbPromise: dbPromise
}