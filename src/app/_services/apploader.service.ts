import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { promise } from 'protractor';

@Injectable({
    providedIn: 'root'
})
export class AppLoaderService {

    private IsLoading = false;
    loadingStatus: Subject<any> = new Subject();

    get loading(): boolean {
        return this.IsLoading;
    }

    set loading(value) {
        this.IsLoading = value;
        this.loadingStatus.next(value);
    }

    startLoading() {
        this.loading = true;
    }

    stopLoading(offset?: number) {
        if (offset) {
            this.loading = false;
            return new Promise((resolve, reject) => {
                resolve();
            });
        } else {
            return new Promise((resolve, reject) => {
                window.setTimeout(() => {
                    this.loading = false;
                    resolve();
                }, offset);
            });
        }
    }
}
