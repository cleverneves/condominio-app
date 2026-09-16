# PRD — Gestão de ocorrências do condomínio

> Tipo: PRD inicial · Data: 2026-09-15
> **Status:** Implementada
>
> <!-- Valores possíveis: "Aguardando implementação" | "Implementada". Atualize para "Implementada" quando todas as specs estiverem concluídas. -->

## 1. Visão geral

Sistema web para **um único condomínio** registrar, acompanhar e atender ocorrências (vazamento, barulho, obra, etc.).

Hoje isso cai no WhatsApp, telefone ou recado na portaria e some. O sistema dá um lugar único: o morador abre o chamado, acompanha o status e conversa por comentários; o funcionário administrativo vê tudo, filtra, muda o status e responde.

Há três perfis de acesso: **funcionário administrativo**, **morador proprietário** e **morador inquilino**. Proprietário e inquilino fazem as **mesmas ações**; o tipo só identifica quem abriu. Todo mundo entra com e-mail e senha e vai direto para a área do seu perfil.

A interface é obrigatória: seguir **`docs/DESIGN.md`** (sistema visual CondoResolve) e o layout de painel descrito na seção 10. Não inventar outra paleta, tipografia, sidebar ou linguagem de cards. O mockup de dashboard serve de referência de **composição**; elementos do mockup que não estão neste PRD continuam fora do escopo (ver seção 6 e 10).

### Decisões confirmadas vs premissas

**Confirmado com o solicitante:** um condomínio; mesmo poder para proprietário e inquilino; status Pendente / Em andamento / Resolvida / Cancelada; morador vê e responde comentários; senha temporária definida pelo administrativo (sem e-mail do sistema); morador vê só as ocorrências dele; edita e cancela só as dele e só se Pendente; categorias e locais fixos; dashboard com filtro por bloco, categoria e status; senha inicial pode ser mantida; um administrativo já existe na implantação; não há cadastro de outros funcionários; imagens JPEG/PNG até 5 MB, no máximo 3; administrativo edita morador, redefine senha e desativa; resolvida/cancelada não reabrem; comentários em qualquer status; stack Next.js + TypeScript + Tailwind + Shadcn UI + Supabase; UI e layout segundo `docs/DESIGN.md`.

**Premissas desta versão** (não foram perguntadas ponto a ponto; seguem das decisões acima e do bom senso operacional — se alguma estiver errada, ajustar antes de implementar):

- O usuário pode **sair** (encerrar a sessão) de qualquer área logada.
- E-mail é **único** no condomínio (não cadastrar duas contas com o mesmo e-mail).
- Pode haver **mais de um morador no mesmo bloco/apartamento** (ex.: proprietário e inquilino).
- Imagens na ocorrência são **opcionais**.
- O dashboard mostra **totais por status** além da lista e dos filtros (sem totais, o “dashboard” vira só uma lista).
- Desativar morador inclui **reativar**.
- “Esqueci a senha” **não envia e-mail**; o login orienta a procurar a administração, que redefine a senha.
- Comentários **não são editados nem apagados** depois de enviados.
- Cancelar pede **confirmação**.
- Filtro por bloco usa o **bloco cadastrado no morador autor**, não o campo “local” da ocorrência.
- Editar ocorrência pendente permite alterar os **mesmos campos da abertura** (título, detalhes, categoria, local e imagens).

## 2. Problema que resolve

Ocorrências do condomínio são avisadas por WhatsApp, telefone ou recado na portaria. O pedido se perde, o morador não sabe se alguém viu, e a administração não tem um histórico único do que está pendente, em andamento ou resolvido.

## 3. Público-alvo

- **Funcionário administrativo** do condomínio (um perfil operacional; nesta versão não há vários funcionários cadastrados pelo sistema).
- **Morador proprietário** da unidade.
- **Morador inquilino** da unidade.

Não é um produto para administradoras com vários condomínios, nem para o público em geral.

## 4. Objetivo do recorte atual

Entregar o ciclo completo de uma ocorrência em **um condomínio**: o administrativo cadastra o morador e entrega a senha por fora; o morador entra, abre chamado (com fotos se quiser), acompanha, comenta, e — se ainda estiver pendente — edita ou cancela; o administrativo vê todas, filtra, comenta e avança o status até resolver ou cancelar.

## 5. Funcionalidades

**Essenciais:**

- Entrar com e-mail e senha e ir para a área do perfil (administrativo ou morador).
- Sair da conta.
- Impedir que morador use a área administrativa e que quem não está logado use as áreas internas.
- Administrativo: cadastrar morador (tipo, bloco, apartamento, nome completo, e-mail, telefone e senha temporária).
- Administrativo: listar moradores; editar dados; redefinir senha; desativar e reativar acesso.
- Morador: área com as opções dele (abrir ocorrência e acompanhar as suas).
- Morador: abrir ocorrência (título, detalhes, categoria, local, até 3 imagens).
- Morador: ver só as ocorrências que ele abriu, com o status.
- Morador: ver o detalhe (dados, imagens, status).
- Morador: editar ou cancelar a ocorrência **somente enquanto Pendente**.
- Administrativo: dashboard com totais por status, lista de **todas** as ocorrências e filtros por bloco, categoria e status.
- Administrativo: ver detalhe de qualquer ocorrência (incluindo quem abriu) e mudar o status nas transições permitidas.
- Morador e administrativo: comentar na ocorrência em qualquer status (o morador só nas dele).

**Desejáveis:**

- Não há desejáveis neste recorte. O que não está em essenciais está fora do escopo.

## 6. Fora do escopo

- App mobile nativo.
- Vários condomínios no mesmo sistema.
- Morador se cadastrar sozinho ou cadastrar outro morador.
- Cadastro de outros funcionários administrativos.
- Envio de e-mail, WhatsApp ou qualquer notificação automática.
- Recuperação de senha por e-mail.
- Troca obrigatória da senha no primeiro acesso.
- Administrativo abrir ocorrência no lugar do morador.
- Categorias e locais cadastráveis (listas fixas).
- Reabrir ocorrência resolvida ou cancelada.
- Morador ver ocorrências de outros.
- Relatórios, PDF, gráficos avançados.
- Boletos, reservas, visitantes, encomendas, assembleia ou outros módulos de condomínio.
- Atribuir ocorrência a um técnico, prioridade “urgente” como status extra, ou chat em tempo real.
- Itens que aparecem no mockup / `docs/DESIGN.md` mas **não** entram nesta versão: busca global (ocorrência, morador, unidade, técnico), ícones de mensagem e notificação no topo, botão administrativo “Nova ocorrência”, exportar relatório, menu Relatórios / Configurações / Suporte e emergência, banner “Baixar app morador”, protocolo tipo `#CR-2024-…`, tendência percentual nos cards, “equipes ativas”, urgência, avatar de técnico, troca de conta/condomínio, timeline com etapas Aberto → Notificado → Em vistoria (usar só os quatro status deste PRD).

## 7. Regras de negócio

- Regra 1: O acesso é só com e-mail e senha. Sem sessão válida, não há área interna.
- Regra 2: Após o login, **funcionário administrativo** vai para o dashboard administrativo; **morador** (proprietário ou inquilino) vai para a área do morador. Os dois tipos de morador têm as mesmas permissões.
- Regra 3: Morador não acessa funções administrativas (dashboard geral, cadastro de moradores, mudar status de ocorrência alheia). Administrativo não abre ocorrência nesta versão.
- Regra 4: O sistema já possui **um** funcionário administrativo na implantação. Não existe tela para cadastrar outro funcionário.
- Regra 5: Só o administrativo cadastra morador. A senha inicial é definida por ele e informada ao morador **fora** do sistema. O morador **não** é obrigado a trocar essa senha.
- Regra 6: E-mail não pode se repetir. Telefone, nome completo, tipo (proprietário ou inquilino), bloco e apartamento são obrigatórios no cadastro do morador.
- Regra 7: Morador desativado não entra. O histórico de ocorrências dele permanece visível para o administrativo. Morador desativado pode ser reativado.
- Regra 8: O morador vê, edita, cancela e comenta **somente** ocorrências que ele mesmo abriu.
- Regra 9: Status possíveis: **Pendente**, **Em andamento**, **Resolvida**, **Cancelada**. Toda ocorrência nasce **Pendente**.
- Regra 10: Morador só cancela se o status for **Pendente**. Cancelar muda o status para **Cancelada**.
- Regra 11: Morador só edita se o status for **Pendente**.
- Regra 12: Administrativo pode: Pendente → Em andamento, Resolvida ou Cancelada; Em andamento → Resolvida ou Cancelada. **Resolvida e Cancelada não mudam mais.**
- Regra 13: Categorias fixas: Reclamação, Obra, Importunação, Hidráulica, Elétrica.
- Regra 14: Locais fixos: Apartamento, Área comum, Praça, Garagem, Portaria.
- Regra 15: No máximo 3 imagens por ocorrência; cada uma JPEG ou PNG, até 5 MB. Quem pode ver a ocorrência pode ver as imagens.
- Regra 16: Comentários são permitidos em **qualquer** status, inclusive resolvida e cancelada. Depois de enviado, o comentário não se edita nem se apaga.
- Regra 17: O filtro por bloco no dashboard usa o bloco do **morador que abriu** a ocorrência.
- Regra 18: Quem esqueceu a senha procura a administração; o administrativo redefine. O sistema não envia e-mail.

## 8. Fluxos principais

### Fluxo 1 — Administrativo cadastra o morador e ele entra

1. O funcionário administrativo já existe e entra com e-mail e senha.
2. Vai para o dashboard administrativo.
3. Cadastra o morador (tipo, bloco, apartamento, nome, e-mail, telefone, senha temporária).
4. Informa e-mail e senha ao morador por fora (conversa, papel, etc.).
5. O morador entra no sistema com esse e-mail e senha.
6. É levado à área do morador.

### Fluxo 2 — Morador abre e acompanha uma ocorrência

1. Na área do morador, escolhe abrir ocorrência.
2. Informa título, detalhes, categoria e local; opcionalmente envia até 3 imagens.
3. O sistema grava a ocorrência como Pendente, ligada a ele (e ao bloco/apartamento do cadastro).
4. Ele vê a ocorrência na lista das dele, com o status.
5. Abre o detalhe, vê os dados, as imagens e o status.
6. Enquanto estiver Pendente, pode editar os dados/imagens ou cancelar (com confirmação).
7. Em qualquer status, pode escrever comentários e ler os do administrativo.

### Fluxo 3 — Administrativo atende a ocorrência

1. No dashboard, vê totais por status e a lista de todas as ocorrências.
2. Filtra por bloco, categoria e/ou status, se quiser.
3. Abre uma ocorrência, vê quem abriu (nome, tipo, bloco, apto, contato), o conteúdo e as imagens.
4. Comenta e/ou muda o status nas transições permitidas.
5. O morador, ao abrir a mesma ocorrência, vê o novo status e os comentários.

### Fluxo 4 — Administrativo corrige cadastro ou acesso do morador

1. Na lista de moradores, escolhe um cadastro.
2. Edita dados, redefine a senha (e informa por fora) ou desativa o acesso.
3. Se desativado, esse morador deixa de entrar; as ocorrências dele continuam no histórico.
4. Se precisar, o administrativo reativa o acesso.

## 9. Critérios de aceite

- O usuário consegue entrar com e-mail e senha e cai na área do perfil dele.
- O usuário consegue sair da conta e deixa de ver as áreas internas.
- O morador consegue abrir ocorrência com os campos obrigatórios e até 3 imagens válidas.
- O morador consegue ver todas as ocorrências **feitas por ele**, com o status, e não vê as de outros.
- O morador consegue ver o detalhe, as imagens e os comentários das ocorrências dele.
- O morador consegue editar e cancelar só quando o status é Pendente.
- O administrativo consegue ver todas as ocorrências, com totais e filtros por bloco, categoria e status.
- O administrativo consegue comentar e mudar o status só nas transições permitidas.
- O administrativo consegue cadastrar, editar, redefinir senha, desativar e reativar morador.
- O sistema deve recusar login de morador desativado e de e-mail/senha inválidos.
- O sistema deve recusar mais de 3 imagens, arquivo que não seja JPEG/PNG ou maior que 5 MB.
- O sistema não deve permitir reabrir resolvida/cancelada, nem o morador acessar o dashboard administrativo.
- Quando o morador cancela uma pendente, o sistema deve marcar a ocorrência como Cancelada.
- Quando o administrativo cadastra um morador com e-mail já usado, o sistema deve recusar e explicar.

## 10. Referência de UI, layout e design

Fonte da verdade visual: **`docs/DESIGN.md`**. Tokens (cor, tipo, raio, espaçamento, elevação) e componentes descritos lá prevalecem sobre paleta “padrão Shadcn”. Shadcn é o kit de peças; o visual CondoResolve é o destino.

### 10.1 Intenção da interface

Painel operacional calmo e autoritário para a administração (densidade, velocidade, clareza de status) e experiência simples para o morador (abrir chamado e ver andamento sem burocracia). Verde floresta como marca, superfícies cinza-quente, cards brancos, badges em pílula. Não usar visual genérico de dashboard azul/cinza.

### 10.2 Marca, cor e tipo (resumo; detalhe no DESIGN.md)

- Marca de produto no shell: **CondoResolve**, com o nome do condomínio como subtítulo (um único condomínio; sem seletor de contas).
- Primário / ação / item de menu selecionado: verde floresta (`#1A5C38`); hover `#2E7D52`; mint `#E8F5EE` em navegação ativa e foco.
- Canvas `#F4F5F7`; cards e áreas de trabalho `#FFFFFF`; texto `#191c1d`.
- Tipografia **Plus Jakarta Sans** nos papéis do DESIGN.md (títulos, corpo, `stat-metric` nos totais, `label-sm` em cabeçalhos de lista).
- Botão primário: pílula, fundo `#1A5C38`, texto branco. Secundário: pílula outline. Status: pílula compacta.

### 10.3 Status visuais (mapear só os quatro deste PRD)

| Status do produto | Papel no DESIGN.md    | Aparência                                                 |
| ----------------- | --------------------- | --------------------------------------------------------- |
| Pendente          | Pendente              | âmbar — texto `#92400E`, fundo `#FEF3C7`, borda `#FDE68A` |
| Em andamento      | Em andamento          | azul — texto `#1E40AF`, fundo `#EFF6FF`, borda `#BFDBFE`  |
| Resolvida         | Concluído / Resolvido | verde — texto `#166534`, fundo `#DCFCE7`, borda `#BBF7D0` |
| Cancelada         | Cancelado             | cinza — texto `#4B5563`, fundo `#F3F4F6`, borda `#E5E7EB` |

Não usar o papel **Urgente / Crítico** do DESIGN.md: não existe esse status no produto.

### 10.4 Arquitetura de layout

**Área administrativa (desktop ≥ 1280px):** grade fluida de 12 colunas; **sidebar fixa 260px** à esquerda; conteúdo com margens ~24px e gutters de card ~20px.

- **Sidebar:** fundo claro; logo CondoResolve + nome do condomínio no topo; grupo MENU; item ativo em container verde escuro com texto claro; **Dashboard** e **Moradores** nesta versão. Rodapé: ação **Sair** (equivalente a “Sair do painel”). Sem Relatórios, Configurações, Suporte, banner de app.
- **Topo do conteúdo:** busca global do mockup **não entra**. À direita: identificação de quem está logado (nome + perfil “Funcionário administrativo”). Sem sino de notificação nem ícone de mensagem.
- **Dashboard (Spec 08):** título “Dashboard” + texto de apoio curto; **não** há “Nova ocorrência” nem “Exportar relatório” para o administrativo. Fileira de **cards de métrica**: um card herói verde escuro (`#1A5C38`, números claros, papel `stat-metric`) com o total do conjunto exibido; demais cards brancos (nível 1) com Pendente, Em andamento, Resolvida e, se couber na fileira, Cancelada — **sem** percentual vs. mês anterior, sem “equipes ativas”, sem “urgência”. Abaixo, módulo “Fila operacional de ocorrências”: chips-pílula de filtro com **contagem** (Todas + cada status; categoria e bloco no mesmo espírito de chip/filtro). Lista em **cards horizontais** (não tabela densa): avatar ou iniciais, nome do autor, bloco + apto, tipo (proprietário/inquilino) em pílula discreta, título da ocorrência, categoria, data, badge de status alinhado à direita, controle para abrir o detalhe. Se a lista for longa, paginação discreta no rodapé do módulo (padrão do mockup), sem virar relatório.
- **Moradores:** mesmo shell; lista em cards/linhas de alta densidade (nome, unidade, tipo, contato, ativo/inativo), formulário em modal ou painel elevado (nível 2/3).
- **Detalhe da ocorrência (admin):** gaveta ou modal de **nível 3** (overlay escuro suave), não uma página sem relação com o dashboard — alinhado a “Incident Detail Drawers & Modals” do DESIGN.md.

**Tablet (768–1279px):** sidebar vira trilho de ícones (~72px); conteúdo em 8 colunas.

**Mobile (<768px) — sobretudo a área do morador:** uma coluna; **barra inferior persistente** com atalho para abrir ocorrência e para a lista das dele; cards full-bleed. Área administrativa no mobile empilha métricas e lista; menu vira navegação compacta, não some o conteúdo.

**Área do morador:** mesmo sistema visual, tom mais direto. Navegação: abrir ocorrência e minhas ocorrências (+ sair). Lista das ocorrências do morador usa o mesmo padrão de **item de ocorrência** (título, categoria, data, badge de status), sem dados de outros moradores. Não usar o banner “emergência / baixar app” do DESIGN.md. Botão de abrir ocorrência é CTA primário em pílula.

**Login (sem sessão):** canvas claro, card branco de nível 1, marca CondoResolve, campos no estilo de input do DESIGN.md (borda `#E5E7EB`, foco verde com aura mint). Sem chrome de sidebar.

### 10.5 O que copiar do mockup vs. o que ignorar

**Copiar (composição):** sidebar + marca; item de menu ativo verde; fileira de KPIs (herói verde + cards brancos); fila em cards com identidade da unidade e badge de status; chips de filtro com número; paginação da lista; chip de perfil no topo.

**Ignorar (escopo):** tudo listado na seção 6 sobre o mockup. Não implementar técnico, relatórios, app, notificações, protocolos nem status “Em análise / Em manutenção / Triagem” — os únicos status na UI são os quatro da Regra 9.

### 10.6 Premissa de UI (layout, não feature nova)

- Lista longa de ocorrências ou moradores pode paginar; não é módulo de relatório.
- Timeline visual, se usada no detalhe, mostra só Pendente → Em andamento → Resolvida (e Cancelada como encerramento), nunca as etapas “Notificado / Em vistoria” do DESIGN.md.

## 11. Stack

- **Next.js** com **TypeScript** (já é a base do projeto).
- **Tailwind CSS** + **Shadcn UI** para montar as peças, **obrigatoriamente** estilizadas segundo `docs/DESIGN.md` (não deixar o tema default do Shadcn no lugar do CondoResolve).
- **Supabase** para autenticação (e-mail e senha), dados persistidos e armazenamento das imagens.

## 12. Justificativa da stack

O repositório já nasceu em Next.js + TypeScript + Tailwind. O recorte precisa de login, cadastros, listagens e upload de foto — sem app mobile e sem vários condomínios. Supabase cobre auth, banco e arquivos sem montar um backend separado. Shadcn UI acelera formulários e overlays acessíveis; o DESIGN.md define a cara do produto (verde floresta, pílulas de status, sidebar, cards de ocorrência) para o painel não nascer genérico.

## 13. Fases de construção

### Fase 1 — Acesso

Objetivo: só entra quem tem conta; cada perfil cai na área certa e não vê a do outro.

Specs:

- Spec 01 — Login, sessão e direcionamento por perfil

### Fase 2 — Moradores

Objetivo: o administrativo consegue colocar o morador no sistema e corrigir acesso depois.

Specs:

- Spec 02 — Cadastrar e listar moradores
- Spec 03 — Editar, redefinir senha, desativar e reativar morador

### Fase 3 — Ocorrências do morador

Objetivo: o morador registra o problema, vê o que abriu e corrige enquanto ainda está pendente.

Specs:

- Spec 04 — Abrir ocorrência
- Spec 05 — Listar minhas ocorrências
- Spec 06 — Ver detalhe da ocorrência (morador)
- Spec 07 — Editar e cancelar ocorrência pendente

### Fase 4 — Atendimento administrativo

Objetivo: a administração enxerga o volume, encontra o chamado e avança o status.

Specs:

- Spec 08 — Dashboard administrativo de ocorrências
- Spec 09 — Atender ocorrência (detalhe e mudança de status)

### Fase 5 — Comunicação

Objetivo: morador e administração conversam no chamado, inclusive depois de resolvido ou cancelado.

Specs:

- Spec 10 — Comentários na ocorrência

## 14. Specs funcionais detalhadas

> Cada spec deve ser autossuficiente: um agente de codificação vai ler SÓ esta spec (mais as dependências) para montar o plano técnico e implementar. Preencha todos os campos; se um não se aplica, escreva "Não se aplica" e o porquê.

### Spec 01 — Login, sessão e direcionamento por perfil

- **Fase:** Fase 1 — Acesso
- **Objetivo (o quê):** Permitir entrada com e-mail e senha, manter a sessão enquanto o usuário estiver autenticado, encerrar a sessão ao sair, e levar cada perfil à sua área — recusando quem não pode entrar.
- **Intenção (por quê):** Sem um portão único e um destino certo, o restante do produto não existe: o morador não pode abrir chamado e o administrativo não pode atender. Separar as áreas evita que o morador mexa no que é da administração.
- **Contexto:** Produto novo. Na implantação já existe **um** funcionário administrativo com e-mail e senha válidos. Moradores ainda não existem até a Spec 02. Layout e visual: seção 10 e `docs/DESIGN.md` (login em card; depois do login, **dois shells distintos** — administrativo com sidebar; morador mais direto, com barra inferior no mobile). Não há recuperação de senha por e-mail.
- **Atores:** Funcionário administrativo; morador proprietário; morador inquilino; visitante sem conta.
- **Descrição do comportamento:** A tela inicial de acesso pede e-mail e senha, no card de login da seção 10 (marca CondoResolve, sem sidebar). Com credenciais corretas de uma conta **ativa**, o sistema abre a sessão e redireciona: administrativo → dashboard administrativo no **shell com sidebar** (menu: Dashboard ativo; Moradores visível; Sair no rodapé; chip de nome + “Funcionário administrativo” no topo); morador (qualquer tipo) → área do morador no shell próprio (CTA de ocorrência e lista; no mobile, barra inferior). As duas áreas são distintas e, nesta spec, já existem como destino (mesmo que as funções internas ainda sejam preenchidas pelas specs seguintes). Em qualquer tela logada há como **sair** (no admin, o item de rodapé da sidebar); ao sair, a sessão acaba e o próximo acesso às áreas internas volta para o login. Se o usuário já autenticado tentar ir à tela de login, segue para a área do perfil dele. Há uma orientação visível para quem esqueceu a senha: procurar a administração (o sistema não envia e-mail). Tentativa com senha errada, e-mail inexistente, conta desativada ou campos vazios não entra e mostra mensagem clara, **sem** dizer se o e-mail existe (para não vazar cadastro), exceto no caso de desativado: aí pode informar que o acesso está desativado. Acesso direto a área interna sem sessão leva ao login. Morador autenticado que tentar a área administrativa é recusado e permanece/volta à área do morador. Administrativo que tentar a área do morador é recusado e permanece/volta ao dashboard (nesta versão o administrativo não usa a área do morador).
- **Entradas e saídas:**
  - Entrada: e-mail e senha digitados na tela de login; ação de sair; tentativa de abrir URL/área interna.
  - Saída: sessão válida + destino da área; ou recusa com mensagem; ou retorno ao login após sair.
- **Dados/entidades envolvidos (conceitual):** Conta de acesso: e-mail, senha, perfil (funcionário administrativo | morador proprietário | morador inquilino), indicador de ativo/inativo. A sessão representa “quem está autenticado agora”.
- **Estados e transições:** Sem sessão → (login válido e conta ativa) → Com sessão na área do perfil. Com sessão → (sair ou sessão inválida) → Sem sessão. Conta inativa nunca gera sessão.
- **Regras de negócio:** Regras 1, 2, 3, 4, 7 (parte do login), 18.
- **Validações:** E-mail e senha obrigatórios. Credenciais devem corresponder a uma conta ativa. Perfil determina o destino. Sem sessão não há área interna.
- **Fluxo do usuário (passo a passo):**
  1. Abre o sistema deslogado e vê a entrada (e-mail e senha).
  2. Informa as credenciais e confirma.
  3. Se ok, cai na área do perfil; se não, vê o erro e permanece no login.
  4. Usa a área (funções das specs seguintes).
  5. Escolhe sair; volta a precisar do login para qualquer área interna.
- **Casos de borda e erros:**
  - Campos vazios: não envia; pede o preenchimento.
  - E-mail/senha inválidos: não entra; mensagem genérica de credenciais incorretas.
  - Conta desativada: não entra; informa que o acesso está desativado e para falar com a administração.
  - Sem sessão em área interna: vai ao login.
  - Morador na área administrativa: recusa e devolve à área do morador.
  - Administrativo na área do morador: recusa e devolve ao dashboard administrativo.
  - Já logado no login: redireciona à área do perfil.
  - Senha temporária nunca trocada: **entra normalmente** (troca obrigatória está fora do escopo).
- **Impacto no existente:** Substitui a página inicial genérica do projeto pelo fluxo de acesso do produto. Ainda não cria ocorrências nem cadastro de morador.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um administrativo ativo com e-mail e senha corretos, quando ele confirma o login, então entra no dashboard administrativo e não na área do morador.
  - Dado um morador ativo (proprietário ou inquilino) com credenciais corretas, quando ele confirma o login, então entra na área do morador e não no dashboard administrativo.
  - Dado e-mail ou senha incorretos, quando tenta entrar, então não há sessão e a mensagem não revela se o e-mail existe.
  - Dado um morador desativado, quando tenta entrar com a senha certa, então não entra e é informado de que o acesso está desativado.
  - Dado um usuário autenticado, quando escolhe sair, então a sessão acaba e uma nova tentativa de área interna exige login.
  - Dado um visitante sem sessão, quando tenta abrir área interna, então é levado ao login.
  - Dado um morador autenticado, quando tenta abrir o dashboard administrativo, então é recusado e permanece na área do morador.
  - Dado a tela de login, quando o usuário lê a orientação de senha esquecida, então ela instrui a procurar a administração e não promete e-mail automático.
  - Dado um administrativo autenticado, quando a área carrega, então há sidebar com marca, item Dashboard, item Moradores e Sair — sem Relatórios, Configurações, notificações ou banner de app.
  - Dado um morador autenticado no mobile, quando a área carrega, então há barra inferior com caminho para abrir ocorrência e para as ocorrências dele.
- **Definição de pronto:** Login, logout, bloqueio sem sessão, redirecionamento por perfil e recusa cruzada de áreas podem ser conferidos manualmente com a conta administrativa da implantação e, depois da Spec 02, com um morador ativo e um desativado.
- **Dependências:** Nenhuma.
- **Fora do escopo desta spec:** Cadastro de morador, ocorrências, comentários, troca de senha pelo próprio usuário, recuperação por e-mail, cadastro de funcionários, conteúdo completo do dashboard e da área do morador (só o destino, o shell e a separação das áreas). Busca global, notificações e demais itens da seção 10.5.

### Spec 02 — Cadastrar e listar moradores

- **Fase:** Fase 2 — Moradores
- **Objetivo (o quê):** O administrativo cadastra moradores com tipo, unidade, dados de contato e senha temporária, e vê a lista dos já cadastrados.
- **Intenção (por quê):** O morador não se cadastra sozinho. Sem este cadastro ele não entra no sistema. A lista é o ponto de partida para achar quem já está no condomínio (a Spec 03 usa essa lista para corrigir dados e acesso).
- **Contexto:** Depende da Spec 01 (só o administrativo autenticado). A senha é informada ao morador **fora** do sistema. Não existe cadastro de outros funcionários. Proprietário e inquilino podem coexistir no mesmo bloco/apartamento. UI: item **Moradores** na sidebar (seção 10); lista em cards/linhas de densidade operacional; cadastro em modal ou painel elevado; tipo do morador em pílula.
- **Atores:** Funcionário administrativo (executa). Morador ainda não usa esta tela.
- **Descrição do comportamento:** Na área administrativa há a gestão de moradores. O administrativo vê a lista (nome, tipo, bloco, apartamento, e-mail, telefone, se está ativo). Pode cadastrar um novo: tipo (proprietário ou inquilino), bloco, apartamento, nome completo, e-mail, telefone e senha temporária. Ao gravar com sucesso, o morador passa a poder entrar (Spec 01) e a lista se atualiza. Se o e-mail já existir, o cadastro é recusado. Campos obrigatórios vazios são recusados. Bloco e apartamento são textos informados pelo administrativo (não há cadastro separado de unidades); o valor de **bloco** será o mesmo usado depois no filtro do dashboard, então vale a pena exibir o que foi gravado de forma explícita na lista. Lista vazia mostra estado vazio com convite para o primeiro cadastro. Morador autenticado não acessa esta função.
- **Entradas e saídas:**
  - Entrada: dados do formulário de cadastro; abertura da lista.
  - Saída: novo morador ativo capaz de autenticar; lista atualizada; ou erros de validação/duplicidade.
- **Dados/entidades envolvidos (conceitual):** Morador: tipo (proprietário | inquilino), bloco, apartamento, nome completo, e-mail, telefone, senha, ativo (inicia ativo). A conta de acesso do morador usa esse e-mail, senha e perfil conforme o tipo.
- **Estados e transições:** Novo cadastro → morador **ativo**. (Desativar/reativar é Spec 03.)
- **Regras de negócio:** Regras 3, 5, 6 e a premissa de vários moradores na mesma unidade.
- **Validações:** Todos os campos do cadastro obrigatórios. E-mail em formato válido e único em todo o sistema (inclusive o e-mail do administrativo). Senha temporária obrigatória (não vazia). Tipo deve ser um dos dois. Morador não pode executar esta ação.
- **Fluxo do usuário (passo a passo):**
  1. Administrativo autenticado abre a gestão de moradores.
  2. Vê a lista ou o estado vazio.
  3. Inicia um novo cadastro, preenche os campos (incluindo a senha temporária) e confirma.
  4. Se válido, o morador entra na lista como ativo; se inválido, vê os erros e corrige.
  5. Informa e-mail e senha ao morador por um canal externo ao sistema.
- **Casos de borda e erros:**
  - E-mail já usado: recusa e explica que o e-mail já está cadastrado.
  - E-mail igual ao do administrativo: recusa (unicidade global).
  - Campos vazios ou e-mail malformado: recusa campo a campo.
  - Dois moradores no mesmo bloco/apartamento com e-mails diferentes: permite.
  - Morador tenta acessar: recusa (Spec 01).
  - Falha ao gravar: mensagem de erro; nada pela metade como “conta sem senha”.
- **Impacto no existente:** Amplia a área administrativa criada na Spec 01 com gestão de moradores. Não altera o fluxo de ocorrências (ainda não existem).
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um administrativo autenticado e dados válidos inéditos, quando ele confirma o cadastro, então o morador aparece na lista como ativo e consegue entrar na área do morador com o e-mail e a senha informados.
  - Dado um e-mail já existente, quando tenta cadastrar de novo, então o sistema recusa e nenhum morador duplicado é criado.
  - Dado bloco A apto 12 já com um proprietário, quando cadastra um inquilino no mesmo bloco/apto com outro e-mail, então o cadastro é aceito.
  - Dado nenhum morador, quando o administrativo abre a lista, então vê um estado vazio claro.
  - Dado um morador autenticado, quando tenta a gestão de moradores, então é recusado.
- **Definição de pronto:** Dá para cadastrar um proprietário e um inquilino, vê-los na lista, recusar e-mail repetido, e o novo morador autentica na Spec 01.
- **Dependências:** Spec 01 — sessão do administrativo e recusa do morador em área administrativa.
- **Fora do escopo desta spec:** Editar, redefinir senha, desativar/reativar (Spec 03). Cadastro de funcionário. Envio de e-mail. Cadastro de blocos/unidades como entidade à parte. Ocorrências.

### Spec 03 — Editar, redefinir senha, desativar e reativar morador

- **Fase:** Fase 2 — Moradores
- **Objetivo (o quê):** O administrativo corrige dados do morador, define uma nova senha, impede o login (desativar) e devolve o acesso (reativar), sem apagar o histórico.
- **Intenção (por quê):** Não há e-mail automático. Quem digitou bloco errado, trocou de telefone ou esqueceu a senha só se resolve na administração. Desativar evita acesso de quem saiu do imóvel sem perder o que já foi registrado.
- **Contexto:** Lista e cadastro da Spec 02. Login da Spec 01 (conta inativa não entra). Ocorrências da Fase 3, quando existirem, **permanecem** após desativar. A nova senha é informada ao morador por fora.
- **Atores:** Funcionário administrativo. O morador sofre o efeito no próximo login; não executa estas ações.
- **Descrição do comportamento:** A partir da lista, o administrativo abre um morador. Pode alterar tipo, bloco, apartamento, nome completo, e-mail e telefone, com as mesmas validações de unicidade de e-mail. Pode definir uma **nova senha**; a senha anterior deixa de valer. Pode **desativar**: o morador some da capacidade de login, mas continua listado (com indicação de inativo) e as ocorrências dele seguem visíveis para o administrativo. Pode **reativar** um inativo; o login volta a funcionar com a senha que estiver válida. Nenhuma dessas ações apaga ocorrências. Alterar bloco/apartamento do cadastro vale para o perfil do morador daí em diante; ocorrências já abertas **mantêm** o bloco/apartamento que tinham no momento da abertura (para o histórico e o filtro não reescreverem o passado). Se ainda não houver ocorrências, só o cadastro muda.
- **Entradas e saídas:**
  - Entrada: dados editados; nova senha; ação desativar; ação reativar; morador alvo.
  - Saída: cadastro atualizado; senha nova válida; conta inativa ou ativa; mensagens de sucesso ou erro.
- **Dados/entidades envolvidos (conceitual):** Os mesmos do morador na Spec 02, mais o indicador ativo/inativo e a senha vigente. Ocorrência (quando existir): bloco e apartamento **do momento da abertura**, independentes de edição posterior do cadastro.
- **Estados e transições:** Ativo → (desativar) → Inativo → (reativar) → Ativo. Senha vigente → (redefinir) → nova senha vigente.
- **Regras de negócio:** Regras 5, 6, 7, 18.
- **Validações:** Mesmas do cadastro ao editar dados. Novo e-mail único (pode manter o e-mail atual). Nova senha, quando redefinida, não pode ser vazia. Só administrativo executa. Não desativar “de novo” um já inativo como se apagasse; a ação visível no inativo é reativar.
- **Fluxo do usuário (passo a passo):**
  1. Administrativo abre a lista e escolhe um morador.
  2. Altera os campos desejados e salva, **ou** informa nova senha e confirma, **ou** desativa/reativa.
  3. Vê confirmação de sucesso ou os erros.
  4. Se redefiniu senha, informa o morador por fora.
- **Casos de borda e erros:**
  - E-mail novo já usado por outra conta: recusa; dados antigos permanecem.
  - Redefinir senha: login antigo falha; o novo funciona (se a conta estiver ativa).
  - Desativado tenta login: comportamento da Spec 01.
  - Reativar: login volta com a senha vigente.
  - Editar bloco depois de ocorrências existentes: ocorrências antigas não mudam de bloco; as novas usam o bloco atual.
  - Morador não executa estas ações.
  - Não há exclusão definitiva do morador nesta spec.
- **Impacto no existente:** Completa a gestão da Spec 02. Afeta o login da Spec 01 (ativo/inativo e senha). Quando a Fase 3 existir, desativar não apaga ocorrências.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um morador ativo, quando o administrativo altera o telefone e salva, então a lista/detalhe mostra o novo telefone.
  - Dado um e-mail já de outro usuário, quando o administrativo tenta gravar esse e-mail no morador, então recusa e o e-mail antigo permanece.
  - Dado um morador que entra com a senha atual, quando o administrativo redefine a senha, então a senha antiga não entra mais e a nova entra.
  - Dado um morador ativo, quando o administrativo desativa, então esse morador deixa de autenticar e continua visível na lista como inativo.
  - Dado um morador inativo, quando o administrativo reativa, então o login volta a funcionar.
  - Dado um morador desativado com ocorrências, quando o administrativo lista ocorrências (Spec 08), então as ocorrências dele continuam existentes.
- **Definição de pronto:** Editar, recusar e-mail duplicado, trocar senha, desativar e reativar podem ser conferidos ponta a ponta com o login.
- **Dependências:** Spec 02 — precisa existir morador na lista. Spec 01 — efeito no login.
- **Fora do escopo desta spec:** Apagar morador de forma definitiva. O morador alterar o próprio cadastro. Enviar a nova senha por e-mail. Cadastrar funcionário.

### Spec 04 — Abrir ocorrência

- **Fase:** Fase 3 — Ocorrências do morador
- **Objetivo (o quê):** O morador autenticado registra uma ocorrência com título, detalhes, categoria, local e até 3 imagens, que nasce com status Pendente e fica ligada a ele.
- **Intenção (por quê):** É o coração do produto: tirar o problema do WhatsApp e transformá-lo num registro que a administração consegue atender e o morador consegue acompanhar.
- **Contexto:** Área do morador (Spec 01). Cadastro do morador traz nome, tipo, bloco e apartamento (Spec 02). Categorias e locais são listas **fixas** (Regras 13 e 14). Imagens opcionais. Administrativo não abre ocorrência. Listagem e detalhe vêm nas specs seguintes; esta spec garante a **criação**. UI: CTA primário em pílula (“Nova ocorrência” só na **área do morador**); formulário no visual de inputs do DESIGN.md; no mobile, atalho na barra inferior.
- **Atores:** Morador proprietário ou inquilino autenticado e ativo.
- **Descrição do comportamento:** Na área do morador há a ação de abrir ocorrência. O formulário pede título, detalhes, categoria (só as cinco opções) e local (só as cinco opções). Permite anexar de 0 a 3 arquivos de imagem JPEG ou PNG, cada um até 5 MB. Ao confirmar com dados válidos, a ocorrência é gravada como **Pendente**, com data/hora de abertura, autor = morador logado, e uma cópia do **bloco** e do **apartamento** atuais do cadastro (para filtro e identificação depois, mesmo que o cadastro mude). As imagens ficam associadas à ocorrência. Sucesso leva o morador a um estado claro de “ocorrência registrada” e ao caminho para vê-la (lista ou detalhe, conforme já existirem Specs 05/06; se ainda não existirem, ao menos confirma o sucesso). Erros de validação não gravam. Não é possível escolher status na abertura. Não é possível apontar outro morador como autor.
- **Entradas e saídas:**
  - Entrada: título, detalhes, categoria, local, 0–3 imagens; identidade do morador logado.
  - Saída: ocorrência Pendente persistida, com autor, bloco/apto do momento, data de abertura e imagens; ou recusa com erros.
- **Dados/entidades envolvidos (conceitual):** Ocorrência: título, detalhes, categoria, local, status (Pendente), data/hora de abertura, autor, bloco do autor no momento, apartamento do autor no momento, imagens (0 a 3). Imagem: arquivo JPEG ou PNG, tamanho até 5 MB.
- **Estados e transições:** Não existia → **Pendente** (único destino desta spec).
- **Regras de negócio:** Regras 8 (autoria), 9, 13, 14, 15. Administrativo não cria.
- **Validações:** Título e detalhes obrigatórios e não podem ser só espaços. Categoria e local obrigatórios e devem ser um valor da lista fixa. Máximo 3 imagens. Cada imagem: tipo JPEG ou PNG e tamanho ≤ 5 MB. Só morador ativo autenticado. Recusar 4ª imagem antes de gravar.
- **Fluxo do usuário (passo a passo):**
  1. Morador autenticado escolhe abrir ocorrência.
  2. Preenche título, detalhes, categoria e local.
  3. Opcionalmente anexa até 3 imagens válidas.
  4. Confirma.
  5. Recebe confirmação de sucesso (ocorrência Pendente) ou vê os erros e corrige.
- **Casos de borda e erros:**
  - Sem imagens: aceita, se o restante for válido.
  - 3 imagens válidas: aceita.
  - 4ª imagem ou vários arquivos passando de 3: recusa.
  - PDF, vídeo ou outro tipo: recusa o arquivo, explica o tipo aceito.
  - Arquivo > 5 MB: recusa esse arquivo.
  - Categoria/local digitados fora da lista: impossível escolher / recusa.
  - Administrativo: não tem esta ação.
  - Sessão caída no meio: não grava; pede login.
  - Falha no envio das imagens: não deixa ocorrência “sem as fotos que o usuário achou que mandou”; ou grava tudo ou informa o erro e não dá sucesso falso.
- **Impacto no existente:** Primeira escrita de ocorrências no produto. Ainda não exige dashboard (Spec 08), mas o dado precisa existir para as specs seguintes.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um morador autenticado e um formulário válido sem imagens, quando confirma, então nasce uma ocorrência Pendente só dele, com bloco e apto iguais aos do cadastro no momento.
  - Dado um formulário válido com 3 JPEG/PNG ≤ 5 MB, quando confirma, então as 3 imagens ficam na ocorrência.
  - Dado título vazio ou só espaços, quando tenta confirmar, então não grava e pede o título.
  - Dado um arquivo que não é JPEG/PNG ou é maior que 5 MB, quando tenta anexar/confirmar, então recusa e explica.
  - Dado um administrativo autenticado, quando usa o sistema, então ele não encontra ação de abrir ocorrência.
- **Definição de pronto:** Um morador consegue registrar ocorrências com e sem fotos, com recusas de arquivo e de campos, e o registro fica Pendente ligado a ele.
- **Dependências:** Spec 01 (área do morador e sessão). Spec 02 (morador existente com bloco/apto).
- **Fora do escopo desta spec:** Listar, ver detalhe, editar, cancelar, comentar, mudar status, filtros do dashboard, o administrativo criar chamado.

### Spec 05 — Listar minhas ocorrências

- **Fase:** Fase 3 — Ocorrências do morador
- **Objetivo (o quê):** O morador vê a lista das ocorrências que **ele** abriu, cada uma com identificação suficiente e o **status** atual.
- **Intenção (por quê):** Resolver o “ninguém me diz se andou”: o morador olha o próprio histórico e o status sem perguntar no WhatsApp.
- **Contexto:** Ocorrências criadas na Spec 04. Área do morador (Spec 01). Ainda sem detalhe rico (Spec 06), mas cada item deve poder levar ao detalhe quando a Spec 06 existir — nesta spec, a lista em si é o entregável. Não mostra ocorrências de outros moradores. UI: padrão de **item de ocorrência** da seção 10 (título, categoria, data, badge de status nas cores do DESIGN.md).
- **Atores:** Morador autenticado e ativo.
- **Descrição do comportamento:** Na área do morador há a lista “minhas ocorrências”. Cada item mostra pelo menos: título, categoria, local, data de abertura e status (Pendente, Em andamento, Resolvida ou Cancelada), de forma distinguível. A lista vem da mais recente para a mais antiga (premissa de uso: o que acabou de abrir aparece primeiro). Se não houver nenhuma, mostra estado vazio com convite para abrir a primeira. Não há filtro obrigatório nesta spec (filtros são do dashboard administrativo). Não mistura ocorrências de outro autor, mesmo do mesmo apartamento.
- **Entradas e saídas:**
  - Entrada: identidade do morador logado.
  - Saída: lista só das ocorrências dele, com status; ou estado vazio.
- **Dados/entidades envolvidos (conceitual):** Ocorrência (título, categoria, local, status, data de abertura, autor). Status visível com a nomenclatura da Regra 9.
- **Estados e transições:** Não se aplica — a lista só reflete o status atual; quem muda status é o administrativo (Spec 09) ou o cancelamento do morador (Spec 07).
- **Regras de negócio:** Regras 8 e 9.
- **Validações:** Só morador autenticado. Consulta restrita ao autor = usuário logado.
- **Fluxo do usuário (passo a passo):**
  1. Morador entra na área dele.
  2. Abre a lista de ocorrências.
  3. Vê as que abriu, com status, ou o estado vazio.
  4. (Quando Spec 06 existir) escolhe uma para ver o detalhe.
- **Casos de borda e erros:**
  - Nenhuma ocorrência: estado vazio, sem erro técnico.
  - Várias: todas as dele, nenhuma de outro, inclusive de quem mora no mesmo apto.
  - Status depois de mudado pelo administrativo: a lista mostra o status **atual**, não o da abertura.
  - Administrativo: não usa esta lista de “minhas”; ele usa o dashboard (Spec 08).
  - Falha ao carregar: mensagem de erro e possibilidade de tentar de novo, sem fingir lista vazia se o problema for técnico.
- **Impacto no existente:** Dá utilidade à criação da Spec 04 na área do morador.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um morador com 2 ocorrências e outro morador com 1, quando o primeiro abre a lista, então vê só as 2 dele, cada uma com o status atual.
  - Dado um morador sem ocorrências, quando abre a lista, então vê estado vazio e caminho para abrir ocorrência.
  - Dado uma ocorrência que o administrativo marcou Em andamento, quando o autor abre a lista, então o item aparece como Em andamento.
- **Definição de pronto:** Dois moradores no mesmo apto não veem a lista um do outro; o status na lista acompanha a realidade da ocorrência.
- **Dependências:** Spec 04 — precisa haver como existir ocorrência. Spec 01 — área do morador.
- **Fora do escopo desta spec:** Detalhe, imagens ampliadas, comentários, edição, cancelar, filtros por bloco, lista geral do condomínio.

### Spec 06 — Ver detalhe da ocorrência (morador)

- **Fase:** Fase 3 — Ocorrências do morador
- **Objetivo (o quê):** O morador abre uma ocorrência **dele** e vê título, detalhes, categoria, local, status, data, imagens e identificação da unidade; se tentar uma ocorrência que não é dele, é recusado.
- **Intenção (por quê):** A lista não basta para reler o texto nem as fotos. O detalhe é onde o morador confere o que registrou e, nas specs 07 e 10, onde edita, cancela e comenta.
- **Contexto:** Lista da Spec 05. Criação da Spec 04. Comentários (Spec 10) ainda podem não existir: o detalhe nesta spec cobre os dados da ocorrência e as imagens. Ações de editar/cancelar ficam para a Spec 07; esta spec não as exige visíveis ainda, mas o detalhe é a tela base.
- **Atores:** Morador autor da ocorrência.
- **Descrição do comportamento:** A partir da lista, o morador abre um item. O detalhe abre em **gaveta ou modal de nível 3** (seção 10), não como um visual solto. Vê todos os campos informados na abertura, o status atual (badge na cor do DESIGN.md), a data/hora, o bloco/apartamento registrados na abertura e as imagens (se houver), visualizáveis. Sem imagens, o detalhe simplesmente não mostra galeria (não é erro). Se o identificador da ocorrência não for dele ou não existir, o sistema não revela o conteúdo: recusa (não encontrado ou sem permissão) e devolve à lista. Administrativo não usa esta tela de morador; o atendimento dele é a Spec 09.
- **Entradas e saídas:**
  - Entrada: escolha de uma ocorrência da lista (ou tentativa de acesso direto ao identificador).
  - Saída: detalhe completo permitido; ou recusa sem expor dados de terceiros.
- **Dados/entidades envolvidos (conceitual):** Ocorrência completa da Spec 04, incluindo imagens e status atual.
- **Estados e transições:** Não se aplica — somente leitura nesta spec.
- **Regras de negócio:** Regras 8 e 15 (quem vê a ocorrência vê as imagens).
- **Validações:** Usuário deve ser o autor. Ocorrência deve existir.
- **Fluxo do usuário (passo a passo):**
  1. Na lista, escolhe uma ocorrência.
  2. Vê o detalhe e as imagens.
  3. Volta à lista se quiser.
- **Casos de borda e erros:**
  - Ocorrência de outro morador: sem conteúdo, recusa.
  - Ocorrência inexistente: recusa / não encontrado.
  - Sem imagens: detalhe ok, sem galeria.
  - Imagens presentes: todas as enviadas (1 a 3) visíveis.
  - Status resolvida/cancelada: ainda pode ver o detalhe (somente leitura aqui).
- **Impacto no existente:** Completa o acompanhamento visual da Spec 05.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado uma ocorrência do morador com 2 imagens, quando ele abre o detalhe, então vê texto, categoria, local, status, data e as 2 imagens.
  - Dado uma ocorrência de outro morador, quando tenta abrir o detalhe, então não vê título, texto nem imagens.
  - Dado uma ocorrência sem imagens, quando abre o detalhe, então os dados textuais aparecem normalmente.
- **Definição de pronto:** O autor lê o próprio chamado com fotos; o vizinho não lê o chamado alheio pelo detalhe.
- **Dependências:** Spec 05 (chegada a partir da lista) e Spec 04 (dados a exibir).
- **Fora do escopo desta spec:** Editar, cancelar, comentar, mudar status, visão administrativa.

### Spec 07 — Editar e cancelar ocorrência pendente

- **Fase:** Fase 3 — Ocorrências do morador
- **Objetivo (o quê):** O autor altera os dados e as imagens de uma ocorrência **Pendente**, ou a cancela (status Cancelada), sempre com recusa se o status já não for Pendente.
- **Intenção (por quê):** Errou o texto, a categoria ou a foto logo depois de enviar — ainda dá para corrigir. Se desistiu, cancela sem precisar da administração. Depois que o atendimento começou (Em andamento) ou terminou, o registro não pode ser reescrito pelo morador.
- **Contexto:** Detalhe da Spec 06. Status e transições das Regras 10 e 11. Cancelar pede confirmação (premissa). Administrativo cancela também, mas por outro caminho (Spec 09); aqui é só o morador na **própria** Pendente. Comentários não são editados por esta spec.
- **Atores:** Morador autor.
- **Descrição do comportamento:** No detalhe de uma ocorrência **Pendente** do autor, há como editar e como cancelar. **Editar** reabre os mesmos campos da criação (título, detalhes, categoria, local, imagens 0–3 com as mesmas regras de tipo/tamanho). Pode trocar, remover ou acrescentar imagens, nunca passando de 3. Ao salvar válido, os dados novos substituem os antigos; o status continua Pendente; autor, data de abertura, bloco e apartamento da abertura **não mudam**. **Cancelar** pede confirmação explícita; se confirmar, o status vira **Cancelada** e deixa de ser editável/cancelável pelo morador. Se o status não for mais Pendente (administrativo já moveu, ou já cancelada), as ações de editar e cancelar não estão disponíveis (ou recusam, se tentadas). Não dá para “descancelar”.
- **Entradas e saídas:**
  - Entrada: campos editados; conjunto de imagens; confirmação de cancelamento.
  - Saída: ocorrência atualizada ainda Pendente; ou ocorrência Cancelada; ou recusa.
- **Dados/entidades envolvidos (conceitual):** Ocorrência (campos editáveis + status). Imagens associadas.
- **Estados e transições:** Pendente → (salvar edição) → Pendente com novos dados. Pendente → (cancelar confirmado) → Cancelada. Qualquer outro status → edição/cancelamento pelo morador **não permitidos**.
- **Regras de negócio:** Regras 8, 10, 11, 13, 14, 15.
- **Validações:** Mesmas da Spec 04 nos campos e imagens. Só autor. Só status Pendente. Cancelamento exige confirmação.
- **Fluxo do usuário (passo a passo):**
  1. Abre o detalhe de uma Pendente sua.
  2. Escolhe editar, altera o que precisar, salva — **ou** escolhe cancelar, confirma.
  3. Vê o resultado no detalhe (dados novos ou status Cancelada).
- **Casos de borda e erros:**
  - Em andamento / Resolvida / Cancelada: não edita nem cancela.
  - Cancelar sem confirmar: permanece Pendente.
  - Edição inválida: não grava; mantém os dados anteriores.
  - Tentar 4 imagens na edição: recusa.
  - Não autor: recusa (já coberto pela Spec 06).
  - Cancelada não volta para Pendente por esta spec.
- **Impacto no existente:** Altera ocorrências da Spec 04 visíveis na lista/detalhe (05 e 06). O dashboard (Spec 08) passará a ver Cancelada quando existir.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado uma ocorrência Pendente do morador, quando ele altera o título e salva, então o detalhe mostra o novo título e o status segue Pendente.
  - Dado uma ocorrência Pendente, quando ele confirma o cancelamento, então o status fica Cancelada e ele não consegue mais editar nem cancelar.
  - Dado uma ocorrência Pendente, quando ele inicia o cancelamento e desiste, então o status permanece Pendente.
  - Dado uma ocorrência Em andamento (ou Resolvida), quando o autor tenta editar ou cancelar, então o sistema impede.
- **Definição de pronto:** Edição e cancelamento só na Pendente do autor, com confirmação no cancelar e as mesmas regras de imagem da abertura.
- **Dependências:** Spec 06 — tela de detalhe. Spec 04 — regras de campos/imagens.
- **Fora do escopo desta spec:** Administrativo mudar status (Spec 09). Reabrir. Editar comentários. Morador mudar status para Em andamento ou Resolvida.

### Spec 08 — Dashboard administrativo de ocorrências

- **Fase:** Fase 4 — Atendimento administrativo
- **Objetivo (o quê):** O administrativo vê totais por status, a lista de **todas** as ocorrências do condomínio e filtra por bloco, categoria e status.
- **Intenção (por quê):** A administração precisa de uma visão operacional: quanto está parado, o que é hidráulica, o que veio do bloco X — sem depender de memória ou de conversa paralela.
- **Contexto:** Destino do login administrativo (Spec 01). Ocorrências de todos os moradores (Specs 04 e 07). Filtro por **bloco** = bloco gravado na ocorrência na abertura (cadastro do autor naquele momento). Detalhe e mudança de status são Spec 09; o dashboard entrega a **visão geral** e o caminho para abrir cada item. Composição visual obrigatória: seção 10.4 (KPIs + fila em cards + chips com contagem), tokens em `docs/DESIGN.md`. O mockup de dashboard é a referência de layout **somente** no que a seção 10 manda copiar.
- **Atores:** Funcionário administrativo autenticado.
- **Descrição do comportamento:** Ao entrar no dashboard, o administrativo vê o **layout da seção 10.4**: título Dashboard; fileira de cards de métrica (card herói verde com o total do conjunto exibido + cards brancos por status, números em peso de métrica, **sem** tendência percentual nem “equipes”); módulo da fila com chips-pílula (Todas e cada status, com contagem; mais filtros de categoria e bloco no mesmo espírito). (1) Totais: Pendente, Em andamento, Resolvida e Cancelada — **decisão:** os totais refletem o **conjunto já filtrado**, e sem filtro refletem todas; assim número e lista não mentem um para o outro. (2) Lista em **cards horizontais**: avatar ou iniciais, nome do autor, bloco + apto, tipo em pílula (proprietário/inquilino), título, categoria, local, data e badge de status (cores do DESIGN.md) à direita; ordem da mais recente para a mais antiga; se houver muitos itens, paginação no rodapé do módulo. (3) Filtros combináveis: bloco, categoria, status. Filtros vazios = todas. Bloco do filtro deve listar valores que façam sentido a partir dos blocos já existentes nas ocorrências e/ou permitir escolher um bloco conhecido; se não houver ocorrências naquele bloco, lista vazia (não é erro). Estado sem nenhuma ocorrência no condomínio: vazio claro, totais zerados. Não há botão de nova ocorrência nem exportar relatório neste painel. Morador não acessa. Cada card pode ser aberto no detalhe (Spec 09).
- **Entradas e saídas:**
  - Entrada: sessão administrativa; valores dos filtros.
  - Saída: totais e lista coerentes com os filtros; estado vazio.
- **Dados/entidades envolvidos (conceitual):** Ocorrência (todos os campos de listagem + bloco/apto da abertura + autor). Totais: quatro contagens de status.
- **Estados e transições:** Não se aplica — leitura e filtragem.
- **Regras de negócio:** Regras 3, 9, 13, 17.
- **Validações:** Só administrativo. Valores de filtro de categoria/status devem ser das listas conhecidas ou “todos”. Bloco filtra por igualdade com o bloco armazenado na ocorrência.
- **Fluxo do usuário (passo a passo):**
  1. Administrativo entra no dashboard.
  2. Vê totais e a lista completa.
  3. Aplica um ou mais filtros.
  4. Vê lista e totais atualizados.
  5. Limpa filtros para voltar ao panorama geral.
  6. Abre uma ocorrência (Spec 09).
- **Casos de borda e erros:**
  - Nenhuma ocorrência: totais 0 e estado vazio.
  - Filtro sem resultado: lista vazia, totais 0, sem parecer um erro do sistema.
  - Dois moradores no mesmo bloco: ambos aparecem quando se filtra esse bloco.
  - Bloco depois editado no cadastro (Spec 03): ocorrência antiga permanece filtrável pelo bloco **da abertura**.
  - Morador tenta abrir o dashboard: recusa (Spec 01).
  - Falha ao carregar: erro explícito, não lista vazia silenciosa.
- **Impacto no existente:** Preenche de fato o dashboard que a Spec 01 só definia como destino.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado 3 pendentes e 1 resolvida de moradores diferentes, quando o administrativo abre o dashboard sem filtro, então os totais mostram 3 e 1 e a lista tem 4 itens.
  - Dado ocorrências em blocos A e B, quando filtra bloco A, então só aparecem as de A e os totais são só de A.
  - Dado ocorrências de várias categorias, quando filtra Hidráulica e Pendente, então só entram as que são as duas coisas ao mesmo tempo.
  - Dado um morador autenticado, quando tenta o dashboard, então é recusado.
  - Dado o dashboard sem filtro, quando o administrativo entra, então vê o card herói de total, cards por status, chips de filtro com contagem e a fila em cards com badge colorido — e **não** vê Nova ocorrência, Exportar relatório, busca global, sino de notificação nem banner de app.
- **Definição de pronto:** Totais e lista batem com os filtros combinados; o morador não vê essa tela; cada item identifica autor, unidade, categoria, local e status; a composição segue a seção 10 e `docs/DESIGN.md` (não um dashboard genérico).
- **Dependências:** Spec 01 (área e permissão). Spec 04 (existir ocorrência). Spec 02 (dados do autor). Idealmente Spec 07 já pode ter gerado Cancelada, mas não é bloqueante.
- **Fora do escopo desta spec:** Mudar status, comentar, cadastrar morador, gráficos, exportar PDF, filtro por período, filtro por morador além do que a lista já mostra, busca global, técnico, protocolo, tendências, “Nova ocorrência” no admin.

### Spec 09 — Atender ocorrência (detalhe e mudança de status)

- **Fase:** Fase 4 — Atendimento administrativo
- **Objetivo (o quê):** O administrativo abre qualquer ocorrência, vê o conteúdo completo (incluindo quem abriu e as imagens) e muda o status só nas transições permitidas, sem reabrir resolvida ou cancelada.
- **Intenção (por quê):** Atender é avançar o chamado: da fila (Pendente) para o trabalho (Em andamento) e para o fechamento (Resolvida) ou para o encerramento (Cancelada). Sem isso o status do morador nunca anda.
- **Contexto:** Lista do Spec 08. Dados da Spec 04. Cancelamento pelo morador (Spec 07) já pode ter deixado Cancelada — aí o administrativo **não reabre**. Comentários são Spec 10: esta spec pode mostrar o detalhe sem exigir a caixa de comentário ainda. O morador não muda status para Em andamento/Resolvida. UI: gaveta/modal de nível 3 (`docs/DESIGN.md`); badges de status nas cores da seção 10.3; se houver trilha de ciclo, só os quatro status deste PRD.
- **Atores:** Funcionário administrativo.
- **Descrição do comportamento:** A partir do dashboard, abre uma ocorrência **em gaveta ou modal** (não perde o contexto da fila). Vê título, detalhes, categoria, local, status (badge), data, imagens, nome do autor, tipo (proprietário/inquilino), bloco, apartamento, e-mail e telefone do autor (para poder falar com a pessoa). **Mudança de status:** se Pendente, pode ir para Em andamento, Resolvida ou Cancelada; se Em andamento, para Resolvida ou Cancelada; se Resolvida ou Cancelada, **não oferece** (e recusa) qualquer mudança. Não pula “para trás” (ex.: Em andamento → Pendente). A mudança é imediata e visível no detalhe e, em seguida, na lista/totais do dashboard e na lista do morador. Opcional útil: confirmar ao cancelar ou ao marcar Resolvida — **premissa:** confirmar ao cancelar; marcar Resolvida pode ser direto. Ocorrência inexistente: não encontrado, volta ao dashboard.
- **Entradas e saídas:**
  - Entrada: ocorrência escolhida; novo status permitido.
  - Saída: ocorrência com status atualizado; detalhe completo; ou recusa de transição.
- **Dados/entidades envolvidos (conceitual):** Ocorrência + dados de contato do autor (vindos do cadastro atual do morador para telefone/e-mail/nome; bloco/apto **exibidos** os da ocorrência na abertura, e os de contato os atuais para conseguir falar com a pessoa).
- **Estados e transições:** Pendente → Em andamento | Resolvida | Cancelada. Em andamento → Resolvida | Cancelada. Resolvida → (nenhuma). Cancelada → (nenhuma).
- **Regras de negócio:** Regras 9 e 12. Regra 15 para imagens.
- **Validações:** Só administrativo. Só transições da lista acima. Status destino deve ser um dos quatro conhecidos.
- **Fluxo do usuário (passo a passo):**
  1. No dashboard, abre uma ocorrência.
  2. Lê o conteúdo, as fotos e quem abriu.
  3. Escolhe um status permitido (se houver).
  4. Vê o status novo no detalhe.
- **Casos de borda e erros:**
  - Transição ilegal (ex.: Resolvida → Pendente): recusa, status antigo permanece.
  - Cancelada pelo morador: administrativo não reabre.
  - Pendente → Resolvida direto: **permitido** (Regra 12).
  - Morador tenta mudar status: não há controle para ele nesta spec / recusa.
  - Autor foi desativado: o detalhe **ainda abre**; o histórico permanece; contato mostra os dados do cadastro.
  - Sem imagens: detalhe ok.
- **Impacto no existente:** Atualiza o status visto nas Specs 05, 06 e 08.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado uma Pendente, quando o administrativo marca Em andamento, então o status fica Em andamento para ele e para o morador autor.
  - Dado uma Em andamento, quando marca Resolvida, então fica Resolvida e não há mais como mudar.
  - Dado uma Pendente, quando o administrativo cancela, então fica Cancelada e não reabre.
  - Dado uma Resolvida, quando tenta qualquer outro status, então o sistema impede e o status continua Resolvida.
  - Dado qualquer ocorrência existente, quando o administrativo abre o detalhe, então vê texto, imagens (se houver) e quem abriu (nome, tipo, bloco, apto, e-mail, telefone).
- **Definição de pronto:** Todas as transições da Regra 12 funcionam; as proibidas não; o detalhe administrativo está completo para atender.
- **Dependências:** Spec 08 — como se chega na ocorrência. Spec 04 — conteúdo. Spec 02/03 — dados do autor.
- **Fora do escopo desta spec:** Comentários (Spec 10). Reabrir. Atribuir responsável. Status “urgente”. Notificar o morador por e-mail.

### Spec 10 — Comentários na ocorrência

- **Fase:** Fase 5 — Comunicação
- **Objetivo (o quê):** Morador (nas ocorrências dele) e administrativo (em qualquer uma) leem e enviam comentários em texto, em **qualquer** status, em ordem cronológica, sem editar ou apagar depois de enviado.
- **Intenção (por quê):** Status sozinho não explica (“vamos amanhã na vistoria”). O fio de comentários substitui o vai-e-vem do WhatsApp **dentro** do chamado, inclusive para um recado depois de resolvido ou cancelado.
- **Contexto:** Detalhe do morador (Spec 06) e detalhe administrativo (Spec 09) já existem. Ambos passam a exibir o mesmo histórico de comentários daquela ocorrência, **dentro da gaveta/modal de detalhe**. Não é chat ao vivo: o usuário envia e o outro vê quando abrir de novo (sem notificação — fora do escopo). Não usar a timeline “Aberto → Notificado → Em vistoria” do DESIGN.md como fio de comentários.
- **Atores:** Morador autor; funcionário administrativo.
- **Descrição do comportamento:** No detalhe da ocorrência, há a lista de comentários (autor, data/hora, texto) da mais antiga para a mais recente (leitura natural de conversa) e um campo para novo comentário. Enviar um texto não vazio grava o comentário associado à ocorrência e ao usuário logado, e a lista atualiza. Morador só comenta se for o **autor**. Administrativo comenta em qualquer ocorrência. Permitido em Pendente, Em andamento, Resolvida e Cancelada. Depois de enviado, não há editar nem apagar. Comentário não muda o status. Lista vazia: estado “ainda não há comentários”. Recusa texto só com espaços. Se o morador tentar comentar ocorrência alheia, recusa (ele nem deveria ver o detalhe).
- **Entradas e saídas:**
  - Entrada: texto do comentário; ocorrência; usuário logado.
  - Saída: comentário persistido visível para quem pode ver a ocorrência; ou recusa.
- **Dados/entidades envolvidos (conceitual):** Comentário: texto, autor (nome e perfil), data/hora, ocorrência ligada.
- **Estados e transições:** Não se aplica ao status da ocorrência. Comentário: não existia → enviado (estado final; imutável).
- **Regras de negócio:** Regras 8 e 16.
- **Validações:** Texto obrigatório, não só espaços. Usuário com permissão de ver a ocorrência. Morador = autor. Administrativo = qualquer ocorrência existente.
- **Fluxo do usuário (passo a passo):**
  1. Abre o detalhe de uma ocorrência que pode ver.
  2. Lê os comentários já existentes (ou o vazio).
  3. Escreve um comentário e envia.
  4. Vê o comentário no fim da lista, com seu nome e horário.
- **Casos de borda e erros:**
  - Texto vazio: não envia.
  - Ocorrência cancelada ou resolvida: ainda envia e ainda lê.
  - Muitos comentários: todos permanecem, em ordem do tempo.
  - Morador em ocorrência de outro: não vê e não comenta.
  - Falha ao gravar: mensagem de erro; o texto não some sem aviso se possível, ou o usuário percebe que não enviou.
  - Não há notificação ao outro lado; o outro só vê ao abrir o detalhe.
- **Impacto no existente:** Acrescenta conversa aos detalhes das Specs 06 e 09, sem alterar regras de status.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado uma ocorrência do morador, quando o administrativo envia um comentário e o morador abre o detalhe, então o morador lê o texto, quem escreveu e quando.
  - Dado a mesma ocorrência, quando o morador responde, então o administrativo vê a resposta no detalhe dela.
  - Dado uma ocorrência Resolvida, quando qualquer um dos dois envia comentário, então o comentário é gravado e o status permanece Resolvida.
  - Dado um comentário já enviado, quando o autor tenta alterá-lo ou apagá-lo, então essa ação não existe / é recusada.
  - Dado um morador, quando tenta comentar ocorrência que não é dele, então é recusado.
- **Definição de pronto:** Os dois lados conversam no mesmo histórico, em qualquer status, sem editar/apagar e sem o morador falar em chamado alheio.
- **Dependências:** Spec 06 e Spec 09 — os dois detalhes onde a conversa aparece. Spec 04 — a ocorrência precisa existir.
- **Fora do escopo desta spec:** Notificação por e-mail/push. Comentário com imagem. Edição/exclusão. Chat instantâneo. Comentário mudando status automaticamente.

## 15. Ordem recomendada de implementação

1. Spec 01 — Login, sessão e direcionamento por perfil
2. Spec 02 — Cadastrar e listar moradores
3. Spec 03 — Editar, redefinir senha, desativar e reativar morador
4. Spec 04 — Abrir ocorrência
5. Spec 05 — Listar minhas ocorrências
6. Spec 06 — Ver detalhe da ocorrência (morador)
7. Spec 07 — Editar e cancelar ocorrência pendente
8. Spec 08 — Dashboard administrativo de ocorrências
9. Spec 09 — Atender ocorrência (detalhe e mudança de status)
10. Spec 10 — Comentários na ocorrência

Seguir essa ordem evita construir tela de ocorrência sem ter morador autenticado, dashboard sem chamado para listar, ou comentário sem detalhe. A Spec 01 é a base; 02 e 03 destravam quem entra como morador; 04–07 são o ciclo do morador; 08–09 o atendimento; 10 a conversa em cima do que já se vê.

**Nota para a implementação:** UI obrigatória em `docs/DESIGN.md` e na seção 10 deste PRD (layout de sidebar, KPIs, cards de ocorrência, badges). Não incluir módulos, status extras, busca global, app, relatórios ou notificações que este PRD colocou fora do escopo — mesmo que apareçam no mockup.
