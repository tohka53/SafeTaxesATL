-- Proceso de taxes por cliente/año (lo controla el staff; el cliente lo ve).
-- Correr en el SQL Editor de Supabase (después de schema.sql).
create table if not exists public.tax_cases (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  tax_year     int  not null,
  status       text not null default 'started' check (status in ('started','in_process','finished')),
  requested    jsonb,        -- arreglo de documentos/datos solicitados
  request_note text,
  started_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  created_by   uuid references auth.users(id),
  unique (user_id, tax_year)
);

alter table public.tax_cases enable row level security;

drop policy if exists tax_cases_select on public.tax_cases;
create policy tax_cases_select on public.tax_cases
  for select using (user_id = auth.uid() or public.is_staff());

drop policy if exists tax_cases_write on public.tax_cases;
create policy tax_cases_write on public.tax_cases
  for all using (public.is_staff()) with check (public.is_staff());

grant select, insert, update, delete on public.tax_cases to authenticated;
