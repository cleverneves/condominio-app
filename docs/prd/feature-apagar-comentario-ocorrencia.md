# PRD — Apagar comentário próprio em ocorrência

> Tipo: PRD de feature · Data: 2026-09-16
> **Status:** Implementada
>
> <!-- Documentado retroativamente: escopo fechado via sessão /questiona (entendimento compartilhado) e implementado na mesma sessão, antes da geração deste PRD. -->

## 1. Visão geral

Extensão da funcionalidade de comentários em ocorrências (Spec 10 do
[PRD do produto](./condominio-app.md)): o autor de um comentário — morador
autor da ocorrência, ou funcionário administrativo — pode apagar (soft
delete) o próprio comentário depois de enviado, em qualquer status da
ocorrência, sem janela de tempo. O comentário apagado deixa de exibir o
texto para quem visualiza a ocorrência (vira um aviso genérico "Comentário
removido", mantendo autor e data/hora), mas o texto original continua
guardado no banco. Comentários continuam **sem edição**, e ninguém apaga
comentário de outra pessoa.

## 2. Problema que resolve

A Regra 16 original do PRD do produto tornava o comentário 100% imutável:
depois de enviado, não havia como editar nem apagar, mesmo em casos de erro
de digitação, conteúdo colado por engano, ou simples arrependimento do
próprio autor. Isso obrigava o autor a "viver" com qualquer comentário
enviado, sem nenhuma saída dentro do produto.

## 3. Público-alvo

Autor do comentário: morador (proprietário ou inquilino) comentando na
própria ocorrência, e funcionário administrativo comentando em qualquer
ocorrência. Cada um só apaga o que ele mesmo escreveu.

## 4. Objetivo do recorte atual

Permitir que o autor de um comentário o apague (soft delete) a qualquer
momento, em qualquer status da ocorrência, com confirmação explícita,
preservando o restante do histórico da conversa e sem abrir a porta para
edição de comentários.

## 5. Funcionalidades

**Essenciais:**

- Ação de apagar sempre visível no próprio comentário (nunca no de outra
  pessoa).
- Confirmação explícita antes de apagar (ação irreversível pela UI).
- Soft delete: comentário apagado vira um placeholder "Comentário
  removido" para todos que veem a ocorrência, mantendo autor e data/hora.
- Vale para morador (autor da ocorrência) e para administrativo, cada um
  no próprio comentário.
- Vale em qualquer status da ocorrência (Pendente, Em andamento, Resolvida,
  Cancelada), sem janela de tempo.

**Desejáveis:**

- Nenhuma — feature deliberadamente enxuta (decisão da sessão de
  alinhamento: simplicidade em vez de paridade com apps de chat).

## 6. Fora do escopo

- Editar o texto de um comentário.
- Apagar comentário de outra pessoa (nem administrativo apaga comentário
  do morador, nem o contrário).
- Restaurar/desfazer um comentário apagado.
- Janela de tempo limitando quando apagar (ex.: só nos primeiros minutos).
- Restringir apagar por status da ocorrência.
- Notificação para o outro lado quando um comentário é apagado.
- Contador de comentários em dashboard/lista (não existe hoje no produto).
- Exclusão definitiva (hard delete) da linha no banco.

## 7. Regras de negócio

- Regra F1: Comentário nunca é editado, independente de quem seja o autor.
- Regra F2: O próprio autor do comentário — e só ele — pode apagá-lo (soft
  delete). Nem outro morador, nem o administrativo apaga comentário
  alheio.
- Regra F3: Apagar vale em qualquer status da ocorrência (Pendente, Em
  andamento, Resolvida, Cancelada) — mesma regra de quem pode comentar
  (Regra 16 do PRD do produto).
- Regra F4: Não há janela de tempo: o autor pode apagar o próprio
  comentário em qualquer momento após o envio.
- Regra F5: Apagar exige confirmação explícita do usuário antes de
  efetivar.
- Regra F6: O texto original do comentário apagado permanece armazenado;
  a interface é que deixa de exibi-lo, mostrando um aviso genérico no
  lugar.
- Regra F7: Um comentário apagado não pode ser apagado de novo, nem
  restaurado.

## 8. Fluxos principais

### Fluxo 1 — Autor apaga o próprio comentário

1. Autor (morador na própria ocorrência, ou administrativo em qualquer
   ocorrência) abre o detalhe da ocorrência e vê a lista de comentários.
2. No próprio comentário, encontra uma ação de apagar (não aparece nos
   comentários de outras pessoas).
3. Ao acionar, o sistema pede confirmação explícita.
4. Ao confirmar, o comentário é apagado (soft delete): o texto vira
   "Comentário removido" para todos que virem a ocorrência a partir
   daquele momento — inclusive quem já tinha lido o comentário antes.
5. O restante da conversa (comentários não apagados) permanece normal, na
   mesma ordem cronológica.

### Fluxo 2 — Outra pessoa vê um comentário apagado

1. Um segundo usuário (morador ou administrativo) que pode ver a
   ocorrência abre o detalhe.
2. Onde havia o comentário apagado, vê "Comentário removido", com nome do
   autor e data/hora originais, sem o texto.
3. Não tem a opção de apagar esse comentário (não é o autor).

## 9. Critérios de aceite

- O usuário consegue apagar um comentário que ele mesmo escreveu, em
  qualquer status da ocorrência.
- O sistema pede confirmação explícita antes de apagar.
- Depois de confirmado, o comentário apagado exibe "Comentário removido"
  no lugar do texto, para qualquer pessoa que veja a ocorrência.
- O sistema não deve permitir que um usuário apague comentário de outra
  pessoa, mesmo tentando diretamente (fora da UI).
- O sistema não deve oferecer edição de comentário em nenhum momento.
- O sistema não deve oferecer a opção de apagar em comentários que já
  estão apagados.
- Quando um comentário é apagado, o autor e a data/hora originais
  continuam visíveis junto do placeholder.

## 10. Stack

Reaproveita integralmente a stack já existente do projeto CondoResolve
(`docs/architecture.md`): Next.js (App Router) + TypeScript + Tailwind +
shadcn/ui, Supabase (Postgres com RLS, Auth), Server Actions e Zod para
validação. Nenhuma tecnologia nova é necessária.

## 11. Justificativa da stack

A feature é uma extensão pontual do domínio de "ocorrências" já
implementado (mesma tabela `occurrence_comments`, mesmo componente de
comentários, mesmas camadas de Server Action / RLS). Não há necessidade de
novas dependências, serviços externos ou mudanças de arquitetura.

## 12. Fases de construção

### Fase 1 — Apagar comentário próprio

Objetivo: permitir que o autor apague (soft delete) o próprio comentário,
com confirmação, e que a UI reflita isso para todos que veem a ocorrência.
Specs:

- Spec 01 — Apagar o próprio comentário (soft delete)
- Spec 02 — Exibição de comentário apagado para quem visualiza a
  ocorrência

## 13. Specs funcionais detalhadas

### Spec 01 — Apagar o próprio comentário (soft delete)

- **Fase:** Fase 1
- **Objetivo (o quê):** O autor de um comentário (morador autor da
  ocorrência, ou administrativo) apaga o próprio comentário, em qualquer
  status da ocorrência, sem janela de tempo, mediante confirmação.
- **Intenção (por quê):** Hoje o comentário é 100% imutável (Regra 16
  original) — isso não dá nenhuma saída para erro de digitação,
  arrependimento ou conteúdo indevido escrito pelo próprio usuário. Dar
  essa saída sem abrir edição preserva a maior parte da filosofia "sem
  reescrever histórico", mas resolve o caso real de quem precisa remover
  o que escreveu.
- **Contexto:** Reaproveita a tabela e a tela de comentários já existentes
  (Spec 10 do PRD do produto — `docs/prd/condominio-app.md`), o componente
  compartilhado de comentários usado no detalhe do morador e na gaveta
  administrativa, e o mesmo padrão de confirmação já usado para cancelar
  ocorrência.
- **Atores:** Morador autor da ocorrência (comentando na própria);
  funcionário administrativo (comentando em qualquer ocorrência).
- **Descrição do comportamento:** Ao lado de cada comentário próprio,
  existe uma ação de apagar, sempre visível (não depende de hover).
  Acionar essa ação abre uma confirmação explícita, descrevendo que a
  ação não pode ser desfeita. Ao confirmar, o comentário passa para o
  estado "apagado": some do texto exibido para todos que veem a
  ocorrência, virando o placeholder da Spec 02. Vale em qualquer status
  da ocorrência (Pendente, Em andamento, Resolvida, Cancelada) e não tem
  janela de tempo — o autor apaga a qualquer momento depois do envio. Não
  existe ação de editar comentário. Comentário de outra pessoa não tem a
  ação de apagar disponível para quem não é o autor, e uma tentativa de
  apagar por fora da UI (chamando a ação diretamente) é recusada caso o
  usuário não seja o autor daquele comentário específico. Um comentário
  já apagado não pode ser apagado novamente nem restaurado.
- **Entradas e saídas:**
  - Entrada: identificador do comentário; ocorrência à qual pertence;
    usuário logado (autor).
  - Saída: comentário marcado como apagado (persistido); ou recusa, se o
    usuário não for o autor ou o comentário já estiver apagado.
- **Dados/entidades envolvidos (conceitual):** Comentário (já existente):
  texto, autor, data/hora, ocorrência ligada, e agora também se está
  apagado e quando foi apagado. O texto original permanece guardado mesmo
  depois de apagado — apagar é sobre visibilidade, não sobre destruir o
  dado.
- **Estados e transições:** Comentário: não existia → enviado → (opcional,
  só pelo próprio autor, em qualquer momento) apagado. "Apagado" é estado
  final: não volta a "enviado", e o texto nunca é alterado em nenhum dos
  estados.
- **Regras de negócio:** Regras F1 a F7 (seção 7 deste PRD); Regra 8 do
  PRD do produto (quem pode ver/comentar a ocorrência).
- **Validações:** Usuário autenticado; usuário é o autor do comentário que
  está tentando apagar; comentário pertence à ocorrência informada;
  comentário ainda não está apagado.
- **Fluxo do usuário (passo a passo):**
  1. Autor abre o detalhe de uma ocorrência que pode ver e onde já
     comentou.
  2. Encontra a ação de apagar no próprio comentário.
  3. Aciona a ação e confirma explicitamente.
  4. O comentário passa a exibir o placeholder de removido (Spec 02) para
     ele e para qualquer outra pessoa que veja a ocorrência.
- **Casos de borda e erros:**
  - Usuário tenta apagar comentário de outra pessoa (inclusive
    contornando a UI): recusado, nada é alterado.
  - Usuário tenta apagar um comentário que ele mesmo já apagou antes:
    recusado (já está apagado).
  - Falha ao salvar (erro de rede/banco): mensagem de erro; o comentário
    continua visível normalmente, como se nada tivesse acontecido.
  - Ocorrência em qualquer status (inclusive Resolvida/Cancelada): apagar
    funciona igual.
- **Impacto no existente:** Comentários (Spec 10 do PRD do produto) deixam
  de ser 100% imutáveis — passam a poder ser apagados (nunca editados)
  pelo próprio autor. Não afeta o status da ocorrência nem nenhuma outra
  regra de negócio existente.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um comentário que o usuário logado escreveu, quando ele aciona
    apagar e confirma, então o comentário passa a "apagado" e some da
    exibição normal para todos.
  - Dado um comentário de outra pessoa, quando o usuário logado tenta
    apagá-lo (mesmo contornando a UI), então a ação é recusada e o
    comentário permanece intacto.
  - Dado um comentário já apagado, quando alguém tenta apagá-lo de novo,
    então a ação é recusada.
  - Dado uma ocorrência Resolvida ou Cancelada, quando o autor de um
    comentário nela aciona apagar, então funciona normalmente.
- **Definição de pronto:** O autor apaga qualquer comentário próprio, em
  qualquer status, com confirmação; ninguém apaga comentário de outra
  pessoa; comentário apagado nunca reaparece com o texto original.
- **Dependências:** Spec 10 do PRD do produto (`docs/prd/condominio-app.md`)
  — comentário precisa existir. Nenhuma dependência dentro deste PRD.
- **Fora do escopo desta spec:** Exibição do placeholder para quem lê
  (Spec 02). Edição de comentário. Notificação. Restaurar comentário.

### Spec 02 — Exibição de comentário apagado para quem visualiza a ocorrência

- **Fase:** Fase 1
- **Objetivo (o quê):** Quem visualiza uma ocorrência (autor da
  ocorrência, outro comentarista, administrativo) vê, no lugar de um
  comentário apagado, um aviso genérico no lugar do texto, sem perder o
  contexto de quem e quando.
- **Intenção (por quê):** Sem isso, apagar (Spec 01) teria efeito só para
  o autor ou quebraria a leitura cronológica da conversa para quem já
  tinha lido antes. O aviso mantém o fio da conversa legível mesmo com
  uma remoção no meio.
- **Contexto:** Mesma tela/componente de comentários usada na Spec 10 do
  PRD do produto (detalhe do morador e gaveta administrativa).
- **Atores:** Qualquer pessoa com permissão de ver a ocorrência (autor da
  ocorrência, outro comentarista, administrativo).
- **Descrição do comportamento:** Na lista de comentários, em ordem
  cronológica normal, um comentário apagado aparece como qualquer outro
  item da lista (mesmo autor, mesma data/hora), mas o corpo do texto é
  substituído por um aviso genérico do tipo "Comentário removido" — sem
  revelar o conteúdo original nem dizer o motivo. A ação de apagar não
  aparece mais para esse comentário (já está apagado). Para quem não é o
  autor, a ação de apagar nunca aparece, mesmo antes de o comentário ser
  apagado.
- **Entradas e saídas:**
  - Entrada: lista de comentários da ocorrência, incluindo os já
    apagados.
  - Saída: lista renderizada onde comentários apagados mostram o aviso no
    lugar do texto; comentários ativos mostram o texto normalmente.
- **Dados/entidades envolvidos (conceitual):** Comentário: autor,
  data/hora, texto (ocultado se apagado), indicação de "apagado" ou não.
- **Estados e transições:** Não se aplica além do já descrito na Spec 01
  (o estado "apagado" do comentário é o que decide o que a tela mostra).
- **Regras de negócio:** Regra F6 e F7 (seção 7).
- **Validações:** Não se aplica (é leitura; a permissão de ver a
  ocorrência já é resolvida por regra existente — Regra 8 do PRD do
  produto).
- **Fluxo do usuário (passo a passo):**
  1. Usuário com permissão abre o detalhe de uma ocorrência que tem ao
     menos um comentário apagado.
  2. Na lista de comentários, no lugar daquele item, vê o autor, a
     data/hora e o aviso "Comentário removido".
  3. Continua lendo os demais comentários normalmente, na mesma ordem
     cronológica.
- **Casos de borda e erros:**
  - Todos os comentários de uma ocorrência estão apagados: a lista mostra
    todos como removidos, na ordem, em vez do estado vazio "ainda não há
    comentários".
  - Um novo comentário é enviado depois de outro ser apagado: a ordem
    cronológica não muda; o apagado continua no lugar dele.
- **Impacto no existente:** Muda a forma como a lista de comentários
  (Spec 10 do PRD do produto) renderiza um item que esteja apagado; não
  muda como comentários ativos são exibidos.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um comentário apagado, quando qualquer pessoa com permissão vê a
    ocorrência, então vê autor e data/hora originais, mas não o texto.
  - Dado um comentário apagado, quando a pessoa que o apagou olha
    novamente, então não há mais a ação de apagar nesse item.
  - Dado uma ocorrência onde todos os comentários foram apagados, quando
    alguém abre o detalhe, então vê todos como removidos, não o estado de
    lista vazia.
- **Definição de pronto:** Qualquer pessoa com permissão de ver a
  ocorrência vê o aviso no lugar de um comentário apagado, mantendo
  autor/data e a ordem cronológica da conversa.
- **Dependências:** Spec 01 — só existe algo para exibir como "apagado"
  depois que a Spec 01 permite apagar.
- **Fora do escopo desta spec:** A ação de apagar em si (Spec 01).
  Qualquer notificação sobre a remoção.

## 14. Ordem recomendada de implementação

1. Spec 01 — Apagar o próprio comentário (soft delete)
2. Spec 02 — Exibição de comentário apagado para quem visualiza a
   ocorrência

Seguir essa ordem evita implementar a exibição (Spec 02) antes de existir
a ação que produz o estado "apagado" (Spec 01). Na prática as duas specs
já foram entregues juntas nesta sessão (código, migration, RLS e UI), mas
a Spec 01 é a que define a regra de negócio da qual a Spec 02 depende.
