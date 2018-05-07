"use strict";

let check_permissions = async function(req, res, next) {
  let route = Object.values(ROUTES).find(route => {
    return route.permissions_matcher.test(req.path);
  });
  console.log("Matched route: %o", route);

  if (route) {
    let user = req.user;
    let reqPermissions = route.required_permissions;
    let roles = await user.getRoles();
    let permissionsLists = await Promise.all(
      roles.map(role => role.getPermissions())
    );
    let myPermissions = _.flatMap(permissionsLists, list =>
      list.map(permission => permission.code)
    );

    //all permissions present, we good
    if (reqPermissions.every(perm => myPermissions.includes(perm))) {
      return next();
    } else {
      return ReE(res, "Missing required permissions for path!", 403);
    }
  }

  //route has no security set up, move along
  return next();
};
module.exports.check_permissions = check_permissions;