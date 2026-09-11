import { test, expect } from '@playwright/test'
import { login } from './helpers/setup'

test.beforeEach(async ({ page }) => {
  await login(page)
})

test('N1 — Sidebar (desktop) tem link para a Visão Gerencial', async ({ page }) => {
  await expect(page.getByRole('link', { name: 'Visão Gerencial' })).toBeVisible()
})

test('N2 — rose sai da Visão Gerencial e consegue voltar pelo menu (bug do menu sem retorno)', async ({ page }) => {
  // Pós-login o perfil rose cai na visão gerencial
  await expect(page).toHaveURL('/dashboard-rose')

  // Navega para outra tela...
  await page.getByRole('link', { name: 'Parcelas' }).click()
  await expect(page).toHaveURL('/')

  // ...e consegue VOLTAR para a gerencial pelo menu (antes não havia link)
  await page.getByRole('link', { name: 'Visão Gerencial' }).click()
  await expect(page).toHaveURL('/dashboard-rose')
})
