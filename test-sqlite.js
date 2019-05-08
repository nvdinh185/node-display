"use strict"

const SQLiteDAO = require('./db/sqlite3/sqlite-dao');
const dbFile = './db/database/mlmt-site-manager-v2.db';
const db = new SQLiteDAO(dbFile);


setTimeout(() => {
    db.getRsts("select * from sites\
                where site_id like 'DNTK14%'")
    .then(data=>{
        console.log(data);
    });
}, 1000);