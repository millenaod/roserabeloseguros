import { supabase } from '@/lib/supabase'

export async function buscarParcelas(filtros = {}) {
  let query = supabase.from('v_parcelas_acao').select('*')

  if (filtros.seguradora_id) query = query.eq('seguradora_id', filtros.seguradora_id)
  if (filtros.status)        query = query.eq('status', filtros.status)
  if (filtros.vencimento_ate) query = query.lte('data_vencimento', filtros.vencimento_ate)

  query = query.order('data_vencimento', { ascending: true })

  const { data, error } = await query
  if (error) console.error('buscarParcelas:', error)
  return { data, error }
}

export async function buscarParcelaPorId(id) {
  const { data, error } = await supabase
    .from('v_parcelas_acao')
    .select('*')
    .eq('id', id)
    .single()

  if (error) console.error('buscarParcelaPorId:', error)
  return { data, error }
}

export async function inserirParcela({ cliente_id, seguradora_id, numero_apolice, numero_parcela, valor, data_vencimento, observacao }) {
  // Busca ou cria a apólice
  let apolice_id
  const { data: apoliceExistente } = await supabase
    .from('apolices')
    .select('id')
    .eq('cliente_id', cliente_id)
    .eq('seguradora_id', seguradora_id)
    .eq('numero', numero_apolice)
    .maybeSingle()

  if (apoliceExistente) {
    apolice_id = apoliceExistente.id
  } else {
    const { data: novaApolice, error: erroApolice } = await supabase
      .from('apolices')
      .insert({ cliente_id, seguradora_id, numero: numero_apolice })
      .select('id')
      .single()

    if (erroApolice) {
      console.error('inserirParcela (apolice):', erroApolice)
      return { data: null, error: erroApolice }
    }
    apolice_id = novaApolice.id
  }

  // Insere a parcela
  const { data, error } = await supabase
    .from('parcelas')
    .insert({ apolice_id, numero: numero_parcela, valor, data_vencimento, observacao, status: 'pendente' })
    .select('id')
    .single()

  if (error) console.error('inserirParcela:', error)
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
