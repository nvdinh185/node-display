"use strict"

const SQLiteDAO = require('../db/sqlite3/sqlite-dao');
const dbFile = './db/vn-prefix-change.db';
const db = new SQLiteDAO(dbFile);

const returnVnPrefixChange = (req, res, next) => {
    db.getRsts("select * from change_prefix")
    .then(data=>{
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(data));
    })
    .catch(err=>{
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(err));
    });
}
const returnVnNetCode = (req, res, next) => {
    db.getRsts("select * from vn_net_code")
    .then(data=>{
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(data));
    })
    .catch(err=>{
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(err));
    });
}

module.exports = {
    returnVnPrefixChange: returnVnPrefixChange
    ,returnVnNetCode: returnVnNetCode
};