import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase/ngx';
import { Platform } from '@ionic/angular';
// import { AngularFirestore } from 'angularfire2/firestore';
import { log } from 'util';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Injectable()
export class FcmService {

  constructor(
    private nativeStorage: NativeStorage,
    // private afs: AngularFirestore,
    private firebase: Firebase,
    private platform: Platform,
  ) { }

  async getToken() {
    if (this.platform.is('cordova')) {
      let token;

      if (this.platform.is('android')) {
        token = await this.firebase.getToken();
      }

      if (this.platform.is('ios')) {
        token = await this.firebase.getToken();
        await this.firebase.grantPermission();
      }
      return await this.saveToken(token);
    } else {
      return false;
    }
  }

  private async saveToken(token) {
    return new Promise((resolve, reject) => {
      if (!token) {
        console.error('No fcm token provided');
        resolve(false);
      }

      if (this.platform.is('cordova')) {
        this.nativeStorage.setItem('user-fcm-token', token).then((data) => {
          resolve(token);
        }, (err) => {
          console.error(err);
          resolve(false);
        });
      }
    });
  }

  onNotifications() {
    return this.firebase.onNotificationOpen();
  }
}
