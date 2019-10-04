import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { HttpClientModule } from '@angular/common/http';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { TimeAgoPipe} from 'time-ago-pipe';

import { MyApp } from './app.component';
import { HomeNewsPage } from '../pages/home-news/home-news';
import { LinkifyPipe } from '../pipes/linkify';
import { NewlinePipe } from '../pipes/new-line';
import { ApiAuthService } from '../services/apiAuthService';
import { Contacts } from '@ionic-native/contacts';
import { ImageFileSrcPipe } from '../pipes/pipe-src';

@NgModule({
  declarations: [
    MyApp,
    HomeNewsPage,
    TimeAgoPipe,
    LinkifyPipe,
    NewlinePipe,
    ImageFileSrcPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomeNewsPage,
  ],
  providers: [
    InAppBrowser,
    ApiAuthService,
    Contacts
  ]
})
export class AppModule {}
