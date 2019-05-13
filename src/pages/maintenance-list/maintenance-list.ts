import { Component } from '@angular/core';
import { NavController, NavParams, Refresher, ItemSliding, ModalController } from 'ionic-angular';
import { ApiAuthService } from '../../services/apiAuthService';
import { SearchSitePage } from '../search-site/search-site';

@Component({
  selector: 'page-maintenance-list',
  templateUrl: 'maintenance-list.html',
})
export class MaintenanceListPage {

  server = "http://localhost:9238/site-manager";

  parent: any;
  cycle: any;
  
  dynamicList: any;
  options: any = [
                    { name: "Xóa", color:"danger", icon:"trash", next:"EXIT"}
                  , { name: "Chỉnh sửa", color:"primary", icon:"create", next: "NEXT"}
                  , { name: "Xem chi tiết", color:"secondary", icon:"list", next: "CALLBACK"}
                ]

  isSearch: boolean = false;
  searchString: string = '';
  shouldShowCancel: boolean = true;

  isMobile: boolean = false;

  constructor(
    private navCtrl: NavController, 
    private navParams: NavParams,
    private apiAuth: ApiAuthService,
    private modalCtrl: ModalController
    ) {
  }

  ngOnInit() {
    this.parent = this.navParams.get("parent");
    this.cycle = this.navParams.get("cycle");
    this.refresh();
  }


  refresh(){

    this.dynamicList = {
      title: "Danh sách bảo dưỡng"
      , search_bar: {hint: "Tìm theo site_id theo tiếp đầu ngữ"} 
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
      , items: []
    };

    this.apiAuth.getDynamicUrl(this.server+"/maintenance-sites?maintenance_cycle="+this.cycle.id+"&limit=20&offset=0",true)
    .then(data=>{
      data.forEach(el => {
        this.dynamicList.items.push({
          site_id: el.site_id
          ,name: el.name
          ,address: el.address
          ,create_time: el.create_time
        });
      });
    })
    .catch(err=>{

    })
  }


// Su dung slide Pages
  /**
   * Thay đổi cách bấm nút đóng lệnh bằng nút trên item sliding
   * @param slidingItem 
   */
  closeSwipeOptions(slidingItem: ItemSliding, it:any){
    slidingItem.close();
    slidingItem.setElementClass("active-sliding", false);
    slidingItem.setElementClass("active-slide", false);
    slidingItem.setElementClass("active-options-right", false);
    it.isSlidingItemOpen=false;
  }
  //----------- end of sliding


  //Su dung search
  //---------------------
  goSearch(){
    this.isSearch = true;
  }

  searchEnter(){
    this.isSearch = false;
    //console.log(this.searchString);
    //tim kiem de lay tu server tra ve danh sach va inra
    this.apiAuth.getDynamicUrl(this.server+"/maintenance-sites?site_id="+this.searchString+"&limit=20&offset=0",true)
    .then(data=>{

      this.dynamicList.items = [];

      data.forEach(el => {
        this.dynamicList.items.push({
            h1:el.site_id
            ,h3:el.site_name
            ,p:el.address
            ,note:"trang bd"
        });
      });
    })
    .catch(err=>{

    })
  }

  onInput(e){
    //console.log(this.searchString);
  }

  onClick(btn){
    //console.log(btn);

  }

  onClickItem(it){
    console.log(it);
  }

  onClickDetails(item: ItemSliding, btn: any, it: any){
    this.closeSwipeOptions(item, it);
    btn.item = it;
    console.log(btn);

  }

  /**
   * tim kiem site
   * @param func 
   */
  onClickHeaders(func){

    //console.log(cycle);
    if (func==='SEARCH'){
      
      /* let formObj: any =  {
        
        title: "TẠO MỚI KỲ BẢO DƯỠNG"
      , home_disable: false //nut home
      , buttons: [
          {color:"danger", icon:"close", next:"CLOSE"} 
        ]
      , items: [
        { type: "title",          name: "CHỌN VÀ NHẬP"}
        , { type: "datetime", key: "year", name: "Năm", hint: "Hãy chọn năm bảo dưỡng", display:"YYYY", picker:"YYYY"}
        , { type: "select", key: "quarter", name: "Chọn quý", value: 1, options: [{ name: "Quý I", value: 1 }, { name: "Quý II", value: 2 }, { name: "Quý III", value: 3 }, { name: "Quý IV", value: 4 }] }
        , { type: "text", key: "name", name: "Tên chu kỳ", hint: "Hãy nhập tên chu kỳ", input_type: "text", icon: "ios-create-outline", validators: [{ required: true, min: 5, max: 50} ]}
        , { type: "text", key: "description", name: "Mô tả", hint: "Hãy nhập mô tả kỳ bảo dưỡng", input_type: "text", icon: "ios-create-outline", validators: [{ required: true, min: 5, max: 50} ]}
        , 
        { 
            type: "button"
          , options: [
            { name: "Reset", next: "RESET" }
            , { name: "Bỏ qua", next: "CLOSE" }
            , { name: "Xử lý", next: "CALLBACK", url: this.server + "/" + this.function_string, token: true }
          ]
        }
      ]
      }; */

        this.openModal(SearchSitePage,{
            parent: this
            // , callback: this.callbackRebuild
            // , form: formObj
          })

      
      
    }
  }

  openModal(form, data?: any) {
    let modal = this.modalCtrl.create(form, data);
        modal.onDidDismiss(data=>{
          //console.log('ket qua xu ly popup xong', data);
          if (data){
          }
        })
    modal.present();
  }

}
