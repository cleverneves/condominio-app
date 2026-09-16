# CondoResolve

Sistema web para **um único condomínio** registrar, acompanhar e atender
ocorrências (vazamento, barulho, obra, etc.), substituindo o WhatsApp/
telefone/recado na portaria. Moradores abrem chamados e acompanham o
status; o administrativo vê tudo, filtra, comenta e resolve.

Visão completa do produto: [`docs/project-overview.md`](./docs/project-overview.md).

## Stack

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 +
shadcn/ui + Supabase (Auth, Postgres, Storage). Detalhes de arquitetura,
estrutura de pastas e modelo de dados: [`docs/architecture.md`](./docs/architecture.md).

## Como rodar localmente

### 1. Pré-requisitos

- Node.js e npm.
- Um projeto [Supabase](https://supabase.com) (cloud ou local via
  [Supabase CLI](https://supabase.com/docs/guides/cli)).

### 2. Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` — credenciais do seu projeto Supabase.
- `NEXT_PUBLIC_CONDOMINIO_NOME` — nome exibido no shell administrativo e
  do morador.
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — credenciais do funcionário
  administrativo criado pelo seed (troque a senha em produção).

### 3. Banco de dados

Aplique as migrations e o seed em `supabase/` (via Supabase CLI ou pelo
SQL Editor do painel Supabase, na ordem numérica de
`supabase/migrations/`, seguido de `supabase/seed.sql`). Isso cria as
tabelas, RLS, bucket de imagens e o único administrativo da implantação.

### 4. Instalar e rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) e entre com o e-mail
e senha do administrativo (`SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`).

## Documentação

- [`docs/project-overview.md`](./docs/project-overview.md) — o que o
  produto faz, perfis de acesso e ciclo de vida da ocorrência.
- [`docs/architecture.md`](./docs/architecture.md) — stack, estrutura de
  pastas, autenticação/RLS e modelo de dados.
- [`docs/DESIGN.md`](./docs/DESIGN.md) — sistema visual (cor, tipografia,
  componentes, layout) — fonte da verdade para qualquer UI nova.
- [`docs/prd/condominio-app.md`](./docs/prd/condominio-app.md) — PRD com
  regras de negócio, fluxos e specs funcionais detalhadas (01–10).
