import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { LangPickModalComponent } from './_components/LanguagePicker/_modal/languagePicker.modal';
import { LanguagePickerComponent } from './_components/LanguagePicker/languagePicker.component';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppLoaderComponent } from './_components/AppLoader/apploader.component';
import { Network } from '@ionic-native/network/ngx';
import { NetworkService } from './_services/network.service';
import { GpsPositionComponent } from './_components/GpsPosition/gpsPosition.component';
import { Globalization } from '@ionic-native/globalization/ngx';
import { OrderByTimePipe } from './_pipes/orderByTime.pipe';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, '../assets/i18n/', '.json');
}

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
    ],
    declarations: [
        LanguagePickerComponent,
        LangPickModalComponent,
        GpsPositionComponent,
        AppLoaderComponent,
        OrderByTimePipe
    ],
    entryComponents: [
        LangPickModalComponent
    ],
    providers: [
        AppLoaderComponent,
        Network,
        NetworkService,
        Globalization
    ],
    exports: [
        CommonModule,
        TranslateModule,
        LangPickModalComponent,
        LanguagePickerComponent,
        GpsPositionComponent,
        AppLoaderComponent,
        OrderByTimePipe
    ]
})



export class SharedModule {
    constructor() {
    }

}
