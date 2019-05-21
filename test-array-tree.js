const arr1=[
    {id:1,data:'a'}
    ,{id:2,pid:7,data:'b'}
    ,{id:3,pid:5,data:'c'}
    ,{id:4,pid:9,data:'d'}
    ,{id:5,pid:2,data:'e'}
    ,{id:6,pid:3,data:'f'}
    ,{id:7,data:'g'}
    ,{id:8,pid:9,data:'h'}
    ,{id:9,pid:3,data:'i'}
    ,{id:10,pid:1,data:'j'}
];

const tree1=[
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
          avatar:"https://icdn.dantri.com.vn/thumb_w/640/2019/03/02/531510014249880849060024764118135794040832-n-1551502898256.jpg",
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
          color:"star",
          value: 5, 
          min: 0, 
          max: 10
        }
      ]
    }
  ];

const utils = require('./utils/array-object');

console.log(utils.convertTree2Order(tree1,"subs"));