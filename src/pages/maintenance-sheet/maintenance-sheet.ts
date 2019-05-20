import { Component } from '@angular/core';
import { NavController, NavParams, Platform, ViewController, LoadingController } from 'ionic-angular';
import { ApiHttpPublicService } from '../../services/apiHttpPublicServices';
import { ApiAuthService } from '../../services/apiAuthService';

@Component({
  selector: 'page-maintenance-sheet',
  templateUrl: 'maintenance-sheet.html',
})
export class MaintenanceSheetPage {
  server = "http://localhost:9238/site-manager";

  dynamicTreeForm: any = {
    title: "Phiếu bảo dưỡng"
    , headers: [
      { color: "primary", icon: "arrow-dropup-circle", next: "COLLAPSE" }
      , { color: "primary", icon: "arrow-dropdown-circle", next: "EXPAND" }
    ]
    , buttons: [
      // { color: "primary", icon: "arrow-dropup-circle", name: "Thu hẹp", next: "COLLAPSE" }
      // , { color: "primary", icon: "arrow-dropdown-circle", name: "Mở rộng", next: "EXPAND" }
      { color: "primary", name: "Reset", next: "RESET" }
      , { color: "primary", name: "Xử lý", next: "SEND" }
    ]
    , items: [
      {
        key: 1,               //mã của node cây
        type: "title",       //kiểu hiển thị title
        name: "I. Nhà Trạm", //title hiển thị
        is_more: true,       //hiển thị nút more
        subs: [              //có hiển thị lá cây con 
          {
            key: 2,           //mã của node cây
            type: "detail",  //Kiểu hiển thị chỉ giá trị không
            name: "Mã trạm", //đề mục chi tiết
            avatar: "https://icdn.dantri.com.vn/thumb_w/640/2019/03/02/531510014249880849060024764118135794040832-n-1551502898256.jpg",
            value: "DNTK01", //Giá trị hiển thị không sử dụng thay đổi nhập liệu
            subs: [{
              key: 3,           //mã của node cây
              type: "select",  //Kiểu hiển thị chọn 1 nội dung
              name: "Hãy lựa chọn đánh giá nhé", //đề mục chi tiết
              value: -1,
              options: [{ name: "N/A", value: -1 }
                , { name: "Đạt", value: 1 }
                , { name: "Không đạt", value: 0 }]
            }
            ]
          }
        ]
      }
      ,
      {
        key: 4,           //mã của node cây
        type: "detail",  //Kiểu hiển thị chỉ giá trị không
        name: "Mã trạm", //đề mục chi tiết
        value: "Đây là trạm thông tin DNTK02 - Ở Đà nẵng thanh khê ... ", //Giá trị hiển thị không sử dụng thay đổi nhập liệu
        subs: [{
          key: 5,           //mã của node cây
          type: "select",  //Kiểu hiển thị chọn 1 nội dung
          name: "Vị trí phòng máy nơi đặt MDF đảm bảo an ninh, an toàn chống ngập lụt",
          value: 5,
          options: [{ name: "0 Điểm", value: 0 }
            , { name: "1 Điểm", value: 1 }
            , { name: "2 Điểm", value: 2 }
            , { name: "3 Điểm", value: 3 }
            , { name: "4 Điểm", value: 4 }
            , { name: "5 Điểm", value: 5 }
          ]
        }
          ,
        {
          key: 6,           //mã của node cây
          type: "range-star",  //Kiểu hiển thị chọn 1 nội dung
          name: "Mặt cười",
          icon: "happy",
          color: "star",
          value: 5,
          min: 0,
          max: 10
        }
        ]
      }
    ]
  };

  callback: any; // ham goi lai khai bao o trang root gui (neu co)
  step: any;     // buoc thuc hien xuat phat trang root goi (neu co)
  parent: any;    // Noi goi this

  callbackTreeView: any;
  callbackTreeForm: any;

  constructor(
    private platform: Platform
    , private apiPublic: ApiHttpPublicService
    , private viewCtrl: ViewController
    , private navCtrl: NavController
    , private navParams: NavParams
    , private loadingCtrl: LoadingController
    , private apiAuth: ApiAuthService
  ) { }

  ngOnInit() {

    this.dynamicTreeForm = this.navParams.get("tree") ? this.navParams.get("tree") : this.dynamicTreeForm;
    this.getMaintenanceSheet()
      .then(data => {
        this.dynamicTreeForm.items = [];
        this.dynamicTreeForm.items = data.maintenance_sheet;
      })
      .catch(err => {
        console.log('err', err);
      })

    this.callback = this.navParams.get("callback");
    this.step = this.navParams.get("step");
    this.parent = this.navParams.get("parent");

    this.callbackTreeView = this.callbackTree;
    this.callbackTreeForm = this.callbackTree;
  }

  getMaintenanceSheet() {

    return new Promise<any>((resolve, reject) => {
      let loading = this.loadingCtrl.create({
        content: 'Đang lấy thông tin phiếu bảo dưỡng...'
      });
      loading.present();

      this.apiAuth.getDynamicUrl(this.server + "/get-maintenance-sheet")
        .then(maintenanceSheet => {
          loading.dismiss();
          resolve({
            maintenance_sheet: maintenanceSheet
          })
        })
        .catch(err => {
          loading.dismiss();
          reject(err);
        })
    })
  }

  resetForm() {
    
  }

  changeRootForm(event) {
    console.log('parent', event);
  }

  callbackTree = function (item, idx, parent, isMore: boolean) {
    if (item.visible) {
      parent.forEach((el, i) => {
        if (idx !== i) this.expandCollapseAll(el, false)
      })
    }

    if (isMore) {
      console.log(item);
    }

  }.bind(this)

  onClickHeader(btn) {
    if (btn.next === "EXPAND") this.dynamicTreeForm.items.forEach(el => this.expandCollapseAll(el, true))
    if (btn.next === "COLLAPSE") this.dynamicTreeForm.items.forEach(el => this.expandCollapseAll(el, false))
  }

  expandCollapseAll(el, isExpand: boolean) {
    if (el.$children) {
      el.visible = isExpand;
      el.$children.forEach(el1 => {
        this.expandCollapseAll(el1, isExpand)
      })
    }
  }

  // Xử lý sự kiện click button theo id
  onClick(btn) {
    // console.log('duyet ket qua', btn, this.dynamicTreeForm.items);
    //chuyen doi cay sang array
    let plane_array = this.apiPublic.convertTree2Order(this.dynamicTreeForm.items, "$children");
    console.log('arr: ',plane_array);
    let result = {}
    plane_array.forEach(el => {
      if (!result[el.id] && el.value) {
        Object.defineProperty(result, el.id, { value: el.value, writable: true, enumerable: true, configurable: true });
      }
    });
    // console.log('ket qua lay duoc', result);
    this.next(btn);
  }

  next(btn) {
    console.log(btn.next_data,this.navCtrl.length());
    if (btn) {
      if (btn.next == 'EXIT') {
        this.platform.exitApp();
      } else if (btn.next == 'RESET') {
        this.resetForm();
      } else if (btn.next == 'CLOSE') {
        if (this.parent) this.viewCtrl.dismiss(btn.next_data)
      } else if (btn.next == 'BACK') {
        if (this.parent) this.navCtrl.pop()
        //if (this.navCtrl.length() > 1) this.navCtrl.pop();      //goback 1 step
      } else if (btn.next == 'CALLBACK') {
        if (this.callback) {
          this.callback(btn.next_data, this.parent)
            .then(nextStep => this.next(nextStep));
        } else {
          if (this.parent) this.navCtrl.pop()
        }
      } else if (btn.next == 'NEXT' && btn.next_data && btn.next_data.data) {
        btn.next_data.callback = this.callback; //gan lai cac function object
        btn.next_data.parent = this.parent;     //gan lai cac function object
        btn.next_data.tree = btn.next_data.data; //gan du lieu tra ve tu server
        this.navCtrl.push(MaintenanceSheetPage, btn.next_data);
      }
    }

  }

}
