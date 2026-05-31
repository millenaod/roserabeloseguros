import { supabase } from '@/lib/supabase'

export async function buscarParcelas(filtros = {}) {
  let query = supabase.from('v_parcelas_ui').select('*')

  if (filtros.seguradora_id)  query = query.eq('seguradora_id', filtros.seguradora_id)
  if (filtros.status)         query = query.eq('status', filtros.status)
  if (filtros.vencimento_ate) query = query.lte('data_vencimento', filtros.vencimento_ate)

  query = query.order('data_vencimento', { ascending: true })

  const { data, error } = await query
  if (error) console.error('buscarParcelas:', error)
  return { data, error }
}

export async function buscarParcelaPorId(id) {
  const { data, error } = await supabase
    .from('v_parcelas_ui')
    .select('*')
    .eq('parcela_id', id)
    .single()

  if (error) console.error('buscarParcelaPorId:', error)
  return { data, error }
}

export async function salvarParcelaComCliente({ cliente_nome, cpf_cnpj, telefone, seguradora_id, numero_apolice, numero_parcela, valor, data_vencimento }) {
  // 1. Busca ou cria cliente pelo CPF/CNPJ
  let cliente_id
  const { data: clienteExistente } = await supabase
    .from('clientes')
    .select('id')
    .eq('cpf_cnpj', cpf_cnpj)
    .maybeSingle()

  if (clienteExistente) {
    cliente_id = clienteExistente.id
  } else {
    const { data: novoCliente, error } = await supabase
      .from('clientes')
      .insert({ nome: cliente_nome, cpf_cnpj, telefone, whatsapp_valido: true })
      .select('id')
      .single()
    if (error) { console.error('salvarParcelaComCliente (cliente):', error); return { error } }
    cliente_id = novoCliente.id
  }

  // 2. Busca ou cria apólice
  let apolice_id
  const { data: apoliceExistente } = await supabase
    .from('apolices')
    .select('id')
    .eq('cliente_id', cliente_id)
    .eq('seguradora_id', seguradora_id)
    .eq('numero_apolice', numero_apolice)
    .maybeSingle()

  if (apoliceExistente) {
    apolice_id = apoliceExistente.id
  } else {
    const { data: novaApolice, error } = await supabase
      .from('apolices')
      .insert({ cliente_id, seguradora_id, numero_apolice })
      .select('id')
      .single()
    if (error) { console.error('salvarParcelaComCliente (apolice):', error); return { error } }
    apolice_id = novaApolice.id
  }

  // 3. Insere parcela
  const { data, error } = await supabase
    .from('parcelas')
    .insert({ apolice_id, numero_parcela, valor, data_vencimento, status: 'pendente' })
    .select('id')
    .single()

  if (error) console.error('salvarParcelaComCliente (parcela):', error)
  return { data, error }
}

export async function atualizarStatus(id, status) {
  const { data, error } = await supabase
    .from('parcelas')
    .update({ status })
    .eq('id', id)
    .select('id')
    .single()

  if (error) console.error('atualizarStatus:', error)
  return { data, error }
}
