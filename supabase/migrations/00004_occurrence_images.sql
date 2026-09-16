-- Imagens de uma ocorrencia (Regra 15): JPEG ou PNG, <= 5 MB (limite do
-- bucket na migration 00008), no maximo 3. O par unico
-- (occurrence_id, position) com position entre 1 e 3 ja garante o limite
-- de 3 imagens sem precisar de trigger separado.
create table if not exists public.occurrence_images (
  id bigint generated always as identity primary key,
  occurrence_id bigint not null references public.occurrences (id) on delete cascade,
  storage_path text not null check (btrim(storage_path) <> ''),
  position smallint not null check (position between 1 and 3),
  created_at timestamptz not null default now(),
  constraint occurrence_images_unique_position unique (occurrence_id, position)
);

comment on table public.occurrence_images is
  'Imagens (1-3) de uma ocorrencia; storage_path aponta para o bucket privado ocorrencia-imagens.';

create index if not exists occurrence_images_occurrence_id_idx
  on public.occurrence_images (occurrence_id);
