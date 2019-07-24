import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Platform } from '@ionic/angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { UserService } from '../_services/user.service';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

        loggedUser: any;

        constructor(
                private nativeStorage: NativeStorage,
                private userService: UserService,
                private platform: Platform,
                private router: Router
        ) { }

        canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
                return new Promise((resolve, reject) => {
                        this.platform.ready().then(() => {
                                this.userService.getUserToken().then((token: string) => {

                                        if (token.length) {
                                                resolve(true);
                                                return;
                                        }

                                        // not logged in so redirect to login page with the return url
                                        this.router.navigate(['/authentication']);
                                        resolve(false);
                                        return;
                                });
                        });
                });


        }
}
