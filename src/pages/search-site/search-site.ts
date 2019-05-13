import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { ApiAuthService } from '../../services/apiAuthService';

@Component({
  selector: 'page-search-site',
  templateUrl: 'search-site.html',
})
export class SearchSitePage {
  parent: any;
  server = "http://localhost:9238/site-manager";
  dynamicList: any;
  // dataService: CompleterData;
  searchData = [];
  isSearch: boolean = false;
  searchString: string = '';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public apiAuth: ApiAuthService
  ) {
  }

  ngOnInit() {
    this.parent = this.navParams.get("parent");
    // this.dataAutocomplete();
    this.refresh();
  }

  dataAutocomplete() {
    /* this.apiAuth.getDynamicUrl(this.server + "/get-site?site_id=&limit=20&offset=0", true)
      .then(data => {
        data.forEach(el => {
          this.searchData.push({
            site_id: el.site_id
            , address: el.address
          });
        });
      })
      .catch(err => {

      }) */
  }



  refresh() {

    this.dynamicList = {
      title: "Tìm kiếm site"
      , search_bar: { hint: "Tìm theo site_id theo tiếp đầu ngữ" }
      , buttons: [
        { color: "primary", icon: "add", next: "ADD" }
        , { color: "primary", icon: "contacts", next: "FRIENDS" }
        , {
          color: "primary", icon: "notifications", next: "NOTIFY"
          , alerts: [
            "cuong.dq"
          ]
        }
        , { color: "royal", icon: "cog", next: "SETTINGS" }
      ]
      , items: []
    };

    /* this.apiAuth.getDynamicUrl(this.server + "/get-site?site_id=" + "this.site_id" + "&limit=20&offset=0", true)
      .then(data => {
        data.forEach(el => {
          this.dynamicList.items.push({
            site_id: el.site_id
            , name: el.name
            , address: el.address
            , create_time: el.create_time
          });
        });
      })
      .catch(err => {

      }); */
  }

  //Su dung search
  //---------------------
  goSearch(){
    this.isSearch = true;
  }

}
