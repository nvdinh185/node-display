"use strict"

const service_key = "api-admin-gate";
const NodeRSA = require('node-rsa');

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
     * Lay key cua client luu tru de biet thiet bi da luu chua
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    getDeviceKey(req, res, next) {
        db.getRst("select *\
                    from device_keys\
                    where id='"+ req.json_data.id + "'")
            .then(row => {
                if (row) {
                    //thuc hien update count request
                    db.runSql("update device_keys\
                                set update_count=nvl(update_count,0)+1,\
                                    update_time='"+Date.now()+"'\
                                 where id='"+ req.json_data.id + "'")
                       .then(data=>{})
                       .catch(err=>{});

                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify(row));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify(null));
                }
            })
            .catch(err => {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify(null));
            })

    }


    async decryptedData(req, res, next) {
        if (req.json_data&&req.json_data.encrypted){
            try{
                let row = await db.getRst("select private_key\
                                                  from server_keys\
                                                  where service_id='"+ service_key + "'");
                if (row&&row.private_key){
                    const keyDecryptPrivate = new NodeRSA(null, { signingScheme: 'pkcs1-sha256' });
                    keyDecryptPrivate.importKey('-----BEGIN RSA PRIVATE KEY-----\n'+row.private_key+'\n-----END RSA PRIVATE KEY-----');
                    req.json_data.decrypted = JSON.parse(keyDecryptPrivate.decrypt(req.json_data.encrypted, 'utf8'));
                }
                //console.log('du lieu da giai ma ', req.json_data.decrypted);
            }catch(e){
                //console.log('loi giai ma ', e);
            }
        }
        next();
    }

    saveDeviceKey(req, res, next) {
        //giai ma
        //req.json_data.client_key
        //lay duoc: client.id, client.ip, client.signature, client.time
        if (req.json_data&&req.json_data.decrypted){
            let client = req.json_data.decrypted;
            
            console.log('-->client data',req.json_data.decrypted);

            var insertTable = {
                name: 'device_keys',
                cols: [
                    {
                        name: 'id',
                        value: client.id
                    }
                    ,
                    {
                        name: 'time',
                        value: client.time
                    }
                    ,
                    {
                        name: 'device',
                        value: client.device
                    }
                    ,
                    {
                        name: 'ip',
                        value: client.ip
                    }
                    ,
                    {
                        name: 'origin',
                        value: client.origin
                    }
                    ,
                    {
                        name: 'signature',
                        value: client.signature
                    }
                    ,
                    {
                        name: 'create_time',
                        value: Date.now()
                    }
                ]
                ,
                wheres: [{
                    name: 'id',
                    value: client.id
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

        }else{
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({message:"No data from client to save!"}));
        }
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
                , req.json_data.broadcast_status
                
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
     * Lấy thông tin của user từ token login vào
     * thông tin này được hiển thị trên thanh login
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    getUserInfo(req, res, next) {

        if (req.user) {
            db.getRst("SELECT username, role, fullname, nickname,\
                                address, email, phone, image, background, start_time,\
                                end_time, change_time, last_access_ip,\
                                last_access_time,\
                                broadcast_status,\
                                is_active\
                        FROM admin_users\
                        where username = '" + (req.user.username) + "'")
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


    /**
     * Lưu danh bạ của user vào
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
     * Lấy tập danh bạ được lưu trữ trên máy điện thoại, được đồng bộ lên máy chủ
     * từ dữ liệu token của người dùng, họ truy vấn danh bạ của họ
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    getYourContacts(req, res, next) {
        db.runSql("select contacts from\
                                        admin_users_contacts\
                                        where username=:username",
            { username: req.paramS.user ? req.paramS.user : req.user ? req.user.username : "" },
            { fetchInfo: { "CONTACTS": { type: db.getTypes().STRING } } })
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
     * luu bạn bè cua user vào là danh sách đã kết bạn
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    saveYourFriends(req, res, next) {

        var insertTable = {
            name: 'admin_users_friends',
            cols: [
                {
                    name: 'username',
                    value: req.user.username
                }
                ,
                {
                    name: 'friends',
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
     * tập danh sách đã được kết bạn
     * danh sách này sẽ làm mệnh đề in để lấy tin tức từ bạn bè
     * các bạn bè để chế độ tin ở mức độ public,
     *  bạn của bạn và bạn bè thì lấy tin tức đó từ mới nhất
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    getYourFriends(req, res, next) {
        db.runSql("select friends from\
                                        admin_users_friends\
                                        where username=:username",
            { username: req.paramS.user ? req.paramS.user : req.user ? req.user.username : "" },
            { fetchInfo: { "FRIENDS": { type: db.getTypes().STRING } } })
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
     * Lưu id (tập public_key & private_key đã mã hóa của khách hàng)
     * Trường hợp lưu mật khẩu khách hàng tự nhớ thì ta lưu private_key
     * Trường hợp khách hàng đưa mật khẩu ta lưu lên hệ thống thì ta chỉ lưu signature thôi
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    saveYourIds(req, res, next) {

        var insertTable = {
            name: 'admin_users_ids',
            cols: [
                {
                    name: 'id',
                    value: req.json_data.id
                }
                ,
                {
                    name: 'hash_key',
                    value: req.json_data.hash_key
                }
                ,
                {
                    name: 'signature',
                    value: req.json_data.signature
                }
                ,
                {
                    name: 'username',
                    value: req.user.username
                }
                ,
                {
                    name: 'create_device',
                    value: req.clientDevice
                }
                ,
                {
                    name: 'create_ip',
                    value: req.clientIp
                }
                ,
                {
                    name: 'create_time',
                    value: Date.now()
                }
            ]
            ,
            wheres: [{
                name: 'id',
                value: req.json_data.id
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
     * kiểm tra ids của một user
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    getYourIds(req, res, next) {
        db.getRsts("select * from\
                    admin_users_ids\
                    where username=:username",
                    [req.paramS.user ? req.paramS.user : req.user ? req.user.username : ""]
            )
            .then(rows => {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ status: 1, result: rows }, function (key, value) { return (value === undefined || value === null || value === "") ? undefined : value }));
            })
            .catch(err => {
                console.log('error all', err);
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(err));
            })
    }
    

    /**
     * Lấy danh sách user có thông tin từ tập follow, hay tập friends của mình
     * Sử dụng cho user tìm bạn, 
     * khi họ gõ số điện thoại trên ô tìm kiếm thông tin sẽ tự trả về
     * để người dùng yêu cầu kết bạn hoặc xem thông tin cá nhân của họ 
     * (trường hợp họ public)
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    getUsersInfo(req, res, next) {
        if (req.paramS.users
            && req.paramS.users.indexOf(")") < 0
            && req.paramS.users.indexOf("=") < 0
            && req.paramS.users.toUpperCase().indexOf("OR") < 0
            && req.paramS.users.toUpperCase().indexOf("AND") < 0
        ) {
            db.getRsts("SELECT username, role, fullname, nickname,\
                                    address, email, phone, image, background, start_time,\
                                    end_time, change_time, last_access_ip, last_access_time,\
                                    is_active,\
                                    broadcast_status\
                            FROM admin_users\
                            where username in (" + (req.paramS.users) + ")")
                .then(data => {
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({
                        status: 1,
                        message: 'Data OK',
                        users: data
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
        }
        else {
            /* res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: "Don't SQLInjection please!" })); */
            //lay public user
            db.getRsts("SELECT username, role, fullname, nickname,\
                                    address, email, phone, image, background, start_time,\
                                    end_time, change_time, last_access_ip, last_access_time,\
                                    is_active,\
                                    broadcast_status\
                            FROM admin_users\
                            where broadcast_status =1")
                .then(data => {
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({
                        status: 1,
                        message: 'Data OK',
                        users: data
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

        }
    }


    postUsersInfo(req, res, next) {
        if (req.json_data
            && req.json_data.username
        ) {
            db.getRsts("SELECT username, role, fullname, nickname,\
                                    address, email, phone, image, background, start_time,\
                                    end_time, change_time, last_access_ip, last_access_time,\
                                    is_active,\
                                    broadcast_status\
                            FROM admin_users\
                            where username in ('" + req.json_data.username + "')")
                .then(data => {
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({
                        status: 1,
                        message: 'Data OK',
                        users: data
                    }
                        , (key, value) => {
                            if (value === null) { return undefined; }
                            return value
                        }
                    ));
                })
                .catch(err => {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({message:"Select DB Error", error: err}));
                })
        }
        else {
            
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({message:"No username!"}));
                
        }
    }



}

module.exports = {
    oracleHandler: new OracleHandler()
};