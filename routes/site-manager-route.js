"use strict"

/**
 * upload-files; list-files; get-file
 * sys,func,dir/file_name,file_type,file_date,file_size/ip,user,time,status
 */

const router = require('express').Router();

const postHandler = require('../utils/post-handler');
const tokenHandler = require('../utils/token-handler');
const proxyHandler = require('../handlers/proxy-handler');

const handlers = require('../handlers/site-manager-handler').Handler;

router.get('/get-menu'
    // , tokenHandler.getToken          //lay req.token
    // , proxyHandler.verifyProxyToken  //lay req.user
    , handlers.getMenu        //lay menu
);

module.exports = router;