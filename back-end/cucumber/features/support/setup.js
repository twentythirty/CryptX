const { BeforeAll, AfterAll } = require('cucumber');
const app = require('../../../app');

const { setWorldConstructor } = require('cucumber');

function CustomWorld() {
    this.worldLog = function(message) {    //Just an expiremntal exmaple
        console.log(`\x1b[5m\x1b[42m[WORLD]\x1b[0m: ${message}`);
    }

    this.app = app;
}

BeforeAll(function(){

    return app.dbPromise.then(() => {
        setWorldConstructor(CustomWorld);
        console.log('THIS IS ALL HAPPENING BEFORE@');
    });
    
});

AfterAll(function() {
    console.log('IT IS DONE!');
});