import {AutoCompleteService} from 'ionic2-auto-complete';
import {Injectable} from "@angular/core";
import { ApiAuthService } from '../apiAuthService';

@Injectable()
export class ApiAutoSiteService implements AutoCompleteService {
  labelAttribute = "name";

  constructor(private apiAuth: ApiAuthService) {}

  getResults(keyword:string) {
    return this.apiAuth.getDynamicUrl("http://localhost:9238/site-manager/search-sites?keyword="+keyword, true)
      .then(
        result =>
        {
          let rtn = result
          .filter(item => item.site_id.toLowerCase().startsWith(keyword.toLowerCase()));
          return  rtn
        });
  }
}
