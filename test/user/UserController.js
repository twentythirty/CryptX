let app = require('../../app');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();

chai.use(chaiHttp);


let User = require("../../models").User

xdescribe('Users', () => {
   
    before((done) => {
       
    });

    describe('GET /users', () => {

        var validJWT = '';

        beforeEach((done) => {
            //get a user and save their token
            User.findOne().then( (user) => {

                validJWT = user.getJWT();
                console.log(validJWT);
                done();
            })
        });

        it('should fetch the authorized user on GET /users', (done) => {
    
            chai.request(app)
                .get('/v1/users')
                .set('Authorization', validJWT)
                .end((err, res) => {
                    console.log(res.body);
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('user');
                    res.body.user.should.be.a('object')
                    res.body.user.should.have.property('first');
                    res.body.user.should.have.property('last');
                    res.body.user.should.have.property('email');
                    res.body.user.should.have.property('phone');
                    res.body.user.should.not.have.property('password');
                    done();
                });
            
        });
    });
});




