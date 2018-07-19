const express = require("express");
const router = express.Router();

const UserController = require("./../controllers/UserController");
const SecurityController = require('./../controllers/SecurityController');
const AssetController = require('./../controllers/AssetController');
const InvestmentController = require('./../controllers/InvestmentController');
const OrdersController = require('./../controllers/OrdersController');
const SystemController = require('./../controllers/SystemController');
const InstrumentController = require('./../controllers/InstrumentController');
const MockController = require('./../controllers/MockController');

// const custom 	        = require('./../middleware/custom');

const passport = require("passport");
require("./../middleware/check_session")(passport);
const path = require("path");
const check_permissions = require("../middleware/check_permissions")
  .check_permissions;
const content_json = require("../middleware/content_json_header").content_json;
const filter_reducer = require('../middleware/resolve_list_filter').resolve_list_filter;
//validate POSTed body of request object using rules defined in config/validators.js
//not intended to validate filters, DON'T use in same stack filter_reduced
const post_body_validator = require('../middleware/post_body_validator').post_body_validator;
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
router.post(
  ROUTES.Login.router_string, 
  post_body_validator,
  UserController.login);
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
  ROUTES.GetUsersColLOV.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  UserController.getUsersColumnLOV
);
router.post(
  ROUTES.GetUsersColLOV.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  UserController.getUsersColumnLOV
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
  post_body_validator,
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
  post_body_validator,
  UserController.issueInvitation
);

//no auth middleware by design. 
//calls made by browser before a user exists
router.post(
  ROUTES.InvitationByToken.router_string,
  post_body_validator,
  UserController.inviteTokenInfo
);
router.post(
  ROUTES.CreateUserByInvite.router_string,
  post_body_validator,
  UserController.createByInvite
);
router.post(
  ROUTES.CreateUser.router_string, 
  post_body_validator,
  UserController.create
);
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
  post_body_validator,
  UserController.changeUserRole
);

//no auth middleware by design. 
//calls made by browser when user cant login
router.post(
  ROUTES.SendPasswordResetToken.router_string,
  post_body_validator,
  UserController.sendPasswordResetToken
);
router.get(
  ROUTES.ResetPassword.router_string,
  UserController.checkPasswordResetToken
);
router.post(
  ROUTES.ResetPassword.router_string,
  post_body_validator,
  UserController.resetPassword
);
//----------------------------------------------

router.post(
  ROUTES.ChangePassword.router_string,
  stateless_auth,
  check_permissions,
  post_body_validator,
  UserController.changePassword
);




//ROLES
router.post(
  ROUTES.CreateRole.router_string,
  stateless_auth,
  check_permissions,
  post_body_validator,
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
  post_body_validator,
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
  ROUTES.GetAssetsDetailedColLOV.router_string,
  stateless_auth,
  check_permissions,
  AssetController.getAssetsColumnLOV
);
router.post(
  ROUTES.GetAssetsDetailedColLOV.router_string,
  stateless_auth,
  check_permissions,
  AssetController.getAssetsColumnLOV
);
router.get(
  ROUTES.GetAssetDetailedInfo.router_string,
  stateless_auth,
  check_permissions,
  AssetController.getAssetDetailed
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
  post_body_validator,
  AssetController.changeAssetStatus
);


// Investment
router.post(
  ROUTES.CreateInvestment.router_string,
  stateless_auth,
  check_permissions,
  post_body_validator,
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
  ROUTES.GetInvestmentsColLOV.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
MockController.fetchColLOV
);
router.post(
  ROUTES.GetInvestmentsColLOV.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
MockController.fetchColLOV
);
router.get(
  ROUTES.GetInvestment.router_string,
  stateless_auth,
  check_permissions,
  InvestmentController.getInvestmentRun
);
router.get(
  ROUTES.GetInvestmentStats.router_string,
  stateless_auth,
  check_permissions,
  InvestmentController.getInvestmentStats
);


// Recipe Runs
router.post(
  ROUTES.ApproveRecipeRun.router_string,
  stateless_auth,
  check_permissions,
  post_body_validator,
  InvestmentController.changeRecipeRunStatus
);
router.post(
  ROUTES.CreateNewRecipeRun.router_string,
  stateless_auth,
  check_permissions,
  post_body_validator,
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
  ROUTES.GetRecipeRunsColLOV.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
MockController.fetchColLOV
);
router.post(
  ROUTES.GetRecipeRunsColLOV.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
MockController.fetchColLOV
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
  ROUTES.GetRecipeOrdersColLOV.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
MockController.fetchColLOV
);
router.post(
  ROUTES.GetRecipeOrdersColLOV.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
MockController.fetchColLOV
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
  post_body_validator,
  OrdersController.changeOrdersGroupStatus
);
router.post(
  ROUTES.GenerateRecipeOrders.router_string,
  stateless_auth,
  check_permissions,
  OrdersController.generateRecipeRunOrders
)

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
  ROUTES.GetRecipeRunDetailsColLOV.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
MockController.fetchColLOV
);
router.post(
  ROUTES.GetRecipeRunDetailsColLOV.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
MockController.fetchColLOV
);
router.get(
  ROUTES.GetRecipeRunDetail.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  InvestmentController.getRecipeRunDetail
);

// Recipe Run deposits
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
  ROUTES.GetRecipeRunDepositsColLOV.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
MockController.fetchColLOV
);
router.post(
  ROUTES.GetRecipeRunDepositsColLOV.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
MockController.fetchColLOV
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
  ROUTES.ExecutionOrdersColLOV.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
MockController.fetchColLOV
);
router.post(
  ROUTES.ExecutionOrdersFillColLOV.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
MockController.fetchColLOV
);
router.get(
  ROUTES.ExecutionOrdersFillColLOV.router_string,
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
  ROUTES.ExecutionOrdersFillColLOV.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
MockController.fetchColLOV
);
router.post(
  ROUTES.ExecutionOrdersFillColLOV.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
MockController.fetchColLOV
);
router.get(
  ROUTES.GetExecutionOrdersFill.router_string,
  stateless_auth,
  check_permissions,
  InvestmentController.ExecutionOrderFill
);

// Instruments
router.post(
  ROUTES.InstrumentCreate.router_string,
  stateless_auth,
  check_permissions,
  post_body_validator,
  InstrumentController.createInstrument
);
router.get(
  ROUTES.GetInstruments.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  InstrumentController.getInstruments
);
router.post(
  ROUTES.GetInstruments.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  InstrumentController.getInstruments
);
router.get(
  ROUTES.GetInstrumentsColLOV.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
MockController.fetchColLOV
);
router.post(
  ROUTES.GetInstrumentsColLOV.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
MockController.fetchColLOV
);
router.get(
  ROUTES.GetInstrument.router_string,
  stateless_auth,
  check_permissions,
  InstrumentController.getInstrument
);
router.post(
  ROUTES.InstrumentCheckMapping.router_string,
  stateless_auth,
  check_permissions,
  post_body_validator,
  InstrumentController.checkInstrumentExchangeMap
);
router.post(
  ROUTES.InstrumentMapExchanges.router_string,
  stateless_auth,
  check_permissions,
  post_body_validator,
  InstrumentController.mapInstrumentsWithExchanges
);
router.get(
  ROUTES.GetInstrumentExchanges.router_string,
  stateless_auth,
  check_permissions,
  InstrumentController.getInstrumentExchanges
);

// Liquidity requirements
router.post(
  ROUTES.LiquidityReqCreate.router_string,
  stateless_auth,
  check_permissions,
  post_body_validator,
  InstrumentController.createLiquidityRequirement
);
router.get(
  ROUTES.GetLiquidityRequirements.router_string,
  stateless_auth,
  check_permissions,
  InstrumentController.getLiquidityRequirements
);
router.post(
  ROUTES.GetLiquidityRequirements.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
  InstrumentController.getLiquidityRequirements
);
router.get(
  ROUTES.GetLiquidityRequirementsColLOV.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
MockController.fetchColLOV
);
router.post(
  ROUTES.GetLiquidityRequirementsColLOV.router_string,
  stateless_auth,
  check_permissions,
  filter_reducer,
MockController.fetchColLOV
);
router.get(
  ROUTES.GetLiquidityRequirement.router_string,
  stateless_auth,
  check_permissions,
  InstrumentController.getLiquidityRequirement
);
router.get(
  ROUTES.GetLiquidityRequirementExchanges.router_string,
  stateless_auth,
  check_permissions,
  InstrumentController.getLiquidityRequirementExchanges
);


router.post(
  ROUTES.CreateDeposit.router_string,
  stateless_auth,
  check_permissions,
  post_body_validator,
  InvestmentController.addDeposit
);

// System Settings
router.post(
  ROUTES.ChangeSettingValues.router_string,
  stateless_auth,
  check_permissions,
  post_body_validator,
  SystemController.changeSettingValue
);
router.get(
  ROUTES.ViewSettingValues.router_string,
  stateless_auth,
  check_permissions,
  SystemController.getAllSettings
);


// Route to check auth and get values. Front-end needs
router.get(
  ROUTES.CheckAuth.router_string,
  stateless_auth,
  check_permissions,
  UserController.checkAuth
);


router.get(
  ROUTES.GetExchanges.router_string,
  stateless_auth,
  check_permissions,
  MockController.getExchanges
);
router.post(
  ROUTES.GetExchanges.router_string,
  stateless_auth,
  check_permissions,
  MockController.getExchanges
);
router.get(
  ROUTES.InstrumentMapExchanges.router_string,
  stateless_auth,
  check_permissions,
  MockController.getExchanges
);
router.post(
  ROUTES.InstrumentMapExchanges.router_string,
  stateless_auth,
  check_permissions,
  MockController.getExchanges
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