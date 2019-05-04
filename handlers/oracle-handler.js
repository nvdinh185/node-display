"use strict"

const service_key = "api-admin-gate";

const tokenHandler = require('../utils/token-handler');

const OracleDAO = require("../db/oracle/oracle-dao");

const dbConfig = {
    poolAlias: 'UserPool',//ten cua pool
    user: 'taxi_owner',      //username to oracle
    password: 'taxi',        //password to oracle
    //connection String to oracle = tnsname
    connectString: "(DESCRIPTION=(LOAD_BALANCE=on)\
                                        (ADDRESS_LIST=\
                                                (ADDRESS=(PROTOCOL=TCP)(HOST=10.151.59.91)(PORT=1521))\
                                                (ADDRESS=(PROTOCOL=TCP)(HOST=10.151.59.92)(PORT=1521))\
                                        )\
                                        (CONNECT_DATA=(SERVICE_NAME=BUSINESS))\
                                    )",
    poolMax: 2,             //so luong pool max
    poolMin: 2,             //so luong pool min
    poolIncrement: 0,       //so luong pool tang len neu co
    poolTimeout: 4          //thoi gian pool timeout
}

const db = new OracleDAO(dbConfig);


//lưu tất cả các session đã sign, verify bởi hệ thống kể từ khi hệ thống khởi động
var aliveSession = [];
const isVerifyAlive = false;


class OracleHandler {

    getAliveSession(req, res, next) {
        let returnSession = [];

        aliveSession.forEach(el => {

            returnSession.push({
                time: el.time,
                last_time: el.last_time,
                user_info: tokenHandler.getInfoFromToken(el.token),
                status: el.status,
                hacker_online: el.hacker_online,
                current_time: new Date().getTime(),
                token: el.token
            })

            //kiem tra session nao het hieu luc thi xoa di

        })

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(returnSession));

    }

    /**
     * doc csdl lay public key ra
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    getPublickeyJson(req, res, next) {

        db.getRst("select service_id\
                                ,public_key\
                                ,service_name\
                                ,is_active\
                                from server_keys\
                                where service_id='"+ service_key + "'")
            .then(row => {
                if (row) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(row));
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(JSON.stringify({ message: 'No public_key init on server!' }));
                }
            })
            .catch(err => {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(JSON.stringify({ message: 'select db error', error: err }));
            })

    }

    /**
     * ham nhan yeu cau tu so thue bao
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    requestIsdn(req, res, next) {
        let test_phone = '123456789';

        if (req.json_data && req.json_data.phone) {
            let keyOTP = Math.random().toString(36).substring(2, 8).toUpperCase();
            req.json_data.key = keyOTP;
            req.json_data.sms = 'Mat khau OTP cua ban la: ' + keyOTP
            //console.log('req.json_data new: ',req.json_data); //da dich duoc json
            db.executeJavaFunction('sms_owner.send_sms_vlr_mnp', [req.json_data.phone, req.json_data.sms, 'MobiFone3', 8])
                .then(data => { //data la mot string kieu json
                    let jsonDBReturn;
                    try { jsonDBReturn = JSON.parse(data); } catch (e) { jsonDBReturn = data }
                    if (jsonDBReturn.status == 1 //so dien thoai thuoc VLR Cty3 hoac MNP thanh cong!
                        ||
                        (jsonDBReturn.status === 0 // hoặc chỉ cho guest test key
                            && req.json_data.phone === test_phone)) {
                        let token = tokenHandler.tokenSign(req);

                        let jsonReturn = {
                            database_out: { status: jsonDBReturn.status, message: req.json_data.phone === test_phone ? jsonDBReturn.message : '' },
                            token: token
                        };

                        aliveSession.push({
                            time: new Date().getTime(),
                            token: token
                        })

                        console.log('data return', aliveSession.length, jsonReturn); //xen log

                        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                        res.end(JSON.stringify(jsonReturn));

                    } else {
                        //nem loi sang catch sau
                        throw 'Số điện thoại phải bật máy tại Mobifone vùng 3 hoặc Chuyển mạng Mobifone giữ nguyên số thành công';
                    }
                })
                .catch(err => {
                    res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(JSON.stringify({ message: 'Oracle Error', error: err }));
                });
        } else {
            res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(JSON.stringify({ message: 'No json_data for Request phone!', error: 'No json_data for Request phone!' }));
        }
    }


    /**
     * xac thuc mot otp
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    confirmKey(req, res, next) {

        if (req.json_data && req.json_data.key && req.token) {

            let session = aliveSession.find(x => x.token === req.token);

            if (session || !isVerifyAlive) {
                if (req.user) {
                    //token cap 365ngay x 24h
                    let tokenConfirmed = tokenHandler.tokenSign(req, '8760h', true);
                    let jsonReturn = {
                        token: tokenConfirmed,
                        status: 1,
                        message: 'You are verified!'
                    };

                    aliveSession.splice(aliveSession.indexOf(session), 1);

                    //ghi moi mot token 24h
                    aliveSession.push({
                        time: new Date().getTime(),
                        token: tokenConfirmed
                    })

                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify(jsonReturn));

                } else {
                    res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ message: 'your key/token invalid!' }));
                }
            } else {
                res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ message: 'No Session init in Serer!' }));
            }


        } else {
            res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ message: 'No json_data for confirm!' }));
        }
    }

    authorizeToken(req, res, next) {

        if (req.json_data && req.token) {

            let session = aliveSession.find(x => x.token === req.token);

            if (session || !isVerifyAlive) {

                if (req.user) {
                    if (session) {
                        session.last_time = new Date().getTime();
                        session.status = true;
                    } else {
                        //neu khong kiem tra online (restart thi xac thuc xong them vao)
                        aliveSession.push({
                            token: req.token,
                            time: req.user ? req.user.local_time : new Date().getTime(),
                            last_time: new Date().getTime(),
                            status: true
                        })
                    }

                    next();

                } else {

                    if (session) {
                        session.last_time = new Date().getTime();
                        session.status = false; //hacker thu session cua minh
                        session.hacker_online = req.clientIp;
                    }

                    res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ message: 'your key/token invalid!' }));
                }
            } else {
                res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ message: 'No Session init in Serer!' }));
            }

        } else {
            res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ message: 'No json_data for confirm!' }));
        }
    }

    /**
     * gui tin nhan
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    sendSMS(req, res, next) {
        if (req.json_data && req.json_data.phone && req.json_data.sms) {
            db.executeJavaFunction('sms_owner.send_sms_vlr_mnp', [req.json_data.phone, req.json_data.sms, 'MobiFone3', 8])
                .then(data => { //data la mot string kieu json
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(data));
                })
                .catch(err => {
                    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(JSON.stringify({ message: 'Error for send sms', error: err }));
                });
        } else {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(JSON.stringify({ message: 'No json_data for send sms!' }));
        }
    }


    /**
     * luu user vao may chu
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    saveUserInfo(req, res, next) {
        db.executeJavaFunction('pkg_user.update_user_info'
            , [
                req.user.username
                , req.json_data.name
                , req.json_data.nickname
                , req.json_data.address
                , req.json_data.phone
                , req.json_data.email
                , req.json_data.image
                , req.json_data.background
                , req.clientIp
            ])
            .then(data => {
                let result = JSON.parse(data);
                if (result.status == 1) {
                    next()
                } else {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 0, result: result }));
                }
            })
            .catch(err => {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(err));
            })
    }


    /**
     * luu contacts cua user vao
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    saveYourContacts(req, res, next) {

        var insertTable = {
            name: 'admin_users_contacts',
            cols: [
                {
                    name: 'username',
                    value: req.user.username
                }
                ,
                {
                    name: 'contacts',
                    value: JSON.stringify(req.json_data)
                }
                ,
                {
                    name: 'update_time',
                    value: new Date().getTime()
                }
            ]
            ,
            wheres: [{
                name: 'username',
                value: req.user.username
            }
            ]
        }

        db.insert(insertTable)
            .then(data => {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ status: 1, result: data }));
            })
            .catch(err => {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(err));
            })
    }


    /**
     * get contacts cua user
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    getYourContacts(req, res, next) {
        let oracledb = require('oracledb');
        db.runSql("select contacts from\
                                        admin_users_contacts\
                                        where username=:username",
            { username: req.paramS.user ? req.paramS.user : req.user ? req.user.username : "" },
            { fetchInfo: { "CONTACTS": { type: oracledb.STRING } } })
            .then(data => {
                if (data.rows.length > 0 && data.rows[0].length > 0) {
                    return JSON.parse(data.rows[0][0])
                } else {
                    return []
                }

            })
            .then(data => {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ status: 1, result: data }, function (key, value) { return (value === undefined || value === null || value === "") ? undefined : value }));
            })
            .catch(err => {
                console.log('error all', err);
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(err));
            })
    }


    /**
     * lay thong tin cua user
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    getUserInfo(req, res, next) {

        if (req.user) {
            db.getRst("SELECT username, role, fullname, nickname,\
                                address, email, phone, image, background, start_time,\
                                end_time, change_time, last_access_ip, last_access_time,\
                                is_active\
                        FROM admin_users\
                        where username = '" + (req.user ? req.user.username : "123456789") + "'")
                .then(data => {
                    req.user.data = data;
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({
                        status: 1,
                        message: 'You are verified!',
                        user_info: req.user
                    }
                        , (key, value) => {
                            if (value === null) { return undefined; }
                            return value
                        }
                    ));
                })
                .catch(err => {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(err));
                })
        } else {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: "No user request" }));
        }
    }

}

module.exports = {
    oracleHandler: new OracleHandler()
};