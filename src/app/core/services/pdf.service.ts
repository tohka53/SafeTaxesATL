import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TranslateService } from '@ngx-translate/core';

import { TaxForm } from '@core/models/tax-form.model';
import { FormDef } from '@core/models/form-def.model';

/**
 * Builds A4 / "desktop width" PDFs so the same file looks correct when opened
 * on a computer and when attached to an email.
 */
@Injectable({ providedIn: 'root' })
export class PdfService {
  constructor(private readonly translate: TranslateService) {}

  private t(key: string): string {
    return this.translate.instant(key) as string;
  }

  private header(doc: jsPDF, subtitle: string): number {
    doc.setFillColor(37, 99, 235); // brand-600
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 70, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Safe Taxes ATL', 40, 34);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(subtitle, 40, 54);
    doc.setTextColor(20, 20, 20);
    return 100;
  }

  private footer(doc: jsPDF): void {
    const h = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Safe Taxes ATL — ${new Date().toLocaleString()}`,
      40,
      h - 24
    );
  }

  generateTaxFormPdf(form: Partial<TaxForm>): jsPDF {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    let y = this.header(doc, `${this.t('form.title')} — ${form.tax_year ?? ''}`);

    const section = (title: string, rows: [string, string][]) => {
      autoTable(doc, {
        startY: y,
        head: [[title, '']],
        body: rows.map(([k, v]) => [k, v || '—']),
        theme: 'striped',
        headStyles: { fillColor: [30, 64, 175], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 6 },
        columnStyles: { 0: { cellWidth: 200, fontStyle: 'bold' } },
        margin: { left: 40, right: 40 }
      });
      // @ts-expect-error lastAutoTable is added by the plugin at runtime
      y = (doc.lastAutoTable?.finalY ?? y) + 18;
    };

    section(this.t('form.personalInfo'), [
      [this.t('form.fullName'), form.full_name ?? ''],
      [this.t('form.email'), form.email ?? ''],
      [this.t('form.phone'), form.phone ?? '']
    ]);
    section(this.t('form.addressSection'), [
      [this.t('form.addressLine1'), form.address_line1 ?? ''],
      [this.t('form.city'), form.city ?? ''],
      [this.t('form.state'), form.state ?? ''],
      [this.t('form.zip'), form.zip ?? '']
    ]);
    section(this.t('form.sensitiveSection'), [
      [this.t('form.ssn'), form.ssn ?? ''],
      [this.t('form.bankName'), form.bank_name ?? ''],
      [this.t('form.accountNumber'), form.bank_account_number ?? ''],
      [this.t('form.routingNumber'), form.bank_routing_number ?? '']
    ]);
    section(this.t('form.workSection'), [
      [this.t('form.employer'), form.employer ?? ''],
      [
        this.t('form.incomeRange'),
        form.income_range ? this.t('income.' + form.income_range) : ''
      ],
      [
        this.t('form.filingStatus'),
        form.filing_status ? this.t('filing.' + form.filing_status) : ''
      ],
      [this.t('form.dependents'), form.dependents != null ? String(form.dependents) : ''],
      [this.t('form.notes'), form.notes ?? '']
    ]);

    this.footer(doc);
    return doc;
  }

  downloadTaxForm(form: Partial<TaxForm>, filename?: string): void {
    const name =
      filename ??
      `SafeTaxesATL_${form.tax_year ?? 'form'}_${(form.full_name ?? 'cliente')
        .replace(/\s+/g, '_')
        .toLowerCase()}.pdf`;
    this.generateTaxFormPdf(form).save(name);
  }

  taxFormPdfBlob(form: Partial<TaxForm>): Blob {
    return this.generateTaxFormPdf(form).output('blob');
  }

  /** Base64 (no data: prefix) — handy for emailing via an Edge Function. */
  taxFormPdfBase64(form: Partial<TaxForm>): string {
    return this.generateTaxFormPdf(form).output('datauristring').split(',')[1];
  }

  private kvSection(
    doc: jsPDF,
    startY: number,
    title: string,
    rows: [string, string][]
  ): number {
    autoTable(doc, {
      startY,
      head: [[title, '']],
      body: rows.map(([k, v]) => [k, v || '—']),
      theme: 'striped',
      headStyles: { fillColor: [30, 64, 175], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 5 },
      columnStyles: { 0: { cellWidth: 200, fontStyle: 'bold' } },
      margin: { left: 40, right: 40 }
    });
    // @ts-expect-error lastAutoTable added by the plugin at runtime
    return (doc.lastAutoTable?.finalY ?? startY) + 14;
  }

  /** Full Client Profile PDF (taxpayer, spouse, dependents, etc.). */
  generateProfilePdf(raw: Record<string, any>): jsPDF {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const t = (k: string) => this.t(k);
    const yn = (v: unknown) =>
      v === 'yes' ? t('common.yes') : v === 'no' ? t('common.no') : '';
    let y = this.header(doc, `${t('pf.title')} — ${raw?.['tax_year'] ?? ''}`);

    const personRows = (p: Record<string, any> = {}): [string, string][] => [
      [t('pf.firstName') + ' / ' + t('pf.lastName'), `${p['first'] ?? ''} ${p['last'] ?? ''}`],
      [t('form.ssn'), p['ssn'] ?? ''],
      [t('pf.dob'), p['dob'] ?? ''],
      [t('form.addressLine1'), `${p['addr'] ?? ''}, ${p['city'] ?? ''} ${p['state'] ?? ''} ${p['zip'] ?? ''}`],
      [t('pf.cell') + ' / ' + t('pf.workPhone'), `${p['cell'] ?? ''} / ${p['work'] ?? ''}`],
      [t('form.email'), p['email'] ?? ''],
      [t('pf.occupation'), p['occ'] ?? ''],
      [t('pf.idType') + ' #', `${p['id_type'] ?? ''} ${p['id_num'] ?? ''}`]
    ];

    y = this.kvSection(doc, y, t('pf.sec2'), personRows(raw?.['taxpayer']));
    y = this.kvSection(doc, y, t('pf.sec3'), personRows(raw?.['spouse']));

    const deps = Array.isArray(raw?.['dependents']) ? raw['dependents'] : [];
    const realDeps = deps.filter((d: any) => d && d.name);
    if (realDeps.length) {
      autoTable(doc, {
        startY: y,
        head: [[t('pf.depName'), t('pf.depDob'), t('pf.depSsn'), t('pf.depRel'), t('pf.depMonths')]],
        body: realDeps.map((d: any) => [d.name ?? '', d.dob ?? '', d.ssn ?? '', d.rel ?? '', d.months ?? '']),
        theme: 'grid',
        headStyles: { fillColor: [30, 64, 175], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 5 },
        margin: { left: 40, right: 40 }
      });
      // @ts-expect-error plugin
      y = (doc.lastAutoTable?.finalY ?? y) + 14;
    }

    y = this.kvSection(doc, y, t('pf.sec6'), [
      [t('pf.businessName'), raw?.['se_bizname'] ?? ''],
      [t('pf.ein'), raw?.['se_ein'] ?? ''],
      [t('form.addressLine1'), `${raw?.['se_addr'] ?? ''}, ${raw?.['se_city'] ?? ''} ${raw?.['se_state'] ?? ''} ${raw?.['se_zip'] ?? ''}`]
    ]);

    y = this.kvSection(doc, y, t('pf.secIncome'), [
      [t('pf.bankInterest'), `${yn(raw?.['bank_int'])} ${raw?.['bank_int_amt'] ? '$' + raw['bank_int_amt'] : ''}`],
      [t('pf.unemployment'), yn(raw?.['unemp'])],
      [t('pf.iraPension'), yn(raw?.['ira'])],
      [t('pf.virtualCurrency'), yn(raw?.['vc'])],
      [t('pf.soldStocks'), yn(raw?.['stocks'])]
    ]);

    y = this.kvSection(doc, y, t('pf.sec12'), [
      [t('pf.insuranceName'), `${raw?.['ins_type'] ?? ''} ${raw?.['ins_name'] ?? ''}`],
      [t('pf.memberNo'), raw?.['ins_member'] ?? '']
    ]);

    this.kvSection(doc, y, t('pf.sec13'), [
      [t('form.bankName'), raw?.['bank_name'] ?? ''],
      [t('form.routingNumber'), raw?.['bank_rout'] ?? ''],
      [t('form.accountNumber'), raw?.['bank_acct'] ?? '']
    ]);

    this.footer(doc);
    return doc;
  }

  downloadProfile(raw: Record<string, any>): void {
    const tp = raw?.['taxpayer'] ?? {};
    const name = `${tp['first'] ?? 'cliente'}_${tp['last'] ?? ''}`
      .replace(/\s+/g, '_')
      .toLowerCase();
    this.generateProfilePdf(raw).save(
      `SafeTaxesATL_${raw?.['tax_year'] ?? 'form'}_${name}.pdf`
    );
  }

  profilePdfBase64(raw: Record<string, any>): string {
    return this.generateProfilePdf(raw).output('datauristring').split(',')[1];
  }

  profilePdfBlob(raw: Record<string, any>): Blob {
    return this.generateProfilePdf(raw).output('blob');
  }

  /** PDF for any config-driven (dynamic) form. */
  generateGenericPdf(
    def: FormDef,
    values: Record<string, any>,
    lang: string
  ): jsPDF {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const title = lang === 'en' ? def.en : def.es;
    let y = this.header(doc, title);
    for (const s of def.sections) {
      const rows: [string, string][] = s.fields.map((fld) => {
        let v = values?.[fld.name];
        if (fld.type === 'yesno') {
          v = v === 'yes' ? (lang === 'en' ? 'Yes' : 'Sí') : v === 'no' ? 'No' : '';
        } else if (fld.type === 'money' && v) {
          v = '$' + v;
        }
        return [lang === 'en' ? fld.en : fld.es, v != null && v !== '' ? String(v) : '—'];
      });
      y = this.kvSection(doc, y, lang === 'en' ? s.en : s.es, rows);
    }
    this.footer(doc);
    return doc;
  }

  downloadGeneric(def: FormDef, values: Record<string, any>, lang: string): void {
    this.generateGenericPdf(def, values, lang).save(
      `SafeTaxesATL_${def.id}_${values?.['taxYear'] ?? ''}.pdf`
    );
  }

  genericPdfBase64(def: FormDef, values: Record<string, any>, lang: string): string {
    return this.generateGenericPdf(def, values, lang)
      .output('datauristring')
      .split(',')[1];
  }

  genericPdfBlob(def: FormDef, values: Record<string, any>, lang: string): Blob {
    return this.generateGenericPdf(def, values, lang).output('blob');
  }

  downloadContactCopy(payload: {
    name: string;
    email: string;
    phone: string;
    message: string;
  }): void {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    let y = this.header(doc, this.t('contact.title'));
    autoTable(doc, {
      startY: y,
      body: [
        [this.t('contact.name'), payload.name || '—'],
        [this.t('contact.email'), payload.email || '—'],
        [this.t('contact.phone'), payload.phone || '—'],
        [this.t('contact.message'), payload.message || '—']
      ],
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 6 },
      columnStyles: { 0: { cellWidth: 160, fontStyle: 'bold' } },
      margin: { left: 40, right: 40 }
    });
    this.footer(doc);
    doc.save(`SafeTaxesATL_contacto_${Date.now()}.pdf`);
  }
}
