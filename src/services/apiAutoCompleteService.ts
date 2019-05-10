import {AutoCompleteService} from 'ionic2-auto-complete';
import {Injectable} from "@angular/core";
import { ApiAuthService } from './apiAuthService';

@Injectable()
export class ApiAutoCompleteService implements AutoCompleteService {
  labelAttribute = "name";

  constructor(private apiAuth: ApiAuthService) {}

  getResults(keyword:string) {
    return this.apiAuth.getDynamicUrl("https://restcountries.eu/rest/v1/name/"+keyword)
    .then(
        result =>
          {
            return result.filter(item => item.name.toLowerCase().startsWith(keyword.toLowerCase()))
          }
    )
  }
}
