const express = require('express');
const app = express();
const fs = require('fs');
const os = require('os');

function main(isHttp) {
  //CHONG TAN CONG DDDOS
  //ngan chan truy cap ddos tra ket qua cho user neu truy cap tan suat lon 
  app.use(require('./ddos/ddos-config').express('ip', 'path'));
  
  //web tinh
  app.use(express.static(__dirname + '/platforms/browser/www'));
  
  //CORS handle
  app.use(require('./handlers/cors-handler').cors);

  //quan ly phan quyen user/menu cho mlmt
  app.use('/mlmt/site-admin', require('./routes/mlmt/admin-route')); 

  //ham tra loi cac dia chi khong co
  //The 404 Route (ALWAYS Keep this as the last route)
  app.all('*',(req, res) => {
    //gui trang thai bao noi dung tra ve
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Xin lỗi trang bạn muốn tìm không tồn tại!</h1>Địa chỉ ip của bạn là : ' + req.clientIp);
  });

  app.use(require('./handlers/error-handler').errors);

  if (isHttp) {
    // For http
    const httpServer = require('http').createServer(app);
    const portHttp = process.env.PORT || isHttp;
    httpServer.listen(portHttp, () => {
      console.log("Server HTTP (" + os.platform() + "; " + os.arch() + ") is started with PORT: "
        + portHttp
        + "\n tempdir: " + os.tmpdir()
        + "\n " + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
      );
    });

  }

}

//=false or port number >1000
const isHttp = 9238; //9235-->auth; 9236-->resource hoa don; 8080-->file-medias; 8081-->c3.mobifone.vn
//9238 - web mang luoi mien trung

main(isHttp);