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

export async function criarClienteTeste() {
  const { data: cliente } = await supabase
    .from('clientes')
    .insert({ nome: 'João da Silva Teste', telefone: '5511999990001', cpf_cnpj: '529.982.247-25' })
    .select('id')
    .single()

  const { data: seg } = await supabase
    .from('seguradoras')
    .select('id')
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

  return { clienteId: cliente!.id, parcelaId: parcela!.id }
}
