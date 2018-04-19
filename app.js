require('./config/config');     //instantiate configuration variables
require('./global_functions');  //instantiate global functions

console.log("App Environment:", CONFIG.app)
console.log("Resolved NODE_ENV: ", process.env.NODE_ENV)

const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');

const v1 = require('./routes/v1');

const app = express();

app.use(logger(CONFIG.logger_format));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

//Passport
app.use(passport.initialize());

//DATABASE
const models = require("./models");
models.sequelize.authenticate().then(() => {
    console.log('Connected to SQL database:', process.env.DATABASE_URL);
})
    .catch(err => {
        console.error('Unable to connect to SQL database:', process.env.DATABASE_URL, err);
    });
if (CONFIG.app === 'dev') {
    models.sequelize.sync();//creates table if they do not already exist
}
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
    res.statusCode = 200;//send the appropriate status code
    res.json({ status: "success", message: CONFIG.disclaimer, data: {} })
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