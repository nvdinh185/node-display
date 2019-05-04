import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-add-maintenance',
  templateUrl: 'add-maintenance.html',
})
export class AddMaintenancePage {
  parent: any;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ngOnInit() {
    this.parent = this.navParams.get("parent");
  }

}
