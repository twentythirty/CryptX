//initial constants
PERMISSIONS = {
  ALTER_ROLES: "perm_alter_user_roles",
  ALTER_PERMS: "perm_alter_role_perm"
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

all_roles = Object.values(ROLES);
