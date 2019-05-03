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
    .then(key=>{
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
      
                this.apiChat.initChatting(this.token,this.userInfo, friends);

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


  resetTreeMenu() {
    //tuy thuoc vao tung user se co menu khac nhau
    if (this.userInfo
      && (this.userInfo.username === '903500888'
        || this.userInfo.username === '702418821'
        || this.userInfo.username === '905000551'
        || this.userInfo.username === '904901567'
        || this.userInfo.username === '906515458'
        || this.userInfo.username === '766777123'
      )) {
      this.treeMenu = [
        {
          name: "1. Trang chủ",
          size: "1.3em",
          click: true,
          next: this.rootPage,
          icon: "home"
        }
        ,
        {
          name: "2. Các liên kết Nội bộ",
          size: "1.3em",
          subs: [
            {
              name: "2.1 Quản lý công việc - yêu cầu",
              size: "1.3em",
              click: true,
              url: "https://c3.mobifone.vn/qlhs/login",
              icon: "alarm"
            }
            ,
            {
              name: "2.2 Hỗ trợ điểm bán lẻ",
              size: "1.3em",
              click: true,
              url: "https://c3.mobifone.vn/dbl/login",
              icon: "people"
            }
            ,
            {
              name: "2.3 Chọn số Công ty 3",
              size: "1.3em",
              click: true,
              popup_iframe: LinkPage, //su dung link web ko file
              url: "https://chonsoc3.mobifone.vn/",
              icon: "keypad"
            }
            ,
            {
              name: "2.4 Nối mạng Công ty 3 SSL4",
              size: "1.3em",
              click: true,
              url: "https://ssl4.c3.mobifone.vn/dana-na/auth/url_default/welcome.cgi",
              icon: "flash"
            }
          ]
        }
        ,
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
                  name: "3.2.1 Mẫu danh sách quẹt nút click",
                  click: true,
                  next: DynamicListPage,
                  icon: "paper"
                }
                ,
                {
                  name: "3.2.2 Mẫu danh sách bảng, liệt kê & sắp xếp lại",
                  click: true,
                  next: DynamicListOrderPage,
                  icon: "reorder"
                }
                ,
                {
                  name: "3.2.3 Mẫu danh sách theo cây FamilyTree",
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
        ,
        {
          name: "5. Speedtest",
          size: "1.3em",
          click: true,
          next: HomeSpeedtestPage,
          icon: "speedometer"
        }
        ,
        {
          name: "6. Bản đồ dẫn đường",
          size: "1.3em",
          click: true,
          next: GoogleMapPage,
          icon: "globe"
        }
        ,
        {
          name: "7. Qr Bar Scanner",
          size: "1.3em",
          click: true,
          next: QrBarScannerPage,
          icon: "qr-scanner"
        }
        ,
        {
          name: "8. Contacts",
          size: "1.3em",
          click: true,
          next: ContactsPage,
          icon: "contacts"
        }
        ,
        {
          name: "9. Cordova",
          size: "1.3em",
          click: true,
          next: CordovaPage,
          icon: "heart"
        }
        ,
        {
          name: "10. Login",
          size: "1.3em",
          click: true,
          next: LoginPage,
          icon: "log-in"
        }
      ]
    } else if (this.userInfo) {
      this.treeMenu = [
        {
          name: "1. Trang chủ",
          size: "1.3em",
          click: true,
          next: this.rootPage,
          icon: "home"
        }
        ,
        {
          name: "2. Quản lý công việc - yêu cầu",
          size: "1.3em",
          click: true,
          //popup: LinkPage, //su dung link web ko file
          url: "https://c3.mobifone.vn/qlhs/login",
          icon: "alarm"
        }
        ,
        {
          name: "3. Hỗ trợ điểm bán lẻ",
          size: "1.3em",
          click: true,
          //popup: LinkPage, //su dung link web ko file
          url: "https://c3.mobifone.vn/dbl/login",
          icon: "people"
        }
        ,
        {
          name: "4. Chọn số Công ty 3",
          size: "1.3em",
          click: true,
          popup_iframe: LinkPage, //su dung link web ko file
          url: "https://chonsoc3.mobifone.vn/",
          icon: "keypad"
        }
        ,
        {
          name: "5. Nối mạng Công ty 3 SSL4",
          size: "1.3em",
          click: true,
          url: "https://ssl4.c3.mobifone.vn/dana-na/auth/url_default/welcome.cgi",
          icon: "flash"
        }
        ,
        {
          name: "6. Qr Bar Scanner",
          size: "1.3em",
          click: true,
          next: QrBarScannerPage,
          icon: "qr-scanner"
        }
        ,
        {
          name: "7. Contacts",
          size: "1.3em",
          click: true,
          next: ContactsPage,
          icon: "contacts"
        }
        ,
        {
          name: "8. Cordova",
          size: "1.3em",
          click: true,
          next: CordovaPage,
          icon: "heart"
        }
        ,
        {
          name: "9. Login",
          size: "1.3em",
          click: true,
          next: LoginPage,
          icon: "log-in"
        }
      ]

    } else {
      this.treeMenu = [
        {
          name: "1. Trang chủ",
          size: "1.3em",
          click: true,
          next: this.rootPage,
          icon: "home"
        }
        ,
        {
          name: "2. Quản lý công việc - yêu cầu",
          size: "1.3em",
          click: true,
          //popup: LinkPage, //su dung link web ko file
          url: "https://c3.mobifone.vn/qlhs/login",
          icon: "alarm"
        }
        ,
        {
          name: "3. Hỗ trợ điểm bán lẻ",
          size: "1.3em",
          click: true,
          //popup: LinkPage, //su dung link web ko file
          url: "https://c3.mobifone.vn/dbl/login",
          icon: "people"
        }
        ,
        {
          name: "4. Chọn số Công ty 3",
          size: "1.3em",
          click: true,
          popup_iframe: LinkPage, //su dung link web ko file
          url: "https://chonsoc3.mobifone.vn/",
          icon: "keypad"
        }
        ,
        {
          name: "5. Nối mạng Công ty 3 SSL4",
          size: "1.3em",
          click: true,
          url: "https://ssl4.c3.mobifone.vn/dana-na/auth/url_default/welcome.cgi",
          icon: "flash"
        }
        ,
        {
          name: "6. Qr Bar Scanner",
          size: "1.3em",
          click: true,
          next: QrBarScannerPage,
          icon: "qr-scanner"
        }
        ,
        {
          name: "7. Cordova",
          size: "1.3em",
          click: true,
          next: CordovaPage,
          icon: "heart"
        }
        ,
        {
          name: "8. Login",
          size: "1.3em",
          click: true,
          next: LoginPage,
          icon: "log-in"
        }
      ]
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
        this.navCtrl.push(item.next,{parent:this});
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

