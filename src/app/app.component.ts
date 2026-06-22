import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { initFlowbite } from 'flowbite';

import { environment } from '@env/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  /** True inside the authenticated CRM area (uses the sidebar shell, not the public chrome). */
  isApp = false;

  constructor(
    private readonly translate: TranslateService,
    private readonly router: Router
  ) {
    const saved =
      (typeof localStorage !== 'undefined' && localStorage.getItem('lang')) ||
      environment.defaultLang;
    this.translate.addLangs(['en', 'es']);
    this.translate.setDefaultLang('en');
    this.translate.use(saved);
  }

  ngOnInit(): void {
    // Flowbite needs to re-scan the DOM for interactive widgets after each
    // client-side navigation.
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.isApp =
          e.urlAfterRedirects.startsWith('/client') ||
          e.urlAfterRedirects.startsWith('/preparer');
        setTimeout(() => initFlowbite(), 0);
      });
    initFlowbite();
  }
}
