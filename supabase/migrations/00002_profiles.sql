-- Contas de acesso: um unico funcionario administrativo (Regra 4) e
-- moradores proprietario | inquilino (Regra 2), um perfil por auth.users.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('administrativo', 'proprietario', 'inquilino')),
  full_name text not null check (btrim(full_name) <> ''),
  email text not null check (btrim(email) <> ''),
  phone text not null check (btrim(phone) <> ''),
  bloco text,
  apartamento text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_unique unique (email),
  -- Regra 6: bloco e apartamento sao obrigatorios para morador; o
  -- administrativo (unico, sem unidade) nao os possui.
  constraint profiles_morador_unit_required check (
    role = 'administrativo'
    or (btrim(coalesce(bloco, '')) <> '' and btrim(coalesce(apartamento, '')) <> '')
  )
);

comment on table public.profiles is
  'Contas de acesso: administrativo (um so) e moradores (proprietario | inquilino). Regras 2-7.';

create index if not exists profiles_bloco_apartamento_idx
  on public.profiles (bloco, apartamento);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- Regras 2, 3, 4: existe um unico funcionario administrativo; ele enxerga
-- e administra tudo. Usada dentro de policies de RLS (nao chamar auth.uid()
-- por linha: envolvida em SELECT para o planner cachear o valor).
-- "language sql": o Postgres valida a referencia a public.profiles no
-- CREATE FUNCTION, por isso esta funcao so pode ser criada depois da
-- tabela acima (nao em 00001_private_helpers.sql).
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'administrativo'
  );
$$;

-- Regra 7: morador desativado nao entra nem grava nada.
create or replace function private.is_active_profile()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and is_active = true
  );
$$;

revoke all on function private.is_admin() from public;
revoke all on function private.is_active_profile() from public;

grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_active_profile() to authenticated;
