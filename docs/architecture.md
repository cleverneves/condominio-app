# CondoResolve — Arquitetura

> Última atualização: 2026-09-16

## Stack

- **Next.js 16.3.5** (App Router) + **React 19.2.8** + **TypeScript**,
  React Compiler ligado (`next.config.ts`).
- **Tailwind CSS v4** + **shadcn/ui** (`components.json`, style
  `radix-nova`, ícones `lucide-react`) — tokens visuais definidos em
  [`docs/DESIGN.md`](./DESIGN.md) e aplicados em `src/app/globals.css`.
- **React Hook Form** + **Zod** em todos os formulários.
- **Supabase**: Auth (e-mail/senha), Postgres (dados) e Storage (imagens).

## Estrutura de pastas

Cada página segue o padrão `page.tsx` (Server Component) → `_data-access`
(consultas) → `_components` (Client Components) → `_actions` (Server
Actions), conforme `.cursor/rules/page-rules.mdc`. Exemplo real:

```
src/app/(admin)/moradores/
├── page.tsx                       # busca via _data-access, renderiza content
├── _components/moradores-content.tsx
├── _components/morador-form-dialog.tsx
├── _components/reset-password-dialog.tsx
├── _actions/criar-morador.ts
├── _actions/atualizar-morador.ts
├── _actions/redefinir-senha.ts
├── _actions/alternar-status.ts
└── _data-access/get-moradores.ts
```

Lógica compartilhada entre páginas mora em `src/lib/`:

- `lib/ocorrencia.ts` — categorias/locais fixos, transições de status
  permitidas para o administrativo, validação de imagens.
- `lib/occurrences/actions.ts` — Server Actions de ocorrência usadas por
  mais de uma rota (abrir, editar, cancelar, comentar, apagar o próprio
  comentário, mudar status).
- `lib/occurrences/queries.ts` — leitura do detalhe completo de uma
  ocorrência (dados, imagens, comentários, autor).
- `lib/perfil.ts` — rótulos de perfil e helper `isMorador(role)`.
- `lib/formatters.ts` — formatação de datas/texto para a UI.
- `lib/auth/session.ts` — leitura de sessão e guards de rota.

Componentes de UI genéricos (shadcn) ficam em `src/components/ui/`;
componentes de domínio reutilizáveis entre páginas (ex.: `status-badge.tsx`,
`occurrence-comments.tsx`) ficam em `src/components/`.

## Autenticação e autorização (3 camadas)

1. **`src/proxy.ts`** (middleware) — portão de sessão: sem sessão em rota
   interna → `/login`; com sessão em `/login` → `/`. Não distingue perfil.
2. **`lib/auth/session.ts`** — `getSessionProfile()` lê o `profile` do
   usuário autenticado (retorna `null` se a conta estiver `is_active =
false`, aplicando a Regra 7 do PRD). `requireAdmin()` e
   `requireMorador()` chamam isso nos `layout.tsx` de cada grupo de rota e
   redirecionam quem está no shell errado.
3. **RLS no Postgres** (`supabase/migrations/00007_rls_policies.sql`) —
   última linha de defesa, independente do código da aplicação.

Clientes Supabase (`src/lib/supabase/`):

- `client.ts` — `createBrowserClient`, uso em Client Components.
- `server.ts` — `createServerClient` com cookies do Next (Server
  Components, Server Actions, Route Handlers); respeita RLS.
- `admin.ts` — `createClient` com a **service role key** (`server-only`);
  bypassa RLS. Uso restrito a ações administrativas que dependem da Auth
  Admin API (criar morador, redefinir senha/e-mail via `auth.users`).

## Sistema visual

Tokens (cor, tipografia, raio, espaçamento, elevação) definidos em
[`docs/DESIGN.md`](./DESIGN.md) e aplicados via `components.json`
(shadcn, style `radix-nova`, base color `neutral`) + `globals.css`. O
tema CondoResolve (verde floresta, badges em pílula, sidebar 260px)
prevalece sobre o tema padrão do shadcn — ver seção 10 do PRD.
