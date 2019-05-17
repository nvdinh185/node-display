"use strict"

/**
 * upload-files; list-files; get-file
 * sys,func,dir/file_name,file_type,file_date,file_size/ip,user,time,status
 */

const router = require('express').Router();

const postHandler = require('../utils/post-handler');
const tokenHandler = require('../utils/token-proxy');

const resourceHandler = require('../handlers/media-handler');

let handlers = resourceHandler.ResourceHandler;

router.get('/get-file/*'
    //, tokenHandler.getToken
    //, tokenHandler.verifyProxyToken
    , handlers.getMediaFile
); 

router.get('/get-private'
    , tokenHandler.getToken
    , tokenHandler.verifyProxyToken
    , handlers.getPrivateFile
    , handlers.getAnyImageFile
); 


router.get('/list-files'
    , tokenHandler.getToken
    , tokenHandler.verifyProxyToken
    , handlers.getMediaList
    );   
    
    //get publics files
router.get('/public-files'
    , handlers.getMediaList
    );   

router.post('/public-files'
    , postHandler.jsonProcess //lay du lieu req.json_data.friends/follows/publics/limit/offset
    , tokenHandler.getTokenNext   //lay du lieu req.token neu co, 
    , tokenHandler.verifyProxyTokenNext //lay req.user tu req.token new co
    , handlers.postMediaListAll //lay tin tuc tu req.user?, publics, follows, friends, 
);       
    
    
router.get('/list-groups'
    , tokenHandler.getToken
    , tokenHandler.verifyProxyToken
    , handlers.getGroupList
    );   
    
router.get('/public-groups'
    , handlers.getGroupList
    );   
    

router.post('/public-groups'
        , postHandler.jsonProcess //lay du lieu req.json_data.friends/follows/publics/limit/offset
        , tokenHandler.getTokenNext   //lay du lieu req.token neu co, 
        , tokenHandler.verifyProxyTokenNext //lay req.user tu req.token neu co
        , handlers.postGroupListAll //lay tin tuc tu req.user?, publics, follows, friends, 
    );   

router.post('/upload-files'
    , tokenHandler.getToken          //lay req.token
    , tokenHandler.verifyProxyToken  //lay req.user
    , postHandler.formProcess        //lay req.form_data
    , handlers.postMediaFiles        //luu csdl
);

router.post('/set-function'
    , tokenHandler.getToken          //lay req.token
    , tokenHandler.verifyProxyToken  //lay req.user
    , postHandler.jsonProcess        //lay req.json_data
    , handlers.postSetFunction        //luu csdl
);

module.exports = router;