import { Component} from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Facebook } from '@ionic-native/facebook/ngx';
import { HttpErrorResponse } from '@angular/common/http';
import { MustMatch } from './_helpers/must-match.validator';
import { ShowInfoService } from '../../_services/showinfo.service';
import { AuthenticationService } from '../../_services/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { NetworkService, ConnectionStatus } from '../../_services/network.service';
import { UserService } from '../../_services/user.service';
// import { FirebaseAuthentication } from '@ionic-native/firebase-authentication/ngx';
import { FcmService } from '../../_services/fcm.service';
import { AppLoaderService } from '../../_services/apploader.service';
import { Keyboard } from '@ionic-native/keyboard/ngx';

@Component({
  selector: 'app-authentication',
  templateUrl: 'authentication.component.html',
  styleUrls: ['authentication.component.scss']
})

export class AuthenticationComponent {

  IS_LOADING: boolean;
  SHOW_SIGNIN_FORM = true;
  SHOW_SIGNUP_FORM = false;
  SHOW_PASSWORD_RECOVERY = false;
  signupForm: FormGroup;
  signinForm: FormGroup;
  recoveryForm: FormGroup;
  signupFormSubmitted: any;
  signinFormSubmitted: any;
  recoveryFormSubmitted: any;
  showFooter: boolean;

  constructor(
    private authenticationService: AuthenticationService,
    private translate: TranslateService,
    private showInfo: ShowInfoService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private network: NetworkService,
    private appLoader: AppLoaderService,
    private fcm: FcmService,
    private router: Router,
    private plt: Platform,
    private kb: Keyboard,
    private fb: Facebook,
  ) {
    this.signupForm = this.formBuilder.group({
      signup_name: ['', Validators.required],
      signup_email: ['', [Validators.required, Validators.email]],
      signup_password: ['', [Validators.required, Validators.minLength(6)]],
      signup_password_confirm: ['', [Validators.required, Validators.minLength(6)]],
      signup_conditions_accept: [false, Validators.requiredTrue]
    }, {
        validator: MustMatch('signup_password', 'signup_password_confirm')
      });


    this.signinForm = this.formBuilder.group({
      signin_email: ['', [Validators.required, Validators.email]],
      signin_password: ['', [Validators.required, Validators.minLength(6)]],
    });


    this.recoveryForm = this.formBuilder.group({
      recovery_email: ['', [Validators.required, Validators.email]],
    });

    this.appLoader.startLoading();
  }



  async ionViewWillEnter() {
    this.showFooter = true;

    this.plt.ready().then(() => {
      window.addEventListener('keyboardWillShow', (event) => {
        this.showFooter = false;
      });
      window.addEventListener('keyboardWillHide', (event) => {
        this.showFooter = true;
      });
    });


    this.userService.getUserToken().then(token => {
      if (typeof token === 'string') {
        console.log(token);

        this.userService.getLocalUserObject().then((data: any) => {
          console.log(data);

          if (
            data && data.preferences
            && data.preferences.gender
            && data.preferences.lookingFor
            && data.preferences.location
            && data.preferences.location.locality) {
            this.router.navigate(['/home']);
          } else {
            this.router.navigate(['/starter']);
          }
        });
      }

    });
  }




  // convenience getter for easy access to form fields
  get f() { return this.signupForm.controls; }
  get fValid() {
    return this.signupForm.status;
  }

  get formSignin() { return this.signinForm.controls; }
  get signinFormValid() {
    return this.signinForm.status;
  }






  async createAccount() {

    const CS = this.network.getCurrentNetworkStatus();
    if (CS === ConnectionStatus.Offline) {
      this.appLoader.stopLoading().then(async () => {
        const value: any = await this.translate.get('APP.MUST_BE_ONLINE').toPromise();
        this.showInfo.presentToast(value, 'danger');
      });
      return;
    }

    this.signupForm.value.signup_name = this.signupForm.value.signup_name.trim();
    this.signupForm.value.signup_email = this.signupForm.value.signup_email.trim().toLowerCase();
    this.signupForm.value.signup_password = this.signupForm.value.signup_password.trim();
    this.signupForm.value.signup_password_confirm = this.signupForm.value.signup_password_confirm.trim();

    if (/\s/g.test(this.signupForm.value.signup_password) || /\s/g.test(this.signupForm.value.signup_password)) {
      this.showInfo.presentToast('Le mot de passe ne peut pas contenir des espaces ou autres caractéres invisibles', 'danger');
      this.appLoader.stopLoading();
      return;
    }

    if (this.signupForm.value.signup_password !== this.signupForm.value.signup_password_confirm) {
      this.showInfo.presentToast('Les mots de passe ne correspondent pas', 'danger');
      this.appLoader.stopLoading();
      return;
    }

    const controls = this.signupForm.controls;

    for (const name in controls) {
      if (controls[name].status === 'INVALID' && name === 'signup_email') {
        this.showInfo.presentToast('L\'adresse email renseigné n\'est pas correcte', 'danger');
        this.appLoader.stopLoading();
        return;
      } else if (controls[name].status === 'INVALID' && name === 'signup_conditions_accept') {
        // tslint:disable-next-line:max-line-length
        this.showInfo.presentToast('Veuillez lire et accepter toutes les conditions concerant l\'inscription et l\'utilisation de public-angular', 'danger');
        this.appLoader.stopLoading();
        return;
      }
    }


    this.signupFormSubmitted = true;


    // stop here if form is invalid
    if (this.signupForm.invalid) {

      this.appLoader.stopLoading().then(() => {
        this.translate.get('AUTHPAGE.INVALID_DATA').subscribe(value => {
          this.showInfo.presentToast('Formulaire incomplet...', 'danger');
        });
      });

      return;
    }


    this.appLoader.startLoading();


    // FCM token for android to send push notifications
    const FCM_TOKEN = await this.fcm.getToken();

    let res: any = null;

    try {
      res = await this.authenticationService.signup(this.signupForm.value, FCM_TOKEN);
      this.appLoader.stopLoading();


      if (res !== undefined && res !== null) {
        if (res instanceof HttpErrorResponse) {
          this.translate.get('APP.SOMETHING_WRONG').subscribe(value => {
            this.showInfo.presentToast(value, 'danger');
          });

        } else {


          if (res.api_msg.code === 'UserExists') {
            this.translate.get('AUTHPAGE.ACCOUNT_EXISTS').subscribe(value => {
              this.showInfo.presentToast(value, 'danger');
            });
          }

          if (res.api_msg.code === 'UserInsertedAndLogged') {

            // if (this.plt.is('cordova')) {
            //   // tslint:disable-next-line:max-line-length
            // tslint:disable-next-line:max-line-length
            //   this.firebaseAuthentication.createUserWithEmailAndPassword(this.signupForm.value.signup_email, this.signupForm.value.signup_password)
            //     .then((resp: any) => console.log(JSON.stringify(res)))
            //     .catch((error: any) => console.error(JSON.stringify(error)));
            // }
            this.doWebLogin({ signup_password: this.signupForm.value.signup_password, signup_email: this.signupForm.value.signup_email });
          }
        }
      } else {
        this.translate.get('APP.SOMETHING_WRONG').subscribe(value => {
          this.showInfo.presentToast(value, 'danger');
        });
      }
    } catch (e) {
      console.log(e);

    }

  }





  async doWebLogin(form: any) {
    this.appLoader.startLoading();
    const Cs = this.network.getCurrentNetworkStatus();
    if (Cs === ConnectionStatus.Offline) {
      const value: any = await this.translate.get('APP.MUST_BE_ONLINE').toPromise();
      this.showInfo.presentToast(value, 'info');
      this.appLoader.stopLoading();
      return;
    }

    this.signinForm.value.signin_email = this.signinForm.value.signin_email.trim().toLowerCase();

    if (form && form.signup_email && form.signup_password) {
      this.signinForm.value.signin_email = form.signup_email.trim().toLowerCase();
      this.signinForm.value.signin_password = form.signup_password.trim();
    }

    console.log(this.signinForm.value);




    this.signinFormSubmitted = true;

    if (this.signinForm.invalid && !form.signup_email && !form.signup_password) {
      this.translate.get('AUTHPAGE.INVALID_USR_OR_PWD').subscribe(value => {
        this.showInfo.presentToast(value, 'info', 1500);
        this.appLoader.stopLoading();
      });
      return;
    }

    this.signinForm.value.from = 'MobileApp';

    this.appLoader.startLoading();


    // FCM token for android to send push notifications
    let result: any;
    const FCM_TOKEN = await this.fcm.getToken();

    try {
      result = await this.authenticationService.login(this.signinForm.value, 'MobileApp', FCM_TOKEN);
    } catch (err) {
      this.appLoader.stopLoading();
      return;
    }

    switch (result.api_msg.code) {

      case 'UserLoggedIn':
        this.appLoader.stopLoading();
        if (form && form.signup_email && form.signup_password) {
          this.router.navigate(['/starter']);
        } else {
          this.router.navigate(['/home']);
        }
        break;


      case 'UserBadPassword':

        this.translate.get('AUTHPAGE.BAD_PWD').subscribe(value => {
          this.appLoader.stopLoading().then(() => {
            this.showInfo.presentToast(value, 'info');
          });
        });
        break;


      case 'UserNotFound':
        this.translate.get('AUTHPAGE.ACCOUNT_NOT_FOUND').subscribe(value => {
          this.appLoader.stopLoading().then(() => {
            this.showInfo.presentToast(value, 'info');
          });
        });
        break;
    }



  }



















  async doFbLogin() {


    const cs = this.network.getCurrentNetworkStatus();
    if (cs === ConnectionStatus.Offline) {
      const value: any = await this.translate.get('APP.MUST_BE_ONLINE').toPromise();
      this.showInfo.presentToast(value, 'danger');
      this.appLoader.stopLoading();
      return;
    }

    const THIS = this;

    this.appLoader.startLoading();

    // FCM token for android to send push notifications
    const FCM_TOKEN = await this.fcm.getToken();

    if (this.plt.is('cordova')) {
      // the permissions your facebook app needs from the user
      const permissions = ['public_profile', 'email', 'user_friends'];

      const response = await this.fb.login(permissions);
      const userId = response.authResponse.userID;
      const user = await this.fb.api('/me?fields=name,email', permissions);

      user.picture = 'https://graph.facebook.com/' + userId + '/picture?type=large';
      user.from = 'Facebook';


      let result: any;

      try {
        result = await THIS.authenticationService.login(user, 'Facebook', FCM_TOKEN);
      } catch (err) {
        return;
      }

      THIS.appLoader.stopLoading();

      // now we have the users info, let's save it in the NativeStorage
      if (result.api_msg.code === 'UserLoggedIn') {
        THIS.router.navigate(['/home']);
      }

      if (result.api_msg.code === 'UserInsertedAndLogged') {
        console.log('goStarterFromAuthFbLogin');

        THIS.router.navigate(['/starter']);
      }

      if (result.api_msg.code === 'UserNotInsertedServerError') {
        this.translate.get('APP.SOMETHING_WRONG').subscribe(value => {
          this.showInfo.presentToast(value, 'danger');
        });
      }
    } else {
      this.appLoader.stopLoading().then(() => {
        console.warn('FACEBOOK WEB LOGIN FUNCTIONALITY NOT IMPLEMENTED');
      });

    }

    this.appLoader.stopLoading();


  }













  async recoveryPassword() {

    const cs = this.network.getCurrentNetworkStatus();
    if (cs === ConnectionStatus.Offline) {
      this.appLoader.stopLoading().then(async () => {
        const value: any = await this.translate.get('APP.MUST_BE_ONLINE').toPromise();
        this.showInfo.presentToast(value, 'danger');
      });
      return;
    }

    this.appLoader.startLoading();

    this.recoveryFormSubmitted = true;

    if (this.recoveryForm.invalid) {
      this.appLoader.stopLoading().then(() => {
        this.translate.get('AUTHPAGE.INVALID_EMAIL').subscribe(value => {
          this.showInfo.presentToast(value, 'danger');
        });
      });
      return;
    }

    const result = await this.authenticationService.recoveryPassword(this.recoveryForm.value);

    this.appLoader.stopLoading();

    this.translate.get('AUTHPAGE.RECOVER_EMAIL_SENT').subscribe(value => {
      this.showInfo.presentToast(value, 'success');
    });

    this.router.navigate(['/signin']);

  }


  showPwd(id) {

    const x: any = document.getElementById(id);
    if (x.type === 'password') {
      x.type = 'text';
    } else {
      x.type = 'password';
    }

    setTimeout(() => {
      x.type = 'password';
    }, 4000);
  }

}
