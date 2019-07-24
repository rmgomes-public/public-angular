import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { StarterComponent } from './starter.component';
import { SharedModule } from 'src/app/shared.module';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        TranslateModule,
        ReactiveFormsModule,
        SharedModule,
        RouterModule.forChild([{ path: '', component: StarterComponent }]),
    ],
    declarations: [
        StarterComponent
    ],
    entryComponents: [
    ],
    providers: [
        Geolocation,
        Diagnostic
    ]
})

export class StarterModule {
    constructor() {
    }

}
