const checkLink = (link) => {
    const request = require('request');
    return new Promise((resolve, reject) => {
        request("https://c3.mobifone.vn/api/ext-public/shot-info-url?url=" + link,
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(body)
                } else {
                    reject()
                }
            })
    })
}



const getDomainAliveInfo = (str) => {
    
    return new Promise(async (resolve, reject) => {

        try{
            var urlRegexS = /(https?:\/\/[^\s]+)/g;
            var links =  urlRegexS.exec(str)[0];
            let data = await checkLink(links)
            resolve(data);
            console.log('links' , links );
            return;
        }catch(e){}
    
        try{
            var urlRegex = /(http?:\/\/[^\s]+)/g;
            var link =  urlRegex.exec(str)[0];
            console.log( 'link ', link );
            let data = await checkLink(link)
            resolve(data);
            return;
        }catch(e){}
        
        var regex = /(?:[\w-]+\.)+[\w-]+/;
        var domain_search = regex.exec(str);
        var domain = domain_search[0];
        console.log(domain_search , domain , domain_index);
        if (domain) {
            let link1 = "https://" + domain;
            try {
                let data = await checkLink(link1)
                resolve(data)
            } catch (e) {
                let link2 =  "http://" + domain;
                try {
                    let data = await checkLink(link2)
                    resolve(data)
                } catch (e) {
                    reject("khong co link2")
                }
            }
        }

    })
}


/* getDomainAliveInfo("angjkl jklhskj dantri.com.vn")
.then(data => console.log("ket qua: ",data))
.catch(err => console.log("Loi: ", err)) */


/* getDomainAliveInfo("angjkl jklhskj https://dantri.com.vn/xa-hoi/gap-rut-trung-tu-nha-van-hoa-thu-vien-mang-ten-dai-tuong-le-duc-anh-20190423222150964.htm j,hh")
    .then(data => console.log("ket qua: ", data))
    .catch(err => console.log("Loi: ", err));
 */

/* 
// hàm này thay thế chuỗi có url bằng liên kết    
function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function (url) {
        return '<a href="' + url + '">' + url + '</a>';
    })
    // or alternatively
    // return text.replace(urlRegex, '<a href="$1">$1</a>')
}

var text = "Find me at http://www.example.com and also at http://stackoverflow.com";
var html = urlify(text);

console.log(html) */



const urlClickPipe = (text) => {
    var urlRegex = /(\b(https?|ftp):\/\/[^\s]+)/g;
    return text.replace(urlRegex, function (url) {
        return "<a href='#' onclick=onClickUrl('" + url + "')>" + url + "</a>";
    })
}


//console.log(urlClickPipe('abc http://c3.mobifone.vn/ abc'))


const linkify = (plainText)=>{
    let valueLinkify = plainText;
    let links = [];

        //URLs starting with http://, https://, or ftp://    
        valueLinkify = valueLinkify.replace(/(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim
            , function (url) {
                links.push(url);
                return "<a href='"+url+"' target='_blank'>" + url + "</a>";
            }
        );

        //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
        valueLinkify = valueLinkify.replace(/([ ])([\w-]+\.[\S]+(\b|$))/gim
            , function (url) {
                links.push('http://'+url.trim());
                return " <a href='http://"+url.trim()+"' target='_blank'>" + url.trim() + "</a>";
            }
        );

        //Change email addresses to mailto:: links.
        valueLinkify = valueLinkify.replace(/(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim
            ,
            function (url) {
                links.push('mailto:'+url);
                return "<a href='mailto:"+url+"' target='_blank'>" + url + "</a>";
            }
            );

    return {content:valueLinkify,urls:links};
}

//console.log(linkify('abc www.mobifone.vn trang mang.vn abc'))


var regex = /([\w-]+\.)+[\w-]+/;
var domain_search = regex.exec('acbb http://c3.mobifone.vn/hand');
console.log('domain',domain_search);