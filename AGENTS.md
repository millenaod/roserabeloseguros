# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Fluxo de desenvolvimento (LER ANTES DE CODAR)

Antes de implementar ou corrigir qualquer feature, siga a skill **`desenvolvimento`** (`.Codex/skills/desenvolvimento/SKILL.md`). Regras não-negociáveis dela: **paridade mobile** (toda navegação vive em `Sidebar.jsx` E `BottomNav.jsx`), **teste sempre** (feature nova → teste novo; bug → teste que reproduz; tela alterada → `.spec.ts` atualizado) e **nunca tocar produção** (dev roda no projeto Supabase `cobranca-seguros-dev`). Para telas/interações, seguir também a skill `ux-guidelines`.

## Comandos

```bash
npm run dev          # servidor de desenvolvimento (Vite, porta 5173)
npm run build        # build de produção
npm run lint         # ESLint
npm run test         # todos os testes Playwright
npx playwright test tests/parcelas.spec.ts   # arquivo específico
npx playwright test --debug                   # modo debug interativo
```

Env vars obrigatórias (`.env.local`):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Arquitetura

### Stack
React 19 + Vite · Supabase (banco + auth + storage) · TanStack React Query · React Router v7 · Radix UI · Tailwind CSS · Playwright (testes e2e)

### Camadas

```
src/
  lib/         → supabase.js (cliente singleton)
  services/    → funções que chamam o Supabase — uma por entidade
  hooks/       → React Query + estado local; importam de services/
  pages/       → uma por rota; montam com hooks, delegam lógica
  components/  → ui/ (Radix primitivos) + componentes de negócio
  utils/       → mascaras.js · format.js · whatsapp.js · pagamento.js
```

**Regra de dependência:** `pages → hooks → services → supabase`. Nunca chame `supabase` diretamente de uma página ou componente.

### Banco de dados (Supabase)

Modelo: `clientes → apolices → parcelas`.

A view `v_parcelas_ui` desnormaliza tudo — é o que todas as queries de listagem e detalhe usam. Campos principais: `parcela_id`, `cliente_id`, `cliente_nome`, `cliente_telefone`, `cliente_cpf`, `seguradora_nome`, `valor`, `status`, `dias_atraso`, `cobertura_em_risco`.

Boletos são armazenados no bucket `boletos` do Supabase Storage. Upload via `uploadBoleto()` em `services/parcelas.js` — só sobe depois de garantir o cliente para não criar arquivo órfão.

Projeto Supabase: `wjbcbiwfmlsfbgbxlief` (ref `cobranca-seguros`, região `sa-east-1`). Tabelas: `clientes`, `apolices`, `parcelas`, `contatos`, `seguradoras`, `usuarios`, `configuracoes`, `kanban_colunas`.

Views (todas `security_invoker = true` — respeitam o RLS de quem consulta, não do criador):
- `v_parcelas_ui` — desnormaliza tudo para listagem/detalhe (ver campos acima).
- `v_parcelas_acao` — parcelas que precisam de ação.

### Segurança / RLS (Supabase)

Convenção de acesso, **respeitar sempre**:
- `authenticated` → `SELECT USING (true)` em todas as tabelas de dados (+ UPDATE onde o app edita). O app **sempre** opera com sessão autenticada; nunca com a chave anon.
- `service_role` → acesso total, ignora RLS. É o que o **n8n** usa para gravar de volta.
- `anon` → **nenhum acesso a tabela de dados.** A chave anon vai no bundle do front (é pública); qualquer política `anon USING(true)` vaza a base inteira. Não recriar políticas `anon_*`.
- `usuarios` → cada usuário só vê o próprio perfil (`auth.uid() = id`).

Ao criar/alterar tabela ou view, rodar o advisor de segurança do Supabase depois (pega RLS faltando, view `SECURITY DEFINER`, função exposta ao anon).

### n8n (automação de mensagens)

Trigger `trg_parcela_nova_n8n` (`AFTER INSERT ON parcelas`) chama `notify_n8n_parcela_nova()`, que dispara o webhook n8n `https://millenaod.app.n8n.cloud/webhook/parcela-nova`. A função é `SECURITY DEFINER` mas **sem EXECUTE para anon/authenticated** — só roda pelo trigger, nunca via `/rest/v1/rpc`.

O n8n envia o WhatsApp e **grava o resultado de volta** em `contatos` (timeline) usando a **service_role key**. Por isso o front não precisa gravar esses contatos, e o anon não precisa de acesso.

Parâmetros de automação ficam na tabela `configuracoes` (par chave/valor): `dias_antes_vencimento`, `dias_followup`, `max_tentativas`, `horario_inicio_envio`, `horario_fim_envio`, `dias_uteis_apenas`, `validade_boleto_dias`.

### Autenticação e perfis

`useAuth` (hook) lê a sessão do Supabase e carrega o perfil do usuário. **Atenção crítica:** nunca chame uma função do Supabase com `await` dentro do callback de `onAuthStateChange` — causa deadlock no lock interno da lib. A busca de perfil usa `setTimeout(0)` para sair do lock (ver comentário em `useAuth.js`).

`RotaProtegida` usa `perfisPermitidos` para restringir rotas: só o perfil `rose` acessa `/dashboard-rose` e `/relatorios`. Vendedores comuns acessam as demais rotas.

### React Query

Cada hook define uma `queryKey` estável (ex: `['carteira-clientes']`). Após mutações, chame `queryClient.invalidateQueries({ queryKey: [...] })` para forçar refetch. Não use estado local para dados que vêm do servidor — use queries.

### Rotas

```
/                → Parcelas (tabela + kanban)
/tarefas         → Tarefas do dia
/nova-parcela    → Cadastro de parcela
/parcelas/:id    → Detalhe da parcela
/carteira        → Carteira de clientes (CarteiraVendedor)
/dashboard-rose  → Dashboard da Rose (perfil rose)
/relatorios      → Relatórios (perfil rose)
```

Todas as páginas são lazy-loaded via `React.lazy` em `App.jsx`.

### Máscaras e formatação

`src/utils/mascaras.js` — máscaras de entrada: `mascararTelefone`, `mascararMoeda`, `mascararCpf`, `mascararCpfCnpj` (detecta CPF/CNPJ pela quantidade de dígitos). Validadores: `telefoneValido`, `cpfValido`, `cpfCnpjValido`. Para salvar no banco: `telefoneCompleto` (adiciona `55`), `moedaParaNumero`.

`src/utils/format.js` — formatação de exibição: `formatarMoeda`, `formatarData`.

### Mensagens WhatsApp

`src/utils/whatsapp.js` — `mensagemCobrancaPadrao(parcela)` gera o texto correto baseado em `tipo_pagamento` e `seguradora_nome`. `linkWhatsApp(parcela, texto)` gera o link `wa.me`.

Os 3 templates aprovados no Meta estão mapeados em `src/utils/pagamento.js` (`TIPOS_PAGAMENTO`), junto com o nome técnico de cada template e as variáveis posicionais do corpo. O envio automático é feito via webhook n8n em `https://millenaod.app.n8n.cloud/webhook/parcela-nova`.

### Estilo

CSS variables para temas (light/dark): `--brand`, `--background`, `--surface`, `--surface-raised`, `--border`, `--text-primary`, `--text-secondary`, `--text-muted`, `--status-error`, `--status-paid`. Use sempre essas variáveis ao invés de cores hardcoded do Tailwind.

Fonte display (títulos, valores monetários): `font-display` = Barlow Condensed. Fonte corpo: Inter.

### Convenções de código

- Componentes de formulário validam no hook (`validar()` retorna objeto de erros); a página/componente apenas exibe.
- Conflito de CPF no cadastro de parcela: quando o mesmo CPF existe com nome/telefone diferentes, o service retorna `{ conflito }` em vez de salvar — a tela apresenta um Dialog para a operadora decidir (`usar_existente` ou `atualizar`).
- Alias de importação: `@/` aponta para `src/`.
- Testes Playwright ficam em `tests/` e usam helpers em `tests/helpers/setup.js`.
