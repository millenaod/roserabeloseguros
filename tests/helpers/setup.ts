import { Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function login(page: Page) {
  await page.goto('/login')
  await page.getByPlaceholder('seu@email.com').fill(process.env.TEST_EMAIL!)
  await page.locator('input[type="password"]').fill(process.env.TEST_PASSWORD!)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('/dashboard-rose')
}

export async function limparParcelas() {
  const { data: clientes } = await supabase
    .from('clientes')
    .select('id')
    .ilike('nome', '%Teste%')
  if (!clientes?.length) return

  const clienteIds = clientes.map(c => c.id)

  const { data: apolices } = await supabase
    .from('apolices')
    .select('id')
    .in('cliente_id', clienteIds)

  if (apolices?.length) {
    const apoliceIds = apolices.map(a => a.id)

    const { data: parcelas } = await supabase
      .from('parcelas')
      .select('id')
      .in('apolice_id', apoliceIds)

    if (parcelas?.length) {
      const parcelaIds = parcelas.map(p => p.id)
      await supabase.from('contatos').delete().in('parcela_id', parcelaIds)
      await supabase.from('parcelas').delete().in('id', parcelaIds)
    }
    await supabase.from('apolices').delete().in('id', apoliceIds)
  }

  await supabase.from('clientes').delete().in('id', clienteIds)
}

// org_id agora é NOT NULL. Inserts via service_role (como este helper) NÃO passam
// pelo trigger de auth (não há auth.uid()), então precisam informar o org_id.
export async function getOrgId(slug = 'rose-rabelo') {
  const { data } = await supabase
    .from('organizacoes')
    .select('id')
    .eq('slug', slug)
    .single()
  return data!.id as string
}

export async function criarClienteTeste(orgId?: string) {
  const org = orgId ?? (await getOrgId())
  const { data: cliente } = await supabase
    .from('clientes')
    .insert({ nome: 'João da Silva Teste', telefone: '5511999990001', cpf_cnpj: '529.982.247-25', org_id: org })
    .select('id')
    .single()

  const { data: seg } = await supabase
    .from('seguradoras')
    .select('id, nome')
    .order('nome')
    .limit(1)
    .single()

  const { data: apolice } = await supabase
    .from('apolices')
    .insert({ cliente_id: cliente!.id, seguradora_id: seg!.id, numero_apolice: 'TEST-AUTO-001' })
    .select('id')
    .single()

  const { data: parcela } = await supabase
    .from('parcelas')
    .insert({
      apolice_id: apolice!.id,
      numero_parcela: 1,
      valor: 250,
      data_vencimento: '2026-12-31',
      status: 'pendente',
    })
    .select('id')
    .single()

  return { clienteId: cliente!.id, parcelaId: parcela!.id, seguradoraNome: seg!.nome as string }
}
