"use strict"

/**
 * dua vao token of user lay menu phu hop
 */

const router = require('express').Router();

const tokenHandler = require('../../utils/token-handler');
const postHandler = require('../../utils/post-handler');
const proxyHandler = require('../../handlers/proxy-handler');

const handlers = require('../../handlers/mlmt/site-manager-handler');

///mlmt/site-admin/get-menu
router.get('/get-menu'
    , tokenHandler.getTokenNext    //lay token xem
    , proxyHandler.verifyProxyTokenNext //lay req.user tu req.token new co
    , handlers.getUserMenu             //lay menu theo user cua token neu co
);

//liet ke cac file bao duong
router.get('/get-json-cycles'
    , tokenHandler.getTokenNext    //req.token
    , proxyHandler.verifyProxyTokenNext //lay req.user tu req.token new co
    , handlers.getMaintenanceCycles       //lay Chu ky bao duong
);

//post chu ky bao duong
router.post('/create-cycle'
    , tokenHandler.getToken    //req.token
    , proxyHandler.verifyProxyToken //lay req.user tu req.token new co
    , handlers.setFunctionFromPath //req.functionCode = create-cycle (chuoi url cuoi)
    , handlers.checkFunctionRole //kiem tra quyen cua user trong bang admin_roles    
    , postHandler.jsonProcess // kqua tra ve la req.json_data
    , handlers.postMaintenanceCycles       //lay Chu ky bao duong
);

//liet ke cac file bao duong
router.get('/maintenance-sites'
    , tokenHandler.getTokenNext    //req.token
    , proxyHandler.verifyProxyTokenNext //lay req.user tu req.token new co
    , handlers.getMaintenanceSites             //lay menu theo user cua token neu co
);

module.exports = router;