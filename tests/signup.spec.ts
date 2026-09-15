import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

// Signup self-service com confirmação de e-mail ligada.
// O provisionamento (empresa + usuário dono 'rose') acontece no insert do auth user
// via trigger handle_new_user — independente da confirmação. A UI, após o signUp,
// mostra a tela "Confirme seu e-mail".

const admin = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const stamp = Date.now()

// --- Teste de backend: provisionamento pelo trigger (via admin API, sem e-mail) ---
test('signup provisiona empresa + usuário dono (perfil rose) via trigger', async () => {
  const email = `cobra.prov.${stamp}@gmail.com`
  const empresa = `Corretora Prov ${stamp}`

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password: 'SenhaTeste123!',
    email_confirm: false,
    user_metadata: { nome_empresa: empresa, nome_usuario: 'Dono Teste' },
  })
  expect(error).toBeNull()
  const userId = created!.user!.id

  try {
    const { data: perfil } = await admin
      .from('usuarios')
      .select('perfil, nome, org_id')
      .eq('id', userId)
      .single()
    expect(perfil?.perfil).toBe('rose')
    expect(perfil?.nome).toBe('Dono Teste')

    const { data: org } = await admin
      .from('organizacoes')
      .select('nome, plano')
      .eq('id', perfil!.org_id)
      .single()
    expect(org?.nome).toBe(empresa)
    expect(org?.plano).toBe('free')
  } finally {
    const { data: perfil } = await admin.from('usuarios').select('org_id').eq('id', userId).maybeSingle()
    await admin.from('usuarios').delete().eq('id', userId)
    if (perfil?.org_id) await admin.from('organizacoes').delete().eq('id', perfil.org_id)
    await admin.auth.admin.deleteUser(userId)
  }
})

// --- Teste de UI: validação client-side antes de qualquer chamada ao Supabase ---
test('validação client-side bloqueia submit com campos inválidos', async ({ page }) => {
  await page.goto('/criar-conta')
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await expect(page.getByText('Informe o nome da empresa')).toBeVisible()
  await expect(page.getByText('E-mail inválido')).toBeVisible()
  await expect(page).toHaveURL(/\/criar-conta/)
})

// --- Teste de UI: tela de confirmação de e-mail (resposta do signup stubbada) ---
test('após criar conta, mostra a tela "Confirme seu e-mail"', async ({ page }) => {
  const email = `cobra.ui.${stamp}@gmail.com`

  // Stub do endpoint de signup: retorna um usuário sem sessão (== confirmação
  // pendente), de forma determinística e sem enviar e-mail de verdade.
  await page.route('**/auth/v1/signup**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: '00000000-0000-0000-0000-000000000000',
        aud: 'authenticated',
        role: 'authenticated',
        email,
        created_at: new Date().toISOString(),
        confirmation_sent_at: new Date().toISOString(),
        user_metadata: {},
        app_metadata: {},
        identities: [],
      }),
    })
  })

  await page.goto('/criar-conta')
  await page.getByPlaceholder('Ex: Rabelo Seguros').fill('Corretora UI Teste')
  await page.getByPlaceholder('Como você quer ser chamado').fill('Fulano Teste')
  await page.getByPlaceholder('seu@email.com').fill(email)
  await page.getByPlaceholder('Mínimo 6 caracteres').fill('SenhaTeste123!')
  await page.getByRole('button', { name: 'Criar conta' }).click()

  await expect(page.getByRole('heading', { name: 'Confirme seu e-mail' })).toBeVisible()
  await expect(page.getByText(email)).toBeVisible()
})
