-- Ocorrencias abertas por moradores. Ciclo de status (Regra 9 e 12):
-- pendente -> em_andamento -> resolvida | cancelada. Resolvida e
-- cancelada nao mudam mais (aplicado pelo trigger da migration 00006).
create table if not exists public.occurrences (
  id bigint generated always as identity primary key,
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (btrim(title) <> '' and char_length(title) <= 200),
  details text not null check (btrim(details) <> ''),
  category text not null check (
    category in ('reclamacao', 'obra', 'importunacao', 'hidraulica', 'eletrica')
  ),
  location text not null check (
    location in ('apartamento', 'area_comum', 'praca', 'garagem', 'portaria')
  ),
  status text not null default 'pendente' check (
    status in ('pendente', 'em_andamento', 'resolvida', 'cancelada')
  ),
  -- Regra 17 / Spec 03: snapshot do bloco/apartamento do autor no momento
  -- da abertura. Nunca reescrito por edicoes de cadastro depois.
  author_bloco text not null check (btrim(author_bloco) <> ''),
  author_apartamento text not null check (btrim(author_apartamento) <> ''),
  opened_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.occurrences is
  'Ocorrencias dos moradores. author_bloco/author_apartamento sao snapshot da abertura (Regra 17).';

create index if not exists occurrences_author_id_idx
  on public.occurrences (author_id);
create index if not exists occurrences_status_opened_at_idx
  on public.occurrences (status, opened_at desc);
create index if not exists occurrences_author_bloco_idx
  on public.occurrences (author_bloco);
create index if not exists occurrences_category_idx
  on public.occurrences (category);

drop trigger if exists occurrences_set_updated_at on public.occurrences;
create trigger occurrences_set_updated_at
  before update on public.occurrences
  for each row
  execute function public.set_updated_at();

-- Regra 8: quem pode ver uma ocorrencia (autor ou administrativo) pode ver
-- seus comentarios e imagens (Regra 15/16).
-- "language sql": o Postgres valida a referencia a public.occurrences no
-- CREATE FUNCTION, por isso esta funcao so pode ser criada depois da
-- tabela acima (nao em 00001_private_helpers.sql).
create or replace function private.can_access_occurrence(occurrence_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.occurrences o
    where o.id = occurrence_id
      and (o.author_id = (select auth.uid()) or private.is_admin())
  );
$$;

-- Regra 11: o autor so edita/anexa imagem enquanto a ocorrencia dele
-- estiver Pendente.
create or replace function private.can_edit_pending_occurrence(occurrence_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.occurrences o
    where o.id = occurrence_id
      and o.author_id = (select auth.uid())
      and o.status = 'pendente'
  );
$$;

revoke all on function private.can_access_occurrence(bigint) from public;
revoke all on function private.can_edit_pending_occurrence(bigint) from public;

grant execute on function private.can_access_occurrence(bigint) to authenticated;
grant execute on function private.can_edit_pending_occurrence(bigint) to authenticated;
