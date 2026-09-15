---
description: Diretrizes de UX para o projeto Rose Rabelo Seguros — heurísticas de Nielsen, boas práticas e padrões de interface do projeto.
---

# UX Guidelines — Rose Rabelo Seguros

Use este documento ao criar ou revisar qualquer tela, componente ou interação. O público principal são operadoras (Thainá) que usam o sistema o dia inteiro, principalmente em celular.

---

## Heurísticas de Nielsen aplicadas ao projeto

### 1. Visibilidade do status do sistema
- Toda ação assíncrona (salvar, excluir, enviar cobrança) deve mudar o texto do botão: `"Salvar"` → `"Salvando…"` e desabilitar o botão durante a operação.
- Após sucesso: toast de confirmação (já temos `useToast`). Após erro: toast destrutivo com mensagem clara.
- Nunca deixar o usuário sem feedback por mais de 1 segundo.

### 2. Correspondência com o mundo real
- Usar linguagem do seguro: "parcela", "apólice", "seguradora", "boleto", "vencimento" — não jargão técnico como "record", "entry", "item".
- Datas sempre em `DD/MM/YYYY`. Moeda sempre `R$ 1.234,56`.
- Status em português: "Em aberto", "Pago", "Vencido", "Desconsiderada".

### 3. Controle e liberdade do usuário
- Toda ação destrutiva (excluir cliente, excluir parcela) exige Dialog de confirmação com descrição do impacto ("isso vai excluir X parcelas").
- Formulários com várias etapas (ex: NovaParcela) têm passo de revisão antes de salvar.
- Fechar um Sheet/Dialog com dados preenchidos não deve perder o rascunho sem aviso — ou limpar só ao confirmar o cancelamento.

### 4. Consistência e padrões
- Botão primário: sempre `style={{ backgroundColor: 'var(--brand)', color: 'white' }}` — nunca hardcode de cor.
- Botão destrutivo: `variant="outline"` com `text-[var(--status-error)]` e `border-[var(--status-error)]`, não `variant="destructive"` do Radix (que usa cor diferente da paleta do projeto).
- Labels de campo: sempre `text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]`.
- Erros inline abaixo do campo: `text-xs text-[var(--status-error)]`.

### 5. Prevenção de erros
- Validação acontece antes de qualquer chamada ao banco — nunca deixar o servidor rejeitar o que o frontend podia validar.
- CPF/CNPJ: usar `mascararCpfCnpj` + `cpfCnpjValido` (11 ou 14 dígitos).
- Telefone: usar `mascararTelefone` + `telefoneValido` (10 ou 11 dígitos com DDD).
- Botão de salvar desabilitado enquanto `salvando === true`.

### 6. Reconhecer em vez de lembrar
- Selects populados com os dados do banco (seguradoras, tipos de pagamento) — nunca campo livre onde o usuário tem que memorizar o nome exato.
- Status exibido como badge colorido, não só texto.
- Revisão antes de salvar (componente de revisão com `LinhaRevisao`) para parcelas novas.

### 7. Flexibilidade e eficiência
- Busca de cliente por nome em tempo real (sem botão de buscar).
- Filtros rápidos (botões de grupo: Todos / Com pendência / Em dia) — sem dropdown.
- Ação principal sempre acessível: botão fixo no rodapé em formulários longos.

### 8. Design estético e minimalista
- Mostrar só o que é necessário para a tarefa atual. Histórico de parcelas pagas fica recolhido em `<details>`.
- Evitar modais aninhados — um Sheet + um Dialog de confirmação é o máximo.
- Separadores (`<Separator>`) para agrupar seções sem poluir com bordas desnecessárias.

### 9. Ajudar a reconhecer, diagnosticar e recuperar erros
- Mensagens de erro em linguagem humana: "WhatsApp incompleto (DDD + número)", não "Invalid phone format".
- Conflito de CPF: mostrar lado a lado o que está no sistema vs. o que foi digitado — deixar a operadora decidir.
- Erro de rede: toast com mensagem e a tela permanece preenchida para tentar novamente.

### 10. Ajuda e documentação
- A página `/ajuda` já existe — redirecionar dúvidas frequentes para lá, não colocar texto explicativo inline nas telas.

---

## Padrões de interface do projeto

### Sheets (painéis laterais)
- Sempre `side="right"`, `className="w-full sm:max-w-lg overflow-y-auto"`.
- Header com `pr-6` para não sobrepor o botão X do Radix.
- Botões de ação (WhatsApp, Editar, Excluir) em uma linha **abaixo** do header, nunca dentro dele — o X de fechar fica no canto superior direito e conflita com ícones próximos.
- Conteúdo destrutivo (excluir) sempre como último botão da linha, com estilo visual diferenciado (cor de erro), mas **não** separado do grupo de ações — isso evita clique acidental enquanto mantém a ação acessível.

### Dialogs de confirmação
- Título descreve a ação: "Excluir cliente", não "Tem certeza?".
- Corpo explica o impacto específico: "Isso vai excluir João Silva e 3 parcelas vinculadas."
- Botões: `"Cancelar"` (ghost, à esquerda) e `"Confirmar exclusão"` (destrutivo, à direita).
- Desabilitar ambos os botões durante a operação, mostrar "Excluindo…" no botão de confirmação.

### Formulários
- Campos obrigatórios não usam asterisco (*) — validação acontece ao tentar salvar.
- `inputMode="numeric"` em campos de CPF/CNPJ, telefone e moeda (abre teclado numérico no mobile).
- Prefixos fixos (+55, R$) como `span` absoluto dentro de `div relative`, com padding no input (`pl-12`, `pl-9`).
- Campos agrupados em grid 2 colunas quando são curtos (CPF + Nº Parcela, Valor + Vencimento).

### Toasts
- Sucesso: `toast({ title: 'Mensagem de confirmação' })` — sem `variant`.
- Erro: `toast({ title: 'Descrição do erro', variant: 'destructive' })`.
- Mensagens curtas, sem ponto final.

### Mobile first
- O sistema é usado principalmente em celular. Testar sempre em viewport mobile (375px).
- `BottomNav` no mobile, `Sidebar` no desktop — não duplicar navegação.
- Tabelas têm colunas `hidden md:table-cell` para colunas secundárias.
- Botões de ação com tamanho mínimo de 44×44px (área de toque).

### Estados vazios
- Usar `<EmptyState icone={...} titulo="..." descricao="..." />` — nunca `null` ou tela em branco.
- Skeleton durante carregamento: `<Skeleton className="h-X w-full" />` em loop.

---

## O que evitar

- **Não** usar `alert()`, `confirm()` ou `prompt()` do browser — usar Dialog do Radix.
- **Não** navegar para outra rota para confirmar uma ação — Dialog inline.
- **Não** colocar botão de excluir próximo ao botão de fechar um painel (X do Sheet).
- **Não** resetar o formulário inteiro ao fechar acidentalmente — limpar só ao salvar com sucesso ou cancelar explicitamente.
- **Não** exibir IDs do banco para o usuário.
- **Não** usar loading global (spinner de tela cheia) para operações parciais — usar estado local no botão.
