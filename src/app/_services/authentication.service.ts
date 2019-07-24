import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { ROUTE } from '../../environments/environment';
import { Facebook } from '@ionic-native/facebook/ngx';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { timeout } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

    constructor(
        private nativeStorage: NativeStorage,
        private http: HttpClient,
        private router: Router,
        private plt: Platform,
        private fb: Facebook
    ) { }





    async login(formValue: any, from: string, FcmToken: any) {
        // PRIVATE CODE
    }




    logout() {
        // PRIVATE CODE
    }




    async signup(formValue: any, FcmToken: any) {
        // PRIVATE CODE
    }



    async recoveryPassword(formValue: any) {
        // PRIVATE CODE
    }

}
