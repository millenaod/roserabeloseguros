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

## Pendências conhecidas

- Nenhuma pendência crítica no momento

## Stack

React 19 + Vite · Supabase · TanStack React Query · React Router v7 · Radix UI · Tailwind · Playwright (e2e)

## Acessos

- Supabase: projeto via `VITE_SUPABASE_URL` em `.env.local`
- n8n: `millenaod.app.n8n.cloud` (webhook de envio de mensagens)
- Vercel: projeto `roserabeloseguros-n1hg` na org `millenaods-projects`
