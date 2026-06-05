
,# Design System Migration Spec — Rose Rabelo Seguros
## Migração de componentes existentes para o novo design system
> Stack: React + Tailwind CSS · Light & Dark mode

---

## Identidade visual (referência rápida)

| Token | Valor |
|---|---|
| Cor primária | `#FF1A00` |
| Cor primária hover | `#CC1500` |
| Azul apoio | `#1B3A6B` |
| Verde sucesso | `#1A7A4A` |
| Âmbar atenção | `#D97706` |
| Neutro 900 | `#0D0D0D` |
| Neutro 800 | `#1A1A1A` |
| Neutro 700 | `#2C2C2C` |
| Neutro 500 | `#555555` |
| Neutro 400 | `#999999` |
| Neutro 200 | `#D4D4D4` |
| Neutro 100 | `#F2F2F2` |
| Branco | `#FFFFFF` |
| Font display | Barlow Condensed (600, 700, 800) |
| Font corpo | Inter (400, 500, 600) |
| Border radius padrão | 8px |
| Border radius card | 12px |
| Shadow focus | `0 0 0 3px rgba(255,26,0,0.25)` |

---

## FASE 1 — Fundação (fazer primeiro, tudo depende disso)

---

### TAREFA 01 — Tokens Tailwind + CSS global

**Arquivo:** `tailwind.config.js` + `src/styles/globals.css`

**O que fazer:** Adicionar os tokens do design system Rose Rabelo sem quebrar o que já existe.

**Critérios de aceitação:**
- [ ] Cores da marca disponíveis como `brand-primary`, `brand-hover`, `brand-tint`
- [ ] Cores semânticas: `semantic-success`, `semantic-warning`, `semantic-danger`
- [ ] Neutros: `neutral-900` até `neutral-50`
- [ ] `font-display` = Barlow Condensed, `font-body` = Inter
- [ ] Variáveis CSS de light/dark mode em `globals.css`
- [ ] Google Fonts importadas (Barlow Condensed + Inter)

**Prompt para Claude Code:**
```
Edite o tailwind.config.js adicionando os tokens do design system Rose Rabelo Seguros:
- Cores: brand-primary #FF1A00, brand-hover #CC1500, brand-tint #FF1A0018, azul #1B3A6B, success #1A7A4A, warning #D97706
- Neutros de 900 (#0D0D0D) a 50 (#FFFFFF)
- font-display: Barlow Condensed, font-body: Inter
No globals.css, importe as fontes do Google Fonts e defina variáveis CSS para light e dark mode.
Não remova configurações existentes — apenas adicione os novos tokens.
```

---

## FASE 2 — UI Primitives (componentes base)

> Migrar na ordem abaixo. Cada um é independente após a Tarefa 01.

---

### TAREFA 02 — `ui/button.jsx`

**O que muda:** Aplicar cores, border-radius, font e transições da marca.

**Variantes esperadas:** `primary` · `secondary` · `ghost` · `danger`
**Tamanhos:** `sm` · `md` · `lg`

**Critérios de aceitação:**
- [ ] `primary`: fundo `brand-primary`, hover `brand-hover`
- [ ] `secondary`: outline `brand-primary`, texto vermelho
- [ ] `ghost`: sem fundo, hover sutil
- [ ] `danger`: fundo `neutral-800`, texto branco
- [ ] Focus ring: `shadow-focus` vermelho 25%
- [ ] Transição 150ms
- [ ] Funciona em dark mode

**Prompt para Claude Code:**
```
Migre src/components/ui/button.jsx para o design system Rose Rabelo.
Variantes: primary (bg #FF1A00, hover #CC1500), secondary (outline vermelho), ghost, danger (bg #1A1A1A).
Focus ring: box-shadow 0 0 0 3px rgba(255,26,0,0.25).
Transição 150ms. Border-radius 8px. Font Inter 500.
Mantenha a API de props existente — não quebre quem já usa o componente.
```

---

### TAREFA 03 — `ui/badge.jsx`

**O que muda:** Cores e estilo visual dos badges de status.

**Variantes esperadas:** `success` · `warning` · `danger` · `neutral`

**Critérios de aceitação:**
- [ ] Cada variante com cor de texto + fundo tint correspondente
- [ ] Border radius pill (9999px)
- [ ] Suporte a prop `dot` (bolinha de status)
- [ ] Font Inter 11px weight 500
- [ ] Funciona em dark mode

**Prompt para Claude Code:**
```
Migre src/components/ui/badge.jsx para o design system Rose Rabelo.
Variantes: success (#1A7A4A + fundo tint), warning (#D97706 + fundo tint), danger (#CC1500 + fundo tint), neutral (cinza com borda).
Adicione prop dot (boolean) que mostra uma bolinha colorida antes do texto.
Border-radius pill. Font Inter 11px 500. Mantenha API existente.
```

---

### TAREFA 04 — `ui/input.jsx`

**O que muda:** Borda, focus ring, estados de validação.

**Critérios de aceitação:**
- [ ] Borda padrão: `neutral-200` (light) / `neutral-700` (dark)
- [ ] Focus: borda `brand-primary` + ring vermelho 25%
- [ ] Estado `error`: borda vermelha + texto de erro abaixo
- [ ] Estado `success`: borda verde + texto de confirmação abaixo
- [ ] Border radius 8px
- [ ] Font Inter 14px
- [ ] Funciona em dark mode

**Prompt para Claude Code:**
```
Migre src/components/ui/input.jsx para o design system Rose Rabelo.
Focus: border #FF1A00 + box-shadow 0 0 0 3px rgba(255,26,0,0.25).
Adicione props error (string) e success (string) que mostram mensagem abaixo do campo com cor correspondente.
Border-radius 8px. Font Inter 14px. Suporte a dark mode.
Mantenha API de props existente.
```

---

### TAREFA 05 — `ui/card.jsx`

**O que muda:** Border radius, sombra, cores de fundo e borda.

**Critérios de aceitação:**
- [ ] Border radius 12px
- [ ] Sombra: `shadow-sm` em repouso, `shadow-md` em hover
- [ ] Fundo: branco (light) / `neutral-800` (dark)
- [ ] Borda: `neutral-200` (light) / `neutral-700` (dark)
- [ ] Variante `urgent`: borda lateral esquerda 3px `brand-primary`
- [ ] Transição 150ms no hover

**Prompt para Claude Code:**
```
Migre src/components/ui/card.jsx para o design system Rose Rabelo.
Border-radius 12px. Shadow: 0 1px 3px rgba(0,0,0,0.08) em repouso, 0 4px 12px rgba(0,0,0,0.12) no hover.
Adicione variante urgent com border-left 3px solid #FF1A00.
Suporte a dark mode (bg neutral-800, border neutral-700).
Mantenha API existente.
```

---

### TAREFA 06 — `ui/label.jsx`

**Prompt para Claude Code:**
```
Migre src/components/ui/label.jsx para o design system Rose Rabelo.
Font Inter 12px weight 500. Cor neutral-500 (light) / neutral-400 (dark).
Mantenha API existente.
```

---

### TAREFA 07 — `ui/select.jsx`

**Prompt para Claude Code:**
```
Migre src/components/ui/select.jsx para o design system Rose Rabelo.
Mesmas regras do input.jsx: border-radius 8px, focus ring vermelho, suporte a dark mode.
Font Inter 14px. Mantenha API existente.
```

---

### TAREFA 08 — `ui/textarea.jsx`

**Prompt para Claude Code:**
```
Migre src/components/ui/textarea.jsx para o design system Rose Rabelo.
Mesmas regras do input.jsx. Mantenha API existente.
```

---

### TAREFA 09 — `ui/dialog.jsx`

**Critérios de aceitação:**
- [ ] Overlay: preto 60% opacidade
- [ ] Modal: border-radius 12px, sombra `shadow-lg`
- [ ] Título em Barlow Condensed 700
- [ ] Botões usam o `button.jsx` já migrado
- [ ] Funciona em dark mode

**Prompt para Claude Code:**
```
Migre src/components/ui/dialog.jsx para o design system Rose Rabelo.
Overlay: rgba(0,0,0,0.6). Modal: border-radius 12px, shadow 0 8px 24px rgba(0,0,0,0.18).
Título em Barlow Condensed 700. Use o button.jsx já migrado para os botões de ação.
Suporte a dark mode. Mantenha API existente.
```

---

### TAREFA 10 — `ui/sheet.jsx`

**Prompt para Claude Code:**
```
Migre src/components/ui/sheet.jsx para o design system Rose Rabelo.
Overlay: rgba(0,0,0,0.6). Painel lateral: fundo branco (light) / neutral-800 (dark), sombra shadow-lg.
Título em Barlow Condensed 700. Animação de entrada 250ms ease-in-out.
Mantenha API existente.
```

---

### TAREFA 11 — `ui/table.jsx`

**Critérios de aceitação:**
- [ ] Headers: Inter 11px, uppercase, letter-spacing 0.06em, `neutral-500`
- [ ] Células: Inter 13px, `neutral-900` (light) / branco (dark)
- [ ] Hover nas linhas: fundo `neutral-100` (light) / `neutral-700` (dark)
- [ ] Borda divisória: `neutral-200` (light) / `neutral-700` (dark)
- [ ] Valores monetários em Barlow Condensed 700

**Prompt para Claude Code:**
```
Migre src/components/ui/table.jsx para o design system Rose Rabelo.
Headers: Inter 11px uppercase letter-spacing 0.06em cor neutral-500.
Hover de linha com fundo sutil. Bordas neutral-200 (light) / neutral-700 (dark).
Para células de valor monetário, adicione variante money que usa Barlow Condensed 700.
Suporte a dark mode. Mantenha API existente.
```

---

### TAREFA 12 — Primitives restantes

Migrar em lote (sem mudanças estruturais, apenas ajuste visual):

- `ui/tabs.jsx`
- `ui/dropdown-menu.jsx`
- `ui/popover.jsx`
- `ui/tooltip.jsx`
- `ui/separator.jsx`
- `ui/skeleton.jsx`
- `ui/toggle.jsx`
- `ui/toast.jsx` + `ui/toaster.jsx`
- `ui/command.jsx`
- `ui/avatar.jsx`

**Prompt para Claude Code:**
```
Migre os seguintes componentes UI para o design system Rose Rabelo.
Regras gerais para todos:
- Cores de fundo/borda/texto usando os tokens da marca
- Border-radius padrão 8px
- Font Inter no corpo, Barlow Condensed em títulos
- Focus rings com box-shadow vermelho 25% de opacidade
- Suporte a dark mode
- Mantenha a API de props existente em todos

Componentes: ui/tabs.jsx, ui/dropdown-menu.jsx, ui/popover.jsx, ui/tooltip.jsx,
ui/separator.jsx, ui/skeleton.jsx, ui/toggle.jsx, ui/toast.jsx, ui/toaster.jsx,
ui/command.jsx, ui/avatar.jsx
```

---

## FASE 3 — App Components (componentes de negócio)

---

### TAREFA 13 — `StatusBadge.jsx`

**O que faz:** Exibe o status de uma parcela (pago, pendente, vencido, cancelado).

**Critérios de aceitação:**
- [ ] Usa o `badge.jsx` já migrado internamente
- [ ] Mapeia status para variante correta: `pago→success`, `pendente→warning`, `vencido→danger`, `cancelado→neutral`
- [ ] Prop `dot` ativada por padrão

**Prompt para Claude Code:**
```
Migre src/components/StatusBadge.jsx para usar o ui/badge.jsx do design system Rose Rabelo.
Mapeamento: pago→success, pendente→warning, vencido→danger, cancelado→neutral.
Ative dot por padrão. Mantenha a API de props existente.
```

---

### TAREFA 14 — `ParcelaCard.jsx`

**O que faz:** Card individual de uma parcela na listagem.

**Critérios de aceitação:**
- [ ] Usa `card.jsx` migrado como base
- [ ] Variante `urgent` automática quando status = `vencido`
- [ ] Nome do cliente em Inter 600
- [ ] Número da apólice em Inter 400 com letter-spacing
- [ ] Valor em Barlow Condensed 700 — cor muda conforme status
- [ ] `StatusBadge` no canto superior direito
- [ ] Funciona em dark mode

**Prompt para Claude Code:**
```
Migre src/components/ParcelaCard.jsx para o design system Rose Rabelo.
Use card.jsx como base. Cards com status vencido recebem variante urgent (borda esquerda vermelha).
Valor em Barlow Condensed 700: vermelho (vencido), verde (pago), padrão (outros).
Use StatusBadge já migrado. Suporte a dark mode. Mantenha API existente.
```

---

### TAREFA 15 — `ParcelaRow.jsx`

**O que faz:** Linha de parcela na tabela.

**Critérios de aceitação:**
- [ ] Usa `table.jsx` migrado
- [ ] Valor em Barlow Condensed 700 com cor por status
- [ ] `StatusBadge` na coluna de status
- [ ] Hover na linha com fundo sutil
- [ ] Funciona em dark mode

**Prompt para Claude Code:**
```
Migre src/components/ParcelaRow.jsx para o design system Rose Rabelo.
Valor em Barlow Condensed 700 com cor por status.
Use StatusBadge já migrado. Hover sutil na linha. Suporte a dark mode.
Mantenha API existente.
```

---

### TAREFA 16 — `KPICard.jsx`

**O que faz:** Card de métrica no topo do dashboard (total a receber, vencidas, etc).

**Critérios de aceitação:**
- [ ] Usa `card.jsx` migrado como base
- [ ] Label em Inter 12px `neutral-500`
- [ ] Valor em Barlow Condensed 800, tamanho grande
- [ ] Ícone no canto superior direito
- [ ] Variante de cor para KPI crítico (ex: vencidas → vermelho)
- [ ] Funciona em dark mode

**Prompt para Claude Code:**
```
Migre src/components/KPICard.jsx para o design system Rose Rabelo.
Label em Inter 12px neutral-500. Valor em Barlow Condensed 800.
Adicione prop variant: default e critical (critical usa cor brand-primary no valor).
Suporte a dark mode. Mantenha API existente.
```

---

### TAREFA 17 — `KanbanCard.jsx` + `KanbanCardStatus.jsx`

**Prompt para Claude Code:**
```
Migre src/components/KanbanCard.jsx e KanbanCardStatus.jsx para o design system Rose Rabelo.
KanbanCard: use card.jsx como base, border-radius 12px, sombra shadow-sm.
KanbanCardStatus: use StatusBadge já migrado.
Fontes: Inter para texto, Barlow Condensed para valores monetários.
Suporte a dark mode. Mantenha API existente em ambos.
```

---

### TAREFA 18 — `KanbanColuna.jsx` + `PainelKanban.jsx`

**Prompt para Claude Code:**
```
Migre src/components/KanbanColuna.jsx e PainelKanban.jsx para o design system Rose Rabelo.
KanbanColuna: header com Barlow Condensed 700, fundo neutro diferenciado por status.
PainelKanban: layout das colunas com gap e padding usando tokens do design system.
Suporte a dark mode. Mantenha API existente.
```

---

### TAREFA 19 — `EmptyState.jsx`

**Prompt para Claude Code:**
```
Migre src/components/EmptyState.jsx para o design system Rose Rabelo.
Ícone centralizado, título em Barlow Condensed 700, descrição em Inter 14px neutral-500.
Botão de ação usa button.jsx migrado variante primary.
Suporte a dark mode. Mantenha API existente.
```

---

### TAREFA 20 — `ConfirmDialog.jsx`

**Prompt para Claude Code:**
```
Migre src/components/ConfirmDialog.jsx para o design system Rose Rabelo.
Use dialog.jsx migrado como base.
Botão de confirmação: variante danger ou primary conforme prop.
Botão de cancelar: variante ghost.
Título em Barlow Condensed 700. Suporte a dark mode. Mantenha API existente.
```

---

### TAREFA 21 — `NovaParcelaSheet.jsx`

**Prompt para Claude Code:**
```
Migre src/components/NovaParcelaSheet.jsx para o design system Rose Rabelo.
Use sheet.jsx migrado como base.
Campos internos usam input.jsx, select.jsx e label.jsx já migrados.
Botão de salvar: variante primary. Botão cancelar: ghost.
Título em Barlow Condensed 700. Suporte a dark mode. Mantenha API existente.
```

---

### TAREFA 22 — `TimelineContatos.jsx`

**Prompt para Claude Code:**
```
Migre src/components/TimelineContatos.jsx para o design system Rose Rabelo.
Linha do tempo: borda lateral neutral-200 (light) / neutral-700 (dark).
Ícone de evento: bolinha brand-primary para eventos recentes, neutral para antigos.
Texto: Inter 13px. Data: Inter 11px neutral-500.
Suporte a dark mode. Mantenha API existente.
```

---

## FASE 4 — Layout

---

### TAREFA 23 — `Sidebar.jsx`

**Critérios de aceitação:**
- [ ] Fundo `neutral-900` (dark sidebar, independente do tema da página)
- [ ] Logo Rose Rabelo no topo
- [ ] Item ativo: fundo `brand-primary`, texto branco
- [ ] Item hover: fundo `brand-primary/10`, texto `brand-primary`
- [ ] Font Inter 14px weight 500
- [ ] Responsivo: colapsa em mobile

**Prompt para Claude Code:**
```
Migre src/components/Sidebar.jsx para o design system Rose Rabelo.
Fundo neutral-900 fixo. Item ativo: bg #FF1A00, texto branco.
Item hover: bg rgba(255,26,0,0.1), texto #FF1A00.
Font Inter 14px 500. Logo no topo em Barlow Condensed 700.
Responsivo: oculta em mobile (usa BottomNav no mobile). Mantenha API existente.
```

---

### TAREFA 24 — `BottomNav.jsx`

**Prompt para Claude Code:**
```
Migre src/components/BottomNav.jsx para o design system Rose Rabelo.
Fundo branco (light) / neutral-800 (dark). Borda superior neutral-200 / neutral-700.
Item ativo: ícone e label brand-primary.
Item inativo: neutral-400.
Font Inter 11px. Mantenha API existente.
```

---

### TAREFA 25 — `AppLayout.jsx`

**Prompt para Claude Code:**
```
Migre src/components/AppLayout.jsx para o design system Rose Rabelo.
Fundo da página: neutral-100 (light) / neutral-900 (dark).
Integre Sidebar (desktop) e BottomNav (mobile) já migrados.
Adicione suporte a dark mode via classe dark no elemento raiz.
Mantenha API existente.
```

---

### TAREFA 26 — `RotaProtegida.jsx`

**Prompt para Claude Code:**
```
Migre src/components/RotaProtegida.jsx para o design system Rose Rabelo.
Se não autenticado, exibe tela de loading usando skeleton.jsx migrado.
Sem mudanças funcionais — apenas ajuste visual. Mantenha API existente.
```

---

## Ordem de execução

```
FASE 1 (fundação)
  T01 — Tokens Tailwind

FASE 2 (primitives — podem rodar em paralelo após T01)
  T02 Button → T03 Badge → T04 Input → T05 Card → T06 Label
  T07 Select → T08 Textarea → T09 Dialog → T10 Sheet → T11 Table
  T12 Primitives restantes (lote)

FASE 3 (app components — dependem da Fase 2)
  T13 StatusBadge → T14 ParcelaCard → T15 ParcelaRow → T16 KPICard
  T17 KanbanCard+Status → T18 KanbanColuna+Painel
  T19 EmptyState → T20 ConfirmDialog → T21 NovaParcelaSheet
  T22 TimelineContatos

FASE 4 (layout — fazer por último)
  T23 Sidebar → T24 BottomNav → T25 AppLayout → T26 RotaProtegida
```

---

## Regra geral para todas as tarefas

Ao migrar qualquer componente, sempre:
1. **Não quebre a API** — mantenha as props existentes
2. **Adicione** suporte a dark mode com classes `dark:`
3. **Use os tokens** definidos no `tailwind.config.js` (T01)
4. **Não refatore lógica** — só mude o visual

---

*Gerado para o projeto Rose Rabelo Seguros — Dashboard de Cobrança*
*Junho 2026*
