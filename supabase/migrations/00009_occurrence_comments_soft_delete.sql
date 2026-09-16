-- Regra 16 (revisada): comentario continua sem edicao, mas o proprio
-- autor pode apagar (soft delete) o comentario que escreveu, em
-- qualquer status da ocorrencia, sem janela de tempo. O texto original
-- permanece no banco (deleted_at marca a remocao); a UI troca o corpo
-- por um placeholder generico. Decisao registrada na sessao "questiona"
-- que substitui a premissa original ("nao ha editar nem apagar").
alter table public.occurrence_comments
  add column if not exists deleted_at timestamptz;

comment on table public.occurrence_comments is
  'Comentarios nao editaveis (Regra 16); autor pode soft-delete o proprio via deleted_at. Visiveis a quem pode ver a ocorrencia (Regra 8).';

comment on column public.occurrence_comments.deleted_at is
  'Soft delete pelo proprio autor. Nulo = comentario ativo. Sem "desfazer" depois de apagado.';

-- Defesa em profundidade (mesmo padrao da 00006 para occurrences): o
-- UPDATE em occurrence_comments so pode fazer uma coisa - apagar
-- (deleted_at de NULL para now()). Nenhum outro campo muda e nao ha
-- reabertura de comentario apagado.
create or replace function public.enforce_occurrence_comment_soft_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.occurrence_id <> old.occurrence_id
     or new.author_id <> old.author_id
     or new.body <> old.body
     or new.created_at <> old.created_at then
    raise exception 'occurrence_comment_immutable_fields_changed';
  end if;

  if old.deleted_at is not null then
    raise exception 'occurrence_comment_already_deleted';
  end if;

  if new.deleted_at is null then
    raise exception 'occurrence_comment_delete_required';
  end if;

  return new;
end;
$$;

drop trigger if exists occurrence_comments_enforce_soft_delete on public.occurrence_comments;
create trigger occurrence_comments_enforce_soft_delete
  before update on public.occurrence_comments
  for each row
  execute function public.enforce_occurrence_comment_soft_delete();

-- Autor apaga (soft delete) o proprio comentario, em qualquer status da
-- ocorrencia (mesma regra de quem pode comentar), sem janela de tempo.
-- Nunca apaga o de outro: USING restringe a linha alcancada, WITH CHECK
-- reforca o resultado, e o trigger acima garante que nada alem de
-- deleted_at muda.
create policy "occurrence_comments_soft_delete_self"
  on public.occurrence_comments
  for update
  to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));
