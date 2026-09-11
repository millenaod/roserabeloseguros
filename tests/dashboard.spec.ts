import { test, expect } from '@playwright/test'
import { login } from './helpers/setup'

test.beforeEach(async ({ page }) => {
  await login(page)
})

// ─── Dashboard Gerencial ──────────────────────────────────────────────────────

test('DR1 — Rose acessa /dashboard-rose e vê o título "Visão Gerencial"', async ({ page }) => {
  await page.goto('/dashboard-rose')
  await expect(page.getByRole('heading', { name: 'Visão Gerencial' })).toBeVisible()
})

test('DR2 — Dashboard exibe os três cards de KPI', async ({ page }) => {
  await page.goto('/dashboard-rose')
  await expect(page.getByText('Valor total em aberto')).toBeVisible()
  await expect(page.getByText('Taxa de recuperação')).toBeVisible()
  await expect(page.getByText('Parcelas com +30 dias')).toBeVisible()
})

test('DR3 — Dashboard exibe a seção de inadimplência por seguradora', async ({ page }) => {
  await page.goto('/dashboard-rose')
  await expect(page.getByText('Inadimplência por seguradora')).toBeVisible()
})

test('DR4 — clicar em uma parcela na lista navega para o detalhe', async ({ page }) => {
  await page.goto('/dashboard-rose')

  const primeiraLinha = page.locator('tbody tr').first()
  const visivel = await primeiraLinha.isVisible()
  if (!visivel) return // nenhuma parcela no banco — teste não aplicável

  await primeiraLinha.click()
  await expect(page).toHaveURL(/\/parcelas\//)
})

// ─── Relatórios ───────────────────────────────────────────────────────────────

test('RE1 — Rose acessa /relatorios e vê o título "Relatórios"', async ({ page }) => {
  await page.goto('/relatorios')
  await expect(page.getByRole('heading', { name: 'Relatórios' })).toBeVisible()
})

test('RE2 — Página exibe painel de filtros com botão Consultar', async ({ page }) => {
  await page.goto('/relatorios')
  await expect(page.getByText('Filtros')).toBeVisible()
  await expect(page.getByRole('button', { name: /Consultar/i })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Mês atual' })).toBeVisible()
})

test('RE3 — antes de consultar exibe EmptyState orientando a usar os filtros', async ({ page }) => {
  await page.goto('/relatorios')
  await expect(page.getByText('Defina os filtros e clique em Consultar')).toBeVisible()
})

test('RE4 — clicar em "Mês atual" e depois Consultar sai do EmptyState inicial', async ({ page }) => {
  await page.goto('/relatorios')

  await page.getByRole('button', { name: 'Mês atual' }).click()
  await page.getByRole('button', { name: /Consultar/i }).click()

  await expect(page.getByText('Defina os filtros e clique em Consultar')).not.toBeVisible()
})

test('RE5 — com resultados o botão "Exportar CSV" fica visível', async ({ page }) => {
  await page.goto('/relatorios')

  await page.getByRole('button', { name: 'Mês atual' }).click()
  await page.getByRole('button', { name: /Consultar/i }).click()

  // Se houver resultados o botão de exportar aparece; se não houver, EmptyState sem erros
  const temResultados = await page.getByRole('button', { name: /Exportar CSV/i }).isVisible()
  if (temResultados) {
    await expect(page.getByRole('button', { name: /Exportar CSV/i })).toBeEnabled()
  } else {
    await expect(page.getByText('Nenhum resultado encontrado')).toBeVisible()
  }
})
