-- =====================================================================
--  Safe Taxes ATL — Supabase schema + Row Level Security
--  Run this in the Supabase SQL Editor (Dashboard → SQL → New query).
--
--  SECURITY NOTE (read me):
--  This app stores PII (SSN, US bank details). RLS below restricts reads to
--  the owner and staff, but for production you SHOULD additionally encrypt the
--  sensitive columns at rest with Supabase Vault / pgsodium (or store them in a
--  separate, more tightly controlled table). Tax preparers are bound by IRS
--  Pub. 4557 and the FTC Safeguards Rule — treat this data accordingly.
-- =====================================================================

-- ---------- updated_at maintenance ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
--  PROFILES
-- =====================================================================
create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text,
  full_name           text,
  phone               text,
  address_line1       text,
  address_line2       text,
  city                text,
  state               text,
  zip                 text,
  ssn                 text,   -- sensitive
  bank_name           text,
  bank_account_number text,   -- sensitive
  bank_routing_number text,   -- sensitive
  employer            text,
  income_range        text,
  role                text not null default 'client' check (role in ('client','preparer','admin')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- Helper: is the current user staff?  Defined AFTER profiles exists so the
-- function body validates. SECURITY DEFINER avoids RLS recursion on profiles.
create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('preparer', 'admin')
  );
$$;

drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
  for select using (auth.uid() = id or public.is_staff());

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id or public.is_staff())
  with check (auth.uid() = id or public.is_staff());

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''), 'client')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
--  TAX FORMS  (one per client per tax year = the "case")
-- =====================================================================
create table if not exists public.tax_forms (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  tax_year            int  not null,
  status              text not null default 'draft' check (status in ('draft','submitted')),
  process_status      text not null default 'received'
                        check (process_status in ('received','in_review','preparing','ready_for_review','filed','completed')),
  form_type           text default 'client_profile',
  full_name           text,
  email               text,
  phone               text,
  address_line1       text,
  city                text,
  state               text,
  zip                 text,
  ssn                 text,   -- sensitive
  bank_name           text,
  bank_account_number text,   -- sensitive
  bank_routing_number text,   -- sensitive
  employer            text,
  income_range        text,
  filing_status       text,
  dependents          int,
  notes               text,
  extra               jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  submitted_at        timestamptz
);

create index if not exists idx_tax_forms_user on public.tax_forms(user_id);
create index if not exists idx_tax_forms_year on public.tax_forms(user_id, tax_year);

drop trigger if exists trg_tax_forms_updated on public.tax_forms;
create trigger trg_tax_forms_updated before update on public.tax_forms
  for each row execute function public.set_updated_at();

alter table public.tax_forms enable row level security;

drop policy if exists tax_forms_select on public.tax_forms;
create policy tax_forms_select on public.tax_forms
  for select using (user_id = auth.uid() or public.is_staff());

drop policy if exists tax_forms_insert on public.tax_forms;
create policy tax_forms_insert on public.tax_forms
  for insert with check (user_id = auth.uid() or public.is_staff());

-- Clients may edit only their own DRAFT forms (editable until submitted).
drop policy if exists tax_forms_update_owner on public.tax_forms;
create policy tax_forms_update_owner on public.tax_forms
  for update using (user_id = auth.uid() and status = 'draft')
  with check (user_id = auth.uid());

drop policy if exists tax_forms_update_staff on public.tax_forms;
create policy tax_forms_update_staff on public.tax_forms
  for update using (public.is_staff()) with check (public.is_staff());

drop policy if exists tax_forms_delete_staff on public.tax_forms;
create policy tax_forms_delete_staff on public.tax_forms
  for delete using (public.is_staff());

-- =====================================================================
--  DOCUMENTS  (finished returns uploaded by staff)
-- =====================================================================
create table if not exists public.documents (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  tax_year     int  not null,
  file_name    text not null,
  storage_path text not null,
  mime_type    text,
  size_bytes   bigint,
  uploaded_by  uuid references auth.users(id),
  created_at   timestamptz not null default now()
);

create index if not exists idx_documents_user on public.documents(user_id);

alter table public.documents enable row level security;

drop policy if exists documents_select on public.documents;
create policy documents_select on public.documents
  for select using (user_id = auth.uid() or public.is_staff());

drop policy if exists documents_insert_staff on public.documents;
create policy documents_insert_staff on public.documents
  for insert with check (public.is_staff());

drop policy if exists documents_delete_staff on public.documents;
create policy documents_delete_staff on public.documents
  for delete using (public.is_staff());

-- =====================================================================
--  LEADS  (PUBLIC landing-page submissions — no auth account yet)
-- =====================================================================
create table if not exists public.leads (
  id                  uuid primary key default gen_random_uuid(),
  tax_year            int,
  full_name           text,
  email               text,
  phone               text,
  address_line1       text,
  city                text,
  state               text,
  zip                 text,
  ssn                 text,   -- sensitive
  bank_name           text,
  bank_account_number text,   -- sensitive
  bank_routing_number text,   -- sensitive
  employer            text,
  income_range        text,
  filing_status       text,
  dependents          int,
  notes               text,
  extra               jsonb,   -- snapshot completo del formulario enviado
  form_type           text default 'client_profile',
  source              text default 'landing',
  status              text default 'new' check (status in ('new','contacted','converted','archived')),
  created_at          timestamptz not null default now()
);

alter table public.leads enable row level security;

-- Anyone (anonymous visitors included) may submit a lead, but only staff read.
drop policy if exists leads_insert_public on public.leads;
create policy leads_insert_public on public.leads
  for insert to anon, authenticated with check (true);

drop policy if exists leads_select_staff on public.leads;
create policy leads_select_staff on public.leads
  for select using (public.is_staff());

drop policy if exists leads_update_staff on public.leads;
create policy leads_update_staff on public.leads
  for update using (public.is_staff()) with check (public.is_staff());

-- =====================================================================
--  CRM CONTACTS  (clients list: existing + manually added, linked by phone)
-- =====================================================================
create table if not exists public.crm_contacts (
  id                 uuid primary key default gen_random_uuid(),
  full_name          text,
  phone              text,
  email              text,
  notes              text,
  linked_profile_id  uuid references public.profiles(id) on delete set null,
  last_communication timestamptz,
  last_update        timestamptz default now(),
  created_by         uuid references auth.users(id),
  created_at         timestamptz default now()
);

create index if not exists idx_crm_contacts_phone on public.crm_contacts(phone);

alter table public.crm_contacts enable row level security;

drop policy if exists crm_contacts_staff on public.crm_contacts;
create policy crm_contacts_staff on public.crm_contacts
  for all using (public.is_staff()) with check (public.is_staff());

-- =====================================================================
--  STORAGE  (private bucket for finished returns)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('tax-documents', 'tax-documents', false)
on conflict (id) do nothing;

-- Staff: full access within the bucket.
drop policy if exists "tax docs staff all" on storage.objects;
create policy "tax docs staff all" on storage.objects
  for all
  using (bucket_id = 'tax-documents' and public.is_staff())
  with check (bucket_id = 'tax-documents' and public.is_staff());

-- Client: read only their own files (path is "<user_id>/<year>/<file>").
drop policy if exists "tax docs owner read" on storage.objects;
create policy "tax docs owner read" on storage.objects
  for select
  using (
    bucket_id = 'tax-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================================
--  ROLE GRANTS (Supabase usually sets these by default; explicit for safety).
--  RLS above is what actually restricts rows — grants only allow the verbs.
-- =====================================================================
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete
  on public.profiles, public.tax_forms, public.documents, public.crm_contacts to authenticated;
grant select, insert, update on public.leads to authenticated;
grant insert on public.leads to anon;   -- anonymous landing submissions only

-- =====================================================================
--  MAKE YOURSELF A PREPARER (run once, after you sign up)
--    update public.profiles set role = 'preparer' where email = 'you@example.com';
-- =====================================================================
