"use strict"

/**
 * dua vao token of user lay menu phu hop
 */

const router = require('express').Router();

const tokenHandler = require('../../utils/token-handler');

const handlers = require('../../handlers/mlmt/admin-handler');

///mlmt/site-admin/get-menu
router.get('/get-menu'
    , tokenHandler.getTokenNext    //lay token xem
    , tokenHandler.tokenVerifyNext //kiem tra token xem
    , handlers.getUserMenu             //lay menu theo user cua token neu co
);

module.exports = router;