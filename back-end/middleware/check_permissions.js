"use strict";

//test to match only routes that end in "me" or have "me" as id, 
//not part of other word
//so users/me and /users/me/do_thing match, /users/meteorite does not
const pure_me_exp = /\/(me(?!\w+))/;

let check_permissions = async function(req, res, next) {
  let route = Object.values(ROUTES).find(route => {
    if (typeof route.permissions_matcher === "undefined") {
      debugger;
    }
    return route.permissions_matcher.test(req.path);
  });
  
  if (route) {
    console.log("Matched route: %o", route);
    let user = req.user;
    //copy of permissions array
    let reqPermissions = route.required_permissions;
    //mathed "me!"
    if (pure_me_exp.test(req.path)) {
      console.log("Matched 'me', skipping personal permissions...")
      reqPermissions = _.difference(reqPermissions, PERMISSIONS.PERSONAL);
    }
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