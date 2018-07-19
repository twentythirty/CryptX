"use strict";

let app = require("../../app");
let chai = require("chai");
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
const sinon = require("sinon");
const path = require("path");
let utils = require('util');

chai.use(chaiAsPromised);

describe("AuthService testing", () => {

  before(done => {

    app.dbPromise.then(migrations => {
      console.log("Migraitions: %o", migrations);
      done();
    })

  });

  const AuthService = require("../../services/AuthService");
  const User = require("../../models").User;
  const UserSession = require("../../models").UserSession;
  const Role = require("../../models").Role;
  const Permission = require("../../models").Permission;

  let NEW_ROLES = ["1", "2"];
  let USER_ID = 23;
  let F_NAME = "Larry";
  let L_NAME = "Test";
  let EMAIL = "test@mock.io";
  let PASSWORD = "test";
  let IP = "0.0.0.0";
  let RESET_TOKEN = "password-reset-token";
  let RESET_TOKEN_EXPIRY = new Date(
    new Date().getTime() + 3600000
  );

  beforeEach(function () {
    //configure user model stubs
    sinon.stub(User, "findOne").callsFake(options => {
      var user = new User({
        id: USER_ID,
        first_name: "",
        last_name: "",
        email: options.where.email,
        reset_password_token_hash: RESET_TOKEN,
        reset_password_token_expiry_timestamp: RESET_TOKEN_EXPIRY,
        is_active: true
      });
      user.toJSON();
      user.Roles = [{
        id: 1,
        name: "Admin",
        Permissions: [{
          id: 1,
          code: "perm_some_code",
          name: "Permission to log in"
        }]
      },{
        id: 1,
        name: "Manager",
        Permissions: [{
          id: 1,
          code: "perm_another_code",
          name: "Permission to log out"
        }]
      }]
      sinon.stub(user, "comparePassword").returns(Promise.resolve(user));
      sinon.stub(user, "getJWT").returns("Bearer test-jwt");
      sinon.stub(user, "save").returns(Promise.resolve(user));

      return Promise.resolve(user);
    });
    sinon.stub(User, "findById").callsFake(id => {
      var user = new User({
        id: id,
        first_name: F_NAME,
        last_name: L_NAME,
        email: EMAIL,
        roles: [],
        password: PASSWORD,
        reset_password_token_hash: RESET_TOKEN,
        reset_password_token_expiry_timestamp: RESET_TOKEN_EXPIRY,
        is_active: true
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
  afterEach(function () {
    //restore user model

    [
      User.findOne,
      User.findById,
      UserSession.create,
      User.create
    ].forEach(model => {
      if (model.restore) {
        model.restore();
      }
    });
  });

  it("the service shall exist", function () {
    chai.expect(AuthService).to.exist;
  });

  describe("and the method changeUserRoles shall", function () {
    it("exist", function () {
      chai.expect(AuthService.changeUserRoles).to.exist;
    });

    it("call required DB model during roles change", function () {
      return AuthService.changeUserRoles(USER_ID, NEW_ROLES).then(
        changedUser => {
          chai.expect(changedUser).to.be.a("object");
          let user = changedUser;

          //user was looked up via supplied id
          chai.assert.isTrue(User.findById.calledWith(USER_ID));
          //user set their roles to DB
          chai.assert.isTrue(user.setRoles.called);
          //user state was persisted in method
          chai.assert.isTrue(user.save.called);
          //user has new roles in array          
          chai.expect(user.getRoles()).to.eq(NEW_ROLES);
        }
      );
    });
  });

  describe("and the method authUser shall ", function () {
    it("exist", function () {
      chai.expect(AuthService.authUser).to.exist;
    });

    it("call required DB model during authentication", function () {
      return AuthService.authUser({
          username: EMAIL,
          password: PASSWORD
        },
        IP
      ).then(function (userSession) {
        //test what function returns
        chai.expect(userSession).to.be.a("array");
        chai.expect(userSession.length).to.eq(3);
        let [user, perms, session] = userSession;

        //that User was searched by this email, and with required models included
        chai.assert.isTrue(User.findOne.calledWith({
          where: {
            email: EMAIL
          },
          include: [{
            model: Role,
            include: [Permission]
          }]
        }));
        //checked these credentials
        chai.assert.isTrue(user.comparePassword.calledWith(PASSWORD));
        //created session out of him and with provided IP and future date
        chai.expect(UserSession.create.called);
        chai.expect(session.expiry_timestamp).to.be.greaterThan(new Date());
        chai.expect(session.ip_address).to.be.eq(IP);
        chai.expect(session.user_id).to.be.eq(USER_ID);

        // permissions should be array of strings
        chai.expect(perms).to.be.Array;
        chai.expect(perms.length).to.be.eq(2);
        chai.expect(perms).to.satisfy(permissions => {
          return permissions.every(p => chai.expect(p).to.be.string);
        });
      });
    });
  });

  describe("and the method createUser shall ", function () {
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

      let partials = [{},
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
      return Promise.all(partials.map(obj => AuthService.createUser(obj)
        .then(result => {
          return Promise.resolve([null, result])
        }).catch(err => {
          return Promise.resolve([err, null])
        })
      )).then(results => {
        AuthService.createUser.restore();

        chai.expect(results).to.satisfy(results => { // checks if all attemps were rejected
          return results.every(pair => pair[1] == null)
        }, utils.format('%j', results));
      });
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
    it("exist", function () {
      chai.expect(AuthService.updatePassword).to.exist;
    });

    it("shall call methods when changing password", function () {
      let new_password = "newpassword";

      return AuthService.updatePassword(USER_ID, PASSWORD, new_password)
        .then(result => {
          let user = result;

          // check if findById was called
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
          // assure that password is not new_password yet
          chai.expect(user.password).to.be.not.equal(new_password);

          return AuthService.updatePassword(USER_ID, PASSWORD, new_password)
        }).then(result => {
          let user = result;

          // check if password has changed to new_password
          chai.expect(user.password).to.be.equal(new_password);
        });
    });
  });

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
        }));

        user_sessions.forEach(session => {
          sinon.stub(session, "save").callsFake(() => {

            return Promise.resolve(session);
          });
        });

        return Promise.resolve(user_sessions);
      });

      return AuthService.expireOtherSessions(USER_ID, current_session)
        .then(result => {
          // check if findAll was called
          chai.assert.isTrue(UserSession.findAll.called);

          user_sessions.forEach(session => {
            // check if session expiry timestamp was changed
            chai.expect(session.expiry_timestamp).to.be.not.equal(session_expiry_timestamp);
            // check if date session expiry_timestamp was set is less than current time
            chai.expect(session.expiry_timestamp).to.be.lessThan(new Date());
            // check if session save was called
            chai.assert.isTrue(session.save.called, "expected every changed session to be saved");
          });

          UserSession.findAll.restore();
        });
    });
  });

  describe('and the method changeUserInfo shall ', function () {
    it("shall exist", function () {
      chai.expect(AuthService.changeUserInfo).to.exist;
    });

    it('not change data that can not changed', function () {
      let new_data = {
        id: 55
      };

      return AuthService.changeUserInfo(USER_ID, new_data)
        .then(returnedUser => {
          // check if data that can't be changed is not changed
          chai.expect(returnedUser.id).to.be.equal(USER_ID);

          // these model methods should've been called
          chai.assert.isTrue(User.findById.calledWith(USER_ID));
          chai.assert.isTrue(returnedUser.save.called);
        });
    });

    it('change data that is allowed to be change by method', function () {
      let new_data = {
        first_name: "New_Name",
        last_name: "New_Last_Name",
        email: "new@email.com",
        is_active: false
      };

      return AuthService.changeUserInfo(USER_ID, new_data)
        .then(returnedUser => {
          _.toPairs(new_data).map(pair => { // checks if all new data was applied
            chai.expect(returnedUser[pair[0]]).to.be.equal(pair[1]);
          });
        })
    });

    it('not change values if new data is not supplied', function () {
      let new_data = {};

      return AuthService.changeUserInfo(USER_ID, new_data)
        .then(returnedUser => {
          chai.expect(returnedUser.id).to.be.equal(USER_ID);
          chai.expect(returnedUser.email).to.be.equal(EMAIL);
          chai.expect(returnedUser.first_name).to.be.equal(F_NAME);
          chai.expect(returnedUser.last_name).to.be.equal(L_NAME);
          chai.expect(returnedUser.is_active).to.be.true;
        })
    });
  });

  describe('and the method deleteUser shall', () => {

    it("exist", function () {
      chai.expect(AuthService.deleteUser).to.exist;
    });

    beforeEach(done => {
      //need custom stubs of User.findOne for these tests, so best restore before
      if (User.findOne.restore) {
        User.findOne.restore();
      }
      done();
    });

    it('change user to not active if they were', done => {
      //check when found user is active
      sinon.stub(User, 'findOne').callsFake(options => {

        let user = new User({
          id: options.where.id,
          is_active: true
        });

        sinon.stub(user, 'save').callsFake(() => {
          return Promise.resolve(user);
        });
        return Promise.resolve(user);
      });

      AuthService.deleteUser(USER_ID).then(user => {
        try {
          chai.expect(user).to.be.a('object');
          chai.expect(user.id).to.eq(USER_ID);
          chai.assert.isTrue(user.save.called);
          chai.assert.isFalse(user.is_active);
          done();
        } catch (ex) {
          done(ex);
        }
      });
    });

    it('perform NOOP on users that werent active', (done) => {
      //check when found user is already "deleted"
      sinon.stub(User, 'findOne').callsFake(options => {

        let user = new User({
          id: options.where.id,
          is_active: false
        });

        sinon.stub(user, 'save').callsFake(() => {
          return Promise.resolve(user);
        });
        return Promise.resolve(user);
      });

      AuthService.deleteUser(USER_ID).then(user => {
        try {
          chai.expect(user).to.be.a('object');
          chai.expect(user.id).to.eq(USER_ID);
          chai.assert.isTrue(user.save.notCalled);
          chai.assert.isFalse(user.is_active);
          done();
        } catch (ex) {
          done(ex);
        }
      });
    });
  });

  describe('and the method sendPasswordResetToken shall', function () {

    it('exist', () => {
      chai.expect(AuthService.sendPasswordResetToken).to.exist;
    });

    it('call required DB model methods, update token and its expiry', () => {
      return AuthService.sendPasswordResetToken(EMAIL).then(user => {
        chai.assert.isTrue(User.findOne.called);
        chai.expect(user.reset_password_token_hash).to.be.not.equal(RESET_TOKEN);
        chai.expect(user.reset_password_token_expiry_timestamp).to.be.not.equal(RESET_TOKEN_EXPIRY);
        chai.expect(user.reset_password_token_expiry_timestamp).to.be.greaterThan(new Date());
        chai.assert.isTrue(user.save.called);
      })
    });

    it('throw error if user is not active', () => {

      if(User.findOne.restore)
        User.findOne.restore();

      sinon.stub(User, "findOne").callsFake(options => {
        let user = new User({
          id: options.where.id,
          is_active: false
        });
        sinon.stub(user, "save").returns(Promise.resolve(user));

        return Promise.resolve(user);
      });

      return chai.assert.isRejected(AuthService.sendPasswordResetToken(USER_ID));
    });
  });

  describe('and the method verifyResetTokenValidity shall', function () {

    it('exist', () => {
      chai.expect(AuthService.verifyResetTokenValidity).to.exist;
    });

    it('shall return user object if everything is good', () => {
      return AuthService.verifyResetTokenValidity(RESET_TOKEN).then(user => {
        chai.expect(
          user.reset_password_token_hash
        ).to.be.equal(RESET_TOKEN);

        chai.expect(
          user.reset_password_token_expiry_timestamp
        ).to.be.equal(RESET_TOKEN_EXPIRY);

      });
    });

    it('shall reject if token is expired', () => {
      if(User.findOne.restore)
        User.findOne.restore();
      
      sinon.stub(User, "findOne").callsFake((options) => {
        let user = new User({
          reset_password_token_hash: options.where.reset_password_token_hash,
          reset_password_token_expiry_timestamp: new Date().getTime() - 10000
        });

        sinon.stub(user, "save").returns(Promise.resolve(user));

        return Promise.resolve(user);
      })

      return chai.assert.isRejected(AuthService.verifyResetTokenValidity(RESET_TOKEN));
    });
  });

  describe('and the method resetPassword shall', function () {

    it('exist', () => {
      chai.expect(AuthService.resetPassword).to.exist;
    });

    it('shall update password', () => {
      let new_pwd = "a_new_password";
      return AuthService.resetPassword(USER_ID, new_pwd).then(user => {
        // check if needed method called
        chai.assert.isTrue(User.findById.calledWith(USER_ID));
        chai.assert.isTrue(user.save.called);

        // check if values match the expectations
        chai.expect(user.reset_password_token_expiry_timestamp).to.be.null;
        chai.expect(user.reset_password_token_hash).to.be.null;
        chai.expect(user.password).to.be.equal(new_pwd);
      });
    });

    it('shall reject if no password was supplied', () => {
      return chai.assert.isRejected(AuthService.resetPassword(USER_ID, ''));
    });
  });
});