import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network/ngx';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastController, Platform } from '@ionic/angular';
import { ModalController } from '@ionic/angular';


export enum ConnectionStatus {
    Offline, // 0 / false
    Online // 1 / true
}

@Injectable({
    providedIn: 'root'
})
export class NetworkService {


    private status: BehaviorSubject<ConnectionStatus> = new BehaviorSubject(ConnectionStatus.Offline);

    // tslint:disable-next-line:max-line-length
    constructor(private network: Network, private toastController: ToastController, private plt: Platform, public modalController: ModalController) {

        this.plt.ready().then(() => {
            if (this.plt.is('cordova')) {
                this.initializeNetworkEvents();
                const status = this.network.type !== 'none' ? ConnectionStatus.Online : ConnectionStatus.Offline;
                this.status.next(status);
            } else {
                console.log(this.network.type);
                const status = (window.navigator.onLine) ? ConnectionStatus.Online : ConnectionStatus.Offline;
                this.status.next(status);
            }
        });

    }


    public async initializeNetworkEvents() {



        this.network.onDisconnect().subscribe(() => {
            if (this.status.getValue() === ConnectionStatus.Online) {
                this.updateNetworkStatus(ConnectionStatus.Offline);
            }
        });

        this.network.onConnect().subscribe(() => {
            if (this.status.getValue() === ConnectionStatus.Offline) {
                this.updateNetworkStatus(ConnectionStatus.Online);
            }
        });
    }

    private async updateNetworkStatus(status: ConnectionStatus) {
        this.status.next(status);

        const connection = status === ConnectionStatus.Offline ? 'Offline' : 'Online';
    }

    public onNetworkChange(): Observable<ConnectionStatus> {
        return this.status.asObservable();
    }

    public getCurrentNetworkStatus(): ConnectionStatus {
        return this.status.getValue();
    }

}
