import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MaintenanecePage } from './maintenanece';

@NgModule({
  declarations: [
    MaintenanecePage,
  ],
  imports: [
    IonicPageModule.forChild(MaintenanecePage),
  ],
})
export class MaintenanecePageModule {}
