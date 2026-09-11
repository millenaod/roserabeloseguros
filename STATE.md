# STATE — Rose Rabelo Seguros

_Atualizado: 2026-07-07_

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

## Segurança (RLS / Supabase)

- Views `v_parcelas_ui` e `v_parcelas_acao` agora com `security_invoker = true` (respeitam RLS de quem consulta).
- `notify_n8n_parcela_nova()` sem EXECUTE para public/anon/authenticated — só dispara via trigger `AFTER INSERT ON parcelas`.
- Removidas TODAS as políticas `anon` de leitura/escrita nas tabelas de dados (clientes, parcelas, apólices, contatos, seguradoras, configuracoes). App usa sempre sessão autenticada; n8n usa service_role.
- **Pendente (painel Supabase, não dá por SQL):** ligar "Leaked Password Protection" em Auth.

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

- **`.env.test`:** colar a `service_role` real do projeto dev (Settings → API) no lugar do placeholder — único passo que falta para `npm test` rodar.

Usuária de teste no dev: `millena.dutra@teste.local` / `teste1234` (nome "Millena Dutra", perfil `rose`). O helper `tests/helpers/setup.ts` agora lê email/senha de `TEST_EMAIL`/`TEST_PASSWORD` (antes o email era hardcoded).
- Ligar proteção de senha vazada no painel (Auth → Policies) da produção
- Régua de cobrança automática ainda não implementada (parâmetros já existem em `configuracoes`)

## Stack

React 19 + Vite · Supabase · TanStack React Query · React Router v7 · Radix UI · Tailwind · Playwright (e2e)

## Acessos

- Supabase: projeto via `VITE_SUPABASE_URL` em `.env.local`
- n8n: `millenaod.app.n8n.cloud` (webhook de envio de mensagens)
- Vercel: projeto `roserabeloseguros-n1hg` na org `millenaods-projects`
