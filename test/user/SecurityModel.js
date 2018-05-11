"use strict";

let app = require("../../app");
let chai = require("chai");
let chaiHttp = require("chai-http");
const sinon = require("sinon");
let should = chai.should();

chai.use(chaiHttp);


let UserSession = require("../../models").UserSession;
let User = require("../../models").User;

describe("Path Security Model ", () => {
  before(done => {

    app.dbPromise.then(migrations => {
      console.log(migrations);
      done();
    })

  });

  it("shall reject secured path requests without Authentication header", (done) => {
    chai
      .request(app)
      .get("/v1/users/me")
      .end((err, res) => {
        chai.expect(res).to.have.status(401);
        done();
      });
  });
  
  it("shall not allow user with few permissions", (done) => {
  chai
    .request(app)
    .get("/v1/users/44")
    .set("Authorization", user.getJWT())
    .end((err, res) => {
      //request was rejected
      chai.expect(res).to.have.status(403);
      //user roles were checked
      chai.expect(user.getRoles.called).to.be.true;

      done();
    });
  }); 
});