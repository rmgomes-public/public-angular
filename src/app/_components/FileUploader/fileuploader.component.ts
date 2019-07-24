import { Component, OnInit, ChangeDetectorRef, Input, Output, ViewChild, AfterViewInit, EventEmitter } from '@angular/core';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/Camera/ngx';
import { Platform } from '@ionic/angular';
import { File, FileEntry } from '@ionic-native/File/ngx';
import { HttpClient, HttpRequest, HttpEventType, HttpHeaders } from '@angular/common/http';
import { FilePath } from '@ionic-native/file-path/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { FormBuilder, Validators } from '@angular/forms';
import { ShowInfoService } from 'src/app/_services/showinfo.service';
import { ROUTE } from '../../../environments/environment';

@Component({
        selector: 'file-uploader',
        templateUrl: 'fileuploader.component.html',
        styleUrls: ['fileuploader.component.scss'],
})
// tslint:disable-next-line:component-class-suffix
export class FileUploader implements OnInit, AfterViewInit {

        @ViewChild('inputFileForm') iff;
        @Input() MediaType: string;
        @Input() UploadStrategy: string;
        @Input() IconType: string;


        // tslint:disable-next-line:no-output-on-prefix
        @Output() onPercentage = new EventEmitter();
        // tslint:disable-next-line:no-output-on-prefix
        @Output() onUploadEnded = new EventEmitter();
        // tslint:disable-next-line:no-output-on-prefix
        @Output() onError = new EventEmitter();

        userID: string;
        images = [];
        fileInputForm: any;
        platformType: any;
        percentUploaded = -1;
        uploadUrl: any;

        constructor(
                private backgroundMode: BackgroundMode,
                private nativeStorage: NativeStorage,
                private showInfo: ShowInfoService,
                private formBuilder: FormBuilder,
                private filePath: FilePath,
                private http: HttpClient,
                private camera: Camera,
                private plt: Platform,
                private file: File,
                private chr: ChangeDetectorRef
        ) {
        }

        ngOnInit() {

                this.plt.ready().then(() => {

                        if (this.plt.is('cordova')) {
                                this.platformType = 'cordova';
                        } else {
                                this.platformType = 'web';
                        }

                        this.backgroundMode.enable();

                        if (!this.plt.is('cordova')) {
                                const ls: any = (JSON.parse(localStorage.getItem('user-data')));
                                this.userID = ls.id;
                        } else {
                                this.nativeStorage.getItem('user-data').then(data => {
                                        this.userID = data.id;
                                }, (err) => {
                                        this.showInfo.presentToast('Error SF24011. Please, contact support or try later', 'danger');
                                });
                        }

                });


                this.fileInputForm = this.formBuilder.group({
                        file: [null, Validators.required]
                });
        }


        ngAfterViewInit() {

        }


        searchMedia() {
                const btn: any = document.getElementById('file-input');
                btn.nativeElement.click();
        }


        async selectImage() {

                switch (this.MediaType) {
                        case 'video':
                                if (this.plt.is('cordova')) {
                                        this.takeFile(this.camera.PictureSourceType.PHOTOLIBRARY);
                                }
                                break;
                        case 'photo':
                                if (this.plt.is('cordova')) {
                                        this.takeFile(this.camera.PictureSourceType.PHOTOLIBRARY);
                                }
                                break;
                }
        }





        async takeFile(sourceType: PictureSourceType) {

                const options: CameraOptions = {
                        quality: 100,
                        sourceType,
                        saveToPhotoAlbum: false,
                        correctOrientation: true,
                        mediaType: (this.MediaType === 'video') ? this.camera.MediaType.VIDEO : this.camera.MediaType.PICTURE
                };

                this.camera.getPicture(options).then(imagePath => {

                        if (this.plt.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
                                if (this.MediaType === 'video') {
                                        imagePath = 'file://' + imagePath;
                                }
                                this.filePath.resolveNativePath(imagePath).then(filePath => {
                                        console.log(filePath);
                                        const correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
                                        const currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));

                                        if (this.MediaType === 'photo') {
                                                const filep = correctPath + currentName;
                                                const fileObj = {
                                                        filePath: filep,
                                                };
                                                this.startUpload(fileObj);
                                        } else {
                                                this.chr.detectChanges();
                                                const fileObj = {
                                                        filePath,
                                                };
                                                this.startUpload(fileObj);
                                        }

                                });
                        }
                });


        }





        startUpload(imgEntry) {
                const THIS = this;
                this.onPercentage.emit({
                        text: 'Preparing',
                        value: 0
                });

                THIS.chr.detectChanges();

                this.file.resolveLocalFilesystemUrl(imgEntry.filePath)
                        .then(entry => {
                                THIS.chr.detectChanges();
                                (entry as FileEntry).file(file => this.readFile(file));
                        })
                        .catch(err => {
                                this.showInfo.presentToast('Error while reading file.', 'danger');
                        });
        }

        readFile(file: any) {
                this.backgroundMode.setDefaults({
                        title: 'public-angular',
                        text: 'Uploading your video presentation...(preparing)'
                });
                this.chr.detectChanges();

                const reader = new FileReader();
                reader.onprogress = (evt) => {
                        if (evt.lengthComputable) {
                                this.onPercentage.emit({
                                        text: 'Preparing',
                                        value: Math.round((evt.loaded / evt.total) * 100)
                                });

                        }
                };
                reader.onloadend = () => {
                        const formData = new FormData();
                        const imgBlob = new Blob([reader.result], {
                                type: file.type
                        });
                        formData.append('file', imgBlob, file.name);
                        this.uploadImageData(formData);
                };
                reader.readAsArrayBuffer(file);
        }



        onFileChange(event) {
                const reader = new FileReader();

                if (event.target.files && event.target.files.length) {
                        const [file] = event.target.files;
                        reader.readAsDataURL(file);

                        reader.onload = () => {
                                this.fileInputForm.patchValue({
                                        file: reader.result
                                });

                                this.chr.markForCheck();

                                const formData = new FormData();

                                this.readFile(file);

                                event.target.value = '';
                        };
                }
        }






        async uploadImageData(formData: FormData) {
                const THIS = this;

                switch (this.UploadStrategy) {
                        case 'JWP':

                                const FILE: any = await formData.get('file');

                                const objfileData = {
                                        name: FILE.name,
                                        type: FILE.type,
                                        size: FILE.size
                                };

                                const options = {};
                                const req1 = new HttpRequest('POST', ROUTE('JwpVideoCreate', [this.userID]), objfileData);
                                this.http.request(req1).subscribe((result: any) => {
                                        if (result.type === HttpEventType.Response) {
                                                this.uploadUrl = result.body.uploadUrl;
                                        }
                                });


                                break;
                        case 'OWNSERVER':
                                const req = new HttpRequest('POST', ROUTE('file', [this.userID]), formData, {
                                        reportProgress: true,
                                });

                                this.http.request(req).subscribe((event: any) => {
                                        const file = formData;
                                        if (event.type === HttpEventType.UploadProgress) {
                                                const progress: number = Math.round(100 * event.loaded / event.total);
                                                THIS.backgroundMode.configure({
                                                        title: 'public-angular',
                                                        text: 'Uploading your video presentation...(' + progress + '%)'
                                                });

                                                THIS.percentUploaded = progress;
                                                THIS.chr.detectChanges();



                                                this.onPercentage.emit({
                                                        text: 'Uploading',
                                                        value: progress
                                                });

                                                THIS.chr.detectChanges();

                                        } else if (event.type === HttpEventType.Response) {

                                                const apiMsg = event.body.api_msg;

                                                THIS.backgroundMode.configure({
                                                        title: 'public-angular',
                                                        text: 'Your file was successfully uploaded!'
                                                });

                                                THIS.chr.detectChanges();

                                                THIS.backgroundMode.disable();

                                                const files = apiMsg.body;

                                                if (apiMsg.type === 'image') {
                                                        this.onUploadEnded.emit({ type: 'image', files });
                                                }

                                                if (apiMsg.type === 'error') {
                                                        this.onError.emit(apiMsg);
                                                }

                                        }
                                });
                                break;
                }


        }




}
