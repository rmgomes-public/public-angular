import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Platform } from '@ionic/angular';
import { UserService } from '../_services/user.service';
import { SocketsService } from '../_services/sockets.service';


@Injectable({ providedIn: 'root' })
export class NotLogged implements CanActivate {

    loggedUser: any;

    constructor(
        private userService: UserService,
        private router: Router,
        private platform: Platform,
        private ws: SocketsService
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
                                user.age &&
                                user.preferences &&
                                user.preferences.gender &&
                                user.preferences.lookingFor &&
                                user.preferences.location &&
                                user.preferences.location.gpsCoords
                            ) {
                                this.router.navigate(['/home']);
                                resolve(false);
                                return;
                            } else {
                                this.router.navigate(['/starter']);
                                resolve(false);
                                return;
                            }
                        });
                    } else {
                        resolve(true);
                    }
                });
            });
        });


    }
}

