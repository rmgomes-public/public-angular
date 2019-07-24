import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../_services/user.service';
import { Platform } from '@ionic/angular';


@Injectable({ providedIn: 'root' })
export class StarterCompleted implements CanActivate {

    loggedUser: any;

    constructor(
        private userService: UserService,
        private router: Router,
        private platform: Platform
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.platform.ready().then(() => {
                resolve();
                this.userService.getUserToken().then((token: any) => {

                    if (token.length) {
                        this.userService.getLocalUserObject().then((user: any) => {
                            if (
                                user.id &&
                                user.preferences &&
                                user.preferences.gender &&
                                user.preferences.lookingFor &&
                                user.preferences.location &&
                                user.preferences.location.locality) {
                                resolve(true);
                                return;
                            } else {
                                this.router.navigate(['/starter']);
                                resolve(false);
                                return;
                            }
                        });
                    } else {
                        this.router.navigate(['/authentication']);
                        resolve(false);
                    }
                });
            });
        });


    }
}

