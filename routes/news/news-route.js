const router = require('express').Router();

const postHandler = require('../../utils/post-handler');
const tokenHandler = require('../../utils/token-proxy');

const resourceHandler = require('../../handlers/news/news-handler');

let handlers = resourceHandler.ResourceHandler;


router.post('/post-news'
    , tokenHandler.getToken          //lay req.token
    , tokenHandler.verifyProxyToken  //lay req.user
    , postHandler.formProcess        //lay req.form_data
    , handlers.postNewsFiles        //luu csdl
);
router.get('/get-public-news'
    , handlers.getPublicNewsList
);
router.get('/get-news'
    , tokenHandler.getToken
    , tokenHandler.verifyProxyToken
    , handlers.getPrivateNewsList
);
router.get('/get-file/*'
    //, tokenHandler.getToken
    //, tokenHandler.verifyProxyToken
    , handlers.getMediaFile
);

module.exports = router;