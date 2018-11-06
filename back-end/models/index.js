'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(__filename);
var db        = {};

//if cucumber we use different DB URL
const db_url = process.env.NODE_ENV === 'cucumber' ? process.env.DATABASE_URL_CUCUMBER : process.env.DATABASE_URL;

const sequelize = new Sequelize(db_url, {
  dialect: CONFIG.db_dialect,
  //if cucumber we use different ssl config
  dialectOptions: {
    ssl: ((process.env.NODE_ENV === 'cucumber' ? process.env.DB_USE_SSL_CUCUMBER : process.env.DB_USE_SSL) || 'false') == 'true'
  },
  //if cucumber we use different pool settings for weaker DB
  pool: (process.env.NODE_ENV === 'cucumber' ? {
    max: 17,
    min: 6,
    idle: 25000,
    acquire: 25000,
    evict: 60000,
    handleDisconnects: true
  } : {}),
  operatorsAliases: false,
  //only log sql queries on TRACE logging
  logging: console.trace
});

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    console.log('Importing model file: %s', file);
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.url = db_url;
module.exports = db;
