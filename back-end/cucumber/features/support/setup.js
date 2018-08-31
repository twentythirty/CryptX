const { BeforeAll, AfterAll } = require('cucumber');
const app = require('../../../app');

const { setWorldConstructor } = require('cucumber');
function CustomWorld() {
    this.worldLog = function(message) {    //Just an expiremntal exmaple
        console.log(`\x1b[5m\x1b[42m[WORLD]\x1b[0m: ${message}`);
    }

    this.app = app;

    this.defaultCredentials = {
        username: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PWD
    }
}

BeforeAll(function(){

    return app.dbPromise.then(() => {
        setWorldConstructor(CustomWorld);
    });
    
});

AfterAll(function() {
    console.log('We should end it on a high note!');
});