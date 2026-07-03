import { test, expect } from '@playwright/test'
import { login, limparParcelas, criarClienteTeste } from './helpers/setup'

test.beforeEach(async ({ page }) => {
  await limparParcelas()
  await criarClienteTeste()
  await login(page)
})

// ─── Editar Cliente ───────────────────────────────────────────────────────────

test('C1 — editar cliente: altera o nome e confirma atualização no Sheet', async ({ page }) => {
  await page.goto('/carteira')
  await page.getByText('João da Silva Teste').click()

  await page.getByRole('button', { name: 'Editar' }).click()

  const dialog = page.getByRole('dialog')
  const nomeInput = dialog.getByRole('textbox').first()
  await nomeInput.clear()
  await nomeInput.fill('João Atualizado Teste')

  await dialog.getByRole('button', { name: 'Salvar' }).click()

  await expect(page.getByText('Cliente atualizado com sucesso')).toBeVisible()
  await expect(dialog.getByRole('heading')).toContainText('João Atualizado Teste')
})

// ─── Excluir Cliente ──────────────────────────────────────────────────────────

test('C2 — excluir cliente: confirma exclusão e cliente some da tabela', async ({ page }) => {
  await page.goto('/carteira')
  await page.getByText('João da Silva Teste').click()

  await page.getByRole('button', { name: 'Excluir' }).click()
  await page.getByRole('button', { name: 'Confirmar exclusão' }).click()

  await expect(page.getByText('Cliente excluído')).toBeVisible()
  await expect(page.getByText('João da Silva Teste')).not.toBeVisible()
})

test('C3 — excluir cliente: clicar em Cancelar mantém o cliente na lista', async ({ page }) => {
  await page.goto('/carteira')
  await page.getByText('João da Silva Teste').click()

  await page.getByRole('button', { name: 'Excluir' }).click()
  await expect(page.getByText('Essa ação não pode ser desfeita')).toBeVisible()
  await page.getByRole('button', { name: 'Cancelar' }).click()

  await expect(page.getByText('João da Silva Teste')).toBeVisible()
})
