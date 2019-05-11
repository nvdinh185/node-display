import { Component, ViewChild } from '@angular/core';
import { NavController, ItemSliding, Platform, NavParams, ViewController, LoadingController, AlertController } from 'ionic-angular';
import { ApiAuthService } from '../../services/apiAuthService';
import { ApiHttpPublicService } from '../../services/apiHttpPublicServices';
import { AutoCompleteComponent } from 'ionic2-auto-complete';
import { ApiAutoCompleteService } from '../../services/apiAutoCompleteService';

@Component({
  selector: 'page-dynamic-list',
  templateUrl: 'dynamic-list.html'
})
export class DynamicListPage {
  
  @ViewChild('searchbar') searchbar: AutoCompleteComponent;

  dynamicList: any = {}; 
  dynamicListOrigin: any = {
    title: "Danh sách kiểu viber"
    , search_bar: {hint: "Tìm cái gì đó"} 
    , buttons: [
        {color:"primary", icon:"add", next:"ADD"}
        , {color:"primary", icon:"contacts", next:"FRIENDS"}
        , {color:"primary", icon:"notifications", next:"NOTIFY"
          , alerts:[
              "cuong.dq"
              ]
          }
        , {color:"royal", icon:"cog", next:"SETTINGS"}
      ]
    , items: [
        {
            image: "assets/imgs/img_forest.jpg"
            ,title:"Là tiêu đề của đề mục"
            ,content:"Sau khi đánh cồng khai trương phiên giao dịch đầu xuân Kỷ Hợi 2019 tại Sở Giao dịch chứng khoán Hà Nội vào sáng 12-2, Thủ tướng Chính phủ Nguyễn Xuân Phúc khẳng định tầm quan trọng của thị trường chứng khoán Việt Nam."
            ,note: Date.now()
        }
        ,{
            icon:"contact"
            ,title:"Là tiêu đề nội dung 2"
            ,content:"Trong những ngày đánh bắt đầu năm, 3 ngư dân Quảng Trị đã thu hoạch được mẻ cá bè gần 140 tấn; trong đó một ngư dân trúng mẻ cá siêu khủng nặng hơn 100 tấn."
            ,note: Date.now()
        }
    ]
  };
  
  callback: any; 
  step: any;  
  parent:any;
  offset:number; //dich chuyen option command
  
  isSearch: boolean = false;

  isMobile: boolean = false;

  constructor(  private platform: Platform
              , private authService: ApiAuthService
              , private pubService: ApiHttpPublicService
              , private viewCtrl: ViewController
              , private alertCtrl: AlertController
              , private navCtrl: NavController
              , private apiAutoComplete: ApiAutoCompleteService
              , private loadingCtrl: LoadingController
              , private navParams: NavParams
             ) {}

  ngOnInit(){
    this.dynamicListOrigin = this.navParams.get("list") ? this.navParams.get("list") : this.dynamicListOrigin;
    this.resetForm();
    
    this.offset = this.navParams.get("offset")?this.navParams.get("offset"):250;
    this.callback = this.navParams.get("callback");
    this.step = this.navParams.get("step");
    
    this.parent = this.navParams.get("parent");

    let call_waiting_data = this.navParams.get("call_waiting_data");
    
    if (call_waiting_data){
      call_waiting_data(this.parent)
      .then(list=>{
        this.resetForm();
      })
    }
  }

  resetForm(list?:any) {
    if (list&&list.length>0){
      this.dynamicList.items = list;
    }else{
      this.dynamicList = this.dynamicListOrigin;
    }
  }

// Su dung slide Pages
  //--------------------------
  /**
   * Thay đổi cách bấm nút đóng lệnh bằng nút trên item sliding
   * @param slidingItem 
   */
  closeSwipeOptions(slidingItem: ItemSliding){
    slidingItem.close();
    slidingItem.setElementClass("active-sliding", false);
    slidingItem.setElementClass("active-slide", false);
    slidingItem.setElementClass("active-options-right", false);
  }
  //----------- end of sliding


  //Su dung search
  //---------------------
  goSearch(){
    this.isSearch = true;
  }

  searchEnter(){
    this.isSearch = false;
  }

  searchSelect(ev){
    console.log('select item',ev);
    //hoi xem dong y chon dua vao ko?
    this.alertCtrl.create({
      title: 'Xác nhận',
      message: 'Bạn muốn chọn ' + ev.name + ' này phải không?',
      buttons: [
        {
          text: 'Bỏ qua',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
            this.isSearch = false;
          }
        },
        {
          text: 'Chọn',
          handler: () => {
            ev.image=  ev.flag;
            ev.title = ev.nativeName;
            ev.content = ev.subregion;
            ev.note = Date.now();
            this.dynamicList.items.unshift(ev);
            this.isSearch = false;
          }
        }
      ]
    }).present();
    
  }

  onClickHeader(btn){
    console.log(btn);
    this.processCommand(btn);
  }

  onClickDetails(item: ItemSliding, btn: any, func: any){
    this.closeSwipeOptions(item);
    btn.func = func;
    console.log(btn);
    this.processCommand(btn);
  }

  processCommand(btn){
    this.next(btn)
  }

  next(btn) {

    if (btn) {
      if (btn.next == 'EXIT') {
        this.platform.exitApp();
      } else if (btn.next == 'RESET') {
        this.resetForm();
      } else if (btn.next == 'CLOSE') {
        if (this.parent) this.viewCtrl.dismiss(btn.next_data)
      } else if (btn.next == 'HOME') {
        if (this.parent) this.navCtrl.popToRoot()
      } else if (btn.next == 'BACK') {
        if (this.parent) this.navCtrl.pop()
      } else if (btn.next == 'CALLBACK') {
        if (this.callback) {
          this.callback(btn.next_data)
            .then(nextStep => this.next(nextStep));
        } else {
          if (this.parent) this.navCtrl.pop()
        }
      } else if (btn.next == 'NEXT' && btn.next_data && btn.next_data.data) {
        btn.next_data.callback = this.callback; //gan lai cac function object
        btn.next_data.parent = this.parent;     //gan lai cac function object
        btn.next_data.form = btn.next_data.data; //gan du lieu tra ve tu server
        this.navCtrl.push(DynamicListPage, btn.next_data);
      }
    }

  }

}
