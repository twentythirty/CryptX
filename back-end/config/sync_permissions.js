'use strict';

const Permission = require('../models').Permission;
const PermissionsCategory = require('../models').PermissionsCategory;

const addMissingPerms = async () => {

  let permissions_codes_in_code = Object.keys(all_permissions);

  let permissions_codes_in_db = (await Permission.findAll({
    where: {
      code: permissions_codes_in_code
    }
  })).map(perm => perm.code);

  let permissions_missing_in_db = _.difference(permissions_codes_in_code, permissions_codes_in_db);

  if (permissions_missing_in_db.length) {
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


const addMissingCategories = async () => {

  const category_names_code = Object.values(PERMISSIONS_CATEGORIES);

  const category_names_db = _.map(await PermissionsCategory.findAll({}), 'name');

  const missing_categories_db = _.difference(category_names_code, category_names_db);

  if (missing_categories_db.length) {
    let [err, categories] = await to(Promise.all(
      missing_categories_db.map(name => {
        return PermissionsCategory.create({
          name: name
        });
      })
    ));

    if (err)
      console.error(err);
    else
      console.log(`Added missing DB categories: ${missing_categories_db}`);
  }
};






const getPermCatId = (perm, category_name_id) => {
  //get id of category with name specified in code as having this group
  const category_name = _.findKey(CATEGORY_TO_PERM_ASSOC, perms => perms.includes(perm.code));
  return category_name_id[category_name];
}

const mapPermCats = (perms, category_name_id) => {
  return _.map(perms, perm => {
    return Permission.build({
      id: perm.id,
      name: perm.name,
      code: perm.code,
      category_id: getPermCatId(perm, category_name_id)
    }, {
      isNewRecord: false
    });
  });
}

const addMissingAssociations = async () => {

  //object of category id:name fields
  const category_name_id = _.fromPairs(
    _.map(await PermissionsCategory.findAll({}), category => [category.name, category.id])
  );
  const all_perms = await Permission.findAll({});

  //process permissions without group - just assign groups to them, simplest case
  const perm_no_cat = _.filter(all_perms, perm => perm.category_id == null);
  const perm_with_cat = _.difference(all_perms, perm_no_cat);
  //assign future group to perms without altering original lists
  const perm_add_cat = mapPermCats(perm_no_cat, category_name_id);
  const perm_change_cat = mapPermCats(perm_with_cat, category_name_id);

  let err, perms;

  //directly save all added associations
  if (perm_add_cat.length) {

    [err, perms] = await to(Promise.all(_.map(perm_add_cat, perm => perm.save())));

    if (err) {
      console.error(err);
    } else {
      console.log(`Added categories to permissions ${_.map(perms, 'code')}`)
    }
  }

  //check changed associations - save only if the change really altered something
  if (perm_change_cat.length) {
    //for faster lookup in comparison
    const perm_by_id = _.keyBy(perm_with_cat, 'id');

    const perm_true_change_cat = _.filter(perm_change_cat, (perm) => {
      return perm.category_id != perm_by_id[perm.id].category_id
    });

    if (perm_true_change_cat.length) {

      [err, perms] = await to(Promise.all(_.map(perm_true_change_cat, perm => perm.save())));

      if (err) {
        console.error(err);
      } else {
        console.log(`Changed categories for permissions ${_.map(perms, 'code')}`)
      }
    }
  }
};


/**
 *  Synchronizes permissions in database with permissions defined
 * in code. It solves an issue where migration executes only once
 * adds all permissions only when migration is first executed, but
 * if we add more permissions along the way, they need to be inserted
 * too. This compares list of permissions in database with ones 
 * defined in code and inserts permissions missing into database.
 */
module.exports = async function () {

  //1. add missing permissions
  return addMissingPerms().then(done => {
    //2. add missing categories
    return addMissingCategories();
  }).then(done => {
    //3. (re-)associate them all, not touching correct associations
    return addMissingAssociations();
  }).then(done => {
    console.log("system permissions sync done!");
  });
};