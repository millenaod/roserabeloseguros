# STATE — Rose Rabelo Seguros

_Atualizado: 2026-09-15_

## Status atual

App em produção: https://roserabeloseguros-n1hg.vercel.app  
Branch principal: `main` · Deploy automático via Vercel

## Funcionalidades implementadas

### Parcelas
- Listagem em tabela e kanban com filtros e busca
- Cadastro de nova parcela com revisão antes de salvar
- Detalhe da parcela com timeline de contatos
- Excluir parcela (remove contatos → parcela, pela FK chain)
- "Cobrar de novo" no kanban, tabela e detalhe (reenvia template WhatsApp)
- Boleto obrigatório para o template Meta (upload no Supabase Storage)

### Clientes / Carteira
- Carteira de clientes por vendedor
- Editar e excluir cliente (exclusão respeita FK: contatos → parcelas → apólices → cliente)
- Histórico de contatos por cliente com decodificação de erros do WhatsApp

### WhatsApp / Templates Meta
- 3 templates aprovados mapeados em `pagamento.js` (boleto, débito, cartão)
- Envio automático via webhook n8n em `millenaod.app.n8n.cloud`
- Timeline mostra erros decodificados do WhatsApp (ex: número inválido)

### Autenticação e perfis
- Perfis: `rose` (acesso total), `vendedor`, `thaina`
- `rose` acessa `/dashboard-rose` e `/relatorios`
- Vendedores acessam `/`, `/tarefas`, `/nova-parcela`, `/parcelas/:id`, `/carteira`

### Dashboard Rose
- Relatórios com filtros por período (persistidos na URL)
- Carrega mês atual por padrão

## Bugs corrigidos recentemente

| Data | Fix |
|------|-----|
| 2026-07-07 | `formatarData` não importada em NovaParcela — página não carregava |
| 2026-07-07 | Exclusão de apólices sem tratar erro em `useCarteiraVendedor` |
| 2026-07-07 | `limparParcelas` nos testes respeitava FK chain (contatos→parcelas→apólices→clientes) |
| 2026-07-07 | Erros do WhatsApp decodificados na timeline |
| 2026-07-07 | Order by em contatos corrigido (`data_contato` → `enviado_em`) |
| 2026-07-07 | Fix excluir parcela/cliente + testes e2e |
| 2026-09-14 | Dashboard "Inadimplência por seguradora" agrupava por `p.seguradora` (campo inexistente na view) → tudo caía em "Outros". Corrigido para `p.seguradora_nome`. Teste de regressão DR5 em `dashboard.spec.ts`. |

## Segurança (RLS / Supabase)

- Views `v_parcelas_ui` e `v_parcelas_acao` agora com `security_invoker = true` (respeitam RLS de quem consulta).
- `notify_n8n_parcela_nova()` sem EXECUTE para public/anon/authenticated — só dispara via trigger `AFTER INSERT ON parcelas`.
- Removidas TODAS as políticas `anon` de leitura/escrita nas tabelas de dados (clientes, parcelas, apólices, contatos, seguradoras, configuracoes). App usa sempre sessão autenticada; n8n usa service_role.
- **Pendente (painel Supabase, não dá por SQL):** ligar "Leaked Password Protection" em Auth.

## Multi-tenancy (aplicado no DEV **e em PRODUÇÃO** — 2026-09-15)

Transformação do app single-tenant (feito p/ Rose) em produto para vários corretores. Modelo: **banco compartilhado + `org_id` por linha + RLS por empresa**; cada usuário pertence a **uma** empresa.

Aplicado em `cobranca-seguros-dev` **e replicado em produção `cobranca-seguros`** (migrations `multitenancy_fase*`; em prod também foi dropada a policy `auth_update_kanban` que era `USING(true)`). Produção: 510 parcelas backfill-adas na org Rose, 0 órfãos, advisor limpo (só o WARN intencional de `auth_org_id`). Migrations `multitenancy_fase*`:
- Tabela `organizacoes` (`nome`, `slug`, `ativo`). `org_id` (NOT NULL) em `usuarios`, `clientes`, `apolices`, `parcelas`, `contatos`, `configuracoes`, `kanban_colunas`. `seguradoras` continua **global**.
- Função `auth_org_id()` (`SECURITY DEFINER`, EXECUTE só p/ `authenticated`+`service_role`; revogado de `anon`). Usada pela RLS.
- **Triggers `BEFORE INSERT`** preenchem `org_id` em cascata (`clientes`←auth; `apolices`←cliente; `parcelas`←apólice; `contatos`←parcela/cliente) — por isso os inserts do front **não mudaram** e o caminho do n8n (service_role) também grava certo. Funções de trigger sem EXECUTE p/ anon/authenticated.
- RLS reescrita: `authenticated` usa `org_id = auth_org_id()` (USING + WITH CHECK) em todas as tabelas de dados; `service_role` total; `usuarios` = próprio perfil.
- Views `v_parcelas_ui`/`v_parcelas_acao`/`v_resumo_inadimplencia` recriadas com coluna `org_id` (seguem `security_invoker` → filtram sozinhas).
- **Unicidades agora por org:** `clientes (org_id, cpf_cnpj)` e `apolices (org_id, seguradora_id, numero_apolice)` — antes eram globais e bloqueariam CPF/apólice repetidos entre corretoras.
- `configuracoes`: PK passou a `(org_id, chave)`.
- Front: `buscarPerfil()` passou a trazer `org_id` + nome da org. `RotaProtegida` inalterada.
- Backfill: todos os dados e usuários do dev vinculados à org **"Rose Rabelo Seguros"** (`slug=rose-rabelo`).
- Teste de isolamento `tests/multitenancy.spec.ts` (nível API/RLS): usuário da org B não vê parcelas da org A e vice-versa; insert nasce com `org_id` correto via trigger. **Passa.**

**Pendente:**
- Criar a 2ª empresa + usuário quando quiser (base já pronta em prod). Provisionamento: inserir org em `organizacoes`, criar user no Supabase Auth, inserir linha em `usuarios` com o `org_id` da nova org e `perfil` (`rose`=dono / `vendedor`).
- **Deploy do front**: `buscarPerfil()` agora seleciona `org_id`+`organizacoes(nome)` — está no working tree, ainda não commitado/deployado. O app deployado atual segue funcionando (Rose/Thainá na org Rose veem tudo via RLS; triggers preenchem `org_id`), então o deploy não é urgente.
- Ajustar o n8n para incluir/filtrar `org_id` (webhook `parcela-nova` e leitura de `configuracoes` por org).
- UI de admin p/ provisionar empresas fica p/ depois.

## CobraAI — rebranding + signup self-service (dev, 2026-09-15)

A plataforma vira **CobraAI**. Novo visual (inspirado em Osko/Replo: light, azul `#2563EB`, Inter, card central) aplicado **só nas telas de auth/cadastro** por ora — o resto do app segue rosa Rose Rabelo.

- **Design system CobraAI (escopo isolado):** paleta `cobra` no `tailwind.config.js`, variante `cobra`/`cobra-ghost` no `Button`, classe `.cobra-theme` em `index.css` (sobrescreve `--background` p/ branco só nesse escopo), componente `CobraLogo`.
- **Signup self-service (nova corretora):** página `/criar-conta` (`src/pages/CriarConta.jsx`) + `criarConta()` em `services/auth.js` (`supabase.auth.signUp` com metadata `nome_empresa`/`nome_usuario`). Login rebrandado + link "Criar conta".
- **Backend (dev):** trigger `handle_new_user` no `auth.users` cria org + usuário dono (`perfil 'rose'`) a partir do metadata; coluna `plano` em `organizacoes`. Só age no signup self-service (guard por `nome_empresa`), não interfere em usuários criados por admin/testes.
- **Confirmação de e-mail LIGADA** (decisão): após criar conta, mostra tela "Confirme seu e-mail" (não entra direto). O provisionamento acontece no `signUp` independente da confirmação. Obs.: GoTrue valida domínio do e-mail (rejeita `teste.local`/`example.com`).
- **Testes:** `tests/signup.spec.ts` (3, passam) — provisionamento via admin API, validação client-side, e tela de confirmação (resposta do signup stubbada, sem e-mail real).

**Painel super-admin (Fase C — listagem pronta no dev):**
- Flag `super_admin` (booleano) em `usuarios`; helper `is_super_admin()` + RPC `admin_list_orgs()` (SECURITY DEFINER, checa super_admin antes de retornar cross-org). Usuária de teste do dev marcada super_admin.
- `buscarPerfil()` traz `super_admin`. `RotaProtegida apenasSuperAdmin` gateia `/admin`.
- Front: `AdminLayout` (sidebar clara CobraAI, responsivo) + `pages/admin/Empresas.jsx` (lista via RPC, empty state, contadores). `services/admin.js`.
- **Criar empresa:** edge function `admin-org-create` (dev) — valida `super_admin`, cria a org e **convida o dono por e-mail** (`inviteUserByEmail`, define senha pelo link), vincula como `perfil 'rose'`. Front: dialog "Nova empresa" (`services/admin.js criarEmpresa`, `supabase.functions.invoke`). Rollback da org se o convite falhar.
- Testes: `tests/admin.spec.ts` (4, passam) — super-admin vê lista; não-admin barrado; edge function nega não-super-admin (403) e valida corpo.
- **Caveat e-mail:** o convite depende do e-mail do Supabase — dev tem rate limit baixo (testes não disparam e-mail real) e **produção vai precisar de SMTP próprio** configurado.

**✅ Corrigido (multi-tenancy) — `admin-usuarios` (dev E prod, v2):** a edge function pré-existente inseria `usuarios` **sem `org_id`** (quebrava com `org_id NOT NULL`) e o GET vazava usuários de **todas** as orgs. Agora insere com o `org_id` do gerente e filtra o GET pela org dele. Fontes versionados em `supabase/functions/`. Testes: `tests/admin-usuarios.spec.ts` (org_id correto no POST; GET sem vazamento cross-org).

- **Pendente geral:** Rollout de prod (trigger `handle_new_user` + `plano` + `super_admin` + RPCs `is_super_admin`/`admin_list_orgs` + deploy edge `admin-org-create` + SMTP + deploy front). Branch `cobraai` gera preview na Vercel (usa env de PROD — só revisão visual).

## Ambientes

| Ambiente | Projeto Supabase | Uso |
|----------|------------------|-----|
| Produção | `wjbcbiwfmlsfbgbxlief` (cobranca-seguros) | App da Rose (dados reais) |
| Teste/Dev | `gizrkcbrqkxurbamsvrx` (cobranca-seguros-dev) | `.env.test` + desenvolvimento da versão genérica |

O projeto **dev** é réplica fiel do schema (8 tabelas, 3 views `security_invoker`, RLS sem `anon`, trigger n8n como **stub** que não envia WhatsApp). Dados de referência semeados (18 seguradoras, 7 colunas kanban, 7 configs); **sem PII de clientes reais**. Bucket `boletos` criado.

Antes: `.env.test` apontava para a PRODUÇÃO e o `SUPABASE_SERVICE_KEY` era só a anon renomeada — os testes mexiam em dados reais. Corrigido.

## Processo de desenvolvimento

Skill **`desenvolvimento`** (`.claude/skills/desenvolvimento/SKILL.md`) é obrigatória antes de codar: paridade mobile (Sidebar + BottomNav), teste sempre (feature→teste; bug→teste que reproduz; tela alterada→spec atualizado), nunca tocar produção (usar projeto dev). Referenciada no topo do `CLAUDE.md`.

Storage do projeto dev: bucket `boletos` + policies (upload/update/delete `authenticated`, leitura pública) replicadas da produção.

## Pendências conhecidas

- ✅ **`.env.test`:** já tem a `service_role` real do projeto dev (confirmado 2026-09-14, claim `role=service_role`); `npm test` semeia e roda.
- **Testes RE3 e RE5 (`dashboard.spec.ts`, página Relatórios) falham (pré-existente)** — provável débito do redesign: RE3 espera o EmptyState "Defina os filtros e clique em Consultar" que não aparece mais no estado inicial. Não relacionado ao fix de seguradora; revisar o comportamento inicial de `/relatorios` e atualizar os specs.
- **Testes C1 e C3 (`carteira.spec.ts`) falham (pré-existente, débito do redesign do Sheet)** — `strict mode violation`: o Sheet ganhou os títulos "Parcelas em aberto" e "Histórico de contatos", então `getByRole('heading')` casa 3 elementos. A ação funciona (toast "Cliente atualizado com sucesso" aparece); é só o seletor do spec que precisa ficar específico (ex.: `heading` de nível/`name`). Não relacionado ao multi-tenancy.

Usuária de teste no dev: `millena.dutra@teste.local` / `teste1234` (nome "Millena Dutra", perfil `rose`). O helper `tests/helpers/setup.ts` agora lê email/senha de `TEST_EMAIL`/`TEST_PASSWORD` (antes o email era hardcoded).
- Ligar proteção de senha vazada no painel (Auth → Policies) da produção
- Régua de cobrança automática ainda não implementada (parâmetros já existem em `configuracoes`)

## Stack

React 19 + Vite · Supabase · TanStack React Query · React Router v7 · Radix UI · Tailwind · Playwright (e2e)

## Acessos

- Supabase: projeto via `VITE_SUPABASE_URL` em `.env.local`
- n8n: `millenaod.app.n8n.cloud` (webhook de envio de mensagens)
- Vercel: projeto `roserabeloseguros-n1hg` na org `millenaods-projects`
