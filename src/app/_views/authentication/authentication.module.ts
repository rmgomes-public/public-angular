import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthenticationComponent } from './authentication.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared.module';
import { FcmService } from 'src/app/_services/fcm.service';
import { Firebase } from '@ionic-native/firebase/ngx';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        TranslateModule,
        ReactiveFormsModule,
        SharedModule,
        RouterModule.forChild([{ path: '', component: AuthenticationComponent }]),
    ],
    declarations: [
        AuthenticationComponent,
    ],
    entryComponents: [

    ],
    providers: [
        FcmService,
        Firebase
    ]
})

export class AuthenticationModule {
    constructor() {
    }

}
