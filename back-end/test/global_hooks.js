const sinon = require('sinon');

const ActionLogUtil = require('../utils/ActionLogUtil');

before(done => {
    sinon.stub(ActionLogUtil, 'log').callsFake((details, options) => {
        let level = options.log_level;
        switch(level) {
            case LOG_LEVELS.Debug:
                level = '\x1b[1m\x1b[34m(Debug)\x1b[0m';
                break;
            case LOG_LEVELS.Warning:
                level = '\x1b[1m\x1b[33m(Warning)\x1b[0m';
                break;
            case LOG_LEVELS.Error:
                level = '\x1b[1m\x1b[31m(Error)\x1b[0m';
                break;
            default:
                level = '\x1b[1m\x1b[32m(Info)\x1b[0m';
                break;
        }
        return Promise.resolve(console.log(`\t  \x1b[1m\x1b[31m[>_]\x1b[0m${level}: ${details}`));
    });
    done();
});

after(done => {
    ActionLogUtil.log.restore();
    done();
});