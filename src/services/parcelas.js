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

// Sobe o anexo do boleto (PDF/imagem) para o bucket `boletos` e devolve a URL pública.
export async function uploadBoleto(file) {
  const ext = (file.name?.split('.').pop() || 'pdf').toLowerCase()
  const caminho = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage
    .from('boletos')
    .upload(caminho, file, { contentType: file.type || undefined, upsert: false })
  if (error) { console.error('uploadBoleto:', error); return { error } }

  const { data } = supabase.storage.from('boletos').getPublicUrl(caminho)
  return { url: data.publicUrl }
}

export async function salvarParcelaComCliente({ cliente_nome, telefone, cpf, seguradora_id, numero_apolice, numero_parcela, valor, data_vencimento, tipo_pagamento, boletoFile }) {
  // Sobe o boleto primeiro: se falhar, não cria cliente órfão.
  let boleto_url = null
  if (boletoFile) {
    const { url, error } = await uploadBoleto(boletoFile)
    if (error) return { error }
    boleto_url = url
  }

  // Cria o cliente na hora. Nome + WhatsApp personalizam e enviam a mensagem.
  const { data: cliente, error: erroCliente } = await supabase
    .from('clientes')
    .insert({ nome: cliente_nome, telefone, cpf_cnpj: cpf || null, whatsapp_valido: true })
    .select('id')
    .single()
  if (erroCliente) { console.error('salvarParcelaComCliente (cliente):', erroCliente); return { error: erroCliente } }

  return criarApoliceEParcela({
    cliente_id: cliente.id,
    seguradora_id,
    numero_apolice,
    numero_parcela,
    valor,
    data_vencimento,
    tipo_pagamento,
    boleto_url,
  })
}

// Cria (ou reaproveita) a apólice e insere a parcela a partir de um cliente já existente.
// Usado pelo cadastro simples, onde o cliente é criado na hora pelo nome.
export async function criarApoliceEParcela({ cliente_id, seguradora_id, numero_apolice, numero_parcela, valor, data_vencimento, tipo_pagamento, boleto_url }) {
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
    if (error) { console.error('criarApoliceEParcela (apolice):', error); return { error } }
    apolice_id = novaApolice.id
  }

  const { data, error } = await supabase
    .from('parcelas')
    .insert({
      apolice_id, numero_parcela, valor, data_vencimento, status: 'pendente',
      tipo_pagamento: tipo_pagamento || null,
      boleto_url: boleto_url || null,
    })
    .select('id')
    .single()

  if (error) console.error('criarApoliceEParcela (parcela):', error)
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
