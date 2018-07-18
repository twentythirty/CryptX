'use strict';

const adminViewService = require('../services/AdminViewsService');

const fetchColLOV = async function (req, res) {
  let lov = await adminViewService.fetchMockHeaderLOV();

  return ReS(res, {
    lov
  });
};
module.exports.fetchColLOV = fetchColLOV;