import { Pipe, PipeTransform } from '@angular/core';
import { ApiAuthService } from '../services/apiAuthService';
import { ApiStorageService } from '../services/apiStorageService';
/*
 * Converts linkify into html domain/http/ftp/email/phone
*/
@Pipe({ name: 'linkify' })
export class LinkifyPipe implements PipeTransform {
    constructor( private apiAuth: ApiAuthService) {}
    transform(value: string, isUrl: string ): any {

        let valueLinkify = value;
        let links = [];
        var regexDomain = /([\w-]+\.)+[\w-]+/;
        
            if (valueLinkify){
                //URLs starting with http://, https://, or ftp://    
                valueLinkify = valueLinkify.replace(/(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim
                    , 
                    function (url) {
                        let domain = regexDomain.exec(url);
                        let hostname = domain?domain[0]:undefined;
                        if (hostname){
                            links.push({hostname,url});
                            return "<a href='"+url+"' target='_blank'>" + hostname + "</a>";
                        }
                    }
                );
        
                //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
                valueLinkify = valueLinkify.replace(/([ ])([\w-]+\.[\S]+(\b|$))/gim
                    , 
                    function (url) {
                        var domain = regexDomain.exec(url);
                        let hostname = domain?domain[0]:undefined;
                        if (hostname){
                        links.push({hostname,url:'http://'+url.trim()});
                        return " <a href='http://"+url.trim()+"' target='_blank'>" + hostname + "</a>";
                        }
                    }
                );
        
                //Change email addresses to mailto:: links.
                valueLinkify = valueLinkify.replace(/(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim
                    ,
                    function (url) {
                        var domain = regexDomain.exec(url);
                        let hostname = domain?domain[0]:undefined;
                        if (hostname){
                            links.push({hostname,url:'mailto:'+url});
                            return "<a href='mailto:"+url+"' target='_blank'>" + url + "</a>";
                        }
                    }
                );
            }

        if (isUrl==='links') return links; //array off urls

        if (isUrl==='urlInfos') {
            let urlInfos = [];
            links.forEach(async el=>{
                try{
                    if (el.url&&el.url.toLowerCase().indexOf("http")===0){
                        let urlInfo = await this.apiAuth.getDynamicUrl(ApiStorageService.authServer + "/ext-public/shot-info-url?url="+el.url);
                        urlInfos.push(urlInfo);
                    }
                }catch{}
            })
            return urlInfos;
        }

        return valueLinkify;

    }
}