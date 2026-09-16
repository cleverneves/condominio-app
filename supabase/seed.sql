-- Seed do unico funcionario administrativo (Regra 4): a implantacao ja
-- nasce com esta conta; nao ha tela de cadastro de outro funcionario.
--
-- USO LOCAL/DEV: credenciais abaixo sao um valor padrao de desenvolvimento.
-- Em qualquer ambiente real, troque a senha pela Spec 03 (redefinir senha)
-- imediatamente depois do primeiro login e nunca versione a senha real.
create extension if not exists pgcrypto;

do $$
declare
  admin_email text := 'admin@condoresolve.local';
  admin_password text := 'CondoResolve!2026';
  admin_id uuid := gen_random_uuid();
begin
  if exists (select 1 from auth.users where email = admin_email) then
    raise notice 'Administrativo % ja existe; seed ignorado.', admin_email;
    return;
  end if;

  -- Todas as colunas de token abaixo precisam ser string vazia (nunca NULL):
  -- o GoTrue (Auth) falha com "500: Database error querying schema" ao
  -- escanear NULL nessas colunas durante o login (bug conhecido quando o
  -- usuario e inserido via SQL direto em vez da Admin API).
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token,
    email_change, email_change_token_new, email_change_token_current,
    phone_change, phone_change_token, reauthentication_token
  ) values (
    '00000000-0000-0000-0000-000000000000',
    admin_id,
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    '', '',
    '', '', '',
    '', '', ''
  );

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider, created_at, updated_at
  ) values (
    gen_random_uuid(),
    admin_id,
    admin_id::text,
    jsonb_build_object('sub', admin_id::text, 'email', admin_email),
    'email',
    now(),
    now()
  );

  -- Administrativo nao tem bloco/apartamento (constraint profiles_morador_unit_required).
  insert into public.profiles (id, role, full_name, email, phone, bloco, apartamento, is_active)
  values (admin_id, 'administrativo', 'Administracao do condominio', admin_email, '-', null, null, true);

  raise notice 'Administrativo criado: % / senha padrao de dev (troque via Spec 03).', admin_email;
end $$;
