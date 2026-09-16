-- Bucket privado para imagens de ocorrencia (Regra 15). Path de cada
-- objeto: "{occurrence_id}/{position}.{ext}" -> o primeiro segmento do
-- path identifica a ocorrencia dona da imagem.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ocorrencia-imagens',
  'ocorrencia-imagens',
  false,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- RLS de storage.objects espelha a visibilidade/edicao da ocorrencia
-- dona da imagem (helpers private.* definidos na migration 00001).
create policy "ocorrencia_imagens_select"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'ocorrencia-imagens'
    and private.can_access_occurrence((split_part(name, '/', 1))::bigint)
  );

create policy "ocorrencia_imagens_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'ocorrencia-imagens'
    and private.can_edit_pending_occurrence((split_part(name, '/', 1))::bigint)
  );

create policy "ocorrencia_imagens_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'ocorrencia-imagens'
    and private.can_edit_pending_occurrence((split_part(name, '/', 1))::bigint)
  );

-- Leitura sempre por URL assinada (bucket nao publico); sem policy de
-- update: substituir imagem e delete + insert.
