---
description: Fluxo OBRIGATÓRIO ao implementar ou corrigir qualquer feature no app Rose Rabelo Seguros. Garante paridade mobile, testes atualizados, uso do ambiente de teste e as convenções do projeto. Use SEMPRE antes de escrever código de feature ou correção (e ao revisar um PR).
---

# Desenvolvimento — Rose Rabelo Seguros

Checklist obrigatório para qualquer mudança de código. Não pule etapas "porque é pequeno" — foi assim que passou o menu sem link mobile e o upload sem policy. Se algo aqui não se aplicar, **diga explicitamente por quê** em vez de ignorar em silêncio.

Complementa (não substitui) a skill `ux-guidelines` (heurísticas de Nielsen) e o `CLAUDE.md`.

---

## 1. Ambiente — NUNCA mexer em produção

- Desenvolvimento e testes rodam **sempre** no projeto Supabase de **dev** (`gizrkcbrqkxurbamsvrx` / `cobranca-seguros-dev`), nunca no da Rose (`wjbcbiwfmlsfbgbxlief`).
- `.env.local` (usado por `npm run dev`) e `.env.test` apontam para o **dev**. Só `.env.production` aponta para a Rose.
- Toda migration/DDL é aplicada e validada **primeiro no dev**. Só replica na produção depois de confirmado.
- Depois de qualquer DDL, rodar o **advisor de segurança** do Supabase (`get_advisors`) — pega RLS faltando, view `SECURITY DEFINER`, função exposta ao anon.
- Convenção de RLS: `authenticated` acessa; `service_role` para o n8n; **`anon` não acessa nada**. Não recriar políticas `anon_*`. (Ver seção Segurança no `CLAUDE.md`.)

## 2. Paridade mobile — SEMPRE

O público principal (operadoras) usa **celular o dia inteiro**. Nenhuma tela ou navegação pode existir só no desktop.

- **Toda rota/link de navegação vive em DOIS lugares:** `src/components/Sidebar.jsx` (desktop) **e** `src/components/BottomNav.jsx` (mobile). Mudou um, atualize o outro. Se não couber na barra inferior (máx. ~4 abas + Perfil), coloque no menu de Perfil do `BottomNav`.
- Respeitar o perfil em ambos: rota `rose`-only (`/dashboard-rose`, `/relatorios`) só aparece para `rose` nos dois menus.
- Toda tela nova é verificada no viewport **iPhone** (o Playwright já tem o projeto `mobile`). Layout não pode vazar (usar `break-all`/`truncate`/`min-w-0` em valores longos como código de boleto).
- Modais/sheets: no mobile, **não empilhar** um `Dialog` por cima de um `Sheet` aberto — vira passo dentro do próprio sheet (ver `NovaParcelaSheet`).

## 3. Testes — SEMPRE, e sempre atualizados

Nenhuma feature ou correção fecha sem teste. É a regra que mais evita regressão.

- Testes ficam em `tests/*.spec.ts` (Playwright), helpers em `tests/helpers/setup.ts`.
- **Feature nova → teste novo.** **Bug corrigido → teste que reproduz o bug** (falharia antes do fix, passa depois).
- **Mudou uma tela que já tem teste → atualize o `.spec.ts` correspondente** no mesmo commit. Nunca deixe teste desatualizado.
- Cobrir os dois projetos quando fizer sentido: `desktop` e `mobile` (`tests/mobile.spec.ts`).
- Rodar antes de considerar pronto: `npx playwright test <arquivo>` do que mexeu, e `npm run lint`.
- Login de teste: usuária `millena.dutra@teste.local` (perfil `rose`) via `login(page)`; limpeza via `limparParcelas()` (usa `service_role`).

## 4. Convenções de código

- Dependência: `pages → hooks → services → supabase`. Nunca chamar `supabase` de página/componente.
- Validação no hook (`validar()` retorna erros); a tela só exibe.
- Cores/tipografia: só variáveis CSS (`var(--brand)`, `var(--text-primary)`…) e `font-display`/`font-body`. Nada de cor hardcoded do Tailwind.
- Feedback de ação assíncrona: botão `"Salvar" → "Salvando…"` + `disabled`; toast de sucesso/erro (`useToast`).
- **Cuidado com telas duplicadas:** `src/pages/NovaParcela.jsx` (página) e `src/components/NovaParcelaSheet.jsx` (sheet) têm o mesmo formulário. Mudou uma regra de negócio, reflita na outra.

## 5. Definition of Done (antes de dizer "pronto")

- [ ] Funciona no **desktop e no mobile** (Sidebar + BottomNav em sincronia; testado em viewport iPhone).
- [ ] `npm run lint` limpo.
- [ ] Teste novo/atualizado passando (`npx playwright test`).
- [ ] Se teve DDL: aplicado no **dev**, advisor de segurança limpo.
- [ ] `STATE.md` atualizado (o que mudou / pendências); `CLAUDE.md` se mudou arquitetura/convenção.
- [ ] Nada tocou dados de produção da Rose.
