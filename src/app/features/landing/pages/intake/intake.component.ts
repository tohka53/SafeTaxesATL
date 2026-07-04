import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { CLIENT_PROFILE_FORM_DEF, FormDef } from '@core/models/form-def.model';
import { FormDefService } from '@core/services/form-def.service';

/** Public forms catalog — same form types as the CRM. */
@Component({
  selector: 'app-intake',
  templateUrl: './intake.component.html'
})
export class IntakeComponent implements OnInit {
  defs: FormDef[] = [CLIENT_PROFILE_FORM_DEF];

  constructor(
    private readonly router: Router,
    private readonly formDefs: FormDefService,
    public readonly translate: TranslateService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const dynamicDefs = await this.formDefs.list();
      this.defs = [CLIENT_PROFILE_FORM_DEF, ...dynamicDefs];
    } catch (e) {
      console.warn('intake defs load', e);
    }
  }

  label(d: FormDef): string {
    return (this.translate.currentLang || 'en') === 'en' ? d.en : d.es;
  }

  open(d: FormDef): void {
    void this.router.navigate(['/formulario', d.id]);
  }
}
