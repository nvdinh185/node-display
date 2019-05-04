
/**
 * File nay su dung chay bang tay 1 lan de tao csdl tu excel
 * khai bao mot db connection, gan vao ham createDatabase(fileexel,db)
 * 
 */

// dich vu tao csdl hoa don ban dau
// doc excel, tao db, tao table
const fs = require('fs');
const NodeRSA = require('node-rsa');

//khoi tao db = 
const OracleDAO = require('./oracle-dao');
var db;


const xlsxtojson1st = require("xlsx-to-json-lc");
const excelToJsonAll = require('convert-excel-to-json');


class HandleDatabase {
    /**
     * dua vao dbconfig database oracle dang pool
     * @param {*} excelFileInput 
     * @param {*} dbConfig 
     */
    createDatabase(excelFileInput, dbConfig){
        if (fs.existsSync(excelFileInput)) {
            db = new OracleDAO(dbConfig);
            setTimeout(() => {
                if (db.isConnected()){
                    console.log('Database Oracle ready!');
                    this.initTable(excelFileInput);
                }else{
                    console.log('DB not Connected! Please check Database Oracle');
                }
            }, 3000); //doi 3 giay de ket noi database roi moi tao bang
        }
    }

    
    //khoi tao cac bang luu so lieu
    initTable(excelFileInput){
        //doc excel
        try {
            xlsxtojson1st({
                input: excelFileInput,
                output: null, //since we don't need output.json
                lowerCaseHeaders:true
            }, (err,results)=>{
                if(err) {
                    console.log(err);
                } 
                //console.log('result :',results);
                let distinct_table_name =[];
                results.forEach(el => {
                    if (!distinct_table_name.find(x=>x==el.table_name)) distinct_table_name.push(el.table_name)
                });

                //console.log(distinct_table_name)
                
                distinct_table_name.forEach(el=>{
                    let table = results.filter(x=>x.table_name==el);
                    //console.log(table);
                    if (table){
                        let tableJson={};
                        tableJson.name = el;
                        tableJson.cols = [];
                        table.forEach(e=>{
                            let col = {};
                            col.name = e.field_name;
                            col.type = e.data_type;
                            col.option_key = e.options;
                            col.description = e.description;
                            tableJson.cols.push(col);
                        })
                        //console.log(tableJson);
                        db.createTable(tableJson)
                        .then(data=>{
                            console.log(data);
                        })
                        .catch(err=>{
                            console.log(err);
                        })
                    }
                })
                //cho tao bang xong moi doc du lieu
                setTimeout(()=>{
                    console.log('table created: ',distinct_table_name)
                    this.initData(distinct_table_name, excelFileInput);
                },1000);

            });
        } catch (e){
            console.log("Corupted excel file",e);
        }
    } 
    
    initData(tables,excelFileInput){
        try{
            let results = excelToJsonAll({
                sourceFile: excelFileInput
            });

            tables.forEach(tablename=>{
                let sheet = results[tablename];
                if (sheet!=undefined){
                    console.log('sheet-tablename insert db: ',tablename);
                    //chuyen doi kieu doc dong 1 la header
                    let header=sheet[0];
                    let jsonOut = [];
                    for (let i=1;i<sheet.length;i++){
                        let row = {};
                        for (let col in header){
                            if (sheet[i][col]!=undefined){
                                Object.defineProperty(row, header[col], { //ten thuoc tinh
                                    value: (tablename=='customers'&&header[col]=='start_date')?new Date().getTime():sheet[i][col], //gia tri cua thuoc tinh
                                    writable: false, //khong cho phep sua du lieu sau khi gan gia tri vao
                                    enumerable: true, //cho phep gan thanh thuoc tinh truy van sau khi hoan thanh
                                    //configurable: false default
                                });
                            }
                        }
                        jsonOut.push(row);
                    }
                    //thuc hien insert data vao table da tao
                    for (let i=0;i<jsonOut.length;i++){
                        let row = jsonOut[i];
                        let jsonInsert={ name:tablename,cols:[]}
                        for (let key in row){
                            let col = {name:key,value:row[key]};
                            jsonInsert.cols.push(col);
                        }
                        //`console.log(jsonInsert);
                        db.insert(jsonInsert)
                        .then(data=>{
                            //console.log(data)
                        })
                        .catch(err=>{
                            //console.log(err);
                        })
                    }  
                }
            })

        }catch(e){
            console.log("Corupted excel file",e);
        }
    }


    /**
     * thuc hien viec tao cap key chen vao csdl
     * neu csdl chua khoi tao thi thoi
     * @param {*} serviceKeyId 
     */
    createKeyPair(serviceKeyId,sevice_name){
        if (db){
            let key = new NodeRSA({ b: 512 }, { signingScheme: 'pkcs1-sha256' });
            
            let insertTable={ name:'server_keys',
            cols:[
                    {
                    name:'service_id',
                    value: serviceKeyId
                    },
                    {
                    name:'private_key',
                    value: key.exportKey('private').replace('-----BEGIN RSA PRIVATE KEY-----\n','').replace('-----END RSA PRIVATE KEY-----','').replace(/[\n\r]/g, '')
                    },
                    {
                    name:'public_key',
                    value: key.exportKey('public').replace('-----BEGIN PUBLIC KEY-----\n','').replace('-----END PUBLIC KEY-----','').replace(/[\n\r]/g, '')
                    },
                    {
                    name:'service_name',
                    value: sevice_name?sevice_name:('Khóa của dịch vụ ' + serviceKeyId)
                    }
                ]
            };
            db.insert(insertTable)
            .then(data=>{
                console.log("Tạo khóa thành công",data);
            })
            .catch(err=>{
                console.log("Tạo khóa bị lỗi", err);
            })
        }else{
            console.log("No database init for create key");
        }
    }

    

}

module.exports = {
    handler: new HandleDatabase()
};