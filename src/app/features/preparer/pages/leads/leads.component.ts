import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { LeadService } from '@core/services/lead.service';
import { PdfService } from '@core/services/pdf.service';
import { Lead } from '@core/models/lead.model';
import { FORM_DEFINITIONS, FormDef, findFormDef } from '@core/models/form-def.model';

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
  readonly defs: FormDef[] = FORM_DEFINITIONS;

  constructor(
    private readonly leadService: LeadService,
    private readonly pdf: PdfService,
    public readonly translate: TranslateService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.leads = await this.leadService.list();
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
    const d = findFormDef(t ?? 'client_profile');
    return d ? (this.lang === 'en' ? d.en : d.es) : (t ?? '');
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
    const d = findFormDef(t);
    if (d) {
      this.pdf.downloadGeneric(d, l.extra ?? {}, this.lang);
    }
  }
}
