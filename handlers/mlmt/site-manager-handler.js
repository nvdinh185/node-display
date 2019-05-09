"use strict"
/**
 * 
 */
const arrObj = require('../../utils/array-object');

const SQLiteDAO = require('../../db/sqlite3/sqlite-dao');
const dbFile = './db/database/mlmt-site-manager-v3.db';
const db = new SQLiteDAO(dbFile);

class Handler {

    /**
     * Thiết lập chức năng dựa trên đường dẫn của get/post
     * Đường dẫn cuối sẽ là duy nhất của từng chức năng
     * ví dụ: /db/edit-customer thì edit-customer là chức năng
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    setFunctionFromPath(req,res,next){
        //lay duong dan phia sau
        req.functionCode = req.pathName.substring(req.pathName.lastIndexOf("/")+1);
        next();
    }

    //lay quyen de thuc hien menu va active function cua user
    getRoles(req,res,next){

        console.log('get roles',req.user);

        if (req.user){
            db.getRst("select roles from admin_roles\
                        where username='"+req.user.username+"'"
            )
            .then(row=>{
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(row?row.roles:""); //obj="{menu:[],functions:[]}"
            })
            .catch(err=>{
                console.log('error:',err);
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end("");//obj.functions==false
            });

        }else{
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({}));//obj.roles==false
        }
    }

    /**
     * req.functionCode = "active" //chuc nang toi thieu la active 
     * 
     * req.functionCode = "edit-customer" //yeu cau kiem tra quyen
     * //neu khong co functionCode thi xem nhu khong can kiem tra quyen
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async checkFunctionRole(req,res,next){

        if (req.functionCode){ //can kiem tra quyen cua user co khong
            if (req.user&&req.user.data){
                //console.log('userData:',req.user.data);
                if (req.user.data.role===99) {
                    next() //quyen root
                }else{
                    try{
                        let row = await db.getRst("select roles\
                                                     from admin_roles\
                                                     where username='"+req.user.username+"'");
                        let row2 = await db.getRst("select id\
                                                         from admin_functions\
                                                         where function_code ='"+req.functionCode+"'");
                        let roles = row&&row.roles?JSON.parse(row.roles):undefined; //tra ve object
                        let functionId = row2?row2.id:undefined; //tra ve id
                        //console.log('rolesFunction', functionId, roles);
                        let index =  roles&&functionId&&roles.functions?roles.functions.findIndex(x=>x===functionId):-1;
    
                        if (index>=0){
                            next()
                        }else{
                            res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
                            res.end(JSON.stringify({message:'Bạn KHÔNG ĐƯỢC PHÂN QUYỀN thực hiện chức năng này'}));
                        }

                    }catch(e){
                        res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
                        res.end(JSON.stringify({message:'Lỗi trong lúc kiểm tra quyền', error: e}));
                    }
                }
            } else {
                res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({message:'Bạn không có quyền thực hiện chức năng này'}));
            }
        }else{
            next(); //xem nhu khong can kiem tra quyen
        }

    }

    getUserMenu(req,res,next){
        
        console.log('user',req.user);

        db.getRsts('select *\
                    from admin_menu\
                     where status = 1\
                     order by order_1')
        .then(results => {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(results
                , (key, value) => {
                    if (value === null) { return undefined; }
                    return value;
                }
            ));
        })
        .catch(err => {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(JSON.stringify([]));
        });
    }



    getMaintenanceSites(req,res,next){

        console.log('req.user', req.user);
        console.log('req.paramS', req.paramS);
        console.log('req.json_data', req.json_data);

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
                    where 1=1\
                    "+(req.paramS.site_id?"and a.site_id like '"+req.paramS.site_id+"%'":"")+"\
                    order by a.site_id\
                    "+(req.paramS.limit?"LIMIT "+req.paramS.limit:"LIMIT 10")+"\
                    "+(req.paramS.offset?"OFFSET "+req.paramS.offset:"OFFSET 0")+"\
                 ")
    .then(results=>{
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(results
                , (key, value) => {
                    if (value === null) { return undefined; }
                    return value;
                }
            ));
    })
    .catch(err => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(JSON.stringify([]));
    });
    ;
    }
}

module.exports = new Handler()