-- Schema privado para funcoes auxiliares de autorizacao.
-- Nunca exposto via API (nao consta em api.schemas). EXECUTE restrito ao
-- role authenticated; anon e o grant implicito de PUBLIC sao revogados.
--
-- As funcoes de autorizacao (is_admin, is_active_profile,
-- can_access_occurrence, can_edit_pending_occurrence) NAO ficam aqui:
-- sao "language sql" e o Postgres resolve/valida as tabelas referenciadas
-- no CREATE FUNCTION (diferente de plpgsql, que so resolve na primeira
-- chamada). Por isso cada uma mora na migration da tabela de que depende
-- (00002_profiles.sql e 00003_occurrences.sql), sempre criada depois que
-- a tabela referenciada ja existe.
create schema if not exists private;

-- Trigger generico de updated_at, reutilizado pelas tabelas do produto.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
