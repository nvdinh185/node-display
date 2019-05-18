/**
 * card hien thi thong tin text noi dung
 * đưa vào text có chứa nội dung và url,
 * card này sẽ hiển thị nội dung có link cho phép kích vào
 * hiển thị các ảnh lấy được trong các link để hiển thị trong khung ảnh
 * đồng thời hiển thị các link bên dưới của trang cho phép gọi inappbrowser
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'content-card',
    templateUrl: "content-card.html"
})
export class ContentCard {
    //các biến dữ liệu đầu vào
    @Input() contentData: any; //là nội dung text đơn thuần,
    
    @Input() callback: any; //hàm gọi lại ở cấp root (ở from gốc lấy được toàn bộ sự kiện này)
    
    //sự kiện sinh ra truyền giá trị con cho cấp cha 1 cấp
    @Output() onChangeSub = new EventEmitter();
    
    constructor() { }

    //khi bấm vào nút cây (dấu +/- ở đầu dòng) thì sự kiện này sinh ra
    toggleChildren(node: any) {
        node.visible = !node.visible;
    }

    //khi bấm vào nút mở rộng thì sự kiện này được sinh ra
    onClickExpand(node,idx,parent){
        //node.visible = !node.visible;
        this.toggleChildren(node);
        if (this.callback) this.callback(node,idx,parent)
    }

    //khi bấm vào phần tử item (toàn bộ dòng - thuộc tích click=true) 
    //thì sự kiện này được sinh ra
    onClickItem(node,idx,parent){
        if (node.click&&this.callback) this.onClickMore(node,idx,parent)
    }
    
    //khi bấm vào nút more (thêm thông tin chi tiết thì sự kiện này sinh ra)
    onClickMore(node,idx,parent){
        if (this.callback) this.callback(node,idx,parent,true)
    }

    //khi bấm vào nút sinh sự kiện cấp cha --> changeParent
    onClickEmit(node,idx,parent){
        this.onChangeSub.emit({node,idx,parent})
    }

    //Khi các nút con phát sinh sự kiện: onChangeSub.emit(data) thì nút cha sẽ nhận được hàm này
    changeParent(event){
        //cha nhận được thì tổng hợp thay đổi thông tin ở cha?
    }
}