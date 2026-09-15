import { test, expect } from '@playwright/test'
import { login } from './helpers/setup'
import { createClient } from '@supabase/supabase-js'

// Painel super-admin: só quem tem a flag super_admin acessa /admin. A usuária de
// teste do dev (millena.dutra@teste.local) está marcada como super_admin.

const admin = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})

test('super-admin acessa /admin e vê a lista de empresas', async ({ page }) => {
  await login(page) // super_admin → /dashboard-rose
  await page.goto('/admin')

  await expect(page.getByRole('heading', { name: 'Empresas' })).toBeVisible()
  // A org da Rose sempre existe no dev (backfill)
  await expect(page.getByText('Rose Rabelo Seguros')).toBeVisible()
})

test('usuário sem super_admin é barrado no /admin', async ({ page }) => {
  const email = `naoadmin.${Date.now()}@gmail.com`
  const senha = 'SenhaTeste123!'
  const { data: rose } = await admin.from('organizacoes').select('id').eq('slug', 'rose-rabelo').single()
  const { data: created } = await admin.auth.admin.createUser({ email, password: senha, email_confirm: true })
  const uid = created!.user!.id
  await admin.from('usuarios').insert({ id: uid, nome: 'Não Admin', perfil: 'vendedor', org_id: rose!.id })

  try {
    await page.goto('/login')
    await page.getByPlaceholder('seu@email.com').fill(email)
    await page.locator('input[type="password"]').fill(senha)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('/carteira') // vendedor

    await page.goto('/admin')
    // Gate super_admin redireciona para fora do /admin
    await expect(page).not.toHaveURL(/\/admin/)
  } finally {
    await admin.from('usuarios').delete().eq('id', uid)
    await admin.auth.admin.deleteUser(uid)
  }
})
