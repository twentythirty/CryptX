const express = require("express");
const router = express.Router();

const UserController = require("./../controllers/UserController");
const SecurityController = require('./../controllers/SecurityController');
const AssetController = require('./../controllers/AssetController');
const InvestmentController = require('./../controllers/InvestmentController');
const OrdersController = require('./../controllers/OrdersController');
const SystemController = require('./../controllers/SystemController');

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
router.get(
  ROUTES.GetUserInfo.router_string,
  stateless_auth,
  check_permissions,
  UserController.getUser
);
router.post(
  ROUTES.ChangeUserInfo.router_string,
  stateless_auth,
  check_permissions,
  UserController.editUser
);
router.get(
  ROUTES.GetMyPermissions.router_string,
  stateless_auth,
  check_permissions,
  UserController.getUserPermissions
);
router.post(
  ROUTES.InviteUser.router_string,
  stateless_auth,
  check_permissions,
  UserController.issueInvitation
);

//no auth middleware by design. 
//calls made by browser before a user exists
router.post(
  ROUTES.InvitationByToken.router_string,
  UserController.inviteTokenInfo
);
router.post(
  ROUTES.CreateUserByInvite.router_string,
  UserController.createByInvite
);
router.post(ROUTES.CreateUser.router_string, UserController.create);
//----------------------------------------------

router.delete(
  ROUTES.DeleteUserInfo.router_string,
  stateless_auth,
  check_permissions,
  UserController.deleteUser
);
router.post(
  ROUTES.ChangeUserRole.router_string,
  stateless_auth,
  check_permissions,
  UserController.changeUserRole
);

//no auth middleware by design. 
//calls made by browser when user cant login
router.post(
  ROUTES.SendPasswordResetToken.router_string,
  UserController.sendPasswordResetToken
);
router.get(
  ROUTES.ResetPassword.router_string,
  UserController.checkPasswordResetToken
);
router.post(
  ROUTES.ResetPassword.router_string,
  UserController.resetPassword
);
//----------------------------------------------

router.post(
  ROUTES.ChangePassword.router_string,
  stateless_auth,
  check_permissions,
  UserController.changePassword
);




//ROLES
router.post(
  ROUTES.CreateRole.router_string,
  stateless_auth,
  check_permissions,
  SecurityController.createRole
);
router.delete(
  ROUTES.DeleteRole.router_string,
  stateless_auth,
  check_permissions,
  SecurityController.deleteRole
)
router.post(
  ROUTES.EditRole.router_string,
  stateless_auth,
  check_permissions,
  SecurityController.editRole
);
router.get(
  ROUTES.GetRolesInfo.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  SecurityController.getRoles
);
router.post(
  ROUTES.GetRolesInfo.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  SecurityController.getRoles
);
router.get(
  ROUTES.GetRoleInfo.router_string,
  stateless_auth,
  check_permissions,
  SecurityController.getRoleInfo
);
router.get(
  ROUTES.GetAllPermissions.router_string,
  stateless_auth,
  check_permissions,
  SecurityController.getAllPermissions
);


// ASSETS
router.get(
  ROUTES.GetAssetDetailedInfo.router_string,
  stateless_auth,
  check_permissions,
  AssetController.getAssetDetailed
);
router.get(
  ROUTES.GetAssetsDetailed.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  AssetController.getAssetsDetailed
);
router.post(
  ROUTES.GetAssetsDetailed.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  AssetController.getAssetsDetailed
);
router.get(
  ROUTES.GetAssets.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  AssetController.getAssets
);
router.post(
  ROUTES.GetAssets.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  AssetController.getAssets
);
router.get(
  ROUTES.GetAssetInfo.router_string,
  stateless_auth,
  check_permissions,
  AssetController.getAsset
);
router.post(
  ROUTES.ChangeAssetStatus.router_string,
  stateless_auth,
  check_permissions,
  AssetController.changeAssetStatus
);


// Investment
router.post(
  ROUTES.CreateInvestment.router_string,
  stateless_auth,
  check_permissions,
  InvestmentController.createInvestmentRun
);
router.get(
  ROUTES.GetInvestments.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  InvestmentController.getInvestmentRuns
);
//get filtered investments
router.post(
  ROUTES.GetInvestments.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  InvestmentController.getInvestmentRuns
);
router.get(
  ROUTES.GetInvestment.router_string,
  stateless_auth,
  check_permissions,
  InvestmentController.getInvestmentRun
);

// Recipe Runs
router.post(
  ROUTES.ApproveRecipeRun.router_string,
  stateless_auth,
  check_permissions,
  InvestmentController.changeRecipeRunStatus
);
router.post(
  ROUTES.CreateNewRecipeRun.router_string,
  stateless_auth,
  check_permissions,
  InvestmentController.createRecipeRun
);
router.get(
  ROUTES.GetRecipeRuns.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  InvestmentController.getRecipeRuns
);
router.post(
  ROUTES.GetRecipeRuns.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  InvestmentController.getRecipeRuns
);
router.get(
  ROUTES.GetRecipeRun.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  InvestmentController.getRecipeRun
);


// Recipe orders
/* router.get( // original
  ROUTES.GetRecipeOrders.router_string,
  stateless_auth,
  check_permissions,
  OrdersController.getOrdersGroup
); */
router.get(
  ROUTES.GetRecipeOrders.router_string,
  stateless_auth,
  check_permissions,
  InvestmentController.getRecipeOrders
);
router.post(
  ROUTES.GetRecipeOrders.router_string,
  stateless_auth,
  check_permissions,
  InvestmentController.getRecipeOrders
);
router.get(
  ROUTES.GetRecipeOrder.router_string,
  stateless_auth,
  check_permissions,
  InvestmentController.getRecipeOrder
);
router.post(
  ROUTES.AlterOrdersGroup.router_string,
  stateless_auth,
  check_permissions,
  OrdersController.changeOrdersGroupStatus
);

// Recipe run details
router.get(
  ROUTES.GetRecipeRunDetails.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  InvestmentController.getRecipeRunDetails
);
router.post(
  ROUTES.GetRecipeRunDetails.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  InvestmentController.getRecipeRunDetails
);
router.get(
  ROUTES.GetRecipeRunDetail.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  InvestmentController.getRecipeRunDetail
);

// Recipe orders
router.get(
  ROUTES.GetRecipeRunDeposits.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  InvestmentController.getRecipeDeposits
);
router.post(
  ROUTES.GetRecipeRunDeposits.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  InvestmentController.getRecipeDeposits
);
router.get(
  ROUTES.GetRecipeRunDeposit.router_string,
  stateless_auth,
  check_permissions,
  InvestmentController.getRecipeDeposit
);

 // Execution orders
router.get(
  ROUTES.GetExecutionOrders.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  InvestmentController.getExecutionOrders
);
router.post(
  ROUTES.GetExecutionOrders.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  InvestmentController.getExecutionOrders
);
router.get(
  ROUTES.GetExecutionOrder.router_string,
  stateless_auth,
  check_permissions,
  InvestmentController.getExecutionOrder
);

 // Execution order fills
 router.get(
  ROUTES.GetExecutionOrdersFills.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  InvestmentController.ExecutionOrderFills
);
router.post(
  ROUTES.GetExecutionOrdersFills.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  InvestmentController.ExecutionOrderFills
);
router.get(
  ROUTES.GetExecutionOrdersFill.router_string,
  stateless_auth,
  check_permissions,
  InvestmentController.ExecutionOrderFill
);

router.post(
  ROUTES.CreateDeposit.router_string,
  stateless_auth,
  check_permissions,
  InvestmentController.addDeposit
);

// System Settings
router.post(
  ROUTES.ChangeSettingValues.router_string,
  stateless_auth,
  check_permissions,
  SystemController.changeSettingValue
);
router.get(
  ROUTES.ViewSettingValues.router_string,
  stateless_auth,
  check_permissions,
  SystemController.getAllSettings
);

// Route to check auth and get values front-end needs
router.get(
  ROUTES.CheckAuth.router_string,
  stateless_auth,
  check_permissions,
  UserController.checkAuth
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