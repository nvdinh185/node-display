"use strict"

const arrObj = require('../utils/array-object');

const dbFile = './db/database/admin-user.db'; 
const SQLiteDAO = require('../db/sqlite3/sqlite-dao');
const db = new SQLiteDAO(dbFile);


class Handler {
    
    getMenu(req, res, next) {
        //getRst => obj {}, getRsts => arr = []
        //console.log(req.user);
        db.getRsts("select * from admin_menu")
        .then(result=>{
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result,
                    (key, value) => {
                        if (value === null) { return undefined; }
                        return value
                    }
                ));
        })
        .catch(err=>{
            res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(err));
        })
    }


}

module.exports = {
  Handler: new Handler()
};