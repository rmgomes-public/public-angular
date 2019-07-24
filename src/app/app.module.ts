import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';


// HTTP CLIENT
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

// Translation
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Network } from '@ionic-native/network/ngx';
import { AuthenticationService } from './_services/authentication.service';
import { UserService } from './_services/user.service';
import { ShowInfoService } from './_services/showinfo.service';
import { AppLoaderService } from './_services/apploader.service';
import { JwtInterceptor } from './_interceptors/jwt.interceptor';
import { ErrorInterceptor } from './_interceptors/error.interceptor';
import { Facebook } from '@ionic-native/facebook/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { FileUploader } from './_components/FileUploader/fileuploader.component';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { Camera } from '@ionic-native/Camera/ngx';
import { File } from '@ionic-native/File/ngx';
import { LoadingScreenInterceptor } from './_interceptors/loadingScreen.interceptor';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { SocketsService } from './_services/sockets.service';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { Location } from '@angular/common';
import { AppLoaderComponent } from './_components/AppLoader/apploader.component';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    IonicModule.forRoot({ rippleEffect: false, animated: false }),
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        useFactory: (createTranslateLoader),
        provide: TranslateLoader,
        deps: [HttpClient]
      }
    }),
    NgIdleKeepaliveModule.forRoot(),
  ],
  providers: [
    AuthenticationService,
    BackgroundMode,
    ScreenOrientation,
    SocketsService,
    FileUploader,
    SplashScreen,
    StatusBar,
    FilePath,
    Location,
    Keyboard,
    Network,
    Facebook,
    Camera,
    File,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    NativeStorage,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
      deps: [
        AuthenticationService,
        UserService,
      ]
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
      deps: [
        ShowInfoService,
        TranslateService,
        AppLoaderService,
        AuthenticationService,
      ]
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingScreenInterceptor,
      multi: true
    }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
