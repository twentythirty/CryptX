const express = require("express");
const router = express.Router();

const UserController = require("./../controllers/UserController");
const HomeController = require("./../controllers/HomeController");

// const custom 	        = require('./../middleware/custom');

const passport = require("passport");
const path = require("path");
const check_permissions = require("../middleware/check_permissions")
  .check_permissions;
const content_json = require("../middleware/content_json_header").content_json;

require("./../middleware/check_session")(passport);
/* GET home page. */
router.get("/", check_permissions, function(req, res, next) {
  res.json({
    status: "success",
    message: CONFIG.disclaimer,
    data: { version_number: "v1.1.5" }
  });
});

//ROUTES is a global map set in config/system_permissions.js

router.all("*", content_json);

//USERS
router.post(ROUTES.Login.router_string, UserController.login);
router.get(
  ROUTES.GetMyInfo.router_string,
  passport.authenticate("jwt", { session: false }),
  UserController.getMe
);
router.get(
  ROUTES.GetUserInfo.router_string,
  passport.authenticate("jwt", { session: false }),
  check_permissions,
  UserController.getUser
);
router.post(ROUTES.CreateUser.router_string, UserController.create);
router.post(
  ROUTES.ChangeUserRole,
  passport.authenticate("jwt", { session: false }),
  check_permissions,
  UserController.changeUserRole
);

router.get(
  "/dash",
  check_permissions,
  passport.authenticate("jwt", { session: false }),
  HomeController.Dashboard
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
