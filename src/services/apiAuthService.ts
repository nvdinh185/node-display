import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ApiStorageService } from './apiStorageService';

import { RequestInterceptor } from '../interceptors/requestInterceptor';

/* import 'rxjs/add/operator/map' */

import NodeRSA from 'node-rsa';
/* import jwt from 'jsonwebtoken'; */

@Injectable()
export class ApiAuthService {

    public authenticationServer = ApiStorageService.authenticationServer;

    public tokenObject: any;
    public userInfo: any;

    public broadcastStatus = {
        "0":"private"
        ,"1":"public"
        ,"2":"friend"
        ,"3":"friend-of"
    }

    constructor(private httpClient: HttpClient,
                private apiStorage: ApiStorageService,
                private reqInterceptor: RequestInterceptor) {
    }


    createObjectKey = (obj,key,value)=>{
        Object.defineProperty(obj, key, {value: value, writable: true, enumerable: true, configurable: true});
        obj.length = obj.length?obj.length+1:1;
        return obj;
    } 
    
    deleteObjectKey = (obj,key)=>{
        if (delete obj[key]) obj.length = obj.length?obj.length - 1: undefined;
        return obj;
    } 

    /**
     * clone đối tượng thành đối tượng mới (sử dụng để gán đối tượng mới)
     * @param {*} obj 
     */
    cloneObject =(obj) => {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

    getBroadcastStatus(status){
        return this.broadcastStatus[status]?this.broadcastStatus[status]:"unknow";
    }


    /**
     * Neu da luu tru trong may roi thi lay ra
     * cap khoa nay duoc tao ra cho ung dung nay
     * su dung de ky thong tin chuyen di (ky nhan tu may nay)
     * 
     */
    generatorKeyPairDevice(){
        return new Promise(async (resolve,reject)=>{
            let deviceKey;
            deviceKey = this.apiStorage.getDeviceKey();
            if (deviceKey) {
                let savedKeyOnServe;
                try{
                    savedKeyOnServe = await this.postDynamicForm(ApiStorageService.authenticationServer+"/ext-auth/key-device-json",{id:deviceKey.id});
                }catch(e){}

                if (savedKeyOnServe){
                    //kiem tra bang luu tru tren may chu va may ca nhan co dung khong??
                    //last update time from this device
                    resolve(deviceKey);
                    //console.log('key server',savedKeyOnServe);
                    return;
                }
            }

            //console.log('key in',deviceKey);
            
            const key = new NodeRSA({b: 512}, { signingScheme: 'pkcs1-sha256' });
            const publicKey = key.exportKey("public").replace('-----BEGIN PUBLIC KEY-----\n','').replace('-----END PUBLIC KEY-----','').replace(/[\n\r]/g, '');
            const privateKey = key.exportKey("private").replace('-----BEGIN RSA PRIVATE KEY-----\n','').replace('-----END RSA PRIVATE KEY-----','').replace(/[\n\r]/g, '');
            
            let yourDevice;
            try{
                yourDevice = await this.getDynamicUrl(ApiStorageService.authenticationServer+"/ext-public/your-device");
            }catch(e){}
            
            //console.log('your device',yourDevice);
            if (yourDevice&&yourDevice.device){
                let time = Date.now();
                
                let signature =  key.sign( JSON.stringify({
                                                            time : time,
                                                            device: yourDevice.device,
                                                            ip: yourDevice.ip,
                                                            origin: yourDevice.origin,
                                                            }
                )
                , 'base64','utf8');
    
                deviceKey = {id: publicKey              //key for verify
                            , time: time                //data in signature
                            , device: yourDevice.device //data in signature
                            , ip: yourDevice.ip         //data in signature
                            , origin: yourDevice.origin //data in signature
                            , signature: signature      //xac thuc chu ky
                            , key: privateKey           //su dung ma hoa luu pass va sign //co mat khau de luu private key xuong
                            }
                
    
                let serverKey = await this.getServerPublicRSAKey();
                if (serverKey){
                    //ma hoa key nay de server giai ma 
                    let encrypted = serverKey.encrypt(JSON.stringify(
                        {id: publicKey
                        , time: time
                        , device: yourDevice.device
                        , ip: yourDevice.ip
                        , origin: yourDevice.origin
                        , signature: signature}
                    )
                    , 'base64','utf8');
                    //console.log(encrypted);
                    this.postDynamicForm(ApiStorageService.authenticationServer+"/ext-auth/key-device",{encrypted: encrypted})
                    .then(data=>{
                        this.apiStorage.saveDeviceKey(deviceKey);
                        resolve(deviceKey);
                    })
                    .catch(err=>{
                        resolve()
                    })
                }
            }else{
                resolve()
            }
        })
    }

    /**
     * id = public key, key = private key
     * tra ve rsaKey dung cho sign, verify, encrypted, decrypted
     * @param keySave 
     * @param keyType 
     */
    importKey(keySave:{id:string,key:string},keyType:'public'|'private'){
        const rsaKey = new NodeRSA(null, { signingScheme: 'pkcs1-sha256' });
        try{
            if (keyType==='private'){
                rsaKey.importKey('-----BEGIN RSA PRIVATE KEY-----\n'+keySave.key+'\n-----END RSA PRIVATE KEY-----');
            }else{
                rsaKey.importKey('-----BEGIN PUBLIC KEY-----\n'+keySave.id+'\n-----END PUBLIC KEY-----');
            }
            return rsaKey;
        }catch(e){
            return null;
        }
    }

    generatorKeyPairUser(user){
        if (!user) return null;
        let userKey;
        userKey = this.apiStorage.getUserKey(user);
        if (userKey) return userKey;
        const key = new NodeRSA({b: 512}, { signingScheme: 'pkcs1-sha256' });
        const publicKey = key.exportKey("public").replace('-----BEGIN PUBLIC KEY-----\n','').replace('-----END PUBLIC KEY-----','').replace(/[\n\r]/g, '');
        const privateKey = key.exportKey("private").replace('-----BEGIN RSA PRIVATE KEY-----\n','').replace('-----END RSA PRIVATE KEY-----','').replace(/[\n\r]/g, '');
        userKey = {id: publicKey, key: privateKey}
        this.apiStorage.saveUserKey(user,userKey);
        return userKey;
    }

    /**
     * ham nay phai lay sau khi xac thuc token OTP bang dien thoai
     * tranh viec hacker ma hoa du lieu lung tung gui len server
     */
    getServerPublicRSAKey(isRenew?:boolean) {
        //{id: publicKey, info:thong tin may chu, signature: chu ky cua may chu}
        let serverId = this.apiStorage.getServerKey();
        //console.log('severId',serverId);
        if (!serverId || !serverId.id || isRenew){
            let serverPublicKey;
            return this.httpClient.get(this.authenticationServer + '/ext-auth/key-json')
                            .toPromise()
                            .then(data => {
                               let sData;
                               sData =  data;
                               if (sData && sData.public_key) {
                                    let rsaServerPublicKey = this.importKey({id: sData.public_key,
                                                                             key:""},"public");
                                    this.apiStorage.saveServerKey({id: serverPublicKey});                                         
                                    return rsaServerPublicKey;
                                } else {
                                    return null;
                                }
                            })
            
        } else {
            return (new Promise((resolve, reject) => {
                let rsaServerPublicKey = this.importKey({id: serverId.id,
                                                         key:""},"public");
                resolve(rsaServerPublicKey);
            })); 
        }
    }

    login(formData) {
        this.reqInterceptor.setRequestToken(null); //login nguoi khac
        return this.httpClient.post(this.authenticationServer + '/ext-auth/login', formData)
            .toPromise()
            .then(data => {
                this.tokenObject = data;
                this.reqInterceptor.setRequestToken(this.tokenObject.token); //login nguoi khac
                return this.tokenObject.token;
            });
        }
        
    logout() {

        //xoa bo token luu tru
        this.apiStorage.deleteToken();

        if (this.tokenObject && this.tokenObject.token) {
                //truong hop user co luu tren session thi xoa session di
            this.reqInterceptor.setRequestToken(this.tokenObject.token); //login nguoi khac
            return this.httpClient.get(this.authenticationServer + '/ext-auth/logout')
                .toPromise()
                .then(data => {
                    //console.log(data);
                    this.tokenObject = null; //reset token nay
                    this.reqInterceptor.setRequestToken(null);
                    return true; //tra ve nguyen mau data cho noi goi logout xu ly
                })
                .catch(err => {
                    //xem nhu da logout khong cap luu tru
                    //console.log(err);
                    this.reqInterceptor.setRequestToken(null);
                    this.tokenObject = null; //reset token nay
                    return true; //tra ve nguyen mau data cho noi goi logout xu ly
                });
        } else {
            return (new Promise((resolve, reject) => {
                resolve(true);
            }));

        }
    }

    register(formData) {
        return this.httpClient.post(this.authenticationServer + '/ext-auth/register', formData)
            .toPromise()
            .then(data => {
                console.log(data);
                return true;
            })
            .catch(err=>{
                console.log(err);
                return false;
            });

    }

    editUser(formData) {
        //them token vao truoc khi edit
        this.reqInterceptor.setRequestToken(this.tokenObject.token);
        return this.httpClient.post(this.authenticationServer + '/ext-auth/edit', formData)
            .toPromise()
            .then(data => {
                console.log(data);
                return true;
            })
            .catch(err=>{
                console.log(err);
                return false;
            });

    }
    //lay thong tin nguoi dung de edit
    getEdit() {
        if (this.tokenObject && this.tokenObject.token) {
            //them token vao truoc khi edit
            this.reqInterceptor.setRequestToken(this.tokenObject.token);
            return this.httpClient.get(this.authenticationServer + '/ext-auth/get-user')
                .toPromise()
                .then(jsonData => {
                    //this.userSetting = jsonData;
                    return jsonData;
                });
        } else {
            return (new Promise((resolve, reject) => {
                //this.userSetting = null;
                reject({ error: 'No token, please login first' }); //bao loi khong import key duoc
            }));
        }
    }
    
    //get userInfo from token
    getUserInfo() {
        return this.userInfo;
    }

    /**
     * Ham nay luu lai token cho phien lam viec sau do
     * dong thoi luu xuong dia token da login thanh cong
     * @param token 
     */
    saveToken(token){
        this.apiStorage.saveToken(token);
        this.tokenObject={token:token};
    }

    /**
     * truong hop logout hoac 
     * token da het hieu luc, 
     * ta se xoa khoi de khong tu dong login duoc nua
     */
    deleteToken(){
        this.apiStorage.deleteToken();
        this.tokenObject=null;
    }

    /**
     * Gui len server kiem tra token co verify thi tra ve token, khong thi khong ghi 
     * @param token 
     */
    authorize(token){
        return this.httpClient.post(this.authenticationServer + '/ext-auth/authorize-token',JSON.stringify({
            token: token
        }))
            .toPromise()
            .then(data => {
                let rtn:any;
                rtn = data;
                this.tokenObject={token: token};
                this.userInfo = rtn.user_info;
                return rtn; 
            })
    }


    //send sms
    sendSMS(isdn,sms){
       return this.httpClient.post(this.authenticationServer + '/ext-auth/send-sms', JSON.stringify({
            isdn:isdn,
            sms:sms
            }))
            .toPromise()
            .then(data => {
                let rtn:any;
                    rtn = data;
                    return rtn;
            });
    }

    /**
     * yeu cau mot OTP tu phone
     * @param jsonString 
     */
    requestIsdn(jsonString){
        //chuyen len bang form co ma hoa
        return this.httpClient.post(this.authenticationServer + '/ext-auth/request-isdn', jsonString)
             .toPromise()
             .then(data => {
                let rtn:any;
                rtn = data;
                return rtn;
             });
     }


     /**
      * confirm OTP key
      * @param jsonString 
      */
    confirmKey(jsonString){
         //chuyen di bang form co ma hoa
        return this.httpClient.post(this.authenticationServer + '/ext-auth/confirm-key', jsonString)
             .toPromise()
             .then(data => {
                 this.tokenObject = data;
                 if (this.tokenObject&&this.tokenObject.token){
                    this.reqInterceptor.setRequestToken(this.tokenObject.token); //gan token ap dung cho cac phien tiep theo
                    return this.tokenObject.token;
                }else{
                    //neu ho nhap so dien thoai nhieu lan sai so spam thi ??
                    throw 'Không đúng máy chủ<br>';
                }
             });
     }


     injectToken(token?:any){
        this.tokenObject={token: token?token:this.tokenObject.token};
        this.reqInterceptor.setRequestToken(this.tokenObject.token);
     }



     postDynamicForm(url:string, json_data:Object, token?:any){
        //lay token cua phien xac thuc
        this.reqInterceptor.setRequestToken(token&&token.length?token:token&&this.tokenObject?this.tokenObject.token:'');
        return this.httpClient.post(url,JSON.stringify(json_data))
                .toPromise()
                .then(data => {
                    let rtn:any;
                    rtn = data;
                    return rtn;
                });
    }

    getDynamicUrl(url:string, token?:any, options?: any){
        //lay token cua phien xac thuc
        this.reqInterceptor.setRequestToken(token&&token.length?token:this.tokenObject?this.tokenObject.token:'');
        return this.httpClient.get(url, options)
                .toPromise()
                .then(data => {
                    let rtn:any;
                    rtn = data;
                    return rtn;
                });
    }

    postDynamicFormData(url:string, form_data:any, token?:any){
        //lay token cua phien xac thuc
        this.reqInterceptor.setRequestToken(token?token:this.tokenObject?this.tokenObject.token:'');
        return this.httpClient.post(url,form_data)
                .toPromise()
                .then(data => {
                    let rtn:any;
                    rtn = data;
                    return rtn;
                });
    }

}