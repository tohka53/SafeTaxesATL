-- =====================================================================
--  Crear / reparar SUPER ADMIN  (correr DESPUÉS de schema.sql)
--
--  IMPORTANTE: el error 500 en /auth/v1/token (login) ocurre cuando un
--  usuario se inserta a mano en auth.users y deja columnas de token en NULL.
--  GoTrue no puede leer NULL en esos campos -> 500. Este script las pone en ''.
--  Es idempotente y repara un usuario ya creado.
-- =====================================================================
create extension if not exists pgcrypto;

do $$
declare uid uuid;
begin
  select id into uid from auth.users where email = 'mecg1994@gmail.com';

  if uid is null then
    -- Crear nuevo
    uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change, email_change_token_new
    ) values (
      '00000000-0000-0000-0000-000000000000', uid,
      'authenticated', 'authenticated', 'mecg1994@gmail.com',
      crypt('ESTm1099513', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Super Admin"}',
      '', '', '', ''
    );
  else
    -- Reparar usuario existente (arregla el 500 y resetea la contraseña)
    update auth.users set
      encrypted_password = crypt('ESTm1099513', gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now())
    where id = uid;

    -- Poner los tokens en '' (con tolerancia a versiones distintas de GoTrue)
    begin
      update auth.users set
        confirmation_token = '', recovery_token = '',
        email_change = '', email_change_token_new = '',
        email_change_token_current = '', reauthentication_token = '',
        phone_change = '', phone_change_token = ''
      where id = uid;
    exception when undefined_column then
      update auth.users set
        confirmation_token = '', recovery_token = '',
        email_change = '', email_change_token_new = ''
      where id = uid;
    end;
  end if;

  -- Asegurar la identidad de email (necesaria para login con contraseña)
  if not exists (
    select 1 from auth.identities where user_id = uid and provider = 'email'
  ) then
    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), uid,
      jsonb_build_object('sub', uid::text, 'email', 'mecg1994@gmail.com'),
      'email', 'mecg1994@gmail.com', now(), now(), now()
    );
  end if;

  -- Perfil con rol admin (acceso total vía is_staff())
  insert into public.profiles (id, email, full_name, role)
  values (uid, 'mecg1994@gmail.com', 'Super Admin', 'admin')
  on conflict (id) do update set role = 'admin', full_name = 'Super Admin';
end $$;

-- Verificar:
-- select email, role from public.profiles where email = 'mecg1994@gmail.com';
