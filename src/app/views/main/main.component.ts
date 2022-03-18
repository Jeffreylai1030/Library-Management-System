import { AuthService } from 'src/app/services/auth.service';
import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnDestroy, OnInit {
  mobileQuery: MediaQueryList;
  loginUser: any;
  private mobileQueryListener: () => void;

  constructor(
    public changeDetectorRef: ChangeDetectorRef,
    public media: MediaMatcher,
    private auth: AuthService,
    private commonService: CommonService,
    private translate: TranslateService
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 990px)');
    this.mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this.mobileQueryListener);

    const language = localStorage.getItem('lms_language');

    if (language) {
      this.translate.use(language);
    }
  }
  ngOnInit(): void {
    this.loginUser = this.commonService.getCurrentUser();
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this.mobileQueryListener);
  }

  onLogout() {
    this.auth.logout();
  }

  onChangeLanguage(language: string) {
    localStorage.setItem('lms_language', language)
    this.translate.use(language);
  }
}
