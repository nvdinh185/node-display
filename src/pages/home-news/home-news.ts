import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { ApiAuthService } from '../../services/apiAuthService';

@Component({
  selector: 'page-home-news',
  templateUrl: 'home-news.html'
})
export class HomeNewsPage {

  server = "http://localhost:9238/site-manager/news"
  contacts = {}

  constructor(
    public modalCtrl: ModalController
    , private apiAuth: ApiAuthService
  ) { }

  ngOnInit() {
    setTimeout(() => {
      console.log(this.dynamicCards.items)
    }, 2000);
    this.refreshNews();
  }

  dynamicCards = {
    title: ""
    , items: []
  }

  refreshNews() {
    this.contacts = {
      903500888: { fullname: "Cuong Test", avatar: "/assets/imgs/m2.png" },
      766777123: { fullname: "NV Định", avatar: "/assets/imgs/m1.png" }
    };

    console.log("this.contacts: ", this.contacts)
    this.getHomeNews();
  }

  getHomeNews() {
    this.dynamicCards.title = "Đây là trang tin của Public"
    this.getJsonPostNews()
      .then(data => {
        console.log("new: ", data)
        data.reverse().forEach((el, idx) => {
          let index = this.dynamicCards.items
            .findIndex(x => x.group_id === el.group_id);
          if (index < 0) {
            this.dynamicCards.items.unshift(el);
          }
        })
      })
      .catch(err => console.log(err))
  }

  getJsonPostNews() {
    let linkFile = this.server + "/get-file/"
    let offset = 0;
    let limit = 5;
    let follows = [];
    for (let key in this.contacts) {
      follows.push(key);
    }

    let json_data = {
      limit: limit,
      offset: offset,
      follows: follows
    }
    return this.apiAuth.postDynamicForm(this.server + "/get-news", json_data)
      .then(data => {
        let items = [];
        data.forEach(el => {
          let medias = [];
          let files = [];
          if (el.medias) {
            el.medias.forEach(e => {
              if (e.type == 1) {
                e.image = linkFile + e.url;
                e.src = linkFile + e.url;
                medias.push(e);
              } else {
                let src = "assets/imgs/file.png";
                if (e.file_type !== undefined && e.file_type !== null) {
                  if (e.file_type.toLowerCase().indexOf("pdf") >= 0) src = "assets/imgs/pdf.png";
                  if (e.file_type.toLowerCase().indexOf("word") >= 0) src = "assets/imgs/word.png";
                }
                files.push({
                  src: src,
                  url: linkFile + e.url,
                  alt: e.file_name,
                  file_type: e.file_type
                })
              }
            })
          }
          el.medias = medias;
          el.files = files;
          el.actions = {
            like: { name: "LIKE", color: "primary", icon: "thumbs-up", next: "LIKE" }
            , comment: { name: "COMMENT", color: "primary", icon: "chatbubbles", next: "COMMENT" }
            , share: { name: "SHARE", color: "primary", icon: "share-alt", next: "SHARE" }
          }
          el.short_detail = {
            p: el.title
            , note: el.time
            , action: { color: "primary", icon: "more", next: "MORE" }
          }
          el.results = {
            likes: {
              like: ["like"]
              , love: ["love"]
              , sad: ["sad"]
            }
            , comments: [
              {
                name: "cuong.dq"
                , comment: "day la cai gi vay"
                , time: new Date().getTime()
              }
              ,
              {
                name: "cu.dq"
                , comment: "la cai nay do nhe"
                , time: new Date().getTime()
              }
            ]
            , shares: [
              {
                name: "cuong.dq"
                , comment: "day la cai gi vay"
                , time: new Date().getTime()
              }
              ,
              {
                name: "cu.dq"
                , comment: "la cai nay do nhe"
                , time: new Date().getTime()
              }
            ]
          }
          items.push(el);
        });
        return items;
      })
      .catch(err => { return [] })
  }
}