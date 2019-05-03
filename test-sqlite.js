"use strict"


const fs = require('fs');
const mime = require('mime-types');
const systempath = require('path');

const SQLiteDAO = require('./db/sqlite3/sqlite-dao');
const dbFile = './db/vn-prefix-change.db';
const db = new SQLiteDAO(dbFile);


setTimeout(() => {
    db.getRsts("select * from change_prefix")
    .then(data=>{
        console.log(data);
    });
}, 1000);