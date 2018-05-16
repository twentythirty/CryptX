//initial constants
PERMISSIONS = {
  ALTER_ROLES: "perm_alter_user_roles",
  ALTER_PERMS: "perm_alter_role_perm",
  VIEW_ROLES: "perm_view_roles",
  VIEW_USERS: "perm_view_users",
  EDIT_USERS: "perm_edit_users",
  DELETE_USER: "perm_delete_users",
  CREATE_USER: "perm_create_user"
};
//list of permissions that dotn apply to users
//as long as they are altering themselves
PERMISSIONS.PERSONAL = [PERMISSIONS.VIEW_USERS, PERMISSIONS.EDIT_USERS];

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
  "Permission to view infomration of other system users";
all_permissions[PERMISSIONS.EDIT_USERS] =
  "Permission to edit basic user information";
all_permissions[PERMISSIONS.DELETE_USER] =
  "Permission to delete users";
all_permissions[PERMISSIONS.CREATE_USER] =
  "Permission to create new system users";

all_roles = Object.values(ROLES);

ROUTES = {
  CreateUser: {
    router_string: "/users/create",
    permissions_matcher: /\/users\/create/,
    required_permissions: [PERMISSIONS.CREATE_USER]
  },
  InviteUser: {
    router_string: "/users/invite",
    permissions_matcher: /\/users\/invite/,
    required_permissions: [PERMISSIONS.CREATE_USER]
  },
  DeleteUserInfo: {
    router_string: "/users/rm/:user_id",
    permissions_matcher: /\users\/rm\/(\d+|me)$/,
    required_permissions: [PERMISSIONS.VIEW_USERS, PERMISSIONS.DELETE_USER]
  },
  //a route that does not require permissions by deisgn
  //return invitation info by email token. Called by browser
  //for somebody who doesnt have a user account yet
  InvitationByToken: {
    router_string: "/users/invitation",
    permissions_matcher: /\/users\/invitation/,
    required_permissions: []
  },
  CreateUserByInvite: {
    router_string: '/users/create-invited',
    permissions_matcher: /\/users\/create-invited/,
    required_permissions: []
  },
  Login: {
    router_string: "/users/login",
    permissions_matcher: /\/users\/login/,
    required_permissions: []
  },
  GetUserInfo: {
    router_string: "/users/:user_id",
    permissions_matcher: /\/users\/(\d+|me)$/,
    required_permissions: [PERMISSIONS.VIEW_USERS]
  },
  GetUsersInfo: {
    router_string: "/users/all",
    permissions_matcher: /\/users\/all\/list/,
    required_permissions: [PERMISSIONS.VIEW_USERS]
  },
  ChangeUserInfo: {
    router_string: "/users/:user_id/edit",
    permissions_matcher: /\/users\/(\d+|me)\/edit/,
    required_permissions: [PERMISSIONS.VIEW_USERS, PERMISSIONS.EDIT_USERS]
  },
  ChangeUserRole: {
    router_string: "/users/:user_id/change_role",
    permissions_matcher: /\/users\/(\d+|me)\/change_role/,
    required_permissions: [PERMISSIONS.VIEW_USERS, PERMISSIONS.ALTER_ROLES]
  },
  CreateUser: {
    router_string: "/users/create",
    permissions_matcher: /\/users\/create/,
    required_permissions: [PERMISSIONS.CREATE_USER]
  },
  ChangePassword: {
    router_string: "/users/:user_id/change_password",
    permissions_matcher: /\/users\/(\d+|me)\/change_password/,
    required_permissions: [PERMISSIONS.VIEW_USERS]
  },
  SendPasswordResetToken: {
    router_string: "/send_reset_token",
    permissions_matcher: /\/send_reset_token/,
    required_permissions: []
  },
  CheckPasswordResetToken: {
    router_string: "/password_reset/:token",
    permissions_matcher: /\/password_reset\/\w+/,
    required_permissions: []
  },

  // Roles
  GetRoleInfo: {
    router_string: "/roles/:role_id",
    permissions_matcher: /\/roles\/\d+$/,
    required_permissions: [PERMISSIONS.VIEW_ROLES]
  },
  GetRolesInfo: {
    router_string: "/roles/all",
    permissions_matcher: /\/roles\/all\/list/,
    required_permissions: [PERMISSIONS.VIEW_ROLES]
  },
  EditRole: {
    router_string: "/roles/:role_id/edit",
    permissions_matcher: /\/roles\/\d+\/edit/,
    required_permissions: [PERMISSIONS.ALTER_PERMS]
  },
  CreateRole: {
    router_string: "/roles/create",
    permissions_matcher: /\/roles\/create/,
    required_permissions: [PERMISSIONS.ALTER_ROLES, PERMISSIONS.VIEW_ROLES]
  },
  DeleteRole: {
    router_string: "/roles/:role_id/delete",
    permissions_matcher: /\/roles\/\d+\/delete/,
    required_permissions: [PERMISSIONS.ALTER_ROLES, PERMISSIONS.VIEW_ROLES]
  }
};