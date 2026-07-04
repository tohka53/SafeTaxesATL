import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { LeadService } from '@core/services/lead.service';
import { PdfService } from '@core/services/pdf.service';
import { FormDefService } from '@core/services/form-def.service';
import { Lead } from '@core/models/lead.model';
import { CLIENT_PROFILE_FORM_DEF, FormDef } from '@core/models/form-def.model';

/** Admin-only: every form submitted from the public site, with free filtering. */
@Component({
  selector: 'app-preparer-leads',
  templateUrl: './leads.component.html'
})
export class LeadsComponent implements OnInit {
  loading = true;
  leads: Lead[] = [];
  q = '';
  typeFilter = '';
  expandedId: string | null = null;
  defs: FormDef[] = [CLIENT_PROFILE_FORM_DEF];

  constructor(
    private readonly leadService: LeadService,
    private readonly pdf: PdfService,
    private readonly formDefs: FormDefService,
    public readonly translate: TranslateService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const [leads, dynamicDefs] = await Promise.all([
        this.leadService.list(),
        this.formDefs.list({ includeInactive: true })
      ]);
      this.leads = leads;
      this.defs = [CLIENT_PROFILE_FORM_DEF, ...dynamicDefs];
    } catch (e) {
      console.warn('leads load', e);
    } finally {
      this.loading = false;
    }
  }

  private get lang(): string {
    return this.translate.currentLang || 'en';
  }

  typeLabel(t: string | undefined): string {
    const id = t ?? 'client_profile';
    const d = this.defs.find((x) => x.id === id);
    return d ? (this.lang === 'en' ? d.en : d.es) : id;
  }

  defLabel(d: FormDef): string {
    return this.lang === 'en' ? d.en : d.es;
  }

  /** Filter by any field (global text) + optional form type. */
  get filtered(): Lead[] {
    const s = this.q.trim().toLowerCase();
    return this.leads.filter((l) => {
      if (this.typeFilter && (l.form_type ?? 'client_profile') !== this.typeFilter) {
        return false;
      }
      if (!s) {
        return true;
      }
      const hay = [
        l.full_name,
        l.email,
        l.phone,
        l.city,
        l.state,
        l.tax_year,
        this.typeLabel(l.form_type),
        JSON.stringify(l.extra ?? {})
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(s);
    });
  }

  toggle(l: Lead): void {
    this.expandedId = this.expandedId === l.id ? null : (l.id ?? null);
  }

  download(l: Lead): void {
    const t = l.form_type ?? 'client_profile';
    if (t === 'client_profile') {
      this.pdf.downloadProfile(l.extra ?? {});
      return;
    }
    const d = this.defs.find((x) => x.id === t);
    if (d) {
      this.pdf.downloadGeneric(d, l.extra ?? {}, this.lang);
    }
  }
}
