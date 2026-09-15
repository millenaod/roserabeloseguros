import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

// Teste de isolamento multi-tenant no nível da API (RLS), que é onde a garantia
// de verdade mora: um usuário de uma empresa NUNCA pode ler os dados de outra.
// Não usa `page` — fala direto com o Supabase como dois usuários autenticados.

const url = process.env.VITE_SUPABASE_URL!
const anonKey = process.env.VITE_SUPABASE_ANON_KEY!
const admin = createClient(url, process.env.SUPABASE_SERVICE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const ORG_B_SLUG = 'org-teste-b'
const USER_B_EMAIL = 'vendedor.b@teste.local'
const USER_B_PASS = 'SenhaTesteB123!'

let orgAId: string
let orgBId: string
let userBId: string

// Semeia cliente → apólice → parcela numa org (via service_role, org_id explícito).
async function seedParcela(orgId: string, nomeCliente: string) {
  const { data: cliente, error: eCli } = await admin
    .from('clientes')
    .insert({ nome: nomeCliente, telefone: '5511900000000', org_id: orgId })
    .select('id')
    .single()
  if (eCli) throw new Error('seed cliente: ' + JSON.stringify(eCli))

  const { data: seg } = await admin.from('seguradoras').select('id').order('nome').limit(1).single()

  const { data: apolice, error: eApo } = await admin
    .from('apolices')
    .insert({ cliente_id: cliente!.id, seguradora_id: seg!.id, numero_apolice: 'ISO-TESTE', org_id: orgId })
    .select('id')
    .single()
  if (eApo) throw new Error('seed apolice: ' + JSON.stringify(eApo))

  const { error: ePar } = await admin.from('parcelas').insert({
    apolice_id: apolice!.id,
    numero_parcela: 1,
    valor: 100,
    data_vencimento: '2026-12-31',
    status: 'pendente',
    org_id: orgId,
  })
  if (ePar) throw new Error('seed parcela: ' + JSON.stringify(ePar))
}

test.beforeAll(async () => {
  // Org A = Rose (já existe do backfill)
  const { data: orgA } = await admin.from('organizacoes').select('id').eq('slug', 'rose-rabelo').single()
  orgAId = orgA!.id

  // Org B (nova empresa de teste)
  const { data: orgB } = await admin
    .from('organizacoes')
    .upsert({ nome: 'Org Teste B', slug: ORG_B_SLUG }, { onConflict: 'slug' })
    .select('id')
    .single()
  orgBId = orgB!.id

  // Usuário B de auth (cria ou reaproveita se rodou antes)
  const { data: created } = await admin.auth.admin.createUser({
    email: USER_B_EMAIL,
    password: USER_B_PASS,
    email_confirm: true,
  })
  if (created?.user) {
    userBId = created.user.id
  } else {
    const { data: list } = await admin.auth.admin.listUsers()
    userBId = list.users.find((u) => u.email === USER_B_EMAIL)!.id
    await admin.auth.admin.updateUserById(userBId, { password: USER_B_PASS })
  }
  await admin.from('usuarios').upsert({ id: userBId, nome: 'Vendedor B Teste', perfil: 'vendedor', org_id: orgBId })

  // Uma parcela em cada empresa
  await seedParcela(orgAId, 'Cliente A Teste')
  await seedParcela(orgBId, 'Cliente B Teste')
})

test.afterAll(async () => {
  // Limpa dados de teste das duas orgs
  const { data: clientes } = await admin.from('clientes').select('id').ilike('nome', '%Teste%')
  const clienteIds = (clientes ?? []).map((c) => c.id)
  if (clienteIds.length) {
    const { data: apolices } = await admin.from('apolices').select('id').in('cliente_id', clienteIds)
    const apoliceIds = (apolices ?? []).map((a) => a.id)
    if (apoliceIds.length) {
      const { data: parcelas } = await admin.from('parcelas').select('id').in('apolice_id', apoliceIds)
      const parcelaIds = (parcelas ?? []).map((p) => p.id)
      if (parcelaIds.length) {
        await admin.from('contatos').delete().in('parcela_id', parcelaIds)
        await admin.from('parcelas').delete().in('id', parcelaIds)
      }
      await admin.from('apolices').delete().in('id', apoliceIds)
    }
    await admin.from('clientes').delete().in('id', clienteIds)
  }
  // Remove usuário e org B
  if (userBId) {
    await admin.from('usuarios').delete().eq('id', userBId)
    await admin.auth.admin.deleteUser(userBId)
  }
  await admin.from('organizacoes').delete().eq('slug', ORG_B_SLUG)
})

test('usuário da org B não vê parcelas da org A, e vice-versa', async () => {
  const clientA = createClient(url, anonKey, { auth: { persistSession: false } })
  await clientA.auth.signInWithPassword({ email: process.env.TEST_EMAIL!, password: process.env.TEST_PASSWORD! })

  const clientB = createClient(url, anonKey, { auth: { persistSession: false } })
  await clientB.auth.signInWithPassword({ email: USER_B_EMAIL, password: USER_B_PASS })

  const { data: aVe } = await clientA.from('v_parcelas_ui').select('cliente_nome, org_id')
  const { data: bVe } = await clientB.from('v_parcelas_ui').select('cliente_nome, org_id')

  // Org A (Rose) enxerga só a própria org e nunca o cliente da org B
  expect(aVe!.length).toBeGreaterThan(0)
  expect(aVe!.every((r) => r.org_id === orgAId)).toBe(true)
  expect(aVe!.some((r) => r.cliente_nome === 'Cliente B Teste')).toBe(false)

  // Org B enxerga só a própria org: vê o próprio cliente e nunca o da org A
  expect(bVe!.every((r) => r.org_id === orgBId)).toBe(true)
  expect(bVe!.some((r) => r.cliente_nome === 'Cliente B Teste')).toBe(true)
  expect(bVe!.some((r) => r.cliente_nome === 'Cliente A Teste')).toBe(false)
})

test('parcela inserida pelo usuário B nasce com org_id de B (trigger)', async () => {
  const clientB = createClient(url, anonKey, { auth: { persistSession: false } })
  await clientB.auth.signInWithPassword({ email: USER_B_EMAIL, password: USER_B_PASS })

  // Não informa org_id: o trigger BEFORE INSERT deve preencher com a org de B.
  const { data: cliente, error } = await clientB
    .from('clientes')
    .insert({ nome: 'Cliente B Trigger Teste', telefone: '5511911111111' })
    .select('id, org_id')
    .single()

  expect(error).toBeNull()
  expect(cliente!.org_id).toBe(orgBId)
})
