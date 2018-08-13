"use strict";

let app = require("../../app");
let chai = require("chai");
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
const sinon = require("sinon");
const path = require("path");
let utils = require('util');

chai.use(chaiAsPromised);

const SecurityService = require("../../services/SecurityService");

const User = require("../../models").User;
const Role = require("../../models").Role;
const Permission = require("../../models").Permission;

describe("SecurityService mocking", () => {

  before(done => {

      app.dbPromise.then(migrations => {
          console.log("Migraitions: %o", migrations);
          done();
      })

  });

  let ROLE_ID = 1;
  let ROLE_NAME = "role_test";
  let ROLE_PERMISSIONS = [
    PERMISSIONS.ALTER_ROLES,
    PERMISSIONS.VIEW_USERS
  ];

  beforeEach(function () {
    sinon.stub(Role, "findById").callsFake((role_id) => {
      let role = new Role({
        id: role_id,
        name: "role_test"
      });

      sinon.stub(role, "setPermissions").callsFake(new_perms => {
        role.permissions = new_perms;
        return Promise.resolve(role.permissions);
      });

      role.setPermissions(ROLE_PERMISSIONS);
      // assign users to role if id is 2
      role.Users = role_id === 2 ? [ new User({}) ] : [];


      sinon.stub(role, "destroy").callsFake(() => {
        return Promise.resolve();
      });

      sinon.stub(role, "save").callsFake(() => {
        return Promise.resolve(role);
      });

      return role;
    });

    sinon.stub(Permission, "findAll").callsFake(query => {
      let checkVal = query.where.code;
      return Promise.resolve(query.where.code);
    });

    sinon.stub(Role, "create").callsFake(options => {
      return Promise.resolve(new Role(options));
    })

    sinon.spy(SecurityService, 'deleteRole');
    sinon.spy(SecurityService, 'createRole');
  });

  afterEach(function () {
    Role.findById.restore();
    Role.create.restore();
    Permission.findAll.restore();
    SecurityService.deleteRole.restore();
    SecurityService.createRole.restore();
  });


  describe("method editRole shall", function () {

    it("exist", function () {
      chai.expect(SecurityService.editRole).to.exist;
    });

    it("call required DB model and update role", function() {
      let new_info = {
        name: "updated_role",
        permissions: [
          PERMISSIONS.ALTER_ROLES,
          PERMISSIONS.ALTER_PERMS,
          PERMISSIONS.VIEW_ROLES,
          PERMISSIONS.VIEW_USERS
        ]
      }

      return SecurityService.editRole(ROLE_ID, new_info).then(
        changedRole => {
          chai.expect(changedRole).to.be.a("object");
          
          // role was looked up via supplied id
          chai.assert.isTrue(Role.findById.calledWith(ROLE_ID));
          // check if setPermissions of role were changed
          chai.assert.isTrue(changedRole.setPermissions.called);
          // role name changed
          chai.expect(changedRole.name).to.be.equal(new_info.name);
          //user has new roles in array
          chai.expect(changedRole.permissions).to.deep.equal(new_info.permissions);
        }
      );
    });

    it("reject if the updated info is empty", function() {
       return Promise.all(_.map([
         [1],
         [1, null],
         [1, {}],
         [1, { name: null, permissions: null }],
         [1, { name: '  ', permissions: [PERMISSIONS.ALTER_ROLES] }],
         [1, { name: 'Super admin', permissions: [] }],
         [1, { permissions: [PERMISSIONS.ALTER_ROLES, PERMISSIONS.ALTER_PERMS] }]
       ], params => {
         return chai.assert.isRejected(SecurityService.editRole(...params));
       })); 
    });

    it("update if the arguments are valid", function() {
      let new_info = [
        {
          permissions: [
            PERMISSIONS.ALTER_ROLES,
            PERMISSIONS.ALTER_PERMS,
            PERMISSIONS.VIEW_ROLES,
            PERMISSIONS.VIEW_USERS
          ],
          name: "updated_test_role"
        }
      ];

      return Promise.all(
        new_info.map((info, index) => SecurityService.editRole(ROLE_ID, info).then(
          changedRole => {
            // check if role name is changed/not changed
            //console.log(index, ROLE_NAME, new_info[index].name, changedRole.name);
            chai.expect(changedRole.name).to.be.equal(
              new_info[index].name != null ?
              new_info[index].name :
              ROLE_NAME 
            );

            //console.log(index, ROLE_PERMISSIONS, new_info[index].permissions, changedRole.permissions);
            chai.expect(changedRole.permissions).to.deep.equal(
              new_info[index].permissions != null ?
              new_info[index].permissions :
              ROLE_PERMISSIONS
            );
          }
        ))
      );
    });
  });
    

  describe("method deleteRole shall", function () {

    it("exist", () => {
      chai.expect(SecurityService.deleteRole).to.exist;
    });

    it("call required DB model methods", function () {
      return SecurityService.deleteRole(ROLE_ID).then(role => {
        chai.assert.isTrue(Role.findById.calledWith(ROLE_ID));
      });
    });

    it("throw when deleting a role still assigned to users", function () {
      let ROLE_ID = 2; // role with id 2 will have users assigned to it
      return chai.assert.isRejected(SecurityService.deleteRole(ROLE_ID));    
    });
  });

  describe("method createRole shall", function () {
    it("exist", function () {
      chai.expect(SecurityService.createRole).to.exist;
    });

    it("throw if role name isn't supplied", function () {
      return chai.assert.isRejected(SecurityService.createRole());
    });

    it("call required DB methods", function () {
      return SecurityService.createRole(ROLE_NAME, ROLE_PERMISSIONS).then(new_role => {
        chai.expect(Role.create.called);

        chai.expect(new_role.name).to.be.equal(ROLE_NAME);
      })
    });
  });
});