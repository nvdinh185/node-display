"use strict"
const request = require('request');

const OracleDAO = require("../db/oracle/oracle-dao");

const dbConfig =
                {
                    poolAlias:'sitePool',//ten cua pool
                    user:'site_owner',      //username to oracle
                    password:'site',        //password to oracle
                                            //connection String to oracle = tnsname
                    connectString:"(DESCRIPTION =\
                                    (ADDRESS_LIST =\
                                        (ADDRESS = (PROTOCOL = TCP)(HOST = 10.151.59.88)(PORT = 1521))\
                                    )\
                                    (CONNECT_DATA =\
                                        (SERVER = DEDICATED)\
                                        (SERVICE_NAME = tech)\
                                    )\
                                )",
                    poolMax: 2,             //so luong pool max
                    poolMin: 2,             //so luong pool min
                    poolIncrement: 0,       //so luong pool tang len neu co
                    poolTimeout: 4          //thoi gian pool timeout
                }

const db = new OracleDAO(dbConfig);

class OracleHandler {

    /**
     * Lưu ý: các loại dữ liệu blob, object sẽ báo lỗi
     * Các cột có dữ liệu đó phải chuyển đổi sang dạng primary
     * thì câu lệnh select mới chạy được.
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    getSite(req, res, next) {

        db.getRst("select site_id,\
                    site_code_geo,\
                    NVL (site_name, site_id) site_name,\
                    site_address,\
                    start_date,\
                    site_type,\
                    count_cell,\
                    last_traffic,\
                    last_data,\
                    last_count_isdn,\
                    TO_CHAR (site_update_auto_datetime, 'dd/mm/yyyy') data_date,\
                    latitude,\
                    longitude,\
                    NVL (is4g, 0) is4g\
                     from site_info\
                    where site_id = '"+ req.paramS.site_id + "'")
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

    get100Site(req, res, next) {

        let lo = req.paramS.lo?req.paramS.lo:'15.407816';
        let la = req.paramS.la?req.paramS.la:'109.10533';

        db.getRsts(
            "select * from (SELECT   site_id,"
            +"         NVL (latitude, 15.407816 + ROWNUM / 100) lat,"
            +"         NVL (longitude, 109.10533 - ROWNUM / 100) lng,"
            +"         DECODE (is4g, NULL, DECODE (site_type, 0, 2, 3), 4) site_type"
            +"  FROM   site_owner.site_info a"
            +" WHERE       status IS NULL"
            +"         AND latitude > 0"
            +"         AND longitude > 0"
            +"         AND sdo_within_distance ("
            +"                a.point,"
            +"                mdsys.sdo_geometry ("
            +"                    2001,"
            +"                    8307,"
            +"                    mdsys.sdo_point_type ("+ lo +", "+ la +", NULL),"
            +"                    NULL,"
            +"                    NULL),"
            +"                'distance=30000') = 'TRUE'"
			+"         ORDER BY sdo_geom.sdo_distance ("
            +"          a.point,"
            +"          mdsys.sdo_geometry ("
            +"              2001,"
            +"              8307,"
            +"              mdsys.sdo_point_type ("+ lo +", "+ la +", NULL),"
            +"              NULL,"
            +"              NULL),"
            +"          0.005))"
            +"        where rownum<=100"
        )
            .then(rows => {
                if (rows) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(rows));
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
}

module.exports = {
    oracleHandler: new OracleHandler()
};