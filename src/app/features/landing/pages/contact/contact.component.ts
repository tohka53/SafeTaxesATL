import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { EmailService } from '@core/services/email.service';
import { PdfService } from '@core/services/pdf.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html'
})
export class ContactComponent {
  form: FormGroup;
  saving = false;
  success = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly email: EmailService,
    private readonly pdf: PdfService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      message: ['', [Validators.required]]
    });
  }

  invalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.saving = true;
    const payload = this.form.getRawValue();

    // Download a copy + best-effort email.
    this.pdf.downloadContactCopy(payload);
    await this.email.sendContact(payload);

    this.saving = false;
    this.success = true;
    this.form.reset();
  }
}
