//initial constants
PERMISSIONS = {
  ALTER_ROLES: "perm_alter_user_roles",
  ALTER_PERMS: "perm_alter_role_perm",
  VIEW_USERS: "perm_view_users",
  CREATE_USER: "perm_create_user"
};

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
all_permissions[PERMISSIONS.VIEW_USERS] =
  "Permission to view infomration of other system users";
all_permissions[PERMISSIONS.CREATE_USER] =
  "Permission to create new system users";

all_roles = Object.values(ROLES);

ROUTES = {
  Login: {
    router_string: "/users/login",
    permissions_matcher: /\/users\/login/,
    required_permissions: []
  },
  GetMyInfo: {
    router_string: "/users/me",
    permissions_matcher: /\/users\/me/,
    required_permissions: []
  },
  GetUserInfo: {
    router_string: "/users/:user_id",
    permissions_matcher: /\users\/\d+$/,
    required_permissions: [PERMISSIONS.VIEW_USERS]
  },
  ChangeUserRole: {
    router_string: "/users/:user_id/change_role",
    permissions_matcher: /\/users\/\d+\/change_role/,
    required_permissions: [PERMISSIONS.VIEW_USERS, PERMISSIONS.ALTER_ROLES]
  },
  ChangeRolePermissions: {
    router_string: "/roles/:role_id/change_perms",
    permissions_matcher: /\roles\/\d+\/change_perms/,
    required_permissions: [PERMISSIONS.ALTER_PERMS]
  },
  CreateUser: {
    router_string: "/users/create",
    permissions_matcher: /\/users\/create/,
    required_permissions: [
      PERMISSIONS.CREATE_USER
    ]
  },
  ChangePassword: {
    router_string: "/users/me/change_password",
    permissions_matcher: /\/users\/me\/change_password/,
    required_permissions: []
  }
};