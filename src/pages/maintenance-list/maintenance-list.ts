import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Refresher, ItemSliding, ModalController, AlertController } from 'ionic-angular';
import { ApiAuthService } from '../../services/apiAuthService';
import { ApiAutoSiteService } from '../../services/mlmt/apiAutoSiteService';
import { ApiAutoCompleteService } from '../../services/apiAutoCompleteService';
import { AutoCompleteComponent } from 'ionic2-auto-complete';
import { StringsConv } from '../../pipes/pipe-strings';
import { DynamicFormWebPage } from '../dynamic-form-web/dynamic-form-web';

@Component({
  selector: 'page-maintenance-list',
  templateUrl: 'maintenance-list.html',
})
export class MaintenanceListPage {

  @ViewChild('searchBar') searchbar: AutoCompleteComponent;

  server = "http://localhost:9238/site-manager";

  parent: any;
  cycle: any;

  dynamicList: any;
  options: any = [
    { name: "Xóa", color: "danger", icon: "trash", next: "EXIT" }
    , { name: "Chỉnh sửa", color: "primary", icon: "create", next: "NEXT" }
    , { name: "Xem chi tiết", color: "secondary", icon: "list", next: "CALLBACK" }
  ]

  isSearch: boolean = false;
  isSearchLocal: boolean = false;
  searchString: string = '';
  quarter_name: string = '';

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private apiAuth: ApiAuthService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private apiAutoSiteService: ApiAutoSiteService,
    private stringsConv: StringsConv
  ) {
  }

  ngOnInit() {
    this.parent = this.navParams.get("parent");
    this.cycle = this.navParams.get("cycle");
    this.refresh();
  }


  refresh() {

    this.dynamicList = {
      title: "Danh sách bảo dưỡng"
      , search_bar: {placeholder: "Tìm site_id từ list items này?"
                  , is_search: false
                  , search_string: ""} 
      , correct_bar:{ options: { placeholder: "Tìm site từ API auto-complete thêm vào Kế hoạch?"}
                    , is_search: false
                    , search_string: "" } 
      , buttons: [
          {color:"primary", icon:"notifications", next:"NOTIFY"
            , alerts:[
                "cuong.dq"
                ]
          }
        ]
      , items: []
    };

    this.apiAuth.getDynamicUrl(this.server + "/maintenance-sites?maintenance_cycle=" + this.cycle.id + "&limit=20&offset=0", true)
      .then(data => {
        data.forEach(el => {
          this.dynamicList.items.push({
            maintenance_sheet_id: el.maintenance_sheet_id
            , site_id: el.site_id
            , name: el.name
            , address: el.address
            , status: el.maintenance_status
            , create_time: el.create_time
          });
        });
      })
      .catch(err => {

      })
  }


  // Su dung slide Pages
  /**
   * Thay đổi cách bấm nút đóng lệnh bằng nút trên item sliding
   * @param slidingItem 
   */
  closeSwipeOptions(slidingItem: ItemSliding, it: any) {
    slidingItem.close();
    slidingItem.setElementClass("active-sliding", false);
    slidingItem.setElementClass("active-slide", false);
    slidingItem.setElementClass("active-options-right", false);
    it.isSlidingItemOpen = false;
  }
  //----------- end of sliding

  /**
   * Ham callback cua form dynamic
   */
  callbackRebuild = function (res) {
    // console.log('Cap nhat', res);
    return new Promise((resolve, reject) => {
      // ktra va gan du lieu vao obj
      if (res.data) {
        let index = this.dynamicList.items.findIndex(x => x.maintenance_sheet_id === res.data.id);
        // console.log('index update:', index);
        //ktra co index thi remove khoi danh sach
        if (index > -1) {
          this.dynamicList.items.splice(index, 1);
        }

        resolve({
          next: "CLOSE"
        });
        return;
      }

      if (res.error) {
        //alert loi
      }

      resolve();

    })

  }.bind(this);

  //Su dung search
  //---------------------
  goSearch(type) {
    if (type === 'REMOTE')
      this.dynamicList.correct_bar.is_search = true;
    else if (type === 'LOCAL')
      this.dynamicList.search_bar.is_search = true;
    /* console.log(this.searchbar);
    this.searchbar.setFocus(); */
  }

  searchEnter(type) {
    if (type === 'REMOTE')
      this.dynamicList.correct_bar.is_search = false;
    else if (type === 'LOCAL')
      this.dynamicList.search_bar.is_search = false;
  }

  searchSelect(ev, what) {
    console.log('select item', ev);
    //hoi xem dong y chon dua vao ko?
    if (what==='SELECTED') {
      this.alertCtrl.create({
        title: 'Xác nhận',
        message: 'Bạn muốn chọn site ' + ev.site_id + ' này phải không?',
        buttons: [
          {
            text: 'Bỏ qua',
            role: 'cancel',
            handler: () => {
              //console.log('Cancel clicked');
              if (this.dynamicList&&this.dynamicList.correct_bar) this.dynamicList.correct_bar.is_search = false;
            }
          },
          {
            text: 'Chọn',
            handler: () => {
              // ev.image=  ev.flag;
              // ev.title = ev.nativeName;
              // ev.content = ev.subregion;
              // ev.note = Date.now();
              ev.sites_id = ev.id;
              ev.cycle = this.cycle;
              // console.log("item xu ly: ", ev);
              this.apiAuth.postDynamicForm(this.server + "/site-plan", ev, true)
              .then(result => {
                console.log(result.status);
                if (result.status === 'NOK') {
                  this.presentAlert('Thông báo', result.message);
                } else if (result.status === 'OK') {
                  this.dynamicList.items.unshift(ev);
                }
              })
              .catch(err => {
                console.log("loi post",err);
              });
              
              if (this.dynamicList&&this.dynamicList.correct_bar) this.dynamicList.correct_bar.is_search = false;
            }
          }
        ]
      }).present();
      if (this.dynamicList&&this.dynamicList.correct_bar) this.dynamicList.correct_bar.search_string = "";
    } else {
      if (this.dynamicList&&this.dynamicList.correct_bar && this.dynamicList.correct_bar.search_string !== null) {
        this.dynamicList.correct_bar.is_search = false;
      }
    }

  }

  setFilteredItems() {
    this.dynamicList.items = this.filterItems(this.dynamicList.search_bar.search_string);
  }

  filterItems(searchTerm) {
    return this.dynamicList.items.filter(item => {
      return item.site_id.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });
  }

  onInput(e) {
    //console.log(this.searchString);
  }

  onClick(btn) {
    //console.log(btn);

  }

  onClickItem(it) {
    console.log(it);
  }

  async onClickDetails(item: ItemSliding, it: any, other_it: any, func: string) {
    /* this.closeSwipeOptions(item, it);
    btn.item = it; */
    
    if (func === 'MOVE') {
      // console.log('item',it);
      
      this.options = [];
      await this.apiAuth.getDynamicUrl(this.server + '/get-users', true)
      .then(results => {
        this.options = results;
      })
      .catch(e => { });

      this.quarter_name =  "Quý " + other_it.quarter + "/" + other_it.year;
      let data: any = {

        title: "CHUYỂN GIAO BẢO DƯỠNG"
        , home_disable: false //nut home
        , buttons: [
          { color: "danger", icon: "close", next: "CLOSE" }
        ]
        , items: [
          { type: "title", name: "CHỌN USER" }
          , { type: "text", key: "id", disabled: true, name: "Mã phiếu bảo dưỡng", input_type: "text", value: "Mã phiếu: " + it.maintenance_sheet_id, icon: "alarm" }
          , { type: "text", key: "cycle", disabled: true, name: "Quý bảo dưỡng", input_type: "text", value: this.quarter_name, icon: "ios-bookmark-outline" }
          , { type: "text", key: "site_id", disabled: true, name: "Site", input_type: "text", value: it.site_id, icon: "ios-color-wand-outline" }
          , { type: "select", key: "users", name: "Chọn User chuyển", value: "1", options: this.options }
          ,
          {
            type: "button"
            , options: [
              { name: "Reset", next: "RESET" }
              , { name: "Bỏ qua", next: "CLOSE" }
              , { name: "Xử lý", next: "CALLBACK", url: this.server + "/site-plan", token: true }
            ]
          }
        ]
      };


      this.openModal(DynamicFormWebPage, {
        parent: this
        , callback: this.callbackRebuild
        , form: data
      });
    }

  }

  openModal(form, data?: any) {
    let modal = this.modalCtrl.create(form, data);
    modal.onDidDismiss(data => {
      //console.log('ket qua xu ly popup xong', data);
      if (data) {
      }
    })
    modal.present();
  }

  presentAlert(title, content) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: content,
      buttons: ['OK']
    });
    alert.present();
  }

}
