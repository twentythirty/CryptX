require('./config/config'); //instantiate configuration variables
require('./config/model_constants'); //instantiate model constants
require('./config/workflow_constants'); //instantiate workflow constants
require('./global_functions'); //instantiate global functions
require("./config/system_permissions"); //instantiate global permissions lists

console.log("App Environment:", CONFIG.app)
console.log("Resolved NODE_ENV: ", process.env.NODE_ENV)

const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');


//DATABASE
const models = require("./models");
//sync migrations
require('./migrator');
let dbPromise = models.sequelize.authenticate().then(() => {
    console.log('Connected to SQL database: %s', models.url);
    console.log('Performing startup migration...');
    return migratorPerform();
}, err => {
    console.error('Unable prepare RDBMS for app: %s, %o', models.url, err);
    process.exit(2);
}).then((migrations) => {
    let syncPermissions = require('./config/sync_permissions');
    return syncPermissions();
}, err => {
    console.error('Unable prepare RDBMS for app: %s, %o', models.url, err);
    process.exit(2);
}).then(done_perm => {
    let settingsService = require('./services/SettingService');
    return settingsService.refreshSettingValues();
}).catch(err => {
    console.error('Unable prepare RDBMS for app:', models.url, err);
    process.exit(2);
});


const v1 = require('./routes/v1');

const app = express();

logger.token('date', function () {
    return new Date().toString()
})

app.use(logger(CONFIG.logger_format));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

//Passport
app.use(passport.initialize());

app.use(async (req, res, next) => { 
    await dbPromise; // postpone requests until promise is resolved

    next();
});

// CORS
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization, Content-Type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

app.use('/v1', v1);

app.use('/', function (req, res) {
    res.statusCode = 200; //send the appropriate status code
    res.json({
        status: "success",
        message: CONFIG.disclaimer,
        data: {}
    })
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
module.exports.dbPromise = dbPromise;