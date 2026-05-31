import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { buscarClientes, criarCliente } from '@/services/clientes'
import { listarSeguradoras } from '@/services/seguradoras'
import { salvarParcelaComCliente } from '@/services/parcelas'

const camposVazios = {
  cliente: null,
  novoClienteNome: '',
  novoClienteWhatsapp: '',
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
  const [resultadosCliente, setResultadosCliente] = useState([])
  const [buscandoCliente, setBuscandoCliente] = useState(false)
  const [modoNovoCliente, setModoNovoCliente] = useState(false)

  const { data: seguradoras = [] } = useQuery({
    queryKey: ['seguradoras'],
    queryFn: () => listarSeguradoras().then(r => r.data ?? []),
    staleTime: 1000 * 60 * 10,
  })

  const buscarClienteDebounced = useCallback(async (query) => {
    if (query.length < 2) { setResultadosCliente([]); return }
    setBuscandoCliente(true)
    const { data } = await buscarClientes(query)
    setResultadosCliente(data ?? [])
    setBuscandoCliente(false)
  }, [])

  function atualizar(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }))
    if (erros[campo]) setErros(prev => ({ ...prev, [campo]: null }))
  }

  function validar() {
    const e = {}
    if (!form.cliente && !modoNovoCliente) e.cliente = 'Selecione ou cadastre um cliente'
    if (modoNovoCliente && !form.novoClienteNome.trim()) e.novoClienteNome = 'Nome obrigatório'
    if (!form.seguradora_id) e.seguradora_id = 'Selecione a seguradora'
    if (!form.numero_apolice.trim()) e.numero_apolice = 'Informe o número da apólice'
    if (!form.numero_parcela) e.numero_parcela = 'Informe o número da parcela'
    if (!form.valor) e.valor = 'Informe o valor'
    if (!form.data_vencimento) e.data_vencimento = 'Informe a data de vencimento'
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function salvar() {
    if (!validar()) return { sucesso: false }
    setSalvando(true)

    let cliente_id = form.cliente?.id

    if (modoNovoCliente) {
      const { data, error } = await criarCliente({
        nome: form.novoClienteNome.trim(),
        telefone: form.novoClienteWhatsapp.trim() || null,
      })
      if (error) { setSalvando(false); return { sucesso: false, erro: error } }
      cliente_id = data.id
    }

    const { error } = await salvarParcelaComCliente({
      cliente_id,
      seguradora_id: form.seguradora_id,
      numero_apolice: form.numero_apolice.trim(),
      numero_parcela: Number(form.numero_parcela),
      valor: Number(form.valor),
      data_vencimento: form.data_vencimento,
    })

    setSalvando(false)
    if (error) return { sucesso: false, erro: error }

    setForm(camposVazios)
    setModoNovoCliente(false)
    return { sucesso: true }
  }

  return {
    form, erros, salvando, seguradoras,
    resultadosCliente, buscandoCliente,
    modoNovoCliente, setModoNovoCliente,
    atualizar, buscarClienteDebounced, salvar,
  }
}
