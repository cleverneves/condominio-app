-- Comentarios de uma ocorrencia (Regra 16): permitidos em qualquer
-- status, imutaveis depois de enviados. Sem updated_at e sem policy de
-- UPDATE/DELETE na migration 00007 -> nunca editados nem apagados.
create table if not exists public.occurrence_comments (
  id bigint generated always as identity primary key,
  occurrence_id bigint not null references public.occurrences (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (btrim(body) <> ''),
  created_at timestamptz not null default now()
);

comment on table public.occurrence_comments is
  'Comentarios imutaveis (Regra 16), visiveis a quem pode ver a ocorrencia (Regra 8).';

create index if not exists occurrence_comments_occurrence_id_idx
  on public.occurrence_comments (occurrence_id);
create index if not exists occurrence_comments_author_id_idx
  on public.occurrence_comments (author_id);
