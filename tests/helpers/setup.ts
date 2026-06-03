import { Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function login(page: Page) {
  await page.goto('/login')
  await page.getByPlaceholder('seu@email.com').fill('rose@roseseguros.com.br')
  await page.locator('input[type="password"]').fill(process.env.TEST_PASSWORD!)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('/dashboard-rose')
}

export async function limparParcelas() {
  await supabase
    .from('clientes')
    .delete()
    .ilike('nome', '%Teste%')
}
