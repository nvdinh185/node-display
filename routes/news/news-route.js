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
router.get('/get-public-news'
    , handlers.getPublicNewsList
);
router.get('/get-news'
    , tokenHandler.getToken
    , proxyHandler.verifyProxyToken
    , handlers.getPrivateNewsList
);
router.get('/get-file/*'
    //, tokenHandler.getToken
    //, proxyHandler.verifyProxyToken
    , handlers.getMediaFile
);

module.exports = router;