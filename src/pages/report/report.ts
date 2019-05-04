import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';


@Component({
  selector: 'page-report',
  templateUrl: 'report.html'
})
export class ReportPage {
  parent:any;
  constructor(
    private viewCtrl: ViewController
    , private navParams: NavParams
  ) { }

  ngOnInit() {
    this.parent = this.navParams.get("parent");
  }
}
