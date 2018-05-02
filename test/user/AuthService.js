"use strict";

let app = require("../../app");
let chai = require("chai");
let should = chai.should();
const sinon = require("sinon");
const path = require("path");

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

      sinon.stub(user, "setRoles").callsFake(roles => {
        user.roles = roles;
      });
      sinon.stub(user, "getRoles").callsFake(roles => {
        return user.roles;
      });
      sinon.stub(user, "save").callsFake(() => {
        user.roles = NEW_ROLES;

        return Promise.resolve();
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
          chai.expect(changedUser).to.be.a("array");
          chai.expect(changedUser.length).to.eq(2);
          let [err, user] = changedUser;

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
        chai.expect(User.findOne.calledWith({ where: { email: EMAIL } }));
        //checked these credentials
        chai.expect(user.comparePassword.calledWith(PASSWORD));
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
      emails.forEach(mail => {
        local_model.email = mail;
        AuthService.createUser(local_model);
      });
      chai.expect(AuthService.createUser.alwaysThrew());

      AuthService.createUser.restore();
    });

    it("shall create a new user when all is good", () => {

        return AuthService.createUser(CREATE_MODEL).then((errUser) => {

            chai.expect(errUser).to.be.a('array');
            let [err, user] = errUser;

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
});
