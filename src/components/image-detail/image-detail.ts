/**
 * card hien thi thong tin danh muc anh
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'image-detail',
    templateUrl: "image-detail.html"
})
export class ImageDetail {
    //các biến dữ liệu đầu vào
    @Input() imageData: any; //tập các link của ảnh cần hiển thị

    //sự kiện sinh ra truyền giá trị con cho cấp cha 1 cấp
    @Output() onClickSub = new EventEmitter();
    
    constructor() { }

    onClickMedia(link){
        this.onClickSub.emit({link});
    }
}