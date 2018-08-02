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
    let req_permissions = route.required_permissions;
    //mathed "me!"
    if (pure_me_exp.test(req.path)) {
      console.log("Matched 'me', skipping personal permissions...")
      req_permissions = _.difference(req_permissions, PERMISSIONS.PERSONAL);
    }
    let roles = await user.getRoles();
    let permissions_list = await Promise.all(
      roles.map(role => role.getPermissions())
    );
    let my_permissions = _.flatMap(permissions_list, list =>
      list.map(permission => permission.code)
    );
    const lacking_permissions = _.difference(req_permissions, my_permissions);
    //all permissions present, we good
    if (_.isEmpty(lacking_permissions)) {
      return next();
    } else {
      if (process.env.NODE_ENV == 'production') {
        return ReE(res, "Missing required permissions for path!", 403);
      } else {
        return ReE(res, {
          reason: `Missing required permissions for route regex ${route.permissions_matcher}`,
          need_permissions: req_permissions,
          missing_permissions: lacking_permissions,
          present_permissions: my_permissions
        }, 403)
      }
    }
  }

  //route has no security set up, move along
  return next();
};
module.exports.check_permissions = check_permissions;