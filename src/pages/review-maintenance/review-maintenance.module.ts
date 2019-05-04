import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReviewMaintenancePage } from './review-maintenance';

@NgModule({
  declarations: [
    ReviewMaintenancePage,
  ],
  imports: [
    IonicPageModule.forChild(ReviewMaintenancePage),
  ],
})
export class ReviewMaintenancePageModule {}
