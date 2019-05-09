"use strict"

const SQLiteDAO = require('./db/sqlite3/sqlite-dao');
// const dbFile = './db/database/mlmt-site-manager-v3.db';
const dbFile = './db/database/mlmt-site-manager-v4.db';
const db = new SQLiteDAO(dbFile);


setTimeout(() => {
   /*  db.getRsts("SELECT *\
                    FROM admin_roles a\
                 ") */
/* 
                 db.insert({
                    name:'admin_roles',
                                      cols:[
                                          {
                                            name:'username',
                                            value:'901952666'
                                            }
                                        ,
                                          {
                                            name:'roles',
                                            value:'{"menu":[1,2,3,4,5,6],"functions":[1,2,3,4,5,6,7,8,9]}'
                                            }
                                        ,
                                          {
                                            name:'status',
                                            value:1
                                            }
                                        ]
                                      }
                 ) */
                 db.insert({
                    name:'admin_functions',
                                      cols:[
                                          {
                                            name:'id',
                                            value:'9'
                                            }
                                        ,
                                          {
                                            name:'function_code',
                                            value:'create-cycle'
                                            }
                                        ,
                                          {
                                            name:'name',
                                            value:'Tạo kỳ bảo dưỡng'
                                            }
                                        ,
                                          {
                                            name:'status',
                                            value:1
                                            }
                                        ]
                                      }
                 )
    .then(data=>{
        console.log(data);
    });
}, 1000);