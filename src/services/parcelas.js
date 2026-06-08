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
// O número da apólice é opcional (o cadastro identifica o cliente pelo CPF).
export async function criarApoliceEParcela({ cliente_id, seguradora_id, numero_apolice = null, numero_parcela, valor, data_vencimento, tipo_pagamento, boleto_url }) {
  let apolice_id

  // Só tenta reaproveitar uma apólice existente quando há número para casar.
  let apoliceExistente = null
  if (numero_apolice) {
    const { data } = await supabase
      .from('apolices')
      .select('id')
      .eq('cliente_id', cliente_id)
      .eq('seguradora_id', seguradora_id)
      .eq('numero_apolice', numero_apolice)
      .maybeSingle()
    apoliceExistente = data
  }

  if (apoliceExistente) {
    apolice_id = apoliceExistente.id
  } else {
    const { data: novaApolice, error } = await supabase
      .from('apolices')
      .insert({ cliente_id, seguradora_id, numero_apolice: numero_apolice || null })
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

// Parcelas cadastradas hoje (mais recentes primeiro) — alimenta o histórico da tela Nova Parcela.
export async function parcelasDeHoje() {
  const inicioHoje = new Date(); inicioHoje.setHours(0, 0, 0, 0)
  const { data, error } = await supabase
    .from('v_parcelas_ui')
    .select('parcela_id, cliente_nome, cliente_cpf, seguradora_nome, valor, numero_parcela, criado_em')
    .gte('criado_em', inicioHoje.toISOString())
    .order('criado_em', { ascending: false })
  if (error) console.error('parcelasDeHoje:', error)
  return { data: data ?? [], error }
}

// Parcelas que precisam de atenção hoje (tudo que não está pago nem já escalado),
// urgentes (cobertura em risco / mais dias de atraso) no topo. Alimenta o Painel de Tarefas.
export async function parcelasParaRevisar() {
  const { data, error } = await supabase
    .from('v_parcelas_ui')
    .select('parcela_id, cliente_nome, cliente_telefone, seguradora_nome, valor, numero_parcela, status, dias_atraso, cobertura_em_risco, total_contatos, ultimo_contato_em, tipo_pagamento')
    .not('status', 'in', '("pago","escalado")')
    .order('cobertura_em_risco', { ascending: false })
    .order('dias_atraso', { ascending: false })
  if (error) console.error('parcelasParaRevisar:', error)
  return { data: data ?? [], error }
}

// Dispara uma nova cobrança chamando o mesmo webhook do n8n que o cadastro aciona.
const N8N_COBRANCA_URL = 'https://millenaod.app.n8n.cloud/webhook/parcela-nova'
export async function solicitarNovaCobranca(parcelaId) {
  try {
    const resp = await fetch(N8N_COBRANCA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ record: { id: parcelaId } }),
    })
    if (!resp.ok) return { error: new Error('Falha ao acionar a cobrança (HTTP ' + resp.status + ')') }
    return { error: null }
  } catch (e) {
    console.error('solicitarNovaCobranca:', e)
    return { error: e }
  }
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
