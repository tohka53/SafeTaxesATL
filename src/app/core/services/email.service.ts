import { Injectable } from '@angular/core';

import { environment } from '@env/environment';

/**
 * Sends emails through FormSubmit.co (https://formsubmit.co) — no backend.
 * The first submission to a new inbox triggers a one-time activation email
 * that must be confirmed once. Attachments are sent as multipart/form-data to
 * the standard endpoint via a `no-cors` fetch (fire-and-forget).
 */
@Injectable({ providedIn: 'root' })
export class EmailService {
  private readonly endpoint = `https://formsubmit.co/${environment.contactEmail}`;

  private async post(
    fields: Record<string, string>,
    pdf?: { blob: Blob; name: string }
  ): Promise<{ sent: boolean }> {
    try {
      const fd = new FormData();
      Object.entries(fields).forEach(([k, v]) => fd.append(k, v ?? ''));
      fd.append('_captcha', 'false');
      fd.append('_template', 'table');
      if (pdf) {
        fd.append(
          'attachment',
          new File([pdf.blob], pdf.name, { type: 'application/pdf' })
        );
      }
      await fetch(this.endpoint, { method: 'POST', body: fd, mode: 'no-cors' });
      return { sent: true };
    } catch (e) {
      console.warn('FormSubmit error:', e);
      return { sent: false };
    }
  }

  /** Any form submission → email to the inbox with the PDF attached. */
  async sendSubmission(opts: {
    subject: string;
    name: string;
    email?: string;
    phone?: string;
    formTitle: string;
    pdfBlob: Blob;
    pdfName: string;
  }): Promise<{ sent: boolean }> {
    return this.post(
      {
        _subject: opts.subject,
        Nombre: opts.name,
        Correo: opts.email ?? '',
        Telefono: opts.phone ?? '',
        Formulario: opts.formTitle
      },
      { blob: opts.pdfBlob, name: opts.pdfName }
    );
  }

  async sendContact(payload: {
    name: string;
    email: string;
    phone: string;
    message: string;
  }): Promise<{ sent: boolean }> {
    return this.post({
      _subject: `Contacto web — ${payload.name}`,
      Nombre: payload.name,
      Correo: payload.email,
      Telefono: payload.phone,
      Mensaje: payload.message
    });
  }
}
