import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { AuthenticationService } from '../_services/authentication.service';
import { UserService } from '../_services/user.service';


@Injectable()
export class JwtInterceptor implements HttpInterceptor {
        constructor(private authenticationService: AuthenticationService, private userService: UserService) { }

        intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

                return from(this.userService.getUserToken())
                        .pipe(
                                switchMap((token: string) => {
                                        if (
                                                !request.url.includes('amazonaws') &&
                                                !request.url.includes('maps')
                                        ) {
                                                if (token === null) {
                                                        console.log('LOGGING OUT');

                                                        this.authenticationService.logout();
                                                        return next.handle(request);
                                                }
                                                const requestClone = request.clone({
                                                        setHeaders: {
                                                                'x-access-token': token
                                                        }
                                                });
                                                return next.handle(requestClone);
                                        }

                                        return next.handle(request);
                                })
                        );
        }
}
