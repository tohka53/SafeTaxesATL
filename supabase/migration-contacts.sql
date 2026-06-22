-- Módulo de Contactos / Clientes del CRM.
-- Correr en el SQL Editor de Supabase (después de schema.sql).
create table if not exists public.crm_contacts (
  id                 uuid primary key default gen_random_uuid(),
  full_name          text,
  phone              text,
  email              text,
  notes              text,
  -- Si el teléfono coincide con un perfil existente, se enlaza aquí.
  linked_profile_id  uuid references public.profiles(id) on delete set null,
  last_communication timestamptz,
  last_update        timestamptz default now(),
  created_by         uuid references auth.users(id),
  created_at         timestamptz default now()
);

create index if not exists idx_crm_contacts_phone on public.crm_contacts(phone);

alter table public.crm_contacts enable row level security;

-- Solo el personal (preparador/admin) administra contactos.
drop policy if exists crm_contacts_staff on public.crm_contacts;
create policy crm_contacts_staff on public.crm_contacts
  for all using (public.is_staff()) with check (public.is_staff());

grant select, insert, update, delete on public.crm_contacts to authenticated;
