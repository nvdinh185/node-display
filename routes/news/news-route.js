const router = require('express').Router();

const postHandler = require('../../utils/post-handler');
const tokenHandler = require('../../utils/token-handler');
const proxyHandler = require('../../handlers/proxy-handler');

const resourceHandler = require('../../handlers/news/news-handler');

let handlers = resourceHandler.ResourceHandler;


router.post('/post-news'
    , tokenHandler.getToken          //lay req.token
    , proxyHandler.verifyProxyToken  //lay req.user
    , postHandler.formProcess        //lay req.form_data
    , handlers.postNewsFiles        //luu csdl
);
router.post('/get-news'
    , postHandler.jsonProcess //lay du lieu req.json_data.friends/follows/publics/limit/offset
    , tokenHandler.getTokenNext
    , proxyHandler.verifyProxyToken
    , handlers.getNewsList //lay tin tuc tu req.user?, publics, follows, friends,
);
router.get('/get-file/*'
    //, tokenHandler.getToken
    //, proxyHandler.verifyProxyToken
    , handlers.getMediaFile
);

module.exports = router;