# Supabase — Tax CRM

## 1. Database

Open the Supabase Dashboard → **SQL Editor** → New query, paste the full
contents of [`schema.sql`](./schema.sql) and run it. This creates:

- `profiles`, `tax_forms`, `documents`, `leads` tables
- Row Level Security policies (owner + staff access; anonymous lead inserts)
- a trigger that auto-creates a profile when a user signs up
- the private `tax-documents` storage bucket and its policies

## 2. Auth settings (for local dev)

Dashboard → **Authentication → Providers → Email**: for fast local testing you
may disable *"Confirm email"* so sign-up logs you straight in. Re-enable it for
production.

## 3. Make yourself a preparer

After signing up once through the app, run in the SQL editor:

```sql
update public.profiles set role = 'preparer' where email = 'you@example.com';
```

Roles: `client` (default), `preparer`, `admin`.

## 4. Email Edge Function (optional but required for emailing PDFs)

The app calls a function named `send-tax-email`. Until it is deployed, the app
still downloads the PDF and saves the record — it just skips the email.

```bash
# one-time
supabase login
supabase link --project-ref ncjicryfnutglupcgpqt

# secrets (Resend account → API key, and a verified sender domain)
# BRAND_NAME is the only brand text baked into the function — set it per
# deployment/location (see src/environments for the frontend equivalent).
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase secrets set MAIL_FROM="Your Business Name <noreply@yourdomain.com>"
supabase secrets set BRAND_NAME="Your Business Name"

# deploy
supabase functions deploy send-tax-email --no-verify-jwt
```

## 5. Security reminder

`profiles`, `tax_forms` and `leads` hold SSN and US bank details. RLS limits who
can read them, but for production add column encryption (Supabase Vault /
pgsodium) and review IRS Pub. 4557 / FTC Safeguards Rule obligations. Also
consider **not** collecting SSN/bank on the public (anonymous) landing form.
