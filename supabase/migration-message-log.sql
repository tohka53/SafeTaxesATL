-- Bitácora de mensajes enviados (correo/SMS) para evitar envíos duplicados.
-- Correr en el SQL Editor de Supabase (después de migration-contacts.sql).
create table if not exists public.message_log (
  id          uuid primary key default gen_random_uuid(),
  contact_id  uuid references public.crm_contacts(id) on delete cascade,
  channel     text not null check (channel in ('email','sms')),
  subject     text,
  body        text,
  sent_by     uuid references auth.users(id),
  sent_at     timestamptz default now()
);

create index if not exists idx_message_log_contact on public.message_log(contact_id, channel);

alter table public.message_log enable row level security;

drop policy if exists message_log_staff on public.message_log;
create policy message_log_staff on public.message_log
  for all using (public.is_staff()) with check (public.is_staff());

grant select, insert, update, delete on public.message_log to authenticated;
