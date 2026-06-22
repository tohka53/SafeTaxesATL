import { Component, OnInit } from '@angular/core';

import { AuthService } from '@core/services/auth.service';
import { TaxFormService } from '@core/services/tax-form.service';
import { DocumentService } from '@core/services/document.service';
import { TaxForm } from '@core/models/tax-form.model';
import { TaxDocument } from '@core/models/document.model';

@Component({
  selector: 'app-client-status',
  templateUrl: './status.component.html'
})
export class StatusComponent implements OnInit {
  loading = true;
  forms: TaxForm[] = [];
  documents: TaxDocument[] = [];

  constructor(
    private readonly auth: AuthService,
    private readonly taxForms: TaxFormService,
    private readonly docs: DocumentService
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
    } catch (e) {
      console.warn('status load', e);
    } finally {
      this.loading = false;
    }
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
