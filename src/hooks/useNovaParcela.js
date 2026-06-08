import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listarSeguradoras } from '@/services/seguradoras'
import { salvarParcelaComCliente } from '@/services/parcelas'
import { telefoneCompleto, telefoneValido, moedaParaNumero, cpfValido } from '@/utils/mascaras'

const camposVazios = {
  clienteNome: '',
  clienteWhatsapp: '',
  cpf: '',
  seguradora_id: '',
  numero_parcela: '',
  valor: '',
  data_vencimento: '',
  tipo_pagamento: '',
  boletoFile: null,
  observacao: '',
}

export function useNovaParcela() {
  const [form, setForm] = useState(camposVazios)
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)

  const { data: seguradoras = [] } = useQuery({
    queryKey: ['seguradoras'],
    queryFn: () => listarSeguradoras().then(r => r.data ?? []),
    staleTime: 1000 * 60 * 10,
  })

  function atualizar(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }))
    if (erros[campo]) setErros(prev => ({ ...prev, [campo]: null }))
  }

  // Rótulo amigável de cada campo, pra nomear o que falta na mensagem de erro.
  const LABELS = {
    clienteNome: 'Nome', clienteWhatsapp: 'WhatsApp', cpf: 'CPF',
    seguradora_id: 'Seguradora', numero_parcela: 'Nº da parcela', valor: 'Valor',
    data_vencimento: 'Vencimento', tipo_pagamento: 'Tipo de pagamento', boletoFile: 'Boleto',
  }

  function validar() {
    const e = {}
    if (!form.clienteNome.trim())     e.clienteNome     = 'Informe o nome do cliente'
    if (!form.clienteWhatsapp.trim()) e.clienteWhatsapp = 'Informe o WhatsApp'
    else if (!telefoneValido(form.clienteWhatsapp)) e.clienteWhatsapp = 'WhatsApp incompleto (DDD + número)'
    if (!form.cpf.trim())             e.cpf             = 'Informe o CPF do cliente'
    else if (!cpfValido(form.cpf))    e.cpf             = 'CPF incompleto (11 dígitos)'
    if (!form.seguradora_id)          e.seguradora_id   = 'Selecione a seguradora'
    if (!form.numero_parcela)         e.numero_parcela  = 'Informe o número da parcela'
    if (!form.valor)                  e.valor           = 'Informe o valor'
    if (!form.data_vencimento)        e.data_vencimento = 'Informe a data de vencimento'
    if (!form.tipo_pagamento)         e.tipo_pagamento  = 'Selecione o tipo de pagamento'
    if (!form.boletoFile)             e.boletoFile      = 'Anexe o boleto'
    setErros(e)
    return e
  }

  async function salvar() {
    const e = validar()
    const faltando = Object.keys(e)
    if (faltando.length) {
      return { sucesso: false, motivo: 'validacao', campos: faltando.map(k => LABELS[k] ?? k) }
    }
    setSalvando(true)

    const { error } = await salvarParcelaComCliente({
      cliente_nome: form.clienteNome.trim(),
      telefone: telefoneCompleto(form.clienteWhatsapp),
      cpf: form.cpf.trim(),
      seguradora_id: form.seguradora_id,
      numero_parcela: Number(form.numero_parcela),
      valor: moedaParaNumero(form.valor),
      data_vencimento: form.data_vencimento,
      tipo_pagamento: form.tipo_pagamento,
      boletoFile: form.boletoFile,
    })

    setSalvando(false)
    if (error) return { sucesso: false, motivo: 'erro', erro: error }

    setForm(camposVazios)
    return { sucesso: true }
  }

  return {
    form, erros, salvando, seguradoras,
    atualizar, salvar,
  }
}
