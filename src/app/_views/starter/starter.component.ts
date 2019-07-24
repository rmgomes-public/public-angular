import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../_services/user.service';
import { AppLoaderService } from 'src/app/_services/apploader.service';

@Component({
  selector: 'app-starter',
  templateUrl: 'starter.component.html',
  styleUrls: ['starter.component.scss']
})


export class StarterComponent {

  step: string;
  showNextButton: boolean;
  showNextButtonAge: boolean;
  userAddress: any;
  age: number;

  constructor(
    private appLoader: AppLoaderService,
    private userService: UserService,
    private chr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.step = 'chooseGender';
    this.showNextButton = false;
    this.showNextButtonAge = true;
    this.age = 25;
  }

  onWaiting(evt) {
    if (evt) {
      this.appLoader.startLoading();
    } else {
      this.appLoader.stopLoading();
    }
  }

  async selectOwnGender(gender) {
    this.appLoader.startLoading();
    await this.userService.setOwnGender(gender);
    this.appLoader.stopLoading();
    this.step = 'chooseAge';
  }

  async selectAge() {
    await this.userService.setAge(this.age);
    this.step = 'chooseSexualOrientation';
  }

  async selectLookingFor(type) {
    this.appLoader.startLoading();
    await this.userService.setLookingFor(type);
    this.step = 'chooseLocation';
  }

  async chooseLocation(addressFound) {

    this.appLoader.startLoading();

    const user: any = await this.userService.getLocalUserObject();

    await this.userService.setLocation(user.id, this.userAddress);

    this.appLoader.stopLoading();

    this.router.navigate(['home']);

  }


  async addressFound(event) {
    if (event) {
      this.userAddress = event;
      this.showNextButton = true;
      this.chr.detectChanges();
    } else {
      this.showNextButton = false;
      this.chr.detectChanges();
    }
  }




}
