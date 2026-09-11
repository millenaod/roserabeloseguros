# Rose Rabelo Seguros — Style Reference
> painel claro com vermelho de marca

**Theme:** light  
**Fontes:** Barlow Condensed (display) · Inter (corpo)  
**Extraído de:** `src/index.css` · `tailwind.config.js`

Rose Rabelo é um painel operacional de cobrança de seguros: superfícies off-white quentes (`#F7F4EF`, `#FFFFFF`) que deixam tabela, badge e valor monetário respirar, com um único vermelho (`#CC1500`) reservado para a ação principal. O texto é quase-preto quente (`#1C1917`), nunca preto puro. Títulos e valores monetários usam Barlow Condensed Bold — condensada e legível em campos numéricos densos. Todo o resto é Inter. Grid de 8px, radius generoso (8px em inputs e cards, 12px em modais), e sombras em foco vermelho que mantêm coerência com a marca.

---

## Tokens — Colors

Cada estado semântico tem quatro camadas coordenadas: `Surface` (fundo tingido), `Action` (fill interativo), `Text`, `Border`. Ao aplicar um estado, use a família inteira — não misture `Surface/Warning` com `Text/Critical`.

### Surface — fundos de container

| Nome | Valor | Token | Papel |
|------|-------|-------|-------|
| Surface/Default | `#FFFFFF` | `--surface` | Fundo padrão de card, modal, drawer, input |
| Surface/Raised | `#FDFAF6` | `--surface-raised` | Seção ligeiramente elevada dentro de card |
| Surface/Gray | `#F2F2F2` | `--neutral-100` | Header de tabela, chip neutro, hover de superfície |
| Surface/Disable | `#E8E2D9` | `--border` | Container inativo |
| Surface/Brand | `#FFEAE6` | `--brand-light` | Destaque de marca, badge de status brand |
| Surface/Success | `#DCFCE7` | `--status-paid-bg` | Feedback positivo — parcela paga |
| Surface/Warning | `#FEF3C7` | `--status-pending-bg` | Pendência, atenção — parcela a cobrar |
| Surface/Critical | `#FEE2E2` | `--status-error-bg` | Erro, bloqueio, cobertura em risco |
| Surface/Sent | `#DBEAFE` | `--status-sent-bg` | Mensagem enviada, em andamento |
| Surface/Waiting | `#CCFBF1` | `--status-waiting-bg` | Aguardando resposta |
| Surface/Escalated | `#EDE9FE` | `--status-escalated-bg` | Escalado para vendedor |
| Surface/Rescheduled | `#CFFAFE` | `--status-rescheduled-bg` | Remarcado |

### Action — fills de elemento interativo

| Nome | Valor | Token | Papel |
|------|-------|-------|-------|
| Action/Primary | `#CC1500` | `--brand` | CTA principal — o único vermelho saturado do sistema |
| Action/Hover | `#A11000` | `--brand-hover` | Hover de Action/Primary |
| Action/On | `#FFFFFF` | — | Conteúdo sobre fill de ação (label de botão primário) |
| Action/Disable | `#E8E2D9` | `--border` | Botão inativo |
| Action/Success | `#16A34A` | `--status-paid` | Ação de confirmação — marcar pago |
| Action/Warning | `#D97706` | `--status-pending` | Ação de atenção |
| Action/Critical | `#DC2626` | `--status-error` | Ação destrutiva — excluir, cancelar |
| Action/Sent | `#2563EB` | `--status-sent` | Ação informativa — enviar cobrança |
| Action/Escalated | `#7C3AED` | `--status-escalated` | Escalar para vendedor |
| Action/Rescheduled | `#0891B2` | `--status-rescheduled` | Remarcar parcela |

### Text

| Nome | Valor | Token | Papel |
|------|-------|-------|-------|
| Text/Default | `#1C1917` | `--text-primary` | Título, label, corpo principal |
| Text/Neutral | `#78716C` | `--text-secondary` | Descrição, hint, metadado |
| Text/Muted | `#A8A29E` | `--text-muted` | Placeholder, texto inativo |
| Text/On | `#FFFFFF` | — | Texto sobre fundo escuro ou de ação |
| Text/Brand | `#CC1500` | `--brand` | Link, ação em texto |
| Text/Success | `#1A7A4A` | `--semantic-success` | Texto em contexto positivo |
| Text/Warning | `#D97706` | `--semantic-warning` | Texto em contexto de atenção |
| Text/Critical | `#DC2626` | `--status-error` | Mensagem de erro |
| Text/Sent | `#2563EB` | `--status-sent` | Texto em contexto de envio |
| Text/Escalated | `#7C3AED` | `--status-escalated` | Texto em contexto escalado |

### Icon

Espelha a escala de texto — mesmos hex, escopo separado.

| Nome | Valor | Token |
|------|-------|-------|
| Icon/Dark | `#1C1917` | `--text-primary` |
| Icon/Neutral | `#78716C` | `--text-secondary` |
| Icon/Muted | `#A8A29E` | `--text-muted` |
| Icon/On | `#FFFFFF` | — |
| Icon/Brand | `#CC1500` | `--brand` |
| Icon/Success | `#16A34A` | `--status-paid` |
| Icon/Warning | `#D97706` | `--status-pending` |
| Icon/Critical | `#DC2626` | `--status-error` |
| Icon/Sent | `#2563EB` | `--status-sent` |
| Icon/Escalated | `#7C3AED` | `--status-escalated` |

### Border

| Nome | Valor | Token | Papel |
|------|-------|-------|-------|
| Border/Default | `#E8E2D9` | `--border` | Borda neutra de card, input, tabela — 1px |
| Border/Brand | `#CC1500` | `--brand` | Foco, item selecionado |
| Border/Success | `#16A34A` | `--status-paid` | Borda em contexto positivo |
| Border/Warning | `#D97706` | `--status-pending` | Borda em contexto de atenção |
| Border/Critical | `#DC2626` | `--status-error` | Borda de campo inválido |
| Border/Sent | `#2563EB` | `--status-sent` | Borda em contexto de envio |
| Border/Escalated | `#7C3AED` | `--status-escalated` | Borda em contexto escalado |

### Background — canvas e overlay

| Nome | Valor | Token | Papel |
|------|-------|-------|-------|
| Background/Default | `#F7F4EF` | `hsl(var(--background))` | Canvas da aplicação — off-white quente |
| Background/Surface | `#FDFAF6` | `--surface-raised` | Canvas em contexto elevado |
| Background/Overlay | `rgba(28,25,23,0.50)` | — | Backdrop de modal e drawer |

### Hover — pares escuros

Nunca produza hover por `opacity` ou `filter: brightness()`. Use o token correspondente.

| Nome | Valor | Token | Par |
|------|-------|-------|-----|
| Hover/Brand | `#A11000` | `--brand-hover` | Action/Primary |
| Hover/Default | `#F2F2F2` | `--neutral-100` | Superfície neutra |
| Hover/Critical | `#9A0000` | — | Action/Critical |
| Hover/Success | `#15803D` | — | Action/Success |
| Hover/Warning | `#B45309` | — | Action/Warning |

---

## Tokens — Typography

### Barlow Condensed + Inter — sistema de duas famílias

| Família | Uso | Pesos |
|---------|-----|-------|
| **Barlow Condensed** (`--font-display`) | Títulos de página, headings de seção, valores monetários, KPIs numéricos | Bold 700 |
| **Inter** (`--font-body`) | Tudo o mais — corpo, labels, hints, botões, células de tabela | 400 · 500 · 600 · 700 |

- **Letter spacing:** 0 em todos os estilos
- **Line height:** sempre em pixels, múltiplo de 4

### Escala completa

| Token | Size | Line height | Peso | Família | Papel |
|-------|------|-------------|------|---------|-------|
| `Display XL` | 40px | 56px | Bold 700 | Barlow Condensed | KPI de destaque, valor monetário grande |
| `Display L` | 32px | 48px | Bold 700 | Barlow Condensed | Título de página |
| `Display M` | 24px | 32px | Bold 700 | Barlow Condensed | Título de seção, heading de card |
| `Display S` | 20px | 32px | Bold 700 | Barlow Condensed | Título de modal, título de widget |
| `Body Large` | 18px | 24px | Regular 400 | Inter | Corpo em destaque |
| `Body Large Highlight` | 18px | 24px | Semi Bold 600 | Inter | Corpo em destaque com ênfase |
| `Body` | 16px | 24px | Regular 400 | Inter | Corpo padrão |
| `Body Highlight` | 16px | 24px | Semi Bold 600 | Inter | Ênfase no corpo |
| `Subtitle` | 16px | 20px | Medium 500 | Inter | Subtítulo, linha de apoio |
| `Body Small` | 14px | 20px | Regular 400 | Inter | Texto auxiliar, célula de tabela, hint |
| `Body Small Highlight` | 14px | 20px | Semi Bold 600 | Inter | Ênfase em texto auxiliar |
| `Label` | 14px | 20px | Medium 500 | Inter | Label de campo, header de coluna |
| `Link` | 14px | 20px | Semi Bold 600 | Inter | Link — sempre sublinhado |
| `Caption` | 12px | 18px | Regular 400 | Inter | Metadado, timestamp, hint de campo |
| `Caption Highlight` | 12px | 18px | Semi Bold 600 | Inter | Metadado com ênfase |
| `Mini` | 8px | 12px | Semi Bold 600 | Inter | Contador de badge |
| `Button Large` | 18px | 24px | Bold 700 | Inter | Label de botão Large |
| `Button` | 16px | 24px | Bold 700 | Inter | Label de botão Medium |
| `Button Small` | 14px | 20px | Bold 700 | Inter | Label de botão Small |

---

## Tokens — Spacing & Shapes

**Unidade base:** 8px (com meio-passo de 4px)
**Densidade:** confortável — o painel é lido em desktop com dados densos (tabela de parcelas, timeline)

### System Spacing — gaps de layout

| Token | Valor | Tailwind |
|-------|-------|----------|
| Spacing/1 | 2px | `gap-0.5` |
| Spacing/2 | 4px | `gap-1` |
| Spacing/3 | 8px | `gap-2` |
| Spacing/4 | 12px | `gap-3` |
| Spacing/5 | 16px | `gap-4` |
| Spacing/6 | 24px | `gap-6` |
| Spacing/7 | 32px | `gap-8` |
| Spacing/8 | 40px | `gap-10` |
| Spacing/9 | 48px | `gap-12` |

### Border Radius

| Token | Valor | CSS | Uso |
|-------|-------|-----|-----|
| Extra Small | 4px | `--radius-sm` | Badge, label, indicador |
| Default | 8px | `--radius-md` | Botão, input, card, sheet |
| Large | 12px | `--radius-lg` | Modal, dialog, alert |
| Full | 9999px | `rounded-full` | Pill, avatar, icon button |

### Shadows

| Token | Valor | Uso |
|-------|-------|-----|
| Focus | `0 0 0 3px rgba(204,21,0,0.25)` | Ring de foco de input/botão — sempre vermelho da marca |
| Card | `0 1px 3px rgba(0,0,0,0.08)` | Elevação suave de card em repouso |
| Popover | `0 4px 16px rgba(0,0,0,0.12)` | Dropdown, popover, sheet |

### Layout

- **Largura da Sidebar desktop (lg+):** 240px
- **Largura da Sidebar colapsada (md):** 64px
- **Altura do BottomNav (mobile):** 64px
- **Altura de campo e botão padrão:** 40px
- **Padding horizontal de página:** 24px (mobile) · 32px (desktop)
- **Gap entre seções:** 32px
- **Gap entre elementos:** 8px

---

## Surfaces

| Nível | Nome | Valor | Uso |
|-------|------|-------|-----|
| 0 | Background/Default | `#F7F4EF` | Canvas da aplicação — levemente mais escuro que o card |
| 1 | Surface/Default | `#FFFFFF` | Card, modal, input, drawer |
| 2 | Surface/Raised | `#FDFAF6` | Bloco agrupado dentro de card |
| 3 | Surface/Gray | `#F2F2F2` | Header de tabela, chip, hover de superfície |
| — | Surface/Brand | `#FFEAE6` | Item selecionado, destaque de marca |

O canvas é levemente mais escuro que o card — herança de papel impresso. A hierarquia sobe do fundo quente para o branco.

---

## Status de Parcela

Os seis estados de parcela têm sempre quatro camadas coordenadas:

| Status | Surface | Text/Icon | Border |
|--------|---------|-----------|--------|
| Pendente (a cobrar) | `#FEF3C7` | `#D97706` | `#D97706` |
| Em cobrança (enviado) | `#DBEAFE` | `#2563EB` | `#2563EB` |
| Aguardando | `#CCFBF1` | `#0D9488` | `#0D9488` |
| Pago | `#DCFCE7` | `#16A34A` | `#16A34A` |
| Escalado | `#EDE9FE` | `#7C3AED` | `#7C3AED` |
| Remarcado | `#CFFAFE` | `#0891B2` | `#0891B2` |
| Erro | `#FEE2E2` | `#DC2626` | `#DC2626` |

Nunca use cor de status de parcela para outro significado semântico.

---

## Components

### Button
Medium (default): altura 40px, padding `10px 24px`, gap 6px, radius 8px, fill `#CC1500`, label Inter Bold 16/24 em `#FFFFFF`. Hover troca fill por `#A11000`.

Variantes: `primary` (vermelho) · `outline` (borda `#E8E2D9`, texto `#1C1917`) · `ghost` (sem borda, hover `#F2F2F2`) · `destructive` (fill `#DC2626`).

Disable: fill `#E8E2D9`, texto `#A8A29E`, cursor `not-allowed`.

### Card
Padding 24px, radius 8px, fill `#FFFFFF`, borda 1px `#E8E2D9`. Sem sombra por padrão — escolha borda ou sombra, nunca os dois.

### Text Input
Radius 8px, fill `#FFFFFF`, borda 1px `#E8E2D9`, altura 40px, padding `8px 12px`. Foco: borda `#CC1500` + ring `0 0 0 3px rgba(204,21,0,0.25)`. Erro: borda `#DC2626`. Label Inter Medium 14/20 `#1C1917` acima, hint Inter Regular 12/18 `#78716C` abaixo, gap 6px entre os três.

### Badge de status
Inline, não interativo. Padding `2px 8px`, radius 4px, altura 22px, texto Inter Semi Bold 12/18. Usa as quatro camadas coordenadas da tabela de status acima.

### Item de menu lateral (Sidebar)
Altura 48px, padding `12px 16px`, radius 6px, gap 8px entre ícone e label. Repouso: ícone `#78716C`, label Inter Medium 14/20 `#1C1917`. Selecionado: fill `#FFEAE6`, ícone e label `#CC1500`. Hover: fill `#F2F2F2`.

### Linha de tabela
Header fill `#F2F2F2`, label Inter Medium 14/20 `#78716C`. Linha fill `#FFFFFF`, célula Inter Regular 14/20 `#1C1917`, divisória 1px `#E8E2D9`, hover `#F2F2F2`.

### Toast / notificação
Radius 8px, padding `12px 16px`, fill `#FFFFFF`, borda 1px `#E8E2D9`, sombra popover. Texto Inter Regular 14/20 `#1C1917`. Ícone de sucesso em `#16A34A`, erro em `#DC2626`.

### Sheet / Drawer
Fill `hsl(var(--background))` = `#F7F4EF` (mesma temperatura do canvas). Cabeçalho do formulário usa `--surface` = `#FFFFFF`. Barra sticky de botões no rodapé usa `bg-[hsl(var(--background))]` para não criar faixa branca sobre o fundo quente.

---

## Do's and Don'ts

### Do
- Use `#CC1500` para a ação principal — no máximo uma por tela. Todo o resto é outline, ghost ou link.
- Aplique estado de parcela como conjunto coordenado: Surface + Text + Icon + Border do mesmo status.
- Use o token de hover correspondente para hover. Nunca `opacity` nem `filter: brightness()`.
- Fique no grid de 8px, com 4px como meio-passo.
- Use `#1C1917` para texto principal e `#78716C` para apoio. Nunca preto puro `#000`.
- Use Barlow Condensed Bold para títulos e valores monetários; Inter para tudo mais.
- Aplique radius por papel: 8px em botão, input e card; 12px em modal e dialog; `full` em pill e avatar.
- Separe superfícies com borda 1px `#E8E2D9` **ou** sombra — nunca as duas na mesma superfície.
- No Sheet/Drawer, use `bg-[hsl(var(--background))]` na barra sticky do rodapé (o fundo do Sheet é `#F7F4EF`, não branco).

### Don't
- Não use cores de status de parcela para outro significado semântico.
- Não use `Surface/*` como fill de elemento interativo — surface é fundo, `Action/*` é fill.
- Não crie cor intermediária entre dois tokens. Se a cor não existe, o padrão é outro.
- Não use peso 700 em corpo de texto: ênfase no corpo é Semi Bold 600, Bold é para título e botão.
- Não use Barlow Condensed em corpo corrido — só em títulos e valores numéricos de destaque.
- Não empilhe mais de um alerta visível — priorize a mensagem mais acionável.
- Não escreva hex direto no JSX. Sempre via CSS variable (`var(--brand)`, `var(--status-paid)`, etc.).

---

## CSS Custom Properties (atual em `src/index.css`)

```css
:root {
  /* Canvas e superfícies */
  --background:      42 33% 95%;   /* #F7F4EF — canvas off-white quente (HSL para Tailwind) */
  --surface:         #FFFFFF;
  --surface-raised:  #FDFAF6;

  /* Texto */
  --text-primary:    #1C1917;
  --text-secondary:  #78716C;
  --text-muted:      #A8A29E;

  /* Marca */
  --brand:           #CC1500;
  --brand-hover:     #A11000;
  --brand-light:     #FFEAE6;

  /* Borda */
  --border:          #E8E2D9;

  /* Status de parcela */
  --status-pending:       #D97706;   --status-pending-bg:    #FEF3C7;
  --status-sent:          #2563EB;   --status-sent-bg:       #DBEAFE;
  --status-waiting:       #0D9488;   --status-waiting-bg:    #CCFBF1;
  --status-paid:          #16A34A;   --status-paid-bg:       #DCFCE7;
  --status-error:         #DC2626;   --status-error-bg:      #FEE2E2;
  --status-escalated:     #7C3AED;   --status-escalated-bg:  #EDE9FE;
  --status-rescheduled:   #0891B2;   --status-rescheduled-bg:#CFFAFE;

  /* Semânticos */
  --semantic-success: #1A7A4A;
  --semantic-warning: #D97706;
  --semantic-danger:  #CC1500;

  /* Neutros */
  --neutral-900: #0D0D0D;
  --neutral-800: #1A1A1A;
  --neutral-700: #2C2C2C;
  --neutral-500: #555555;
  --neutral-400: #999999;
  --neutral-200: #D4D4D4;
  --neutral-100: #F2F2F2;
  --neutral-50:  #FFFFFF;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Sombras */
  --shadow-focus: 0 0 0 3px rgba(204, 21, 0, 0.25);

  /* Fontes */
  --font-display: 'Barlow Condensed', sans-serif;
  --font-body:    'Inter', sans-serif;
}
```
