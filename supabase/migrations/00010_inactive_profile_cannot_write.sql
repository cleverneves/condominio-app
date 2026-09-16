-- Regra 7: perfil inativo nao grava. A 00007 so exigia is_active_profile()
-- no INSERT de ocorrencia; update de ocorrencia, comentario e imagens
-- (via can_edit_pending_occurrence) aceitavam JWT ainda valido. O access
-- token sobrevive ao logout ate o exp (tipicamente 1h), entao a RLS e a
-- defesa imediata. private.is_admin() tambem passa a exigir is_active.

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
      and is_active = true
  );
$$;

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
      and private.is_active_profile()
  );
$$;

drop policy if exists "occurrences_update_author_pending_or_admin"
  on public.occurrences;
create policy "occurrences_update_author_pending_or_admin"
  on public.occurrences
  for update
  to authenticated
  using (
    (
      author_id = (select auth.uid())
      and status = 'pendente'
      and (select private.is_active_profile())
    )
    or (select private.is_admin())
  )
  with check (
    (select private.is_admin())
    or (
      author_id = (select auth.uid())
      and status in ('pendente', 'cancelada')
      and (select private.is_active_profile())
    )
  );

drop policy if exists "occurrence_comments_insert"
  on public.occurrence_comments;
create policy "occurrence_comments_insert"
  on public.occurrence_comments
  for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and (select private.is_active_profile())
    and private.can_access_occurrence(occurrence_id)
  );

drop policy if exists "occurrence_comments_soft_delete_self"
  on public.occurrence_comments;
create policy "occurrence_comments_soft_delete_self"
  on public.occurrence_comments
  for update
  to authenticated
  using (
    author_id = (select auth.uid())
    and (select private.is_active_profile())
  )
  with check (
    author_id = (select auth.uid())
    and (select private.is_active_profile())
  );

-- Desativar revoga as sessoes no Auth (refresh tokens deixam de renovar).
-- auth.admin.signOut() exige o JWT da vitima, que o administrativo nao
-- tem; apagar auth.sessions e o equivalente por user_id. Nao da para
-- invalidar o access token ja emitido - a RLS acima cobre esse intervalo.
create or replace function public.revoke_sessions_on_profile_deactivate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from auth.sessions where user_id = new.id;
  return new;
end;
$$;

drop trigger if exists profiles_revoke_sessions_on_deactivate on public.profiles;
create trigger profiles_revoke_sessions_on_deactivate
  after update of is_active on public.profiles
  for each row
  when (old.is_active = true and new.is_active = false)
  execute function public.revoke_sessions_on_profile_deactivate();

-- Regra 4: o unico administrativo nao pode ser desativado por esta via
-- (lockout do condominio).
create or replace function public.prevent_admin_deactivation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role = 'administrativo' and new.is_active = false then
    raise exception 'administrativo_nao_pode_ser_desativado';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_admin_deactivation on public.profiles;
create trigger profiles_prevent_admin_deactivation
  before update of is_active on public.profiles
  for each row
  execute function public.prevent_admin_deactivation();

revoke all on function public.revoke_sessions_on_profile_deactivate() from public;
revoke all on function public.prevent_admin_deactivation() from public;
