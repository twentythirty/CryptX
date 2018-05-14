"use strict";

let app = require("../../app");
let chai = require("chai");
let should = chai.should();
const sinon = require("sinon");
const path = require("path");
let utils = require('util');

const SecurityService = require("../../services/SecurityService");

const Role = require("../../models").Role;
const Permission = require("../../models").Permission;

describe("SecurityService mocking", () => {

  before(done => {

      app.dbPromise.then(migrations => {
          console.log("Migraitions: %o", migrations);
          done();
      })

  });

  describe("and method changeRolePermission shall", function () {
    let ROLE_ID = 1;
    beforeEach(function () {
      sinon.stub(Role, "findById").callsFake((role_id) => {
        let role = new Role({
          id: role_id,
          name: "role_test"
        });

        sinon.stub(role, "setPermissions").callsFake(new_perms => {
          role.permissions = new_perms;
        });

        sinon.stub(role, "getPermissions").callsFake(() => {
          return role.permissions;
        });

        sinon.stub(role, "save").callsFake(() => {
          return Promise.resolve(role);
        });

        return role;
      });

      sinon.spy(Permission, "findAll");
    });

    afterEach(function () {
      Role.findById.restore();
      Permission.findAll.restore();
    });

    it("exist", function () {
      chai.expect(SecurityService.changeRolePermissions).to.exist;
    });

    it("call required DB model during roles permission change", function() {
      let new_permissions = [
        PERMISSIONS.ALTER_ROLES,
        PERMISSIONS.ALTER_PERMS,
        PERMISSIONS.VIEW_ROLES,
        PERMISSIONS.VIEW_USERS
      ];

      return SecurityService.changeRolePermissions(ROLE_ID, new_permissions).then(
        changedRole => {
          chai.expect(changedRole).to.be.a("object");
          
          //role was looked up via supplied id
          chai.assert.isTrue(Role.findById.calledWith(ROLE_ID));
          // check if setPermissions of role were changed
          chai.assert(changedRole.setPermissions.called);
          //role state was persisted in method
          chai.assert.isTrue(changedRole.save.called);
          //user has new roles in array

          chai.expect(
            [...changedRole.getPermissions().map(perm => perm.code)]
          ).to.deep.equal(new_permissions);
        }
      );
    });
  });
});