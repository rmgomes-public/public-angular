import { Platform, ModalController, IonRouterOutlet, } from '@ionic/angular';
import { NetworkService, ConnectionStatus } from './_services/network.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { Component, ViewChild, enableProdMode } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { User } from './_models/user.model';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { fromEvent } from 'rxjs';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';

enableProdMode();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})


export class AppComponent {

  // set up hardware back button event.
  lastTimeBackPress = 0;
  timePeriodToExit = 500;

  offline: boolean;

  currentUser: User;
  FileTransferManager: any;

  // Idle Vars
  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date = null;
  currentPath: any;

  @ViewChild(IonRouterOutlet) routerOutlet: IonRouterOutlet;


  constructor(
    private screenOrientation: ScreenOrientation,
    public toastController: ToastController,
    private backgroundMode: BackgroundMode,
    private translate: TranslateService,
    public modalCtrl: ModalController,
    private network: NetworkService,
    private platform: Platform,
    private router: Router,
  ) {

    this.platform.ready().then(() => {

      // Set default translation language
      this.translate.setDefaultLang('fr');

      // Handle back button
      this.handleBackButton();

      // Look for network changes
      this.subscribeNetworkChanges();

      // Setup push notifications
      this.notificationSetup();

      // Initialize app.
      this.initializeApp();
    });


  }

  async handleBackButton() {


    const sub = this.platform.backButton.subscribeWithPriority(9999, () => {
    });

    const nav: any = navigator;
    // Hande Back Button
    this.platform.backButton.subscribe(() => {
      if (this.router.url.includes('profiles')) {
        if (new Date().getTime() - this.lastTimeBackPress < this.timePeriodToExit) {
          // nav.app.exitApp(); // work in ionic 4
          this.backgroundMode.overrideBackButton();
        } else {
          this.lastTimeBackPress = new Date().getTime();
        }
      }

      if (this.router.url.includes('authentication')) {
        if (new Date().getTime() - this.lastTimeBackPress < this.timePeriodToExit) {
          nav.app.exitApp(); // work in ionic 4
        } else {
          this.lastTimeBackPress = new Date().getTime();
        }
      }
    });


  }




  async subscribeNetworkChanges() {

    await this.platform.ready();

    // Subscribe network Changes
    this.network.onNetworkChange().subscribe(cs => {
      if (cs === ConnectionStatus.Online) {
        this.offline = false;
      }

      if (cs === ConnectionStatus.Offline) {
        this.offline = true;
      }

    });

    fromEvent(window, 'online').subscribe(() => {
      this.offline = false;
      console.log('network connected!');
    });

    fromEvent(window, 'offline').subscribe(() => {
      this.offline = true;
      console.log('network disconnected:(');
    });

  }




  async notificationSetup() {
      // PRIVATE CODE
  }


  async initializeApp() {

    await this.platform.ready();


    const CS = this.network.getCurrentNetworkStatus();
    if (CS === ConnectionStatus.Online) {
      this.offline = false;
    }

    if (CS === ConnectionStatus.Offline) {
      this.offline = true;
    }


    if (this.platform.is('cordova')) {
      this.screenOrientation.lock('portrait');
    }

  }



}

