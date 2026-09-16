-- Maquina de estados da ocorrencia (Regras 10, 11, 12) aplicada no banco,
-- independente de quem faz o UPDATE (defesa em profundidade alem do RLS
-- da migration 00007). O limite de 3 imagens por ocorrencia ja e
-- garantido pela constraint occurrence_images_unique_position (00004).
create or replace function public.enforce_occurrence_status_transition()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_is_admin boolean;
begin
  -- Conteudo imutavel apos a abertura (Spec 03/07): autor, data de
  -- abertura e o bloco/apartamento snapshot nunca mudam por UPDATE.
  if new.author_id <> old.author_id
     or new.opened_at <> old.opened_at
     or new.author_bloco <> old.author_bloco
     or new.author_apartamento <> old.author_apartamento then
    raise exception 'occurrence_immutable_fields_changed';
  end if;

  if new.status = old.status then
    return new;
  end if;

  -- Regra 12: resolvida e cancelada nao mudam mais, nem o administrativo.
  if old.status in ('resolvida', 'cancelada') then
    raise exception 'occurrence_status_locked';
  end if;

  caller_is_admin := private.is_admin();

  if caller_is_admin then
    if old.status = 'pendente'
       and new.status in ('em_andamento', 'resolvida', 'cancelada') then
      return new;
    end if;

    if old.status = 'em_andamento'
       and new.status in ('resolvida', 'cancelada') then
      return new;
    end if;

    raise exception 'occurrence_status_transition_not_allowed';
  end if;

  -- Regra 10: o proprio morador so cancela a sua ocorrencia Pendente.
  if new.author_id = (select auth.uid())
     and old.status = 'pendente'
     and new.status = 'cancelada' then
    return new;
  end if;

  raise exception 'occurrence_status_transition_not_allowed';
end;
$$;

drop trigger if exists occurrences_enforce_status_transition on public.occurrences;
create trigger occurrences_enforce_status_transition
  before update on public.occurrences
  for each row
  execute function public.enforce_occurrence_status_transition();
