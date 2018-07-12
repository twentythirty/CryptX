require('./route_matchers');

//initial constants
PERMISSIONS = {
  ALTER_ROLES: "perm_alter_user_roles",
  ALTER_PERMS: "perm_alter_role_perm",
  VIEW_ROLES: "perm_view_roles",
  VIEW_USERS: "perm_view_users",
  EDIT_USERS: "perm_edit_users",
  DELETE_USER: "perm_delete_users",
  CREATE_USER: "perm_create_user",
  VIEW_ASSETS: "perm_view_assets",
  CHANGE_ASSET_STATUS: "perm_change_asset_status",
  VIEW_INVESTMENT_RUN: "perm_view_investment_run",
  CREATE_INVESTMENT_RUN: "perm_create_investment_run",
  APPROVE_RECIPE_RUN: "perm_approve_recipe_run",
  VIEW_ORDERS: "perm_view_orders",
  ALTER_ORDERS: "perm_alter_orders",
  CHANGE_SETTING_VALUES: "perm_change_settings",
  VIEW_SETTING_VALUES: "perm_view_settings"
};
//list of permissions that dotn apply to users
//as long as they are altering themselves
PERMISSIONS.PERSONAL = [PERMISSIONS.VIEW_USERS, PERMISSIONS.EDIT_USERS];

PERMISSIONS_CATEGORIES = {
  INVESTMENT_RUN: "Investment run",
  ORDERS: "Orders",
  RECIPE_RUN: "Recipe run",
  OTHER: "Other groups"
};

CATEGORY_TO_PERM_ASSOC = {
  [PERMISSIONS_CATEGORIES.INVESTMENT_RUN]: [
    PERMISSIONS.VIEW_INVESTMENT_RUN,
    PERMISSIONS.CREATE_INVESTMENT_RUN
  ],
  [PERMISSIONS_CATEGORIES.ORDERS]: [
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.ALTER_ORDERS
  ],
  [PERMISSIONS_CATEGORIES.RECIPE_RUN]: [
    PERMISSIONS.APPROVE_RECIPE_RUN
  ]
}
//fill other category with remaining permissions
CATEGORY_TO_PERM_ASSOC[PERMISSIONS_CATEGORIES.OTHER] = _.difference(
  Object.values(PERMISSIONS),
  _.flatMap(Object.values(CATEGORY_TO_PERM_ASSOC))
)

ROLES = {
  ADMIN: "ROLE_ADMIN",
  MANAGER: "ROLE_MANAGER",
  USER: "ROLE_USER"
};

//referenceable lists
all_permissions = {};
all_permissions[PERMISSIONS.ALTER_ROLES] =
  "Permission to change the roles a user has";
all_permissions[PERMISSIONS.ALTER_PERMS] =
  "Permission to change what permissions are included in a specific role";
all_permissions[PERMISSIONS.VIEW_ROLES] =
  "Permission to view information of system user roles";
all_permissions[PERMISSIONS.VIEW_USERS] =
  "Permission to view information of other system users";
all_permissions[PERMISSIONS.EDIT_USERS] =
  "Permission to edit basic user information";
all_permissions[PERMISSIONS.DELETE_USER] =
  "Permission to delete users";
all_permissions[PERMISSIONS.CREATE_USER] =
  "Permission to create new system users";
all_permissions[PERMISSIONS.VIEW_ASSETS] =
  "Permission to view assets available on the system";
all_permissions[PERMISSIONS.CHANGE_ASSET_STATUS] =
  "Permission to blacklist/whitelist assets";
all_permissions[PERMISSIONS.VIEW_INVESTMENT_RUN] =
  "Permission to view investment runs";
all_permissions[PERMISSIONS.CREATE_INVESTMENT_RUN] =
  "Permission to create investment runs";
all_permissions[PERMISSIONS.APPROVE_RECIPE_RUN] =
  "Permission to approve/reject investment recipes";
all_permissions[PERMISSIONS.VIEW_ORDERS] = 
  "Permission to view orders of recipe runs in groups";
all_permissions[PERMISSIONS.ALTER_ORDERS] = 
  "Permission to alter the status of a group or recipe orders";
all_permissions[PERMISSIONS.CHANGE_SETTING_VALUES] =
  "Permission to edit system setting values";
all_permissions[PERMISSIONS.VIEW_SETTING_VALUES] =
  "Permission to view system setting values";

all_roles = Object.values(ROLES);

ROUTES = {
  CreateUser: {
    router_string: "/users/create",
    permissions_matcher: ROUTE_MATCHERS.CreateUser,
    required_permissions: [PERMISSIONS.CREATE_USER]
  },
  InviteUser: {
    router_string: "/users/invite",
    permissions_matcher: ROUTE_MATCHERS.InviteUser,
    required_permissions: [PERMISSIONS.CREATE_USER]
  },
  DeleteUserInfo: {
    router_string: "/users/rm/:user_id",
    permissions_matcher: ROUTE_MATCHERS.DeleteUserInfo,
    required_permissions: [PERMISSIONS.VIEW_USERS, PERMISSIONS.DELETE_USER]
  },
  //a route that does not require permissions by deisgn
  //return invitation info by email token. Called by browser
  //for somebody who doesnt have a user account yet
  InvitationByToken: {
    router_string: "/users/invitation",
    permissions_matcher: ROUTE_MATCHERS.InvitationByToken,
    required_permissions: []
  },
  CreateUserByInvite: {
    router_string: '/users/create-invited',
    permissions_matcher: ROUTE_MATCHERS.CreateUserByInvite,
    required_permissions: []
  },
  Login: {
    router_string: "/users/login",
    permissions_matcher: ROUTE_MATCHERS.Login,
    required_permissions: []
  },
  GetMyPermissions: {
    router_string: "/users/me/permissions",
    permissions_matcher: ROUTE_MATCHERS.GetMyPermissions,
    required_permissions: [PERMISSIONS.VIEW_USERS]
  },
  GetUserInfo: {
    router_string: "/users/:user_id",
    permissions_matcher: ROUTE_MATCHERS.GetUserInfo,
    required_permissions: [PERMISSIONS.VIEW_USERS]
  },
  GetUsersInfo: {
    router_string: "/users/all",
    permissions_matcher: ROUTE_MATCHERS.GetUsersInfo,
    required_permissions: [PERMISSIONS.VIEW_USERS]
  },
  ChangeUserInfo: {
    router_string: "/users/:user_id/edit",
    permissions_matcher: ROUTE_MATCHERS.ChangeUserInfo,
    required_permissions: [PERMISSIONS.VIEW_USERS, PERMISSIONS.EDIT_USERS]
  },
  ChangeUserRole: {
    router_string: "/users/:user_id/change_role",
    permissions_matcher: ROUTE_MATCHERS.ChangeUserRole,
    required_permissions: [PERMISSIONS.VIEW_USERS, PERMISSIONS.ALTER_ROLES]
  },
  CreateUser: {
    router_string: "/users/create",
    permissions_matcher: ROUTE_MATCHERS.CreateUser,
    required_permissions: [PERMISSIONS.CREATE_USER]
  },
  ChangePassword: {
    router_string: "/users/:user_id/change_password",
    permissions_matcher: ROUTE_MATCHERS.ChangePassword,
    required_permissions: [PERMISSIONS.VIEW_USERS]
  },
  SendPasswordResetToken: {
    router_string: "/send_reset_token",
    permissions_matcher: ROUTE_MATCHERS.SendPasswordResetToken,
    required_permissions: []
  },
  ResetPassword: {
    router_string: "/password_reset/:token",
    permissions_matcher: ROUTE_MATCHERS.ResetPassword,
    required_permissions: []
  },

  // Roles
  GetRoleInfo: {
    router_string: "/roles/:role_id",
    permissions_matcher: ROUTE_MATCHERS.GetRoleInfo,
    required_permissions: [PERMISSIONS.VIEW_ROLES]
  },
  GetRolesInfo: {
    router_string: "/roles/all",
    permissions_matcher: ROUTE_MATCHERS.GetRolesInfo,
    required_permissions: [PERMISSIONS.VIEW_ROLES]
  },
  EditRole: {
    router_string: "/roles/:role_id/edit",
    permissions_matcher: ROUTE_MATCHERS.EditRole,
    required_permissions: [PERMISSIONS.ALTER_PERMS]
  },
  CreateRole: {
    router_string: "/roles/create",
    permissions_matcher: ROUTE_MATCHERS.CreateRole,
    required_permissions: [PERMISSIONS.ALTER_ROLES, PERMISSIONS.VIEW_ROLES]
  },
  DeleteRole: {
    router_string: "/roles/:role_id/delete",
    permissions_matcher: ROUTE_MATCHERS.DeleteRole,
    required_permissions: [PERMISSIONS.ALTER_ROLES, PERMISSIONS.VIEW_ROLES]
  },

  GetAllPermissions: {
    router_string: "/permissions/list",
    permissions_matcher: ROUTE_MATCHERS.GetAllPermissions,
    required_permissions: [PERMISSIONS.VIEW_ROLES]
  },

  // Assets
  GetAssetInfo: {
    router_string: "/assets/:asset_id",
    permissions_matcher: ROUTE_MATCHERS.GetAssetInfo,
    required_permissions: [PERMISSIONS.VIEW_ASSETS]
  },
  GetAssets: {
    router_string: "/assets/all",
    permissions_matcher: ROUTE_MATCHERS.GetAssets,
    required_permissions: [PERMISSIONS.VIEW_ASSETS]
  },
  GetAssetDetailedInfo: {
    router_string: "/assets/detailed/:asset_id",
    permissions_matcher: ROUTE_MATCHERS.GetAssetDetailedInfo,
    required_permissions: [PERMISSIONS.VIEW_ASSETS]
  },
  GetAssetsDetailed: {
    router_string: "/assets/detailed/all",
    permissions_matcher: ROUTE_MATCHERS.GetAssetsDetailed,
    required_permissions: [PERMISSIONS.VIEW_ASSETS]
  },
  ChangeAssetStatus: {
    router_string: "/assets/:asset_id/change_status",
    permissions_matcher: ROUTE_MATCHERS.ChangeAssetStatus,
    required_permissions: [PERMISSIONS.VIEW_ASSETS, PERMISSIONS.CHANGE_ASSET_STATUS]
  },

  // Investment
  CreateInvestment: {
    router_string: "/investments/create",
    permissions_matcher: ROUTE_MATCHERS.CreateInvestment,
    required_permissions: [PERMISSIONS.CREATE_INVESTMENT_RUN, PERMISSIONS.VIEW_INVESTMENT_RUN]
  },
  GetInvestment: {
    router_string: "/investments/:investment_id",
    permissions_matcher: ROUTE_MATCHERS.GetInvestment,
    required_permissions: [PERMISSIONS.VIEW_INVESTMENT_RUN]
  },
  GetInvestments: {
    router_string: "/investments/all",
    permissions_matcher: ROUTE_MATCHERS.GetInvestments,
    required_permissions: [PERMISSIONS.VIEW_INVESTMENT_RUN]
  },
  GetRecipeRun: {
    router_string: "/recipes/:recipe_id",
    permissions_matcher: ROUTE_MATCHERS.GetRecipeRun,
    required_permissions: [PERMISSIONS.VIEW_INVESTMENT_RUN]
  },
  GetRecipeRuns: {
    router_string: "/investments/:inverstment_id/recipes/all",
    permissions_matcher: ROUTE_MATCHERS.GetRecipeRuns,
    required_permissions: [PERMISSIONS.VIEW_INVESTMENT_RUN]
  },
  GetRecipeRunDetails: {
    router_string: "/recipes/:recipe_id/details",
    permissions_matcher: ROUTE_MATCHERS.GetRecipeRunDetails,
    required_permissions: [PERMISSIONS.VIEW_INVESTMENT_RUN]
  },
  ApproveRecipeRun: {
    router_string: "/recipes/:recipe_id/approve",
    permissions_matcher: ROUTE_MATCHERS.ApproveRecipeRun,
    required_permissions: [PERMISSIONS.VIEW_INVESTMENT_RUN, PERMISSIONS.APPROVE_RECIPE_RUN]
  },
  GetRecipeOrders: {
    router_string: "/orders/of_recipe/:recipe_run_id",
    permissions_matcher: ROUTE_MATCHERS.GetRecipeOrders,
    required_permissions: [PERMISSIONS.VIEW_ORDERS]
  },
  AlterOrdersGroup: {
    router_string: "/orders/:order_group_id/alter",
    permissions_matcher: ROUTE_MATCHERS.AlterOrdersGroup,
    required_permissions: [PERMISSIONS.VIEW_ORDERS, PERMISSIONS.ALTER_ORDERS]
  },
  CreateNewRecipeRun: {
    router_string: "/investments/:investment_id/create_recipe",
    permissions_matcher: ROUTE_MATCHERS.CreateNewRecipeRun,
    required_permissions: [PERMISSIONS.CREATE_INVESTMENT_RUN]
  },
  CreateDeposit: {
    router_string: "/investments/:investment_id/deposit",
    permissions_matcher: ROUTE_MATCHERS.CreateDeposit,
    required_permissions: [PERMISSIONS.CREATE_INVESTMENT_RUN]
  },

  // System settings
  ChangeSettingValues: {
    router_string: "/settings/:setting_id",
    permissions_matcher: ROUTE_MATCHERS.ChangeSettingValues,
    required_permissions: [PERMISSIONS.CHANGE_SETTING_VALUES]
  },
  ViewSettingValues: {
    router_string: "/settings",
    permissions_matcher: ROUTE_MATCHERS.ViewSettingValues,
    required_permissions: [PERMISSIONS.VIEW_SETTING_VALUES]
  },

  CheckAuth: {
    router_string: "/users/login/check",
    permissions_matcher: ROUTE_MATCHERS.CheckAuth,
    required_permissions: [PERMISSIONS.VIEW_USERS]
  },
};