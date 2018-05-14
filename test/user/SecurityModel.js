"use strict";

let app = require("../../app");
let chai = require("chai");
let chaiHttp = require("chai-http");
const sinon = require("sinon");
let should = chai.should();

chai.use(chaiHttp);

let USER_ID = 57;

let User = require("../../models").User;
let UserSession = require("../../models").UserSession;

describe("Path Security Model ", () => {
  let mockUser, mockSession;

  before(done => {

    app.dbPromise.then(migrations => {
      console.log(migrations);
      done();
    })

  });
  
  beforeEach(() => {
    mockUser = new User({
      id: USER_ID,
      first_name: "Larry",
      last_name: "Mock",
      created_timestamp: new Date(),
      email: "larry@cryptx.io",
      password: "test",
      is_active: true
    });
    mockSession = new UserSession({
      user_id: mockUser.id,
      expiry_timestamp: new Date(),
      ip_address: "0.0.0.0"
    });
    sinon.stub(UserSession, "findOne").callsFake(options => {
      var session = mockSession;
      mockSession.token = options.where.token;
      sinon.stub(session, "touch");
      return Promise.resolve(session);
    });
    sinon.stub(User, "findById").callsFake(id => {
      if(!mockUser.getRoles.restore) {
        sinon.stub(mockUser, "getRoles").callsFake(() => {
          return [{
            id: 55,
            name: ROLES.ADMIN,
            getPermissions: function () {
              return [{
                  name: PERMISSIONS.ALTER_ROLES
                },
                {
                  name: PERMISSIONS.ALTER_PERMS
                }
              ];
            }
          }];
        });
      }
      
      return Promise.resolve(mockUser);
    });

  });

  afterEach(() => {
    [UserSession.findOne, User.findById].forEach(func => {
      if (func.restore) {
        func.restore();
      }
    });

    [mockUser, mockSession] = [null, null];
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

  it("shall check the session and touch before allowing user request", (done) => {

    chai
      .request(app)
      .get("/v1/users/me")
      .set("Authorization", mockUser.getJWT())
      .end((err, res) => {
        //request went through ok
        chai.expect(res).to.have.status(200);
        //user session was retrieved for user of this id
        chai.assert.isTrue(UserSession.findOne.called);
        //user searched by correct id
        chai.assert.isTrue(User.findById.calledWith(USER_ID));
        //session token is from user
        chai.expect(mockSession.token).to.be.equal(mockUser.getJWT());
        //session was touched at the end of check
        chai.expect(mockSession.touch.called);

        done();
      });

  });

  it("shall not allow user with few permissions", (done) => {
    chai
      .request(app)
      .get("/v1/users/44")
      .set("Authorization", mockUser.getJWT())
      .end((err, res) => {
        //request was rejected
        chai.expect(res).to.have.status(403);
        //user roles were checked
        chai.expect(mockUser.getRoles.called);
        done();
      });

  });
});