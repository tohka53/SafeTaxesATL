// =====================================================================
//  Supabase Edge Function: send-tax-email
//  Sends the intake form / contact message by email with the PDF attached.
//  Uses Resend (https://resend.com). The HTML body uses a fixed 600px table
//  so it renders well on desktop email clients.
//
//  Deploy:
//    supabase functions deploy send-tax-email --no-verify-jwt
//    supabase secrets set RESEND_API_KEY=re_xxx MAIL_FROM="Safe Taxes ATL <noreply@yourdomain.com>"
// =====================================================================
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const MAIL_FROM = Deno.env.get('MAIL_FROM') ?? 'Safe Taxes ATL <onboarding@resend.dev>';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function row(label: string, value: unknown): string {
  return `<tr>
    <td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;width:200px">${label}</td>
    <td style="padding:8px 12px;border:1px solid #e5e7eb">${value ?? '—'}</td>
  </tr>`;
}

function buildHtml(form: Record<string, unknown> | undefined, contact: Record<string, unknown> | undefined): string {
  const inner = contact
    ? row('Nombre', contact['name']) +
      row('Email', contact['email']) +
      row('Teléfono', contact['phone']) +
      row('Mensaje', contact['message'])
    : row('Año fiscal', form?.['tax_year']) +
      row('Nombre', form?.['full_name']) +
      row('Email', form?.['email']) +
      row('Teléfono', form?.['phone']) +
      row('Dirección', form?.['address_line1']) +
      row('Ciudad/Estado/ZIP', `${form?.['city'] ?? ''} ${form?.['state'] ?? ''} ${form?.['zip'] ?? ''}`) +
      row('Empleador', form?.['employer']) +
      row('Rango de ingresos', form?.['income_range']);

  return `<!doctype html><html><body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden">
          <tr><td style="background:#2563eb;padding:24px 32px;color:#fff">
            <h1 style="margin:0;font-size:22px">Safe Taxes ATL</h1>
            <p style="margin:4px 0 0;font-size:13px;color:#dbeafe">Nuevo formulario recibido</p>
          </td></tr>
          <tr><td style="padding:24px 32px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;color:#111827">
              ${inner}
            </table>
            <p style="margin:24px 0 0;font-size:12px;color:#6b7280">El PDF adjunto contiene la información completa del formulario.</p>
          </td></tr>
          <tr><td style="padding:16px 32px;background:#f9fafb;color:#9ca3af;font-size:11px">© Safe Taxes ATL</td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }
  try {
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not set' }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { to, cc, replyTo, subject, pdfBase64, pdfName, form, contact } = body;

    const payload: Record<string, unknown> = {
      from: MAIL_FROM,
      to: [to],
      subject: subject ?? 'Safe Taxes ATL',
      html: buildHtml(form, contact)
    };
    if (cc) payload['cc'] = [cc];
    if (replyTo) payload['reply_to'] = replyTo;
    if (pdfBase64) {
      payload['attachments'] = [
        { filename: pdfName ?? 'safe-taxes-atl.pdf', content: pdfBase64 }
      ];
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.ok ? 200 : 502,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });
  }
});
