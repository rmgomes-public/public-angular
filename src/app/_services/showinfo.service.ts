import { ToastController } from '@ionic/angular';
import { Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class ShowInfoService {

  toast: any;

  constructor(
    private toastController: ToastController
  ) { }


  async presentToast(Message: string, Color: string, duration?: number) {

    if (duration === undefined) {
      duration = 3000;
    }
    if (duration > 0) {

      this.toast = await this.toastController.create({
        message: Message,
        position: 'middle',
        color: Color,
        translucent: false,
        animated: true,
        cssClass: 'toaster',
        duration
      });
      this.toast.present();

    } else {

      this.toast = await this.toastController.create({
        message: Message,
        position: 'middle',
        color: Color,
        translucent: false,
        animated: true,
        cssClass: 'toaster',
      });
      this.toast.present();
      return this.toast;
    }
  }


  async dismiss() {
    this.toast.dismiss();
  }
}
