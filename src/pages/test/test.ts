import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

import { LinkPage } from '../link/link';

@Component({
  selector: 'page-test',
  templateUrl: 'test.html',
})
export class TestPage {
  treeMenu: any;
  callbackTreeMenu: any;
  constructor(private modalCtrl: ModalController, private inAppBrowser: InAppBrowser,
    public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.callbackTreeMenu = this.callbackTree;
    this.treeMenu = [
      {
        name: "4. Các phôi pdf In",
        size: "1.3em",
        subs: [
          {
            name: "",
            size: "",
            click: true,
            url: "",
            icon: ""
          }
          ,
          {
            name: "4.3 Mở kiểu Popup iframe",
            size: "1.3em",
            click: true,
            popup_iframe: LinkPage, //su dung link web ko file
            url: "https://dantri.com.vn/",
            icon: "at"
          }
          ,
          {
            name: "4.4 Mở kiểu InApp",
            size: "1.3em",
            click: true,
            in_app_browser: LinkPage, //Link page chi gia lap thoi
            url: "https://dantri.com.vn/",
            icon: "globe"
          }
        ]
      }
    ]
  }

  callbackTree = function (item, isMore: boolean) {
    if (isMore) {
      if (item.in_app_browser && item.url) {
        //mo kieu new window
        var target = "_blank"; //mo trong inappbrowser
        var options = "hidden=no,toolbar=yes,location=yes,presentationstyle=fullscreen,clearcache=yes,clearsessioncache=yes";
        this.inAppBrowser.create(item.url, target, options);
      } else if (item.popup_iframe && item.url) {
        console.log(item.popup_iframe)
        this.openModal(item.popup_iframe
          , {
            parent: this,
            link: item.url
          });
      }
    }
  }.bind(this)

  openModal(form, data?: any) {
    let modal = this.modalCtrl.create(form, data);
    modal.present();
  }

  openBrowser() {
    var target = "_blank";
    var options = "hidden=no,toolbar=yes,location=yes,presentationstyle=fullscreen,clearcache=yes,clearsessioncache=yes";
    this.inAppBrowser.create("https://dantri.com.vn/", target, options);
  }
}