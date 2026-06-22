-- Migración: columnas para guardar el formulario completo (jsonb) y el tipo de
-- formulario. Correr si ya creaste las tablas con una versión anterior.
alter table public.leads add column if not exists extra jsonb;
alter table public.leads add column if not exists form_type text default 'client_profile';
alter table public.tax_forms add column if not exists extra jsonb;
alter table public.tax_forms add column if not exists form_type text default 'client_profile';
