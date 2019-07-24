import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


import { ShowInfoService } from '../_services/showinfo.service';
import { TranslateService } from '@ngx-translate/core';
import { AppLoaderService } from '../_services/apploader.service';
import { AuthenticationService } from '../_services/authentication.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
        constructor(
                private showInfo: ShowInfoService,
                private translate: TranslateService,
                private appLoader: AppLoaderService,
                private authenticationService: AuthenticationService,
        ) { }

        intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
                const THIS = this;

                return next.handle(request).pipe(catchError((err: HttpErrorResponse) => {


                        let data = {};
                        if (err && err.error) {
                                data = {
                                        reason: err && err.error.statusText ? err.error.statusText : '',
                                        status: err.status
                                };

                                if (err.status === 401) {
                                        THIS.showInfo.presentToast('Unhauthorized', 'danger');
                                        THIS.appLoader.stopLoading(4000).then(() => {
                                                THIS.authenticationService.logout();
                                        });
                                }

                                THIS.translate.get('APP.SOMETHING_WRONG').subscribe(value => {

                                        THIS.showInfo.presentToast(value, 'danger');
                                        THIS.appLoader.stopLoading(4000).then(() => {
                                        });

                                });
                                return throwError(err);

                        }
                }));

        }
}
