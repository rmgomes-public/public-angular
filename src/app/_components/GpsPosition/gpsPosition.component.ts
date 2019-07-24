import { Component, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ShowInfoService } from '../../_services/showinfo.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Platform } from '@ionic/angular';


declare var google;

@Component({
    selector: 'gps-position',
    templateUrl: 'GpsPosition.component.html',
    styleUrls: ['GpsPosition.component.scss']
})

export class GpsPositionComponent implements AfterViewInit {

    // tslint:disable-next-line:no-output-on-prefix
    @Output() onAddress: EventEmitter<any> = new EventEmitter();
    // tslint:disable-next-line:no-output-on-prefix
    @Output() onWaiting: EventEmitter<any> = new EventEmitter();

    map: any;
    autocomplete: any;
    userAddress: any;
    searchInput: any;
    addressFound: boolean;
    isGpsAskIntervalStarted: any;
    isGpsAskModalOpened: boolean;
    gpsIsDisabled: boolean;
    gpsIsEnabled: boolean;
    showMap: boolean;
    recheck: boolean;

    constructor(
        private showInfo: ShowInfoService,
        private geolocation: Geolocation,
        private diagnostic: Diagnostic,
        private chr: ChangeDetectorRef,
        private platform: Platform,
    ) {
        this.recheck = false;
        this.userAddress = {
            street_number: null,
            route: null,
            locality: null,
            administrative_area_level_1: null,
            administrative_area_level_2: null,
            country: null,
            postal_code: null,
            gpsCoords: {
                lng: null,
                lat: null,
            },
        };
        this.onAddress.emit(false);
    }


    async ngAfterViewInit() {
        const THIS = this;

        if (this.platform.is('cordova')) {
            await this.askForPermissions().then(res => {
                this.gpsIsDisabled = false;
                this.gpsIsEnabled = true;
                this.setPositionAndGoNext();
            }, error => {
                this.onWaiting.emit(false);
                this.gpsIsDisabled = true;
                this.gpsIsEnabled = false;
            });
        } else {
            this.onWaiting.emit(false);
            this.gpsIsDisabled = false;
            this.gpsIsEnabled = true;
            this.setPositionAndGoNext();
        }
    }


    goToGpsParameters() {
        this.diagnostic.switchToLocationSettings();
        this.gpsIsEnabled = false;
        this.gpsIsDisabled = true;
        this.recheck = true;
    }

    setPositionAndGoNext() {
        const THIS = this;

        this.onAddress.emit(false);

        this.onWaiting.emit(true);
        if (this.platform.is('cordova')) {
            this.askForPermissions().then(() => {
                this.geolocation.getCurrentPosition().then((resp) => {

                    const geocoder = new google.maps.Geocoder();


                    geocoder.geocode({ location: { lat: resp.coords.latitude, lng: resp.coords.longitude } }, (results, status) => {

                        const addressComponents = THIS.getFirstStreetAddress(results);
                        if (!addressComponents) {
                            THIS.showInfo.presentToast('Adresse introuvable', 'warning');
                            this.onWaiting.emit(false);
                            THIS.searchInput = '';
                            THIS.addressFound = false;
                            THIS.onAddress.emit(false);
                            return;
                        }
                        // tslint:disable-next-line:max-line-length
                        const formattedAddress = THIS.getFormatedAddress(addressComponents, { lat: resp.coords.latitude, lng: resp.coords.longitude });
                        THIS.addressFound = true;
                        this.gpsIsDisabled = false;
                        this.gpsIsEnabled = true;
                        THIS.chr.detectChanges();
                        THIS.onAddress.emit(formattedAddress);
                        this.onWaiting.emit(false);
                    });



                }).catch((error) => {
                    this.onWaiting.emit(false);
                    // tslint:disable-next-line:max-line-length
                    THIS.showInfo.presentToast('Veuillez donner la permission à l\'aplication d\'utiliser le positionnement par GPS', 'warning', 3000);
                });
            }, () => {
                THIS.onAddress.emit(false);
                this.onWaiting.emit(false);
                this.gpsIsDisabled = true;
                this.gpsIsEnabled = false;
            });

        } else {
            this.geolocation.getCurrentPosition().then((resp) => {

                const geocoder = new google.maps.Geocoder();


                geocoder.geocode({ location: { lat: resp.coords.latitude, lng: resp.coords.longitude } }, (results, status) => {

                    const addressComponents = THIS.getFirstStreetAddress(results);
                    if (!addressComponents) {
                        THIS.showInfo.presentToast('Adresse introuvable', 'warning');
                        this.onWaiting.emit(false);
                        THIS.searchInput = '';
                        THIS.addressFound = false;
                        THIS.onAddress.emit(false);
                        return;
                    }
                    // tslint:disable-next-line:max-line-length
                    const formattedAddress = THIS.getFormatedAddress(addressComponents, { lat: resp.coords.latitude, lng: resp.coords.longitude });
                    THIS.addressFound = true;
                    this.gpsIsDisabled = false;
                    this.gpsIsEnabled = true;
                    THIS.onAddress.emit(formattedAddress);
                    THIS.chr.detectChanges();
                    this.onWaiting.emit(false);
                });



            }).catch((error) => {
                THIS.onAddress.emit(false);
                this.onWaiting.emit(false);
                this.gpsIsDisabled = true;
                this.gpsIsEnabled = false;
                // tslint:disable-next-line:max-line-length
            });
        }
    }



    askForPermissions() {
        const THIS = this;
        return new Promise((resolve, reject) => {
            if (!this.platform.is('cordova')) {
                reject(false);
                console.warn('Diagnostic.isLocationEnable not working because cordova is not available!');
            } else {
                THIS.diagnostic.isLocationEnabled().then(state => {
                    if (state) {
                        console.log('POWERED ON');
                        resolve(true);
                    } else {
                        console.log('ASK USER TO ACTIVATE GPS');
                        reject(false);
                    }
                });
            }
        });
    }



    setLocationManually() {
        this.showMap = true;
        this.gpsIsDisabled = false;
        this.gpsIsEnabled = false;
        this.onWaiting.emit(true);
        window.setTimeout(() => {
            this.loadMap();
        }, 100);
    }


    loadMap() {

        this.onWaiting.emit(false);

        const THIS = this;

        const card = document.getElementById('pac-card');
        const input = document.getElementById('pac-input');
        const types = document.getElementById('type-selector');
        const strictBounds = document.getElementById('strict-bounds-selector');

        // this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);
        const options = {
            types: ['geocode']
        };

        this.autocomplete = new google.maps.places.Autocomplete(input, options);

        // Bind the map's bounds (viewport) property to the autocomplete object,
        // so that the autocomplete requests use the current map bounds for the
        // bounds option in the request.
        // this.autocomplete.bindTo('bounds', this.map);

        // Set the data fields to return when the user selects a place.
        this.autocomplete.setFields(
            ['address_components', 'geometry', 'icon', 'name']);

        this.autocomplete.addListener('place_changed', () => {
            THIS.onWaiting.emit(true);
            // infowindow.close();
            // marker.setVisible(false);


            const place = THIS.autocomplete.getPlace();

            if (!place.geometry) {
                // User entered the name of a Place that was not suggested and
                // pressed the Enter key, or the Place Details request failed.
                THIS.showInfo.presentToast('Adresse introuvable', 'warning');
                THIS.searchInput = '';
                THIS.addressFound = false;
                THIS.onWaiting.emit(false);
                return;
            }


            const geocoder = new google.maps.Geocoder();


            // tslint:disable-next-line:max-line-length
            geocoder.geocode({ location: { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() } }, (results, status) => {

                const addressComponents = THIS.getFirstStreetAddress(results);
                if (!addressComponents) {
                    THIS.showInfo.presentToast('Adresse introuvable', 'warning');
                    THIS.onWaiting.emit(false);
                    THIS.searchInput = '';
                    THIS.addressFound = false;
                    return;
                }

                // tslint:disable-next-line:max-line-length
                const formattedAddress = THIS.getFormatedAddress(addressComponents, { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });

                if (!formattedAddress.locality.length) {
                    THIS.onWaiting.emit(false);
                    return;
                }


                this.searchInput = '';
                THIS.addressFound = true;
                THIS.onWaiting.emit(false);
                THIS.chr.detectChanges();
                THIS.onAddress.emit(formattedAddress);
            });



            let address = '';
            if (place.address_components) {
                address = [
                    (place.address_components[0] && place.address_components[0].short_name || ''),
                    (place.address_components[1] && place.address_components[1].short_name || ''),
                    (place.address_components[2] && place.address_components[2].short_name || '')
                ].join(' ');

            }
        });


        THIS.autocomplete.setTypes([
            'geocode'
        ]);


        THIS.onWaiting.emit(false);

    }


    disableNextButton() {
        this.addressFound = false;
        this.onAddress.emit(false);
    }





    getFormatedAddress(addressComponents, gpsCoords) {
        // tslint:disable-next-line:prefer-for-of
        for (let index = 0; index < addressComponents.length; index++) {
            const element = addressComponents[index];

            if (element.types.indexOf('street_number') > -1) {
                this.userAddress.street_number = element.long_name;
            }
            if (element.types.indexOf('route') > -1) {
                this.userAddress.route = element.long_name;
            }
            if (element.types.indexOf('locality') > -1) {
                this.userAddress.locality = element.long_name;
            }
            if (element.types.indexOf('administrative_area_level_1') > -1) {
                this.userAddress.administrative_area_level_1 = element.long_name;
            }
            if (element.types.indexOf('administrative_area_level_2') > -1) {
                this.userAddress.administrative_area_level_2 = element.long_name;
            }
            if (element.types.indexOf('country') > -1) {
                this.userAddress.country = element.long_name;
            }
            if (element.types.indexOf('postal_code') > -1) {
                this.userAddress.postal_code = element.long_name;
            }

            this.userAddress.gpsCoords = gpsCoords;
        }

        return this.userAddress;
    }

    getFirstStreetAddress(markerResults) {
        // tslint:disable-next-line:prefer-for-of
        for (let s = 0; s < markerResults.length; s++) {
            if (markerResults[s].types.indexOf('street_address') > -1) {
                return markerResults[s].address_components;
            }
        }
    }

}
