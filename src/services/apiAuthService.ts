import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ApiAuthService {

    constructor(private httpClient: HttpClient) {
    }

    /**
     * get url => req.paramS
     * @param url 
     * @param token 
     * @param options 
     */
    getDynamicUrl(url: string) {
        return this.httpClient.get(url)
            .toPromise()
            .then(data => {
                let rtn: any;
                rtn = data;
                return rtn;
            });
    }

    /**
     * post json_data => req.json_data
     * @param url 
     * @param json_data 
     * @param token 
     */
    postDynamicForm(url: string, json_data: Object) {
        return this.httpClient.post(url, JSON.stringify(json_data))
            .toPromise()
            .then(data => {
                let rtn: any;
                rtn = data;
                return rtn;
            });
    }

    getBroadcastStatus(status) {
        return this.broadcastStatus[status] ? this.broadcastStatus[status] : "unknow";
    }

    broadcastStatus = {
        "0": "private"
        , "1": "public"
        , "2": "friend"
        , "3": "friend-of"
    }


    createObjectKey = (obj, key, value) => {
        Object.defineProperty(obj, key, { value: value, writable: true, enumerable: true, configurable: true });
        obj.length = obj.length ? obj.length + 1 : 1;
        return obj;
    }

    deleteObjectKey = (obj, key) => {
        if (delete obj[key]) obj.length = obj.length ? obj.length - 1 : undefined;
        return obj;
    }
}