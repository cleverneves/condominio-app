-- RLS de todas as tabelas do produto. Helpers de private.* (00001)
-- evitam recursao e mantem auth.uid() em subselect (performance).

-- profiles ------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles_select_self_or_admin"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()) or private.is_admin());

-- Regra 5: so o administrativo cadastra morador (Spec 02).
create policy "profiles_insert_admin_only"
  on public.profiles
  for insert
  to authenticated
  with check (private.is_admin());

-- Regra 5/7: so o administrativo edita, redefine senha, desativa e
-- reativa (Spec 03). Morador nao altera o proprio cadastro.
create policy "profiles_update_admin_only"
  on public.profiles
  for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

-- Sem policy de delete: nao ha exclusao definitiva de morador (Spec 03).

-- occurrences -----------------------------------------------------------
alter table public.occurrences enable row level security;

-- Regra 8: autor ve as proprias; administrativo ve todas (Spec 05/08).
create policy "occurrences_select_author_or_admin"
  on public.occurrences
  for select
  to authenticated
  using (author_id = (select auth.uid()) or private.is_admin());

-- Regra 9: so morador ativo abre, sempre como autor e sempre Pendente
-- (Spec 04). Administrativo nao cria ocorrencia.
create policy "occurrences_insert_active_author"
  on public.occurrences
  for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and private.is_active_profile()
    and status = 'pendente'
  );

-- Regra 10/11/12: autor edita/cancela so a propria Pendente;
-- administrativo avanca status em qualquer ocorrencia (a maquina de
-- estados fina fica no trigger da migration 00006).
create policy "occurrences_update_author_pending_or_admin"
  on public.occurrences
  for update
  to authenticated
  using (
    (author_id = (select auth.uid()) and status = 'pendente')
    or private.is_admin()
  )
  with check (
    private.is_admin()
    or (author_id = (select auth.uid()) and status in ('pendente', 'cancelada'))
  );

-- Sem policy de delete: ocorrencia nunca e apagada.

-- occurrence_images -------------------------------------------------------
alter table public.occurrence_images enable row level security;

-- Regra 15: quem ve a ocorrencia ve as imagens.
create policy "occurrence_images_select"
  on public.occurrence_images
  for select
  to authenticated
  using (private.can_access_occurrence(occurrence_id));

-- Regra 11: so o autor anexa, e so enquanto Pendente (abertura ou
-- edicao, Spec 04/07).
create policy "occurrence_images_insert"
  on public.occurrence_images
  for insert
  to authenticated
  with check (private.can_edit_pending_occurrence(occurrence_id));

create policy "occurrence_images_delete"
  on public.occurrence_images
  for delete
  to authenticated
  using (private.can_edit_pending_occurrence(occurrence_id));

-- Sem policy de update: substituir imagem e delete + insert.

-- occurrence_comments -----------------------------------------------------
alter table public.occurrence_comments enable row level security;

-- Regra 8/16: quem ve a ocorrencia ve os comentarios, em qualquer status.
create policy "occurrence_comments_select"
  on public.occurrence_comments
  for select
  to authenticated
  using (private.can_access_occurrence(occurrence_id));

-- Regra 16: autor comenta na propria ocorrencia; administrativo comenta
-- em qualquer uma. Sempre como o proprio usuario logado.
create policy "occurrence_comments_insert"
  on public.occurrence_comments
  for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and private.can_access_occurrence(occurrence_id)
  );

-- Sem policy de update/delete: comentario e imutavel (Regra 16).
