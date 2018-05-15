const express = require("express");
const router = express.Router();

const UserController = require("./../controllers/UserController");
const SecurityController = require('./../controllers/SecurityController');

// const custom 	        = require('./../middleware/custom');

const passport = require("passport");
require("./../middleware/check_session")(passport);
const path = require("path");
const check_permissions = require("../middleware/check_permissions")
  .check_permissions;
const content_json = require("../middleware/content_json_header").content_json;
const filter_reducer = require('../middleware/resolve_list_filter').resolve_list_filter;
const stateless_auth = passport.authenticate("jwt", {
  session: false
});

/* GET home page. */
router.get("/", check_permissions, function (req, res, next) {
  res.json({
    status: "success",
    message: CONFIG.disclaimer,
    data: {
      version_number: "v1.1.5"
    }
  });
});

//ROUTES is a global map set in config/system_permissions.js

router.all("*", content_json);

//USERS
router.post(ROUTES.Login.router_string, UserController.login);
router.get(
  ROUTES.GetUserInfo.router_string,
  stateless_auth,
  check_permissions,
  UserController.getUser
);
router.get(
  ROUTES.GetUsersInfo.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  UserController.getUsers
);
router.post(
  ROUTES.GetUsersInfo.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  UserController.getUsers
);
router.post(
  ROUTES.ChangeUserInfo.router_string,
  stateless_auth,
  check_permissions,
  UserController.editUser
);
router.post(ROUTES.CreateUser.router_string, UserController.create);
router.post(
  ROUTES.ChangeUserRole.router_string,
  passport.authenticate("jwt", {
    session: false
  }),
  check_permissions,
  UserController.changeUserRole
);
router.post(
  ROUTES.CreateRole.router_string,
  passport.authenticate("jwt", {
    session: false
  }),
  check_permissions,
  SecurityController.createRole
);
router.get(
  ROUTES.DeleteRole.router_string,
  passport.authenticate("jwt", {
    session: false
  }),
  check_permissions,
  SecurityController.deleteRole
)
router.post(
  ROUTES.ChangeRolePermissions.router_string,
  stateless_auth,
  check_permissions,
  SecurityController.changeRolePermissions
);
router.get(
  ROUTES.GetRoleInfo.router_string,
  stateless_auth,
  check_permissions,
  SecurityController.getRoleInfo
);

router.post(
  ROUTES.ChangePassword.router_string,
  stateless_auth,
  UserController.changePassword
);

//********* API DOCUMENTATION **********
router.use(
  "/docs/api.json",
  express.static(path.join(__dirname, "/../public/v1/documentation/api.json"))
);
router.use(
  "/docs",
  express.static(path.join(__dirname, "/../public/v1/documentation/dist"))
);
module.exports = router;