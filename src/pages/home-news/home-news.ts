import { Component } from '@angular/core';
import { Events, ModalController } from 'ionic-angular';
import { PostNewsPage } from '../post-news/post-news';
import { ApiAuthService } from '../../services/apiAuthService';
import { ApiStorageService } from '../../services/apiStorageService';
import { DynamicCardSocialPage } from '../dynamic-card-social/dynamic-card-social';
import { ApiContactService } from '../../services/apiContactService';

@Component({
  selector: 'page-home-news',
  templateUrl: 'home-news.html'
})
export class HomeNewsPage {

  dynamicCardsOrigin: any = {
    title: "Mạng xã hội"
    , search_bar: { hint: "Tìm cái gì đó" }
    , buttons: [
      { color: "primary", icon: "add", next: "ADD" }
      , { color: "primary", icon: "contacts", next: "FRIENDS" }
      , {
        color: "primary", icon: "notifications", next: "NOTIFY"
        , alerts: [
          "cuong.dq"
        ]
      }
      , { color: "royal", icon: "cog", next: "SETTINGS" }
    ]
    , items: [
      //1.
      {
        short_detail: {
          avatar: "assets/imgs/ca_nau.jpg"
          , h1: "Cuong.dq"
          , p: "Cần thiết là nội dung chi tiết đây, có thể viết tóm lượt nhiều thông tin cũng được"
          , note: "1h ago"
          , action: { color: "primary", icon: "more", next: "MORE" }
        }
        , title: "Chi tiết các ảnh hiển thị"
        , note: "Bài viết chi tiết kết thúc"
        , medias: [
          {
            image: "assets/imgs/img_forest.jpg"
            , title: "Miền quê yêu dấu"
            , h1: "Chốn yên bình"
            , p: "Là nơi bình yên nhất. Bạn có thể dạo bước trên con đường rợp bóng mát thanh bình đến lạ"
          }
          , {
            image: "assets/imgs/anh_vua.png"
            , h1: "Nội dung bài viết vể cao tốc"
            , p: "Một bài viết về cao tốc đây nhé"
          }
          , {
            image: "assets/imgs/ca_nau.jpg"
            , h2: "Cá Nâu ở Quê Mỹ lợi"
            , p: "Cá ngày mồng 3 tết ở quê"
          }
          , {
            image: "assets/imgs/ca_the.jpg"
            , h1: "Cá Thệ ở Quê Mỹ lợi"
            , p: "Cá ngày mồng 3 tết ở quê, Cá thệ kho dưa rất tuyệt vời"
          }
          , { image: "assets/imgs/img_forest.jpg" }
          , {
            image: "assets/imgs/anh_nho.png"
            , h1: "Mùa trái cây chín đỏ"
            , p: "Trái cây vựa, miền quê nhiều cá lắm đó"
          }
        ]
        , results: {
          likes: {
            like: ["Cuong.dq", "abc", "xyz"]
            , love: ["love"]
            , unlike: ["dog"]
            , sad: ["cat"]
            , angery: ["tiger"]
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
        , actions: {
          like: { name: "LIKE", color: "primary", icon: "thumbs-up", next: "LIKE" }
          , comment: { name: "COMMENT", color: "primary", icon: "chatbubbles", next: "COMMENT" }
          , share: { name: "SHARE", color: "primary", icon: "share-alt", next: "SHARE" }
        }
      }
      //2.
      , {
        short_details: {
        }
        , medias: [
          { image: "assets/imgs/img_forest.jpg", title: "1 Ảnh", subtitle: "Tác giả Đoàn Quốc Cường" }
        ]
        , results: {
          likes: {
            like: ["Cuong.dq", "abc", "xyz"]
            , love: ["love"]
          }
          , shares: [
            {
              name: "cu.dq"
              , comment: "la cai nay do nhe"
              , time: new Date().getTime()
            }
          ]

        }
        , actions: {
          like: { name: "Thích", color: "primary", icon: "thumbs-up", next: "LIKE" }
          , comment: { name: "Trò chuyện", color: "primary", icon: "chatbubbles", next: "COMMENT" }
          , share: { name: "Chia sẻ", color: "primary", icon: "share-alt", next: "SHARE" }
        }
      }
      //3.
      , {
        short_details: {

        }
        , medias: [
          { image: "assets/imgs/ca_nau.jpg", title: "Ảnh 1", subtitle: "Tác giả Đoàn Quốc Cường" }
          , { image: "assets/imgs/img_forest.jpg", title: "Ảnh 2", subtitle: "Tác giả Đoàn Quốc Cường" }
        ]
        , results: {
          likes: {
            sad: ["cat"]
          }
          , comments: [
            {
              name: "cu.dq"
              , comment: "la cai nay do nhe"
              , time: new Date().getTime()
            }
          ]
        }
        , actions: {
          like: { name: "Thích", color: "primary", icon: "thumbs-up", next: "LIKE" }
          , comment: { name: "Trò chuyện", color: "primary", icon: "chatbubbles", next: "COMMENT" }
          , share: { name: "Chia sẻ", color: "primary", icon: "share-alt", next: "SHARE" }
        }
      }
      //4.
      , {
        short_details: {

        }
        , medias: [
          { image: "assets/imgs/img_forest.jpg", title: "3 Ảnh", subtitle: "Tác giả Đoàn Quốc Cường" }
          , { image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" }
          , { image: "data:image/gif;base64,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" }
        ]
        , results: {
          likes: {
            like: ["Cuong.dq", "abc", "xyz"]
          }

        }
        , actions: {
          like: { name: "Thích", color: "primary", icon: "thumbs-up", next: "LIKE" }
          , comment: { name: "Trò chuyện", color: "primary", icon: "chatbubbles", next: "COMMENT" }
          , share: { name: "Chia sẻ", color: "primary", icon: "share-alt", next: "SHARE" }
        }
      }
      //5.
      , {
        short_details: {

        }
        , medias: [
          { image: "assets/imgs/img_forest.jpg", title: "4 Ảnh" }
          , { image: "assets/imgs/ca_the.jpg" }
          , { image: "assets/imgs/anh_vua.png" }
          , { image: "assets/imgs/ca_nau.jpg" }
        ]
        , actions: {
          like: { name: "Thích", color: "primary", icon: "thumbs-up", next: "LIKE" }
          , comment: { name: "Trò chuyện", color: "primary", icon: "chatbubbles", next: "COMMENT" }
          , share: { name: "Chia sẻ", color: "primary", icon: "share-alt", next: "SHARE" }
        }
      }

    ]
  };

  server = "http://localhost:9238/site-manager/news"
  userInfo: any;
  maxOnePage = 2;
  pageIndexPublic = 0;
  pageIndexPrivate = 0;
  contacts = {}

  constructor(private events: Events
    , public modalCtrl: ModalController
    , private auth: ApiAuthService
    , private apiContact: ApiContactService
    , private apiStorageService: ApiStorageService
  ) { }

  ngOnInit() {
    let linkPublicNews = this.server + "/get-public-news?limit=" + this.maxOnePage + "&offset=" + this.pageIndexPublic;
    this.getPublicNews(linkPublicNews);

    this.events.subscribe('event-main-login-checked'
      , (data => {
        this.userInfo = data.user;
        this.contacts = this.apiContact.getUniqueContacts();

        //console.log('Contact for new',this.contacts, this.userInfo);
        //them danh ba cua nguoi login vao
        if (this.userInfo) {
          if (!this.contacts[this.userInfo.username]) {
            //console.log('userInfo_data: ', this.userInfo.data);

            Object.defineProperty(this.contacts, this.userInfo.username, {
              value: {
                fullname: this.userInfo.data.fullname,
                nickname: this.userInfo.data.nickname,
                image: this.userInfo.data.image,
                avatar: this.userInfo.data.image,
                relationship: ['private']
              },
              writable: true, enumerable: true, configurable: true
            });
          } else {
            if (this.userInfo.data) {
              this.contacts[this.userInfo.username].image = this.userInfo.data.image;
              this.contacts[this.userInfo.username].avatar = this.userInfo.data.image;
              this.contacts[this.userInfo.username].fullname = this.userInfo.data.fullname;
              this.contacts[this.userInfo.username].nickname = this.userInfo.data.nickname;
            }
            if (this.userInfo.data && this.userInfo.data.avatar) this.contacts[this.userInfo.username].avatar = this.userInfo.data.avatar;
          }
        }
        //console.log(this.auth.getUserInfo())
        //console.log(this.apiStorageService.getToken());

        console.log('Contact for new after: ', this.contacts);

        let linkPrivateNews = this.server + "/get-news?limit=" + this.maxOnePage + "&offset=" + this.pageIndexPrivate;
        this.getPrivateNews(linkPrivateNews);
      })
    )
    this.events.subscribe('postok', () => {
      this.pageIndexPublic = 0;
      this.pageIndexPrivate = 0;
      let linkPublicNews = this.server + "/get-public-news?limit=" + this.maxOnePage + "&offset=" + this.pageIndexPublic;
      this.getPublicNews(linkPublicNews, true);
      let linkNews = this.server + "/get-news?limit=" + this.maxOnePage + "&offset=" + this.pageIndexPrivate;
      this.getPrivateNews(linkNews, true);
    });
  }

  dynamicCards = {
    title: ""
    , buttons: [
      { color: "primary", icon: "photos", next: "ADD" }
    ]
    , items: []
  }

  getPublicNews(linkNews, reNews?: boolean) {
    this.dynamicCards.title = "Đây là trang tin của Public";
    let linkFile = this.server + "/get-file/"

    this.auth.getDynamicUrl(linkNews)
      .then(data => {
        data.forEach(el => {
          this.pageIndexPublic++;
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

          let index = this.dynamicCards.items
            .findIndex(x => x.group_id === el.group_id);
          if (index < 0) {
            reNews ? this.dynamicCards.items.unshift(el) : this.dynamicCards.items.push(el);
          }
        });
      })
      .catch(err => console.log(err))
  }

  getPrivateNews(linkNews, reNews?: boolean) {
    this.dynamicCards.title = "Đây là trang tin của " + (this.userInfo ? this.userInfo.username : "")
    let linkFile = this.server + "/get-file/"

    this.auth.getDynamicUrl(linkNews)
      .then(data => {
        data.forEach(el => {
          this.pageIndexPrivate++;
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
          let index = this.dynamicCards.items
            .findIndex(x => x.group_id === el.group_id);
          if (index < 0) {
            reNews ? this.dynamicCards.items.unshift(el) : this.dynamicCards.items.push(el);
          }
        });
      })
      .catch(err => console.log(err))
  }

  doInfinite(ev) {
    let linkPublicNews = this.server + "/get-public-news?limit=" + this.maxOnePage + "&offset=" + this.pageIndexPublic;
    this.getPublicNews(linkPublicNews);
    if (this.userInfo) {
      let linkPrivateNews = this.server + "/get-news?limit=" + this.maxOnePage + "&offset=" + this.pageIndexPrivate;
      this.getPrivateNews(linkPrivateNews);
    }
    setTimeout(() => {
      ev.complete();
    }, 500);
  }

  doRefresh(ev) {
    this.pageIndexPublic = 0;
    this.pageIndexPrivate = 0;
    let linkPublicNews = this.server + "/get-public-news?limit=" + this.maxOnePage + "&offset=" + this.pageIndexPublic;
    this.getPublicNews(linkPublicNews, true);
    if (this.userInfo) {
      let linkPrivateNews = this.server + "/get-news?limit=" + this.maxOnePage + "&offset=" + this.pageIndexPrivate;
      this.getPrivateNews(linkPrivateNews, true);
    }
    setTimeout(() => {
      ev.complete();
    }, 500);
  }

  onClickHeader(btn) {
    if (btn.next === 'ADD') {
      let modal = this.modalCtrl.create(PostNewsPage);
      modal.present();
    }
  }

  onClickShortDetails(a, b) {
    console.log(a, b);
  }

  onClickMedia(number, it) {
    //console.log(number);
    //console.log(it);
    let dynamicCardsOrigin: any = {
      title: it.user
      , buttons: [
        { color: "danger", icon: "close", next: "CLOSE" }
      ]
      , items: [
        {
          short_detail: {
            avatar: this.userInfo ? this.userInfo.data.image : ""
            , h1: this.userInfo.data.fullname
            , p: it.content
            , note: it.time
            , action: { color: "primary", icon: "more", next: "MORE" }
          }
          , content: {
            title: it.title
            , paragraphs: [
              {
                //h2: "Chốn yên bình"
                //, p: "Là nơi bình yên nhất. Bạn có thể dạo bước trên con đường rợp bóng mát thanh bình đến lạ"
                medias: it.medias
              }
            ]
            , note: "Nguyễn Văn Định 2019"
          }
          , actions: it.actions
        }
      ]
    };
    let modal = this.modalCtrl.create(DynamicCardSocialPage, { form: dynamicCardsOrigin });
    modal.present();
  }
}