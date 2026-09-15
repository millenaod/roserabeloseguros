import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

// admin-usuarios (gerente cria/lista usuários da PRÓPRIA empresa). Multi-tenant:
// insere com o org_id do gerente e o GET não pode vazar usuários de outra org.

const url = process.env.VITE_SUPABASE_URL!
const anonKey = process.env.VITE_SUPABASE_ANON_KEY!
const admin = createClient(url, process.env.SUPABASE_SERVICE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function comoGerente() {
  const cli = createClient(url, anonKey, { auth: { persistSession: false } })
  await cli.auth.signInWithPassword({ email: process.env.TEST_EMAIL!, password: process.env.TEST_PASSWORD! })
  return cli // millena: perfil 'rose', org Rose
}

test('POST cria usuário vinculado à org do gerente (org_id correto)', async () => {
  const cli = await comoGerente()
  const email = `au.${Date.now()}@gmail.com`

  const { error } = await cli.functions.invoke('admin-usuarios', {
    body: { nome: 'Vendedor AU Teste', email, senha: 'SenhaTeste123!', perfil: 'vendedor' },
  })
  expect(error).toBeFalsy()

  const { data: rose } = await admin.from('organizacoes').select('id').eq('slug', 'rose-rabelo').single()
  const { data: list } = await admin.auth.admin.listUsers()
  const novo = list!.users.find((u) => u.email === email)!
  try {
    const { data: perfil } = await admin.from('usuarios').select('org_id, perfil').eq('id', novo.id).single()
    expect(perfil?.org_id).toBe(rose!.id)
    expect(perfil?.perfil).toBe('vendedor')
  } finally {
    await admin.from('usuarios').delete().eq('id', novo.id)
    await admin.auth.admin.deleteUser(novo.id)
  }
})

test('GET não vaza usuários de outra org', async () => {
  // Seed: org B + um usuário nela com nome distinto
  const marca = `OrgB-${Date.now()}`
  const { data: orgB } = await admin.from('organizacoes')
    .upsert({ nome: 'Org B admin-usuarios', slug: `orgb-au-${Date.now()}` }, { onConflict: 'slug' })
    .select('id').single()
  const { data: created } = await admin.auth.admin.createUser({
    email: `orgb.${Date.now()}@gmail.com`, password: 'SenhaTeste123!', email_confirm: true,
  })
  const uidB = created!.user!.id
  await admin.from('usuarios').insert({ id: uidB, nome: marca, perfil: 'vendedor', org_id: orgB!.id })

  try {
    const cli = await comoGerente() // org Rose
    const { data, error } = await cli.functions.invoke('admin-usuarios', { method: 'GET' })
    expect(error).toBeFalsy()
    const nomes = (data?.usuarios ?? []).map((u: any) => u.nome)
    // O usuário da org B NÃO pode aparecer para o gerente da org Rose
    expect(nomes).not.toContain(marca)
  } finally {
    await admin.from('usuarios').delete().eq('id', uidB)
    await admin.auth.admin.deleteUser(uidB)
    await admin.from('organizacoes').delete().eq('id', orgB!.id)
  }
})
