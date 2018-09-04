require('./global_functions'); //instantiate global functions
require('./config/config'); //instantiate configuration variables
require('./config/model_constants'); //instantiate model constants
require('./config/system_permissions') //load permissions
require('./config/workflow_constants') //load more constants
//DATABASE
const models = require("./models");
const path = require('path');

var Umzug = require('umzug');
var umzug = new Umzug({
    storage: 'sequelize',
    storageOptions: {
        sequelize: models.sequelize
    },
    migrations: {
        params: [
            models.sequelize.getQueryInterface(), // queryInterface
            models.sequelize.constructor, // DataTypes
            function () {
                throw new Error('Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.');
            }
        ],
        // The path to the migrations directory.
        path: 'back-end/migrations',
        // The pattern that determines whether or not a file is a migration.
        pattern: /^\d+[\w-]+\.js$/
    }
});

function cmdStatus() {
    let result = {};

    return umzug.executed()
        .then(executed => {
            result.executed = executed;
            return umzug.pending();
        }).then(pending => {
            result.pending = pending;
            return result;
        }).then(({ executed, pending }) => {

            executed = executed.map(m => {
                m.name = path.basename(m.file, '.js');
                return m;
            });
            pending = pending.map(m => {
                m.name = path.basename(m.file, '.js');
                return m;
            });

            const current = executed.length > 0 ? executed[0].file : '<NO_MIGRATIONS>';
            const status = {
                current: current,
                executed: executed.map(m => m.file),
                pending: pending.map(m => m.file),
            }

            console.log(JSON.stringify(status, null, 2))

            return { executed, pending };
        })
}

function cmdMigrate() {
    return umzug.up();
}

function cmdMigrateNext() {
    return cmdStatus()
        .then(({ executed, pending }) => {
            if (pending.length === 0) {
                return Promise.reject(new Error('No pending migrations'));
            }
            const next = pending[0].name;
            return umzug.up({ to: next });
        })
}

function cmdReset() {
    return umzug.down({ to: 0 });
}

function cmdResetPrev() {
    return cmdStatus()
        .then(({ executed, pending }) => {
            if (executed.length === 0) {
                return Promise.reject(new Error('Already at initial state'));
            }
            const prev = executed[executed.length - 1].name;
            return umzug.down({ to: prev });
        })
}


let runningMigrator = process.argv[1].split(/\//).pop() === 'migrator.js';

if (runningMigrator) {

    if (process.argv.length < 3) {

        console.log("Usage: migrator.js <cmd> (cmd: status|up|migrate|down|reset|next|prev)")
        process.exit(1);
    }

    const cmd = process.argv[2].trim();
    let executedCmd;

    console.log(`${cmd.toUpperCase()} BEGIN`);
    switch (cmd) {
        case 'status':
            executedCmd = cmdStatus();
            break;

        case 'up':
        case 'migrate':
            executedCmd = cmdMigrate();
            break;

        case 'next':
        case 'migrate-next':
            executedCmd = cmdMigrateNext();
            break;

        case 'down':
        case 'reset':
            executedCmd = cmdReset();
            break;

        case 'prev':
        case 'reset-prev':
            executedCmd = cmdResetPrev();
            break;

        default:
            console.log(`invalid cmd: ${cmd}`);
            process.exit(1);
    }

    executedCmd
        .then((result) => {
            const doneStr = `${cmd.toUpperCase()} DONE`;
            console.log(doneStr);
            console.log("=".repeat(doneStr.length));
        })
        .catch(err => {
            const errorStr = `${cmd.toUpperCase()} ERROR`;
            console.log(errorStr);
            console.log("=".repeat(errorStr.length));
            console.log(err);
            console.log("=".repeat(errorStr.length));
        })
        .then(() => {
            if (cmd !== 'status' && cmd !== 'reset-hard') {
                // return cmdStatus()
            }
            return Promise.resolve();
        })
        .then(() => process.exit(0))
}

migratorPerform = cmdMigrate;