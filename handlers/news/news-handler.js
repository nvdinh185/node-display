const fs = require('fs');
const mime = require('mime-types');
const systempath = require('path');

const SQLiteDAO = require('../../db/sqlite3/sqlite-dao');

const dbFile = './db/database/news-v1.db';
const db = new SQLiteDAO(dbFile);

class ResourceHandler {

    getMediaFile(req, res) {
        let path = req.pathName
        let params = path.substring('/site-manager/news/get-file/'.length);
        let fileRead = params.replace('/', systempath.sep);
        let contentType;

        if (mime.lookup(fileRead)) contentType = mime.lookup(fileRead);

        fs.readFile(fileRead, { flag: 'r' }, (error, data) => {
            if (!error) {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            } else {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(JSON.stringify(error));
            }
        });
    }

    getNewsList(req, res) {
        //req.user,
        //req.json_data.follows,
        //req.json_data.limit
        //req.json_data.offset
        let users = "";
        if (req.json_data.follows.length > 0) {
            req.json_data.follows.forEach(el => {
                users += (users === "" ? "" : ",") + "'" + el + "'";
            });
        }
        //console.log("users: ", users)
        db.getRsts("select *\
                    from news\
                    where user in ("+ users + ")\
                    order by time desc\
                    LIMIT "+ (req.json_data && req.json_data.limit ? req.json_data.limit : 6) + "\
                    OFFSET "+ (req.json_data && req.json_data.offset ? req.json_data.offset : 0) + "\
                    ")
            .then(results => {
                //lay file chi tiet tra cho nhom
                let detailsPromise = new Promise((resolve, reject) => {
                    if (!results || results.length === 0) {
                        resolve();
                    } else {
                        let countDetails = 0;
                        for (let idx = 0; idx < results.length; idx++) {
                            db.getRsts("select *\
                                from news_files\
                                where group_id = '"+ results[idx].group_id + "'\
                                ")
                                .then(files => {
                                    countDetails++;
                                    results[idx].medias = files;
                                    if (countDetails == results.length) {
                                        resolve();
                                    };
                                })
                                .catch(err => reject(err))
                        }
                    }
                })
                detailsPromise.then(data => {
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify(results
                        , (key, value) => {
                            if (value === null) { return undefined; }
                            return value
                        }
                    ));
                })
                    .catch(err => {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(JSON.stringify(err));
                    })
            }).catch(err => {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(JSON.stringify(err));
            })
    }
}

module.exports = {
    ResourceHandler: new ResourceHandler()
};