"use strict"

const SQLiteDAO = require('./db/sqlite3/sqlite-dao');
const dbFile = './db/database/mlmt-site-manager-v3.db';
const db = new SQLiteDAO(dbFile);


setTimeout(() => {
    db.getRsts("SELECT a.id,\
                        a.site_id,\
                        a.name,\
                        a.address,\
                        b.id as maintenance_sheet_id,\
                        b.sites_id,\
                        b.year,\
                        b.quarter,\
                        c.employee_status,\
                        c.total_mark,\
                        c.status as maintenance_status\
                    FROM sites a \
                    LEFT JOIN maintenance_sheet b\
                    ON a.id=b.sites_id\
                    LEFT JOIN maintenance_sheet_report c\
                    ON b.id=c.maintenance_sheet_id\
                    where a.site_id like 'DNTK01%'\
                 ")

    .then(data=>{
        console.log(data);
    });
}, 1000);