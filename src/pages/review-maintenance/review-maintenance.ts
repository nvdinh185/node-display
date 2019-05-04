import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-review-maintenance',
  templateUrl: 'review-maintenance.html',
})
export class ReviewMaintenancePage {
  parent: any;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ngOnInit() {
    this.parent = this.navParams.get("parent");
  }

}
