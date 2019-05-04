const router = require('express').Router();

const postHandler = require('../utils/post-handler');
const oracleHandler = require('../handlers/user-handler').oracleHandler;
const tokenHandler = require('../utils/token-handler');


//cap key khi co token xac thuc bang isdn
router.get('/key-json', oracleHandler.getPublickeyJson);

router.post('/key-device-json'
                      , postHandler.jsonProcess
                      , oracleHandler.getDeviceKey
                      );

router.post('/key-device'
                      , postHandler.jsonProcess
                      , oracleHandler.decryptedData
                      , oracleHandler.saveDeviceKey
                      );


//gui len so thue bao --> tra ve token temp -> key --> 1h 
router.post('/request-isdn', postHandler.jsonProcess
                           , oracleHandler.requestIsdn);

//gui len so thue bao --> tra ve token temp -> key --> 1h 
router.post('/send-sms'
                       , postHandler.jsonProcess  //xu ly du lieu nguoi dung post len
                       , tokenHandler.getToken  //tiền xử lý token
                       , tokenHandler.tokenVerify //verify thanh cong se co req.user
                       , oracleHandler.sendSMS);   //thuc hien nhan tin

//gui len token temp, key xac thuc -- tra ve token 24h
router.post('/confirm-key'
                          , postHandler.jsonProcess  //nhan ma OTP de verify req.json_data
                          , (req,res,next)=>{
                            req.keyOTP = req.json_data.key; //gan OTP de verify
                            next()
                          }
                          , tokenHandler.getToken  //tiền xử lý req.token
                          , tokenHandler.tokenVerify //verify token thanh cong se co user.req
                          , oracleHandler.confirmKey);

//xac thuc xem token do co dung la may chu nay cap khong?, tra ve true or false thoi
//chuyen doi data --> req.token (khong chua bear)
router.post('/authorize-token'
                              , postHandler.jsonProcess //lay du lieu kem token=
                              , tokenHandler.getToken  //tiền xử lý req.token
                              , tokenHandler.tokenVerify //verify   
                              , oracleHandler.authorizeToken
                              , oracleHandler.getUserInfo); 

//chi co quyen admin moi truy van alive-session
router.get('/alive-session'
                           //, tokenHandler.getToken  //tiền xử lý token
                           , oracleHandler.getAliveSession);

router.get('/get-users-info'
                           , tokenHandler.getTokenNext  //tra ve req.token neu co
                           , tokenHandler.tokenVerifyNext //xac thuc tra ve req.user neu co
                           , oracleHandler.getUsersInfo);

router.post('/post-users-info'
                           , postHandler.jsonProcess  //tra ve json_data
                           , tokenHandler.getToken  //req.token
                           , tokenHandler.tokenVerify //req.user
                           , oracleHandler.postUsersInfo);

router.post('/save-user-info'
                           , postHandler.jsonProcess //neu co token moi xu ly
                           , tokenHandler.getToken  //tiền xử lý token
                           , tokenHandler.tokenVerify
                           , oracleHandler.saveUserInfo
                           , oracleHandler.getUserInfo);
                   

router.post('/save-your-contacts'
                        , tokenHandler.getToken  //tiền xử lý token
                        , tokenHandler.tokenVerify
                        , postHandler.jsonProcess
                        , oracleHandler.saveYourContacts
                        )                        

router.get('/get-your-contacts'
                        , tokenHandler.getToken  //tiền xử lý token 
                        , tokenHandler.tokenVerify //lay req.user
                        , oracleHandler.getYourContacts
                        ) 

router.post('/save-your-friends'
                        , tokenHandler.getToken  //tiền xử lý token
                        , tokenHandler.tokenVerify
                        , postHandler.jsonProcess
                        , oracleHandler.saveYourFriends
                        )                        

router.get('/get-your-friends'
                        , tokenHandler.getToken  //tiền xử lý token 
                        , tokenHandler.tokenVerify //lay req.user
                        , oracleHandler.getYourFriends
                        )    

router.post('/save-your-ids'
                        , tokenHandler.getToken  //tiền xử lý token
                        , tokenHandler.tokenVerify
                        , postHandler.jsonProcess
                        , oracleHandler.saveYourIds
                        )                        

router.get('/get-your-ids'
                        , tokenHandler.getToken  //tiền xử lý token 
                        , tokenHandler.tokenVerify //lay req.user
                        , oracleHandler.getYourIds
                        )                        
                        
module.exports = router;