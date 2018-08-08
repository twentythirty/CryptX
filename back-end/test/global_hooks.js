const sinon = require('sinon');

const ActionLogUtil = require('../utils/ActionLogUtil');

before(done => {
    sinon.stub(ActionLogUtil, 'log').callsFake(details => {
        return Promise.resolve(console.log(`LOGGER OUTPUT: ${details}`));
    });
    done();
});

after(done => {
    ActionLogUtil.log.restore();
    done();
});