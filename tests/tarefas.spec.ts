import { test, expect } from '@playwright/test'
import { login, limparParcelas, criarClienteTeste } from './helpers/setup'

test.beforeEach(async ({ page }) => {
  await limparParcelas()
  await login(page)
})

// ─── Estrutura da página ──────────────────────────────────────────────────────

test('TA1 — acessa /tarefas e vê o título "Tarefas do dia"', async ({ page }) => {
  await page.goto('/tarefas')
  await expect(page.getByRole('heading', { name: 'Tarefas do dia' })).toBeVisible()
})

test('TA2 — sem parcelas pendentes exibe EmptyState "Tudo em dia!"', async ({ page }) => {
  await page.goto('/tarefas')
  await expect(page.getByText('Tudo em dia!')).toBeVisible()
})

// ─── Com parcela pendente ─────────────────────────────────────────────────────

test('TA3 — card exibe nome do cliente e botões de ação', async ({ page }) => {
  await criarClienteTeste()
  await page.goto('/tarefas')

  await expect(page.getByText('João da Silva Teste')).toBeVisible()
  await expect(page.getByRole('button', { name: /Cobrar de novo/i }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Marcar paga/i }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Escalar/i }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Desconsiderar/i }).first()).toBeVisible()
})

test('TA4 — clicar no nome do cliente navega para o detalhe da parcela', async ({ page }) => {
  await criarClienteTeste()
  await page.goto('/tarefas')

  await page.getByText('João da Silva Teste').click()

  await expect(page).toHaveURL(/\/parcelas\//)
  await expect(page.getByText('Dados da parcela')).toBeVisible()
})

test('TA5 — clicar em "Escalar" exibe toast e remove o card da lista', async ({ page }) => {
  await criarClienteTeste()
  await page.goto('/tarefas')

  await page.getByRole('button', { name: /Escalar/i }).first().click()

  await expect(page.getByText('Escalada para o vendedor.').first()).toBeVisible()
  await expect(page.getByText('João da Silva Teste')).not.toBeVisible()
})

test('TA6 — clicar em "Marcar paga" exibe toast e remove o card da lista', async ({ page }) => {
  await criarClienteTeste()
  await page.goto('/tarefas')

  await page.getByRole('button', { name: /Marcar paga/i }).first().click()

  await expect(page.getByText('Marcada como paga!').first()).toBeVisible()
  await expect(page.getByText('João da Silva Teste')).not.toBeVisible()
})

test('TA7 — clicar em "Desconsiderar" exibe toast e remove o card da lista', async ({ page }) => {
  await criarClienteTeste()
  await page.goto('/tarefas')

  await page.getByRole('button', { name: /Desconsiderar/i }).first().click()

  await expect(page.getByText('Parcela desconsiderada.').first()).toBeVisible()
  await expect(page.getByText('João da Silva Teste')).not.toBeVisible()
})

// ─── Dialog "Cobrar de novo" ──────────────────────────────────────────────────

test('TA8 — clicar em "Cobrar de novo" abre dialog com aviso de boleto obrigatório', async ({ page }) => {
  await criarClienteTeste()
  await page.goto('/tarefas')

  await page.getByRole('button', { name: /Cobrar de novo/i }).first().click()

  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByText('O template exige um boleto anexado.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Enviar' })).toBeDisabled()
})

test('TA9 — cancelar o dialog de cobrança fecha sem disparar envio', async ({ page }) => {
  await criarClienteTeste()
  await page.goto('/tarefas')

  await page.getByRole('button', { name: /Cobrar de novo/i }).first().click()
  await expect(page.getByRole('dialog')).toBeVisible()

  await page.getByRole('button', { name: 'Cancelar' }).click()

  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(page.getByText('João da Silva Teste')).toBeVisible()
})
