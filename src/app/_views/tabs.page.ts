import { Component, ViewChild } from '@angular/core';
import { IonTabs, Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { SocketsService } from '../_services/sockets.service';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Router, NavigationEnd } from '@angular/router';
import { UserService } from '../_services/user.service';


@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  @ViewChild('AppTabs') tabs: IonTabs;

  timer: any;
  activeTabName: any;
  private nbIdleListeners = 0;

  constructor(
    private websocketService: SocketsService,
    private usersService: UserService,
    private wsService: SocketsService,
    private platform: Platform,
    private location: Location,
    private router: Router,
    private idle: Idle,
  ) {
    const THIS = this;

    this.platform.ready().then(() => {
      if (this.nbIdleListeners === 0) {
        this.initIdleListener();
        this.nbIdleListeners++;
      }
    });
  }


  async ionViewWillEnter() {
    this.platform.ready().then(() => {
      this.websocketService.connect();
    });
  }

  initIdleListener() {



    // sets an idle timeout of 5 seconds, for testing purposes.
    this.idle.setIdle(5);
    // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
    this.idle.setTimeout(5);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    this.idle.onTimeout.subscribe(() => {
      console.log('timedout');
      this.wsService.userIsIdle();
    });


    document.addEventListener('click', () => {
      if (!this.location.path().includes('signin')) {
        this.idle.watch();
        this.wsService.userIsNotIdle();
      } else {
        this.idle.stop();
      }
    }, false);

    this.idle.watch();

  }

  getSelectedTab(): void {
    this.activeTabName = this.tabs.getSelected();
  }

  goBack() {
    this.location.back();
  }


}
