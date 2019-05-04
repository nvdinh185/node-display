"use strict"
const request = require('request');

const OracleDAO = require("../db/oracle/oracle-dao");

const dbConfig =
                {
                    poolAlias:'locationPool',//ten cua pool
                    user:'taxi_owner',      //username to oracle
                    password:'taxi',        //password to oracle
                                            //connection String to oracle = tnsname
                    connectString:"(DESCRIPTION=(LOAD_BALANCE=on)\
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

const GOOGLE_API_KEY = "AIzaSyDBxMizhomgbDZ9ljbf9-mY_Omuo0heCig";
const url_point = "https://maps.googleapis.com/maps/api/geocode/json?key="+GOOGLE_API_KEY

const url_route = "https://maps.googleapis.com/maps/api/directions/json?key="+GOOGLE_API_KEY

const getGoogleApiRoute = (req, res, next) =>{
    
    let link = url_route 
                +"&origin=" + encodeURI(req.paramS.origin)
                +"&destination=" + encodeURI(req.paramS.destination)
   
    request(link, 
                (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        //ghi vao csdl de lan sau lay thoi
                        //{?=call taxi_owner.pkg_google_api.push_routes(?, ?, ?, ?)}
                        /**
                         * p_lat1 NUMBER, p_lon1 NUMBER, p_address1 VARCHAR2, p_lat2 NUMBER,
                         * p_lon2 NUMBER, p_address2 VARCHAR2, p_distance NUMBER,
                         * p_distance_text VARCHAR2, p_duration NUMBER, p_duration_text
                         * VARCHAR2, p_route1 VARCHAR2, p_origin_json VARCHAR2 DEFAULT NULL,
                         * p_route2 VARCHAR2 DEFAULT NULL, p_route3 VARCHAR2 DEFAULT NULL
                         */
                        /* try{
                            let json = JSON.parse(body);
                            let lat = json.results[0].geometry.location.lat;
                            let lng = json.results[0].geometry.location.lng;
                            let address = json.results[0].formatted_address;
                            db.executeJavaFunction('taxi_owner.pkg_google_api.push_point',[lat,lng,address,body])
                            .then(data=>{
                                console.log(data);
                            })
                            .catch(err=>{
                                console.log(err);
                            });
                        }catch(err){
                            console.log('Loi save db',err);
                        } */
                        res.writeHead(200, { 'Content-Type': 'application/json;  charset=utf-8' });
                        res.end(body);
                    }else{
                        res.writeHead(404, { 'Content-Type': 'application/json;  charset=utf-8' });
                        res.end(JSON.stringify({status:'ERR', error: error}));
                    }
        });

};

const getGoogleApiPoint = (req, res, next) =>{
    //console.log('dia chi lay duoc', req.paramS.address);
    let link;
    if (req.paramS.address)
        link = url_point+"&address=" + encodeURI(req.paramS.address)
    else 
        link = url_point+"&latlng=" + req.paramS.latlng

    request(link, 
                (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        //ghi vao csdl de lan sau lay thoi
                        //{?=call taxi_owner.pkg_google_api.push_point(?, ?, ?, ?)}
                        try{
                            let json = JSON.parse(body);
                            let lat = json.results[0].geometry.location.lat;
                            let lng = json.results[0].geometry.location.lng;
                            let address = json.results[0].formatted_address;
                            db.executeJavaFunction('taxi_owner.pkg_google_api.push_point',[lat,lng,address,body])
                            .then(data=>{
                                console.log(data);
                            })
                            .catch(err=>{
                                console.log(err);
                            });
                        }catch(err){
                            console.log('Loi save db',err);
                        }
                        res.writeHead(200, { 'Content-Type': 'application/json;  charset=utf-8' });
                        res.end(body);
                    }else{
                        res.writeHead(404, { 'Content-Type': 'application/json;  charset=utf-8' });
                        res.end(JSON.stringify({status:'ERR', error: error}));
                    }
        });

};

/**
 * ?address= --> jsonaddressLatlng
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const getPoint = async (req, res, next) =>{
    //"{?=call taxi_owner.pkg_google_api.get_address(?)}"
    let checkSave;
    try{
        if (req.paramS.address){
            checkSave = await db.executeJavaFunction('taxi_owner.pkg_google_api.get_address',[req.paramS.address]);
        } else {
            let latlng = req.paramS.latlng.split(",");
            let lat = latlng[0];
            let lng = latlng[1];
            checkSave = await db.executeJavaFunction('taxi_owner.pkg_google_api.get_point',[lat, lng]);
        } 
        checkSave = JSON.parse(checkSave);
        //console.log('du lieu ra',checkSave);
        if (checkSave.status==="OK"){
            res.writeHead(200, { 'Content-Type': 'application/json;  charset=utf-8' });
            res.end(JSON.stringify(checkSave.data));
        }else{
            getGoogleApiPoint(req, res, next);
        }
    }catch(err){
        getGoogleApiPoint(req, res, next);
    }
}

const getRoute = async (req, res, next) =>{
    let checkSave;
    try{
        checkSave = await db.executeJavaFunction('taxi_owner.pkg_google_api.get_routes',[req.paramS.origin, req.paramS.destination]);
        checkSave = JSON.parse(checkSave);
        //console.log('du lieu ra',checkSave);
        if (checkSave.status==="OK"){
            res.writeHead(200, { 'Content-Type': 'application/json;  charset=utf-8' });
            res.end(JSON.stringify(checkSave.data));
        }else{
            getGoogleApiRoute(req, res, next);
        }
    }catch(err){
        getGoogleApiRoute(req, res, next);
    }
}

module.exports = {
    getPoint: getPoint,
    getRoute: getRoute
};