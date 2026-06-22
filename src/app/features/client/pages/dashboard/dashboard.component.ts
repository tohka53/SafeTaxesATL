import { Component, OnInit } from '@angular/core';

import { AuthService } from '@core/services/auth.service';
import { TaxFormService } from '@core/services/tax-form.service';
import { DocumentService } from '@core/services/document.service';
import { FormStatus, TaxForm } from '@core/models/tax-form.model';
import { TaxDocument } from '@core/models/document.model';

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  readonly FormStatus = FormStatus;
  readonly currentYear = new Date().getFullYear();

  loading = true;
  forms: TaxForm[] = [];
  documents: TaxDocument[] = [];
  currentForm: TaxForm | null = null;

  constructor(
    public readonly auth: AuthService,
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
      this.currentForm =
        forms.find((f) => f.tax_year === this.currentYear) ?? forms[0] ?? null;
    } catch (e) {
      console.warn('dashboard load', e);
    } finally {
      this.loading = false;
    }
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
