# STATE — Rose Rabelo Seguros (app de cobrança)

> Documento de estado do produto. Última atualização: **2026-06-03**.
> Serve pra bater o olho e saber onde paramos, sem reler tudo.

---

## Visão geral em 1 frase

Sistema de gestão de cobrança de parcelas vencidas para a corretora Rose Rabelo Seguros.
Hoje o produto tem **duas metades que ainda não se conversam**.

---

## As duas metades

### 1. App de gestão (esta base de código) — **maduro** ✅
React + Supabase + shadcn/ui + React Query + Vite, deploy na Vercel.

Telas e recursos prontos:
- **Login** com perfis (`rose` vs vendedor/funcionária) + **reset de senha** (recém-feito)
- **Parcelas** — lista (tabela) + visão **"Por status"** (antigo "Kanban"); botão **Nova Parcela**
  abre um **drawer lateral** (vale desktop e mobile)
- **Nova Parcela** e **Detalhe da Parcela** — formulário em painel branco (inputs com contraste)
- **Dashboard da Rose**, **Relatórios**, **Aprovações**, **Carteira do Vendedor** (em **tabela**)
- View `v_parcelas_ui` no Supabase, índices, code-splitting
- Suíte de testes Playwright (autenticação, parcelas, mobile) — pronta, **ainda não rodada**

**Padrão de UI:** shadcn/ui sobre Tailwind (NÃO é DaisyUI, apesar de a skill de design dizer).
Fundo da página = creme `--background` #F7F4EF; superfícies (cards, drawer, painéis) = branco
`--surface` #FFFFFF. Inputs precisam de uma superfície branca atrás pra terem contraste.

### 2. Motor de envio (n8n + Evolution + WhatsApp) — **separado / pendente** ⏳
Vive isolado, lendo o Supabase direto. Descrito no contexto do projeto (skills).

---

## 🔑 O gargalo central do produto

O app **registra e acompanha** parcelas, mas **NÃO dispara WhatsApp sozinho**.
Confirmado no código: `src/services/parcelas.js` só lê/grava no Supabase — não há serviço de
envio, chamada à Evolution nem trigger pro n8n. A funcionária ainda muda status na mão.

**Conectar as duas metades** (app marca "cobrar" → dispara WhatsApp → status volta pro app)
é o próximo grande destravamento de valor.

---

## Caminhos possíveis (decisão de produto)

| Frente | O que é | Status |
|---|---|---|
| **A. Ligar app ↔ envio** | Interface dispara WhatsApp de verdade via n8n/Evolution | ⏳ pendente — maior valor |
| **B. Estabilizar o aberto** | Limpar, testar e guardar a base antes de Rose usar | 🔵 **escolhida — quase concluída** |
| **C. Regras com a Rose** | Texto das mensagens, prazos, nº de tentativas, VIP | ⏳ depende da Rose (não é código) |

---

## O que foi feito nesta sessão (2026-06-03)

**Commit `bf2f529`** — `chore: limpeza de lint + reset de senha + suíte Playwright`:
- **Lint zerado**: removidas 17 sobras (imports/variáveis não usados) em 13 arquivos
- **eslint config**: globals Node nos arquivos de config + regra `react-refresh` desativada
  na pasta `components/ui` (padrão shadcn)
- **Reset de senha**: serviço (`resetarSenha`/`atualizarSenha`), página `RedefinirSenha` e rota
- **Testes Playwright** + scripts no `package.json`

**Commit `179a0f5`** — `docs: STATE.md`.

**Commit `78a61c6`** — `feat: ajustes de UX nas telas de parcelas, carteira e cadastro`
(a partir de feedback da Millena):
- Nova Parcela agora abre em **drawer lateral** (desktop + mobile) — corrige o botão que **não
  funcionava na visão por status** (antes o form era uma linha dentro da tabela, que sumia no Kanban)
- **"Kanban" → "Por status"** (linguagem da usuária; ela não reconhecia "Kanban")
- removido `NovaParcelaInline.jsx` (substituído pelo drawer)
- formulário da Nova Parcela em **painel branco** (inputs creme sobre página creme não tinham contraste)
- Carteira do vendedor: cards → **tabela** (responsiva no mobile)

Build OK ✅ e lint limpo (exit 0) ✅ em todos os commits.

---

## O que falta pra fechar "Estabilizar" (Frente B) — 100%

1. **Criar `.env.test`** com as credenciais do Supabase (Millena ainda não tem).
   - Copiar 2 valores do painel do Supabase (URL + chave).
2. **Rodar os testes Playwright** (`npm run test`) e confirmar que login, parcelas e a versão
   mobile funcionam de ponta a ponta.

---

## Pendências anotadas (não esquecer)

- **Integração app ↔ motor de envio** (Frente A) — próximo grande passo de valor.
- **Permissão de rotas por perfil** — foi removida da `RotaProtegida.jsx` na faxina (estava
  escrita mas nunca ligada). Decisão: *"depois a gente cria essa permissão"*. Existe um perfil
  **"Thainá"** previsto além de `rose` e `vendedor` — recriar o mapa de rotas por perfil quando
  for construir de verdade.

---

## Decisões que dependem da Rose (em aberto)

- Texto final das mensagens (1ª, 2ª, última tentativa)
- Quantos dias após o vencimento começar a cobrar
- Quantas tentativas antes de chamar o vendedor
- Como identificar e tratar clientes VIP
- Investir ou não em WhatsApp Business API oficial (R$ 100–450/mês)

---

## Como retomar

1. Ler este arquivo.
2. Se for fechar a Frente B: guiar a Millena a criar o `.env.test` e rodar os testes.
3. Se for partir pra Frente A: planejar a ponte de envio (app → n8n/Evolution → status de volta).
4. Sempre confirmar com a Millena onde ela parou antes de propor o próximo micro-passo.
