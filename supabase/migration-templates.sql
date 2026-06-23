-- Módulo de Mensajes predeterminados (plantillas de correo y SMS).
-- Correr en el SQL Editor de Supabase (después de schema.sql).
create table if not exists public.message_templates (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        text not null default 'email' check (type in ('email','sms')),
  subject     text,
  body        text,
  created_by  uuid references auth.users(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.message_templates enable row level security;

drop policy if exists message_templates_staff on public.message_templates;
create policy message_templates_staff on public.message_templates
  for all using (public.is_staff()) with check (public.is_staff());

grant select, insert, update, delete on public.message_templates to authenticated;
