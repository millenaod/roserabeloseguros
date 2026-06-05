import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listarSeguradoras } from '@/services/seguradoras'
import { salvarParcelaComCliente } from '@/services/parcelas'
import { telefoneCompleto, telefoneValido, moedaParaNumero } from '@/utils/mascaras'

const camposVazios = {
  clienteNome: '',
  clienteWhatsapp: '',
  seguradora_id: '',
  numero_apolice: '',
  numero_parcela: '',
  valor: '',
  data_vencimento: '',
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

  function validar() {
    const e = {}
    if (!form.clienteNome.trim())     e.clienteNome     = 'Informe o nome do cliente'
    if (!form.clienteWhatsapp.trim()) e.clienteWhatsapp = 'Informe o WhatsApp'
    else if (!telefoneValido(form.clienteWhatsapp)) e.clienteWhatsapp = 'WhatsApp incompleto (DDD + número)'
    if (!form.seguradora_id)          e.seguradora_id   = 'Selecione a seguradora'
    if (!form.numero_apolice.trim())  e.numero_apolice  = 'Informe o número da apólice'
    if (!form.numero_parcela)         e.numero_parcela  = 'Informe o número da parcela'
    if (!form.valor)                  e.valor           = 'Informe o valor'
    if (!form.data_vencimento)        e.data_vencimento = 'Informe a data de vencimento'
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function salvar() {
    if (!validar()) return { sucesso: false }
    setSalvando(true)

    const { error } = await salvarParcelaComCliente({
      cliente_nome: form.clienteNome.trim(),
      telefone: telefoneCompleto(form.clienteWhatsapp),
      seguradora_id: form.seguradora_id,
      numero_apolice: form.numero_apolice.trim(),
      numero_parcela: Number(form.numero_parcela),
      valor: moedaParaNumero(form.valor),
      data_vencimento: form.data_vencimento,
    })

    setSalvando(false)
    if (error) return { sucesso: false, erro: error }

    setForm(camposVazios)
    return { sucesso: true }
  }

  return {
    form, erros, salvando, seguradoras,
    atualizar, salvar,
  }
}
