"use strict";

let app = require("../../app");
let chai = require("chai");
let should = chai.should();
const sinon = require("sinon");
const path = require("path");

describe("AuthService mocking", () => {
  const AuthService = require("../../services/AuthService");
  const User = require("../../models").User;
  const UserSession = require("../../models").UserSession;

  beforeEach(function() {
    //configure user model stubs
    sinon.stub(User, "findOne").callsFake(options => {
      var user = new User({
        id: 57,
        first_name: "",
        last_name: "",
        email: options.where.email
      });
      sinon.stub(user, "comparePassword").returns(Promise.resolve(user));
      sinon.stub(user, "getJWT").returns("Bearer test-jwt");

      return Promise.resolve(user);
    });
    sinon.stub(UserSession, "create").callsFake(options => {
      return Promise.resolve(
        new UserSession({
          user_id: options.user_id,
          token: options.token,
          expiry_timestamp: options.expiry_timestamp,
          ip_address: options.ip_address
        })
      );
    });
  });
  afterEach(function() {
    //restore user model
    User.findOne.restore();
    UserSession.create.restore();
  });

  it("the service shall exist", function() {
    chai.expect(AuthService).to.exist;
  });

  describe("and the method authUser shall ", function() {
    it("exist", function() {
      chai.expect(AuthService.authUser).to.exist;
    });

    let EMAIL = "test@mock.io";
    let PASSWORD = "test";
    let IP = "0.0.0.0";

    it("call required DB model during authentication", function() {
      return AuthService.authUser(
        {
          username: EMAIL,
          password: PASSWORD
        },
        IP
      ).then(function(userSession) {
        //test what function returns
        chai.expect(userSession).to.be.a("array");
        chai.expect(userSession.length).to.eq(2);
        let [user, session] = userSession;

        //that User was searched by this email
        chai.expect(User.findOne.calledWith({ where: { email: EMAIL } }));
        //checked these credentials
        chai.expect(user.comparePassword.calledWith(PASSWORD));
        //created session out of him and with provided IP and future date
        chai.expect(UserSession.create.called);
        chai.expect(session.expiry_timestamp).to.be.greaterThan(new Date());
        chai.expect(session.ip_address).to.be.eq(IP);
        chai.expect(session.user_id).to.be.eq(57);
      });
    });
  });
});
