import { test, expect } from '@playwright/test'
import { login } from './helpers/setup'

test('AU1 — acessa rota protegida sem login e é redirecionado para /login', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/login')
})

test('AU2 — faz login com credenciais corretas e entra no sistema', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('seu@email.com').fill('rose@roseseguros.com.br')
  await page.locator('input[type="password"]').fill(process.env.TEST_PASSWORD!)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL('/dashboard-rose')
})

test('AU3 — faz login com senha errada e vê mensagem de erro', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('seu@email.com').fill('rose@roseseguros.com.br')
  await page.locator('input[type="password"]').fill('senha-errada')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByText('E-mail ou senha incorretos.')).toBeVisible()
  await expect(page).toHaveURL('/login')
})

test('AU4 — faz logout e rota protegida é bloqueada', async ({ page }) => {
  await login(page)
  // Botão "Sair" fica na Sidebar (visível em telas largas)
  await page.getByRole('button', { name: 'Sair' }).click()
  await expect(page).toHaveURL('/login')
  // Confirma que a rota protegida continua bloqueada
  await page.goto('/')
  await expect(page).toHaveURL('/login')
})
