  import { Component, ViewChild } from '@angular/core';
  import { NavController, AlertController, LoadingController, Platform, ItemSliding, Item, ModalController } from 'ionic-angular';
  import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
  import { ApiResourceService } from '../../services/apiResourceServices';
  import { ApiStorageService } from '../../services/apiStorageService';
  import { DynamicFormWebPage } from '../dynamic-form-web/dynamic-form-web';
  import { ApiHttpPublicService } from '../../services/apiHttpPublicServices';
  import { ApiAuthService } from '../../services/apiAuthService';

@Component({
  selector: 'page-maintenanece',
  templateUrl: 'maintenanece.html',
})
export class MaintenanecePage {
  
  server = "http://localhost:9238/site-manager";

  maintenanceCycles:any=[];
  lastCycle: any = {};

  constructor(private navCtrl: NavController,
              private inAppBrowser: InAppBrowser,
              private resource: ApiResourceService,
              private pubService: ApiHttpPublicService,
              private apiAuth: ApiAuthService,
              private apiStorageService: ApiStorageService,
              private platform: Platform,
              private alertCtrl: AlertController,
              private modalCtrl: ModalController,
              private loadingCtrl: LoadingController) {
  }

  ngOnInit(){
    
   this.getmaintenanceCycles()
   .then(data=>{
     //console.log('data',data);
     this.maintenanceCycles = data.maintenance_cycles;
     this.lastCycle = data.last_cycle;
   })
   .catch(err=>{
     console.log('err',err);
   })
  }

  openModal(form, data?: any) {
    let modal = this.modalCtrl.create(form, data);
        modal.onDidDismiss(data=>{
          //console.log('ket qua xu ly popup xong', data);
          if (data){
            this.maintenanceCycles = data.maintenance_cycles;
            this.lastCycle = data.last_cycle;
          }
        })
    modal.present();
  }

  getmaintenanceCycles(){

    return new Promise<any>((resolve, reject) => {
      let loading = this.loadingCtrl.create({
        content: 'Đang kiểm tra các kỳ bảo dưỡng...'
      });
      loading.present();
  
      this.apiAuth.getDynamicUrl(this.server+"/get-json-cycles?limit=6")
      .then(maintenanceCycles=>{
        // maintenanceCycles.forEach(el => {
        //   el.bill_cycle_vn = el.bill_cycle.slice(4,6)+"/"+el.bill_cycle.slice(0,4)
        //   el.bill_date_vn = el.bill_date.slice(6,8)+"/"+el.bill_date.slice(4,6)+"/"+el.bill_date.slice(0,4)
        //   el.bill_cycle_value = el.bill_cycle.slice(0,4) +"-"+ el.bill_cycle.slice(4,6)
        //   el.bill_date_value = el.bill_cycle.slice(0,4) +"-"+ el.bill_cycle.slice(4,6) +"-"+ el.bill_date.slice(6,8)

        // });
        let lastCycle;
        let maxIdCycle = Math.max.apply(Math, maintenanceCycles.map((o)=>{ return o['id']}));
        if (typeof maxIdCycle == 'number') lastCycle = maintenanceCycles.find(x=>x.id===maxIdCycle.toString()); 
        
        loading.dismiss();
        resolve({
            last_cycle: lastCycle,
            maintenance_cycles : maintenanceCycles
          })
      })
      .catch(err=>{
        loading.dismiss();
        reject(err);
      })
    })
  }


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

  // cac ham rieng thuc hien chuc nang he thong nay
  /**
   * Goi API de phat hanh hoa don theo thang
   * @param billCycle 
   */
  callCreateInvoices(billCycle){

    //console.log('ky cuoc',billCycle);

    return new Promise((resolve, reject) => {

      let loading = this.loadingCtrl.create({
        content: 'Đang phát hành hóa đơn <br>' 
        + 'Tháng: ' + billCycle.bill_cycle.slice(0,7)
      });
      loading.present();

      this.resource.createInvoices(billCycle)
      .then(result=>{
        if (result&&result.status&&result.data){
          //console.log('data',result.data);
          this.presentAlert({
            ok_text: 'Xong',
            title:'ĐÃ PHÁT HÀNH XONG',
            message:'Tháng: ' + (result.data.bill_cycle?result.data.bill_cycle.slice(4,6)+'/'+result.data.bill_cycle.slice(0,4):'') + '<br>'
                    + 'Ngày phát hành: ' + (result.data.bill_date?result.data.bill_date.slice(6,8)+'/'+result.data.bill_date.slice(4,6)+'/'+result.data.bill_date.slice(0,4):'') + '<br>'
                    + 'Số lượng phát hành: ' + result.data.count + '<br>'
                    + 'Số hóa đơn lần tiếp theo: ' + result.data.invoice_no,
          });
          resolve(result);
        }
        loading.dismiss();
      })
      .catch(err=>{
        loading.dismiss();
        reject(err);
      })
    })
  }

  /**
   * Ham callback cua form dynamic
   */
  callbackRebuild = function(res) {
    console.log('phat hanh',res);
    return new Promise((resolve, reject) => {
      resolve({
        next:"CLOSE" 
      });
    })

  }.bind(this);

  /**
   * tao chu ky bao duong moi
   * @param func 
   */
  onClickHeaders(func){

    //console.log(cycle);
    if (func==='BUILD'){
      
      let formObj: any =  {
        
        title: "TẠO MỚI KỲ BẢO DƯỠNG"
      , home_disable: false //nut home
      , buttons: [
          {color:"danger", icon:"close", next:"CLOSE"} 
        ]
      , items: [
        { type: "title",          name: "CHỌN VÀ NHẬP"}
        , { type: "text", key: "id", disabled: true, name: "Mã chu kỳ", input_type: "text", icon: "mail"}
        , { type: "datetime", key: "year", name: "Năm", hint: "Hãy chọn năm bảo dưỡng", display:"YYYY", picker:"YYYY"}
        , { type: "select", key: "quarter", name: "Chọn quý", value: 1, options: [{ name: "Quý I", value: 1 }, { name: "Quý II", value: 2 }, { name: "Quý III", value: 3 }, { name: "Quý IV", value: 4 }] }
        , { type: "text", key: "description", name: "Mô tả", hint: "Hãy nhập mô tả kỳ bảo dưỡng", input_type: "text", icon: "mail", validators: [{ required: true, min: 5, max: 50} ]}
        , 
        { 
            type: "button"
          , options: [
            { name: "Reset", next: "RESET" }
            , { name: "Bỏ qua", next: "CLOSE" }
            , { name: "Xử lý", next: "CALLBACK", url: this.server + "/create-cycle", token: true }
          ]
        }
      ]
      };

        this.openModal(DynamicFormWebPage,{
            parent: this
            , callback: this.callbackRebuild
            , form: formObj
          })

      
      
    }
  }


  callbackPrintSelect = function (res){
    //console.log(res)
    
    return new Promise((resolve, reject) => {
      let link = ApiStorageService.resourceServer+"/db/pdf-invoices/"
                +res.data.bill_cycle
                +"?token="+this.apiStorageService.getToken()
                +(res.data.area_id?"&area_id="+res.data.area_id:"")
                +(res.data.staff_id?"&staff_id="+res.data.staff_id:"")
                +(res.data.price_id?"&price_id="+res.data.price_id:"")
                +(res.data.cust_id?"&cust_id="+res.data.cust_id:"")
                ;
      if (this.platform.is('ios')) {
        this.inAppBrowser.create(link);
      } else {
        window.open(link, '_system');
      }

      resolve({next:"CLOSE"});

    })
  }.bind(this);

/**
   * Khi bam len tung item, thi cho popup cua so chon
   * nhan vien, khu vuc, gia cuoc, ... khach le de in
   * 
   * @param cycle 
   */
  async onClickItem(cycle){

    
    let data:any = {
      title: "Lọc theo tiêu chí"
      , items: [
        { type: "text", key: "bill_cycle", disabled: true, value: cycle.bill_cycle, name: "Kỳ cước", input_type: "text", icon: "alarm" }
        ,
        { type: "select", key: "area_id", name: "Khu vực", value: 0,  options: [{ name: "<<Tất cả>>", value: 0 }] }
        ,
        { type: "select", key: "staff_id", name: "Quản lý", value: 0,  options: [{ name: "<<Tất cả>>", value: 0 }] }
        ,
        { type: "select", key: "price_id", name: "Loại khách hàng", value: 0,  options: [{ name: "<<Tất cả>>", value: 0 }] }
        ,
        { type: "text", key: "cust_id", name: "Mã khách hàng", input_type: "text", icon: "contact" }
        ,
        { 
          type: "button"
          , options: [
            { name: "Bỏ qua", next: "CLOSE"}
            ,{ name: "Tạo trang in", next: "CALLBACK"}
        ]
        }
      ]
    }

    let staffs = await this.apiAuth.getDynamicUrl(ApiStorageService.resourceServer+"/db/json-parameters"
                                                              +"?type=4",true);
    let prices = await this.apiAuth.getDynamicUrl(ApiStorageService.resourceServer+"/db/json-prices",true);
    let areas = await this.apiAuth.getDynamicUrl(ApiStorageService.resourceServer+"/db/json-parameters"
                                                            +"?type=6",true);

    areas.forEach(el => {
      data.items.find(x=>x.key==="area_id")
      .options.push(
        { name: el.description, value: parseInt(el.code)}
        )
    });

    staffs.forEach(el => {
      data.items.find(x=>x.key==="staff_id")
      .options.push(
        { name: el.description, value: parseInt(el.code)}
        )
    });

    prices.forEach(el => {
      data.items.find(x=>x.key==="price_id")
      .options.push(
        { name: el.description, value: parseInt(el.code)}
        )
    });
    
    this.navCtrl.push(DynamicFormWebPage
      , {
        parent: this,
        callback: this.callbackPrintSelect,
        form: data
      });
    
}


  onClickDetails(slidingItem: ItemSliding, cycle: any, func: string){
    this.closeSwipeOptions(slidingItem);

    if (func==='RE-BUILD'){
      
      console.log('RE-BUILD',cycle);

      let loading = this.loadingCtrl.create({
        content: 'Đang đọc dữ liệu ....'
      });
      loading.present();

      this.pubService.getDynamicForm("assets/data/form-add-billcycle.json")
      .then(data=>{
        loading.dismiss();

        data.items.find(x=>x.key==='bill_cycle').value = cycle.bill_cycle_value;
        data.items.find(x=>x.key==='bill_date').value = cycle.bill_date_value;
        data.items.find(x=>x.key==='invoice_no').value = cycle.invoice_no_min;

        this.openModal(DynamicFormWebPage,{
            parent: this
            , callback: this.callbackRebuild
            , form: data
          })
      })
      .catch(err=>{
        loading.dismiss();
      })
      
    }

    if (func==='PRINT-ONE'){
      
    }

    if (func==='RELOAD'){
      
    }

    if (func==='PRINT-ALL'){
      let link = ApiStorageService.resourceServer+"/db/pdf-invoices/"+cycle.bill_cycle+"?token="+this.apiStorageService.getToken();
      //var target = "_blank"; //mo trong inappbrowser
      //var options = "hidden=no,toolbar=yes,location=yes,presentationstyle=fullscreen,clearcache=yes,clearsessioncache=yes";
      //this.inAppBrowser.create(link,target,options);
      this.inAppBrowser.create(link);
    }
  }

  
  presentConfirm(jsonConfirm:{title:string,message:string,cancel_text:string,ok_text:string,ok:any}) {
    let alert = this.alertCtrl.create({
      title: jsonConfirm.title, //'Xác nhận phát hành',
      message: jsonConfirm.message, //'Bạn muốn ',
      buttons: [
        {
          text: jsonConfirm.cancel_text, //Bỏ qua
          role: 'cancel',
          handler: () => {
            if (jsonConfirm.ok) jsonConfirm.ok(false);
          }
        },
        {
          text: jsonConfirm.ok_text,//'Đồng ý',
          handler: () => {
            if (jsonConfirm.ok) jsonConfirm.ok(true);
          }
        }
      ]
    });
    alert.present();
  }

  presentAlert(jsonConfirm:{title:string,message:string,ok_text:string}) {
    let alert = this.alertCtrl.create({
      title: jsonConfirm.title, //'Xác nhận phát hành',
      message: jsonConfirm.message, //'Bạn muốn ',
      buttons: [
        {
          text: jsonConfirm.ok_text,//'Đồng ý',
          handler: () => {}
        }
      ]
    });
    alert.present();
  }

}

