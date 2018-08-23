const sinon = require('sinon');

const ActionLogUtil = require('../utils/ActionLogUtil');
const InvestmentService = require('../services/InvestmentService');
const InvestmentRun = require('../models').InvestmentRun;

beforeEach(done => {
    sinon.stub(ActionLogUtil, 'log').callsFake((details, key, options) => {
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

    sinon.stub(InvestmentService, 'changeInvestmentRunStatus').callsFake((id, status) => {
        let investment_run = new InvestmentRun({
            id: id,
            strategy_type: 101,
            is_simulated: true,
            user_created_id: 1,
            started_timestamp: new Date,
            updated_timestamp: new Date,
            status: status
        });

        return Promise.resolve(investment_run);
    });
    done();
});

afterEach(done => {
    ActionLogUtil.log.restore();
    if(InvestmentService.changeInvestmentRunStatus.restore)
        InvestmentService.changeInvestmentRunStatus.restore();
    done();
});