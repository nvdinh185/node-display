const router = require('express').Router();

const postHandler = require('../utils/post-handler');
const siteHandler = require('../handlers/site-handler').oracleHandler;
const tokenHandler = require('../utils/token-handler');


//cap key khi co token xac thuc bang isdn
router.get('/get-site'
                        // , tokenHandler.getToken  //tiền xử lý token 
                        // , tokenHandler.tokenVerify //lay req.user
                        , siteHandler.getSite
);

router.get('/get-100-site'
                        // , tokenHandler.getToken  //tiền xử lý token 
                        // , tokenHandler.tokenVerify //lay req.user
                        , siteHandler.get100Site
);
                   
                        
module.exports = router;