import { Component } from '@angular/core';
import { NavController, NavParams, Refresher, ItemSliding } from 'ionic-angular';
import { ApiAuthService } from '../../services/apiAuthService';

@Component({
  selector: 'page-maintenanece',
  templateUrl: 'maintenanece.html',
})
export class MaintenanecePage {
  
  server = "http://localhost:9238/site-manager";

  parent:any;
  
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
    public navCtrl: NavController, 
    public navParams: NavParams,
    public apiAuth: ApiAuthService
    ) {
  }

  ngOnInit() {

    


    this.parent = this.navParams.get("parent");
    this.refresh();
  }


  refresh(){

    this.dynamicList = {
      title: "Mạng xã hội"
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

    this.apiAuth.getDynamicUrl(this.server+"/maintenance-sites?site_id=DN&limit=20&offset=0",true)
    .then(data=>{
      
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

}
