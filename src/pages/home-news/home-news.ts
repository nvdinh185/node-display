import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { ApiAuthService } from '../../services/apiAuthService';
import { ApiContactService } from '../../services/apiContactService';

@Component({
  selector: 'page-home-news',
  templateUrl: 'home-news.html'
})
export class HomeNewsPage {

  server = "http://localhost:9238/site-manager/news"
  contacts = {}
  isShow = false;

  constructor(public modalCtrl: ModalController
    , private auth: ApiAuthService
    , private apiContact: ApiContactService
  ) { }

  ngOnInit() {
    setTimeout(() => {
      console.log(this.dynamicCards.items)
    }, 2000);
    this.refreshNews();
  }

  dynamicCards = {
    title: ""
    , buttons: [
      { color: "primary", icon: "photos", next: "ADD" }
    ]
    , items: []
  }

  async refreshNews() {
    //chay ham nay de KHOI TAO CAC USER PUBLIC
    await this.apiContact.getPublicUsers(true);
    //lay cac danh ba public
    this.contacts = this.apiContact.getUniqueContacts();
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
    return this.auth.postDynamicForm(this.server + "/get-news", json_data, true)
      .then(data => {
        let items = [];
        data.forEach(el => {
          let medias = [];
          if (el.medias) {
            el.medias.forEach(e => {
              if (e.url.includes("upload_files")) {
                e.image = linkFile + e.url;
              } else {
                e.image = e.url;
              }
              medias.push(e);
            })
          }
          el.medias = medias;
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