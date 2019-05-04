import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-maintenanece',
  templateUrl: 'maintenanece.html',
})
export class MaintenanecePage {
  parent:any;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ngOnInit() {
    this.parent = this.navParams.get("parent");
  }

}
