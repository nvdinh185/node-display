"use strict"

/**
 * dua vao token of user lay menu phu hop
 */

const router = require('express').Router();

const tokenHandler = require('../../utils/token-proxy');
const postHandler = require('../../utils/post-handler');

const handlers = require('../../handlers/mlmt/site-manager-handler');

///mlmt/site-admin/get-menu
router.get('/get-role'  //?function='create-cycle'
    , tokenHandler.getTokenNext    //lay token xem
    , tokenHandler.verifyProxyTokenNext //lay req.user tu req.token new co
    , handlers.setFunctionFromParam //req.functionCode = create-cycle (chuoi tu ?function_string=)
    , handlers.checkFunctionRoleReturn //kiem tra quyen cua user trong bang admin_roles
);

router.get('/get-menu'
    , tokenHandler.getTokenNext    //lay token xem
    , tokenHandler.verifyProxyTokenNext //lay req.user tu req.token new co
    , handlers.getUserMenu             //lay menu theo user cua token neu co
);

//liet ke cac file bao duong
router.get('/get-json-cycles'
    , tokenHandler.getTokenNext    //req.token
    , tokenHandler.verifyProxyTokenNext //lay req.user tu req.token new co
    , handlers.getMaintenanceCycles       //lay Chu ky bao duong
);

//post chu ky bao duong
router.post('/create-cycle'
    , tokenHandler.getToken    //req.token
    , tokenHandler.verifyProxyToken //lay req.user tu req.token new co
    , handlers.setFunctionFromPath //req.functionCode = create-cycle (chuoi url cuoi)
    , handlers.checkFunctionRole //kiem tra quyen cua user trong bang admin_roles    
    , postHandler.jsonProcess // kqua tra ve la req.json_data
    , handlers.postMaintenanceCycles       //lay Chu ky bao duong
);

//liet ke cac file bao duong
router.get('/maintenance-sites'
    , tokenHandler.getTokenNext    //req.token
    , tokenHandler.verifyProxyTokenNext //lay req.user tu req.token new co
    , handlers.getMaintenanceSites             //lay menu theo user cua token neu co
);

router.get('/search-sites'
    , tokenHandler.getToken    //req.token
    , tokenHandler.verifyProxyToken //lay req.user tu req.token new co
    , handlers.getSearchSites             //tim kiem site theo keyword
);

//post site ke hoach bao duong
router.post('/site-plan'
    , tokenHandler.getToken    //req.token
    , tokenHandler.verifyProxyToken //lay req.user tu req.token new co   
    , postHandler.jsonProcess // kqua tra ve la req.json_data
    , handlers.postSiteToPlan       //lay Site
);

router.get('/maintenance-list'
    // , tokenHandler.getTokenNext    //req.token
    // , tokenHandler.verifyProxyTokenNext //lay req.user tu req.token new co
    , handlers.getMaintenanceList 
);

//lay thong tin user cho select box
router.get('/get-users'
    , tokenHandler.getTokenNext    //req.token
    , tokenHandler.verifyProxyTokenNext //lay req.user tu req.token new co
    , handlers.getUsers       //lay thong tin user
);

//lay du lieu de hien thi form bao duong
router.get('/get-maintenance-sheet'
    , tokenHandler.getTokenNext    //req.token
    , tokenHandler.verifyProxyTokenNext //lay req.user tu req.token new co
    , handlers.getMaintenanceList       //lay du lieu form bao duong
);

module.exports = router;