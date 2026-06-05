import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { buscarParcelas, atualizarStatus, salvarParcelaComCliente } from '@/services/parcelas'
import { supabase } from '@/lib/supabase'

export function useParcelas() {
  const queryClient = useQueryClient()
  const [filtros, setFiltros] = useState({ status: '', seguradora_id: '', vencimento_ate: '' })
  const [busca, setBusca] = useState('')

  const { data: parcelas = [], isLoading } = useQuery({
    queryKey: ['parcelas', filtros],
    queryFn: () => buscarParcelas(filtros).then(r => r.data ?? []),
  })

  // Busca por nome do cliente — client-side, instantânea conforme digita.
  const termo = busca.trim().toLowerCase()
  const parcelasVisiveis = termo
    ? parcelas.filter(p => (p.cliente_nome || '').toLowerCase().includes(termo))
    : parcelas

  const mesAtual = new Date().toISOString().slice(0, 7)

  const kpis = {
    totalAberto:      parcelas.filter(p => p.status !== 'pago').reduce((acc, p) => acc + (p.valor || 0), 0),
    enviados:         parcelas.filter(p => p.status === 'enviado').length,
    aguardandoRetorno:parcelas.filter(p => p.status === 'aguardando_retorno').length,
    pagosMes:         parcelas.filter(p => p.status === 'pago' && p.data_vencimento?.startsWith(mesAtual))
                              .reduce((acc, p) => acc + (p.valor || 0), 0),
  }

  const { mutateAsync: executarAcao, isPending: executando } = useMutation({
    mutationFn: ({ id, status }) => atualizarStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parcelas'] }),
  })

  const { mutateAsync: salvar, isPending: salvando } = useMutation({
    mutationFn: (dados) => salvarParcelaComCliente(dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parcelas'] }),
  })

  async function remarcar(id, novaData) {
    const { error } = await supabase
      .from('parcelas')
      .update({ data_vencimento: novaData, status: 'remarcado' })
      .eq('id', id)
    if (!error) queryClient.invalidateQueries({ queryKey: ['parcelas'] })
    return { error }
  }

  function aplicarFiltros(novosFiltros) {
    setFiltros(prev => ({ ...prev, ...novosFiltros }))
  }

  function limparFiltros() {
    setFiltros({ status: '', seguradora_id: '', vencimento_ate: '' })
    setBusca('')
  }

  return {
    parcelas: parcelasVisiveis, isLoading, filtros, busca, setBusca, kpis, executando, salvando,
    aplicarFiltros, limparFiltros, salvar,
    pagar:         id => executarAcao({ id, status: 'pago' }),
    escalar:       id => executarAcao({ id, status: 'escalado' }),
    moverKanban:   (id, novoStatus) => executarAcao({ id, status: novoStatus }),
    remarcar,
  }
}
