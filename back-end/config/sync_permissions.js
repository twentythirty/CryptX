'use strict';

/**
 *  Synchronizes permissions in database with permissions defined
 * in code. It solves an issue where migration executes only once
 * adds all permissions only when migration is first executed, but
 * if we add more permissions along the way, they need to be inserted
 * too. This compares list of permissions in database with ones 
 * defined in code and inserts permissions missing into database.
*/
module.exports = async function () {
  const Permission = require('../models').Permission;

  let permissions_in_code = _.map(all_permissions, (name, code) => ({
      code: code
    }));

  let permissions_in_db = await Permission.findAll({
    where: {
      code: permissions_in_code.map(perm => perm.code)
    }
  });

  permissions_in_db = permissions_in_db.map(perm => perm.code);

  let permissions_missing_in_db = _.difference(permissions_in_code.map(perm => perm.code), permissions_in_db);

  if(permissions_missing_in_db.length) {
    let [err, permissions] = await to(Promise.all(
      permissions_missing_in_db.map(perm_code => {
        return Permission.create({
          code: perm_code,
          name: all_permissions[perm_code]
        });
      })
    ));

    if (err)
      console.error(err);
    else 
      console.log(`Added permissions_missing_in_db permissions to DB: ${permissions_missing_in_db}`);
  }
};