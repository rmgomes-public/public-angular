import { ToastController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import * as ws from 'socket.io-client';
import { AuthenticationService } from './authentication.service';
import { Observable } from 'rxjs';
const webSockets = ws;

@Injectable({ providedIn: 'root' })
export class SocketsService {

    private ws: any;
    private wsConnections = 0;

    constructor(
        private usersService: UserService,
        private authService: AuthenticationService
    ) { }




    async connect() {
        const THIS = this;

        return new Promise(async (resolve, reject) => {
            const usertoken = await THIS.usersService.getUserToken();
            if (usertoken && this.wsConnections === 0) {
                THIS.ws = webSockets('PRIVATE CODE', { query: { jwt: usertoken } });
                this.wsConnections++;
                THIS.listenEvents();
            }
        });
    }

    async listenEvents() {

        this.ws.on('unauthorized', (data) => {
            this.ws.disconnect();
            this.authService.logout();
        });

        this.ws.on('disconnect', (data) => {
            this.ws.disconnect();
            this.authService.logout();
        });


        this.ws.on('incomingMessage', (data) => {
            console.log(data);
            console.log('SOCKET RECEIVED');
        });
    }

    async userIsIdle() {
        if (this.ws) {
            this.ws.emit('userIsIdle', {});
        }
    }

    async userIsNotIdle() {
        if (this.ws) {
            this.ws.emit('userIsNotIdle', {});
        }
    }

    async sendPrivateMessage(data) {
        if (this.ws) {
            this.ws.emit('privateChatMessage', data);
        }
    }

    getMessages() {
        return Observable.create((observer) => {
            this.ws.on('incomingMessage', (message) => {
                console.log('INCOMING MESSAGE');
                observer.next(message);
            });
        });
    }

    updateMessagesStatusToSeen(receiverID) {
        if (this.ws) {
            this.ws.emit('updateMessagesStatusToSeen', receiverID);
        }
    }

    userSeenMessages() {
        return Observable.create((observer) => {
            this.ws.on('userSeenMessages', () => {
                observer.next();
            });
        });
    }

}
