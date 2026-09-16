# CondoResolve — Visão do produto

> Última atualização: 2026-09-16

## O que é

Sistema web para **um único condomínio** registrar, acompanhar e atender
ocorrências (vazamento, barulho, obra, etc.). Substitui o WhatsApp/telefone/
recado na portaria por um lugar único: o morador abre o chamado e acompanha
o status; o administrativo vê tudo, filtra, muda o status e responde.

Especificação completa: [`docs/prd/condominio-app.md`](./prd/condominio-app.md).
Sistema visual obrigatório: [`docs/DESIGN.md`](./DESIGN.md).

## Perfis de acesso

- **Funcionário administrativo** — um único, já existe na implantação (via
  `supabase/seed.sql`). Cadastra moradores, atende e fecha ocorrências.
- **Morador proprietário** e **morador inquilino** — mesmas permissões; o
  tipo só identifica quem abriu o chamado. Cada um só vê e comenta as
  próprias ocorrências.

Todo acesso é por e-mail e senha; não há cadastro público nem recuperação
de senha por e-mail (quem esquece procura a administração).

## Funcionalidades implementadas

- Login, sessão e redirecionamento por perfil; bloqueio de área alheia.
- Administrativo: cadastrar, editar, listar, redefinir senha e
  ativar/desativar morador (histórico de ocorrências nunca é apagado).
- Morador: abrir ocorrência (título, detalhes, categoria, local, até 3
  imagens JPEG/PNG ≤ 5 MB), listar e ver detalhe das próprias, editar ou
  cancelar enquanto **Pendente**.
- Administrativo: dashboard com totais por status, lista de todas as
  ocorrências, filtros por bloco/categoria/status, detalhe com dados do
  autor e mudança de status.
- Comentários na ocorrência (morador autor e administrativo), em qualquer
  status, sem edição; o próprio autor pode apagar (soft delete) o
  comentário que escreveu.

## Ciclo de vida da ocorrência

Toda ocorrência nasce **Pendente**. Transições permitidas:

```
Pendente ──(morador cancela)──────────────► Cancelada
Pendente ──(administrativo)──► Em andamento ──(administrativo)──► Resolvida
Pendente ──(administrativo)────────────────────────────────────► Resolvida
Pendente/Em andamento ──(administrativo)───────────────────────► Cancelada
```

`Resolvida` e `Cancelada` são finais — nenhum perfil reabre a ocorrência.

## Categorias e locais (listas fixas)

- **Categoria:** Reclamação, Obra, Importunação, Hidráulica, Elétrica.
- **Local:** Apartamento, Área comum, Praça, Garagem, Portaria.

## Onde ler mais

- Decisões técnicas e estrutura de código:
  [`docs/architecture.md`](./architecture.md).
- Paleta, tipografia, componentes e layout: [`docs/DESIGN.md`](./DESIGN.md).
