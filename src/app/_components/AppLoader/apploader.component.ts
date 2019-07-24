import { Component, Input, OnDestroy, AfterViewInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { AppLoaderService } from 'src/app/_services/apploader.service';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-loader',
  templateUrl: 'apploader.component.html',
  styleUrls: ['apploader.component.scss'],
})

export class AppLoaderComponent implements AfterViewInit, OnDestroy {

  @Input() percentage: number;
  @Input() showPercentage: boolean;
  @Input() text: string;
  IsLoading: any = false;
  loadingSubscription: Subscription;
  debounceTime = 200;


  constructor(private appLoaderService: AppLoaderService, private elmRef: ElementRef, private cdr: ChangeDetectorRef) {
    this.showPercentage = false;
    this.percentage = 0;
    this.text = '';
  }

  ngAfterViewInit() {
    this.elmRef.nativeElement.style.display = 'none';
    this.loadingSubscription = this.appLoaderService.loadingStatus.pipe(debounceTime(this.debounceTime)).subscribe((status: boolean) => {
      this.elmRef.nativeElement.style.display = status ? 'block' : 'none';
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.loadingSubscription.unsubscribe();
  }
}

