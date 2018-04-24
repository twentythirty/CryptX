let app = require('../app');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();

chai.use(chaiHttp);

describe('General', () => {

    it('should deliver a general Disclaimer to unauthorized requests', () => {

        chai.request(app)
        .get('/users')
        .end((err, result) => {
            
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('status');
            res.body.status.should.equal('success');
            res.body.should.have.property('message');
            res.body.message.should.equal(CONFIG.disclaimer);

        });

    });

})