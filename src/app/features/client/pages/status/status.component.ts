import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from '@core/services/auth.service';
import { TaxFormService } from '@core/services/tax-form.service';
import { DocumentService } from '@core/services/document.service';
import { CaseService } from '@core/services/case.service';
import { TaxForm } from '@core/models/tax-form.model';
import { TaxDocument } from '@core/models/document.model';
import { CaseStatus, TaxCase } from '@core/models/tax-case.model';

@Component({
  selector: 'app-client-status',
  templateUrl: './status.component.html'
})
export class StatusComponent implements OnInit {
  loading = true;
  forms: TaxForm[] = [];
  documents: TaxDocument[] = [];
  cases: TaxCase[] = [];

  constructor(
    private readonly auth: AuthService,
    private readonly taxForms: TaxFormService,
    private readonly docs: DocumentService,
    private readonly caseService: CaseService,
    private readonly translate: TranslateService
  ) {}

  async ngOnInit(): Promise<void> {
    const uid = this.auth.userId;
    if (!uid) {
      this.loading = false;
      return;
    }
    try {
      const [forms, documents] = await Promise.all([
        this.taxForms.listByUser(uid),
        this.docs.listByUser(uid)
      ]);
      this.forms = forms;
      this.documents = documents;
      try {
        this.cases = await this.caseService.listByUser(uid);
      } catch (e) {
        console.warn('cases', e);
      }
    } catch (e) {
      console.warn('status load', e);
    } finally {
      this.loading = false;
    }
  }

  statusLabel(s: CaseStatus): string {
    return this.translate.instant('cse.' + s);
  }
  reqLabel(item: string): string {
    return this.translate.instant('req.' + item);
  }
  /** 0..2 progress index for the 3-step bar. */
  stepIndex(s: CaseStatus): number {
    return s === 'finished' ? 2 : s === 'in_process' ? 1 : 0;
  }

  docsForYear(year: number): TaxDocument[] {
    return this.documents.filter((d) => d.tax_year === year);
  }

  async openDoc(doc: TaxDocument): Promise<void> {
    try {
      const url = await this.docs.getSignedUrl(doc.storage_path);
      window.open(url, '_blank');
    } catch (e) {
      console.warn('openDoc', e);
    }
  }
}
