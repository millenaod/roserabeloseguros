import { test, expect } from '@playwright/test'

// Tela /redefinir-senha — design CobraAI e estados da UI.
// Não dispara e-mail real; testa apenas a renderização dos estados.

test('redefinir-senha: estado inicial aguardando link mostra design CobraAI', async ({ page }) => {
  await page.goto('/redefinir-senha')

  // Logo CobraAI presente (wordmark é um span com texto "CobraAI")
  await expect(page.getByText('CobraAI').first()).toBeVisible()

  // Subtítulo correto
  await expect(page.getByText('Redefinir senha')).toBeVisible()

  // Estado "aguardando link" (sem evento PASSWORD_RECOVERY)
  await expect(page.getByText('Aguardando verificação do link…')).toBeVisible()
  await expect(page.getByRole('button', { name: /voltar ao login/i })).toBeVisible()
})

test('redefinir-senha: fundo branco (cobra-theme aplicado)', async ({ page }) => {
  await page.goto('/redefinir-senha')

  const body = page.locator('.cobra-theme').first()
  await expect(body).toBeVisible()

  // Garante que o card usa a borda CobraAI e não a borda Rose
  const card = page.locator('.border-cobra-border').first()
  await expect(card).toBeVisible()
})

test('redefinir-senha: botão voltar ao login navega para /login', async ({ page }) => {
  await page.goto('/redefinir-senha')

  await page.getByRole('button', { name: /voltar ao login/i }).click()
  await expect(page).toHaveURL(/\/login/)
})
