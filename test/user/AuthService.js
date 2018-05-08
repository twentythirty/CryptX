"use strict";

let app = require("../../app");
let chai = require("chai");
let should = chai.should();
const sinon = require("sinon");
const path = require("path");
let utils = require('util');

describe("AuthService mocking", () => {

    before(done => {

        app.dbPromise.then(migrations => {
            console.log("Migraitions: %o", migrations);
            done();
        })

    });

  const AuthService = require("../../services/AuthService");
  const User = require("../../models").User;
  const UserSession = require("../../models").UserSession;

  let NEW_ROLES = ["1", "2"];
  let USER_ID = 23;
  let F_NAME = "Larry";
  let L_NAME = "Test";
  let EMAIL = "test@mock.io";
  let PASSWORD = "test";
  let IP = "0.0.0.0";

  beforeEach(function() {
    //configure user model stubs
    sinon.stub(User, "findOne").callsFake(options => {
      var user = new User({
        id: USER_ID,
        first_name: "",
        last_name: "",
        email: options.where.email
      });
      sinon.stub(user, "comparePassword").returns(Promise.resolve(user));
      sinon.stub(user, "getJWT").returns("Bearer test-jwt");

      return Promise.resolve(user);
    });
    sinon.stub(User, "findById").callsFake(id => {
      var user = new User({
        id: id,
        first_name: "",
        last_name: "",
        email: EMAIL,
        roles: []
      });

      sinon.stub(user, "comparePassword").returns(Promise.resolve(user));

      sinon.stub(user, "setRoles").callsFake(roles => {
        user.roles = roles;
      });
      sinon.stub(user, "getRoles").callsFake(roles => {
        return user.roles;
      });
      sinon.stub(user, "save").callsFake(() => {
        user.roles = NEW_ROLES;

        return Promise.resolve(user);
      });

      return Promise.resolve(user);
    });
    sinon.stub(UserSession, "create").callsFake(options => {
      return Promise.resolve(new UserSession(options));
    });
    sinon.stub(User, "create").callsFake(options => {
      return Promise.resolve(new User(options));
    });
  });
  afterEach(function() {
    //restore user model
    User.findOne.restore();
    User.findById.restore();
    UserSession.create.restore();
    User.create.restore();
  });

  it("the service shall exist", function() {
    chai.expect(AuthService).to.exist;
  });

  describe("and the method changeUserRoles shall", function() {
    it("exist", function() {
      chai.expect(AuthService.changeUserRoles).to.exist;
    });

    it("call required DB model during roles change", function() {
      return AuthService.changeUserRoles(USER_ID, NEW_ROLES).then(
        changedUser => {
          chai.expect(changedUser).to.be.a("object");
          let user = changedUser;

          //user was looked up via supplied id
          chai.expect(User.findById.calledWith(USER_ID));
          //user set their roles to DB
          chai.expect(user.setRoles.calledWith(NEW_ROLES));
          //user state was persisted in method
          chai.expect(user.save.called);
          //user has new roles in array
          chai.expect(user.getRoles()).to.eq(NEW_ROLES);
        }
      );
    });
  });

  describe("and the method authUser shall ", function() {
    it("exist", function() {
      chai.expect(AuthService.authUser).to.exist;
    });

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
        chai.assert.isTrue(User.findOne.calledWith({ where: { email: EMAIL } }));
        //checked these credentials
        chai.assert.isTrue(user.comparePassword.calledWith(PASSWORD));
        //created session out of him and with provided IP and future date
        chai.expect(UserSession.create.called);
        chai.expect(session.expiry_timestamp).to.be.greaterThan(new Date());
        chai.expect(session.ip_address).to.be.eq(IP);
        chai.expect(session.user_id).to.be.eq(USER_ID);
      });
    });
  });

  describe("and the method createUser shall ", function() {
    let CREATE_MODEL = {
      first_name: F_NAME,
      last_name: L_NAME,
      email: EMAIL,
      password: PASSWORD
    };

    it("exist", () => {
      chai.expect(AuthService.createUser).to.exist;
    });

    it("shall reject partial user data", () => {
      var spy = sinon.spy(AuthService, "createUser");

      let partials = [
        {},
        {
          first_name: F_NAME
        },
        {
          first_name: F_NAME,
          last_name: L_NAME
        },
        {
          email: EMAIL,
          password: PASSWORD
        }
      ];
      let local_model = Object.assign({}, CREATE_MODEL);
      let keys = Object.keys(local_model);
      let num_keys = keys.length;

      //add more partials objects (with 1 key missing)
      partials.concat(
        Array(num_keys)
          .fill(local_model)
          .map((model, idx) => {
            delete model[keys[idx]];
          })
      );

      //apply all partials to service spy
      partials.forEach(obj => AuthService.createUser(obj));
      //auth service rejected values
      chai.expect(AuthService.createUser.alwaysThrew("CryptXError"));
      AuthService.createUser.restore();
    });

    it("shall reject bad email usernames", () => {
      var spy = sinon.spy(AuthService, "createUser");

      let emails = ["", "a!", "peter", "@", ".@.", "a@", "@here", "maybe@this"];
      let local_model = Object.assign({}, CREATE_MODEL);
      
      return Promise.all(emails.map(email => {
        local_model.email = email;
        return AuthService.createUser(local_model) // attempting to create user
        .then(resolved => { // resolves if user email is valid
          return Promise.resolve([null, email])
        }).catch(rejected => { // rejects if user email is invalid
          return Promise.resolve([rejected, null])
        });
      })).then(results => {
        AuthService.createUser.restore();

        chai.expect(results).to.satisfy(results => { // checks if at least one valid email is in the list
          return results.every(pair => pair[1] == null)
        }, utils.format('%j', results));
      });
    });

    it("shall create a new user when all is good", () => {

        return AuthService.createUser(CREATE_MODEL).then((user) => {

            chai.expect(user).to.be.a('object');

            chai.expect(user).to.have.property('created_timestamp');
            chai.expect(user.is_active).eq(true);
            chai.expect(user).to.have.property('id');
            chai.expect(user.first_name).eq(F_NAME);
            chai.expect(user.last_name).eq(L_NAME);
            chai.expect(user.email).eq(EMAIL);
            chai.expect(user.password).eq(PASSWORD);
        });
    });
  });

  describe('and the method updatePassword shall ', function () {
    it("exist", function() {
      chai.expect(AuthService.updatePassword).to.exist;
    });

    it("shall call methods when changing password", function () {
      let new_password = "newpassword";

      return AuthService.updatePassword(USER_ID, PASSWORD, new_password)
      .then(result => {
        let user = result;
      
        // check if userFindById was called
        chai.assert.isTrue(User.findById.calledWith(USER_ID));
        // check if incorrect old password is rejected
        chai.assert.isTrue(user.comparePassword.calledWith(PASSWORD));
        // check if save was called
        chai.assert.isTrue(user.save.called);
      });
    });

    it("change password", function () {
      let new_password = "newpassword";

      return User.findById(USER_ID)
      .then(user => {
        chai.expect(user.password).to.be.not.equal(PASSWORD);

        return AuthService.updatePassword(USER_ID, PASSWORD, new_password)
      }).then(result => {
        let user = result;

        chai.expect(user.password).to.be.equal(new_password);
      });
    });
  });

  //expireOtherSessions
  // check if UserSession.findAll was called
  describe('and the method expireOtherSessions shall ', function () {
    it("shall exist", function () {
      chai.expect(AuthService.expireOtherSessions).to.exist;
    });

    it("shall expire users sessions", function () {

      let current_session = "This is a session",
        session_expiry_timestamp = new Date(new Date().getTime() + 1000 * process.env.JWT_EXPIRATION),
        user_sessions = [],
        tokens = ["token1", "token2", "token3", "token4"];

      let spy = sinon.stub(UserSession, "findAll").callsFake(options => {

        user_sessions = tokens.map(token_value => new UserSession({
            user_id: USER_ID,
            token: token_value,
            expiry_timestamp: session_expiry_timestamp,
            ip_address: "0.0.0.0"
          })
        );

        user_sessions.forEach(session => {
          sinon.stub(session, "save").callsFake(() => {

            return Promise.resolve(session);
          });
        });

        return Promise.resolve(user_sessions);
      });

      return AuthService.expireOtherSessions(USER_ID, current_session)
      .then(result => {
        
        chai.assert.isTrue(UserSession.findAll.called);

        user_sessions.forEach(session => {
          chai.expect(session.expiry_timestamp).to.be.not.equal(session_expiry_timestamp);
          chai.assert.isTrue(session.save.called, "expected every changed session to be saved");
        });

        UserSession.findAll.restore();
      });
    });
  });
});