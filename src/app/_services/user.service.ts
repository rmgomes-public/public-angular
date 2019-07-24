import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

import { Router, PreloadAllModules } from '@angular/router';
import { User } from '../_models/user.model';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

import { ROUTE } from '../../environments/environment';

import { Platform } from '@ionic/angular';
import { promise } from 'protractor';


@Injectable({ providedIn: 'root' })
export class UserService {

    user: any;

    constructor(
        private http: HttpClient,
        private nativeStorage: NativeStorage,
        private router: Router,
        private plt: Platform
    ) { }


    getUserToken() {
        return new Promise((resolve, reject) => {
            if (!this.plt.is('cordova')) {
                try {
                    const obj: any = JSON.parse(localStorage.getItem('user-token'));
                    if (obj && obj.token) {
                        resolve(obj.token);
                    } else {
                        resolve(true);
                    }
                } catch (e) {
                    console.log(e);
                    reject(e);
                }
            } else {
                this.nativeStorage.getItem('user-token').then((data) => {
                    resolve(data.token);
                }, (err) => {
                    resolve(err);
                    console.log(err);
                });
            }
        });
    }

    getLocalUserObject() {
        return new Promise((resolve, reject) => {
            if (!this.plt.is('cordova')) {
                this.user = JSON.parse(localStorage.getItem('user-data'));
                resolve(this.user);
            } else {
                this.nativeStorage.getItem('user-data').then((data) => {
                    this.user = data;
                    resolve(this.user);
                }, (err) => {
                    resolve(err);
                    console.log(err);
                });
            }
        });
    }

    async setLocalUserObject(user) {
        return new Promise((resolve, reject) => {
            if (!this.plt.is('cordova')) {
                try {
                    localStorage.setItem('user-data', JSON.stringify(user));
                    resolve(true);
                } catch (e) {
                    console.log(e);
                    reject(e);
                }
            } else {
                this.nativeStorage.setItem('user-data', user).then(() => {
                    resolve(true);
                }, (err) => {
                    resolve(err);
                    console.log(err);
                });
            }
        });

    }


    setOwnGender(gender) {
        // PRIVATE CODE
    }

    setAge(age) {
        // PRIVATE CODE
    }

    setLookingFor(lookingFor) {
       // PRIVATE CODE
    }

    async getProfiles(limit, skip, lng, lat) {
       // PRIVATE CODE
    }


    async getProfile(profileID) {
        // PRIVATE CODE
    }

    async getConversations() {
       // PRIVATE CODE
    }

    async getMessages(senderID, receiverID, limit, skip) {
        // PRIVATE CODE
    }

    async sendMessage(senderID, receiverID, text) {
       // PRIVATE CODE
    }


    async getLastMessages(senderID, receiverID, time) {
       // PRIVATE CODE
    }


    async setLocation(senderID, userAdress) {
        // PRIVATE CODE
    }

    getCurrentLang() {
       // PRIVATE CODE
    }

    setCurrentLang(langCode) {
       // PRIVATE CODE
    }

    async pushProfileToHistory(profileID) {
        // PRIVATE CODE
    }

    async getUserProfilesViewHistory() {
        // PRIVATE CODE
    }

}
