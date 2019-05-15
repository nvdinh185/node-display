import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Refresher, ItemSliding, ModalController, AlertController } from 'ionic-angular';
import { ApiAuthService } from '../../services/apiAuthService';
import { ApiAutoSiteService } from '../../services/mlmt/apiAutoSiteService';
import { ApiAutoCompleteService } from '../../services/apiAutoCompleteService';
import { AutoCompleteComponent } from 'ionic2-auto-complete';
import { StringsConv } from '../../pipes/pipe-strings';

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
  searchOptions = { placeholder: 'Tìm Site nào để thêm vào Kế hoạch?' };

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
            site_id: el.site_id
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

  searchSelect(ev,what) {
    console.log('select item', ev);
    //hoi xem dong y chon dua vao ko?
    if (what==='SELECTED'){
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
              this.apiAuth.postDynamicForm(this.server + "/add-site-plan", ev, true)
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
    console.log('search local');
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

  onClickDetails(item: ItemSliding, btn: any, it: any) {
    this.closeSwipeOptions(item, it);
    btn.item = it;
    console.log(btn);

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
