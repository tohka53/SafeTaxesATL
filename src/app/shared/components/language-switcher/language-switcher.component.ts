import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html'
})
export class LanguageSwitcherComponent {
  constructor(public readonly translate: TranslateService) {}

  get current(): string {
    return this.translate.currentLang || this.translate.defaultLang || 'en';
  }

  use(lang: 'es' | 'en'): void {
    this.translate.use(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lang', lang);
    }
  }
}
