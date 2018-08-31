import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from 'environments/environment';
import { ApiService } from './api.service';


import { AuthenticationModule } from './shared/authentication';

import { ShowServerErrorModule } from './shared/validators/show-server-error/show-server-error.module';
import { ShowErrorsModule } from './shared/validators/show-errors/show-errors.module';
import { LoadingModule, ANIMATION_TYPES } from 'ngx-loading';

import {ToastModule} from 'ng2-toastr/ng2-toastr';
import { Lang } from 'app/shared/services';
import { ActionsService } from 'app/layout/actions.service';

const API_URL = environment.apiUrl;
// AoT requires an exported function for factories
export function createTranslateLoader(http: HttpClient) {
  // for development
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AuthenticationModule,
    ShowErrorsModule,
    ShowServerErrorModule,

    LoadingModule.forRoot({
      animationType: ANIMATION_TYPES.circleSwish,
      backdropBackgroundColour: 'rgba(0,0,0,0.5)', 
      backdropBorderRadius: '4px',
      primaryColour: '#90ee90', 
      secondaryColour: '#ffffff', 
      tertiaryColour: '#ffffff',
      fullScreenBackdrop: true
    }),

    HttpModule,
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient]
        }
    }),
    ToastModule.forRoot()
  ],
  providers: [AppComponent, Lang, ApiService, ActionsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
