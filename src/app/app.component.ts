import { Component, ViewChild, HostListener } from '@angular/core';
import { Platform, Nav, MenuController, ModalController, Events, LoadingController, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { DynamicFormMobilePage } from '../pages/dynamic-form-mobile/dynamic-form-mobile';
import { DynamicFormWebPage } from '../pages/dynamic-form-web/dynamic-form-web';
import { DynamicRangePage } from '../pages/dynamic-range/dynamic-range';
import { DynamicListPage } from '../pages/dynamic-list/dynamic-list';
import { DynamicListOrderPage } from '../pages/dynamic-list-order/dynamic-list-order';
import { DynamicTreePage } from '../pages/dynamic-tree/dynamic-tree';
import { DynamicMediasPage } from '../pages/dynamic-medias/dynamic-medias';
import { DynamicCardSocialPage } from '../pages/dynamic-card-social/dynamic-card-social';
import { GoogleMapPage } from '../pages/google-map/google-map';
import { LoginPage } from '../pages/login/login';
import { HandDrawPage } from '../pages/hand-draw/hand-draw';
import { ApiStorageService } from '../services/apiStorageService';
import { ApiAuthService } from '../services/apiAuthService';
import { HomeMenuPage } from '../pages/home-menu/home-menu';
import { HomeSpeedtestPage } from '../pages/home-speedtest/home-speedtest';
import { OwnerImagesPage } from '../pages/owner-images/owner-images';

import { ApiImageService } from '../services/apiImageService';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { LinkPage } from '../pages/link/link';
import { QrBarScannerPage } from '../pages/qr-bar-scanner/qr-bar-scanner';
import { ContactsPage } from '../pages/contacts/contacts';
import { CordovaPage } from '../pages/cordova-info/cordova-info';
import { ApiContactService } from '../services/apiContactService';
import { ApiChatService } from '../services/apiChatService';
import { ReportPage } from '../pages/report/report';
import { MaintenanecePage } from '../pages/maintenanece/maintenanece';
import { AddMaintenancePage } from '../pages/add-maintenance/add-maintenance';
import { ReviewMaintenancePage } from '../pages/review-maintenance/review-maintenance';
import { DocumentsPage } from '../pages/documents/documents';
import { HomeNewsPage } from '../pages/home-news/home-news';
import { DynamicChartPage } from '../pages/dynamic-chart/dynamic-chart';
import { DynamicHomePage } from '../pages/dynamic-home/dynamic-home';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) navCtrl: Nav;

  //ham nhan key press tren web
  keyCode: any;
  @HostListener('document:keyup', ['$event']) handleKeyboardEvent(event: KeyboardEvent) {
    this.keyCode = event.keyCode;
    //console.log('key',this.keyCode);
    //se cho tat ca cac hotkey go duoc
  }

  menuServer = ApiStorageService.siteServer;

  //rootPage: any = HomeNewsPage; //HomeMenuPage;
  rootPage: any = HomeMenuPage;

  treeMenu: any;
  callbackTreeMenu: any;

  userInfo: any;
  token: any;

  keyPair: any;

  constructor(
    private menuCtrl: MenuController, //goi trong callback
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private apiStorage: ApiStorageService,
    private apiImage: ApiImageService,
    private apiAuth: ApiAuthService,
    private apiContact: ApiContactService,
    private apiChat: ApiChatService,
    private events: Events,
    private inAppBrowser: InAppBrowser, //goi trong callback
    private platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen
  ) {
    this.platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

  ngOnInit() {

    this.callbackTreeMenu = this.callbackTree;

    this.ionViewDidLoad_main();

    this.apiAuth.generatorKeyPairDevice()
      .then(key => {
        this.keyPair = key;
        //console.log('key resolve',this.keyPair);
      });


  }

  ionViewDidLoad_main() {

    this.checkTokenLogin();

    this.events.subscribe('user-log-in-ok', (() => {
      this.checkTokenLogin();
    }));

    this.events.subscribe('user-log-out-ok', (() => {
      this.checkTokenLogin();
    }));

  }

  /**
   * login ok get image and background
   * add to contacts
   */
  async userChangeImage() {
    //du lieu da duoc dang ky 
    if (this.userInfo.data) {
      try {
        this.userInfo.data.image = await this.apiImage
          .createBase64Image(ApiStorageService.mediaServer + "/db/get-private?func=avatar&token=" + this.apiStorage.getToken(), 120)

        this.userInfo.data.background = await this.apiImage
          .createBase64Image(ApiStorageService.mediaServer + "/db/get-private?func=background&token=" + this.apiStorage.getToken(), 300)
      } catch (e) { }

    } else {
      //du lieu chua dang ky user 
      //yeu cau dang ky user
      this.navCtrl.push(LoginPage);
    }

  }


  /**
   * khoi tao key
   */
  preparePrivateKeys() {

    // this.apiStorage.getUserKey(this.userInfo);

  }


  checkTokenLogin() {
    this.token = this.apiStorage.getToken();
    if (this.token) {

      let loading = this.loadingCtrl.create({
        content: 'Đợi xác thực...'
      });
      loading.present();

      this.apiAuth.authorize
        (this.token)
        .then(async data => {

          this.userInfo = data.user_info;
          //Tiêm token cho các phiên làm việc lấy số liệu cần xác thực
          if (this.userInfo && this.userInfo.data) {

            this.apiAuth.injectToken();
            //thay doi anh dai dien va anh background
            this.userChangeImage();
            //login ok ... contacts, friends, ids, pass
            //await this.apiContact.delay(1000); //doi 1 giay de lay het anh
            //ban dau moi khoi tao chua co Friend, ta moi khoi tao khi nao co thi moi di tiep
            let friends = await this.apiContact.prepareFriends(this.userInfo);

            this.apiChat.initChatting(this.token, this.userInfo, friends);

          } else {

            this.navCtrl.push(LoginPage);

          }
          this.resetTreeMenu();
          loading.dismiss();
        })
        .catch(err => {
          this.resetTreeMenu();
          loading.dismiss();
        });
    } else {
      this.userInfo = undefined;
      this.resetTreeMenu();
    }

  }


  getPage(strPage) {
    switch (strPage) {
      case "HomeMenuPage":
        return HomeMenuPage
      case "MaintenanecePage":
        return MaintenanecePage
      case "AddMaintenancePage":
        return AddMaintenancePage
      case "ReviewMaintenancePage":
        return ReviewMaintenancePage
      case "GoogleMap":
        return GoogleMapPage
      case "ReportPage":
        return ReportPage
      case "DocumentsPage":
        return DocumentsPage
      case "LoginPage":
        return LoginPage
      default:
        return this.rootPage;
    }

  }

  async resetTreeMenu() {

    let sampleMenu = [
      {
        name: "3. Các mẫu reponsive",
        size: "1.3em",
        subs: [
          {
            name: "3.1 Các nhập liệu",
            size: "1.3em",
            subs: [
              {
                name: "3.1.1 Mẫu nhập liệu toàn màn hình dành cho di động",
                click: true,
                next: DynamicFormMobilePage,
                icon: "phone-portrait"
              }
              ,
              {
                name: "3.1.2 Nhập liệu và hiển thị cho desktop & di động",
                click: true,
                next: DynamicFormWebPage,
                icon: "desktop"
              }
              ,
              {
                name: "3.1.3 Mẫu nhập chọn & kéo",
                click: true,
                next: DynamicRangePage,
                icon: "radio-button-on"
              }
            ]
          }
          ,
          {
            name: "3.2 Các mẫu hiển thị danh sách",
            size: "1.3em",
            subs: [
              {
                name: "3.2.1 Mẫu trang chủ tin tức kiểu nhập tin share, comment...",
                click: true,
                next: DynamicHomePage,
                icon: "home"
              }
              ,
              {
                name: "3.2.2 Mẫu danh sách quẹt nút click",
                click: true,
                next: DynamicListPage,
                icon: "paper"
              }
              ,
              {
                name: "3.2.3 Mẫu Biểu đồ Chart",
                click: true,
                next: DynamicChartPage,
                icon: "paper"
              }
              ,
              {
                name: "3.2.4 Mẫu danh sách bảng, liệt kê & sắp xếp lại",
                click: true,
                next: DynamicListOrderPage,
                icon: "reorder"
              }
              ,
              {
                name: "3.2.5 Mẫu danh sách theo cây FamilyTree",
                click: true,
                next: DynamicTreePage,
                icon: "menu"
              }
            ]
          }
          ,
          {
            name: "3.3 Các mẫu xử lý hình ảnh và file",
            size: "1.3em",
            subs: [
              {
                name: "3.3.1 Mẫu upload ảnh theo facebook",
                click: true,
                next: DynamicMediasPage,
                icon: "images"
              }
              ,
              {
                name: "3.3.2 Mẫu hiển thị ảnh và tương tác mạng xã hội",
                click: true,
                next: DynamicCardSocialPage,
                icon: "logo-facebook"
              }
              ,
              {
                name: "3.3.3 Mẫu vẽ tay lên màn hình trên nền di động",
                click: true,
                next: HandDrawPage,
                icon: "create"
              }
            ]
          }
        ]
      }
      ,
      {
        name: "4. Các phôi pdf In",
        size: "1.3em",
        subs: [
          {
            name: "4.1 Mẫu ma trận điểm A4",
            size: "1.3em",
            click: true,
            url: "https://c3.mobifone.vn/qld/db/matrix-a4",
            icon: "ios-apps-outline"
          }
          ,
          {
            name: "4.2 Mẫu ma trận điểm A5",
            size: "1.3em",
            click: true,
            url: "https://c3.mobifone.vn/qld/db/matrix-a5",
            icon: "md-apps"
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

    this.treeMenu = [
      {
        name: "1. Trang chủ",
        size: "1.3em",
        click: true,
        next: this.rootPage,
        icon: "home"
      }
    ]

    if (this.userInfo) {
      //lay theo kieu dong bo
      try {
        let data = await this.apiAuth.getDynamicUrl(this.menuServer + "/get-menu");
        //console.log (data);
        if (Array.isArray(data)) {
          this.treeMenu = [];
          data.forEach((el, idx) => {
            this.treeMenu.push({
              name: el.name,
              size: el.size,
              click: el.click,
              type: el.type,
              next: this.getPage(el.next),
              icon: el.icon
            });
          })
        }
      } catch (e) {
        console.log(e);
      }

      if (this.userInfo.username === '903500888'
        || this.userInfo.username === '702418821'  //cuong
        || this.userInfo.username === '905000551'  //hai
        || this.userInfo.username === '934901567'  //lam
        || this.userInfo.username === '901952666'  //sy
        || this.userInfo.username === '766777123'  //dinh
      ) {
        //them cac menu mau vao
        this.treeMenu = this.treeMenu.concat(sampleMenu);
      }

    }

    //bao hieu da login xong
    this.events.publish('event-main-login-checked', {
      token: this.token,
      user: this.userInfo
    });

  }


  callbackTree = function (item, idx, parent, isMore: boolean) {
    if (item.visible) {
      parent.forEach((el, i) => {
        if (idx !== i) this.expandCollapseAll(el, false)
      })
    }

    if (isMore) {
      if (item.next) {
        this.navCtrl.push(item.next, { parent: this });
        this.menuCtrl.close();
        if (item.next === this.rootPage) {
          //lam gi voi trang chu??? khong can
        }

      } else if (item.in_app_browser && item.url) {
        //mo kieu new window
        var target = "_blank"; //mo trong inappbrowser
        var options = "hidden=no,toolbar=yes,location=yes,presentationstyle=fullscreen,clearcache=yes,clearsessioncache=yes";
        this.inAppBrowser.create(item.url, target, options);

      } else if (item.popup_iframe && item.url) {

        if (this.platform.is('ios')) {
          //mo kieu popup cua ios doc link
          this.inAppBrowser.create(item.url, '_blank');
        } else {
          //mo keu popup
          this.openModal(item.popup_iframe
            , {
              parent: this,
              link: item.url
            });
        }

      } else if (item.url) {
        //neu ios, browser, android??
        if (this.platform.is('ios')) {
          this.inAppBrowser.create(item.url);
        } else {
          window.open(item.url, '_system');
        }
      }
    }

  }.bind(this)



  onClickUser() {
    this.navCtrl.push(LoginPage);
    this.menuCtrl.close();
  }


  callbackChangeImage = function (res: any) {
    return new Promise((resolve, reject) => {
      this.userChangeImage();
      resolve({ next: 'CLOSE' })
    })
  }.bind(this)

  onClickUserImage(func) {
    this.openModal(OwnerImagesPage,
      {
        parent: this
        , func: func
        , callback: this.callbackChangeImage
      });
  }

  onClickLogin() {
    this.navCtrl.push(LoginPage);
    this.menuCtrl.close();
  }

  onClickHeader(btn) {
    if (btn.next === "EXPAND") this.treeMenu.forEach(el => this.expandCollapseAll(el, true))
    if (btn.next === "COLLAPSE") this.treeMenu.forEach(el => this.expandCollapseAll(el, false))
  }

  expandCollapseAll(el, isExpand: boolean) {
    if (el.subs) {
      el.visible = isExpand;
      el.subs.forEach(el1 => {
        this.expandCollapseAll(el1, isExpand)
      })
    }
  }

  openModal(form, data?: any) {
    let modal = this.modalCtrl.create(form, data);
    modal.present();
  }

}

