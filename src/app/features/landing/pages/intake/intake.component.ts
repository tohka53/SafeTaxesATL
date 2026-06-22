import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { FORM_DEFINITIONS, FormDef } from '@core/models/form-def.model';

/** Public forms catalog — same form types as the CRM. */
@Component({
  selector: 'app-intake',
  templateUrl: './intake.component.html'
})
export class IntakeComponent {
  readonly defs: FormDef[] = FORM_DEFINITIONS;

  constructor(
    private readonly router: Router,
    public readonly translate: TranslateService
  ) {}

  label(d: FormDef): string {
    return (this.translate.currentLang || 'en') === 'en' ? d.en : d.es;
  }

  open(d: FormDef): void {
    void this.router.navigate(['/formulario', d.id]);
  }
}
