import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { buscarParcelas } from '@/services/parcelas'
import { supabase } from '@/lib/supabase'

export function useCarteiraVendedor() {
  const queryClient = useQueryClient()
  const [salvandoObs, setSalvandoObs] = useState(false)

  const { data: parcelas = [], isLoading } = useQuery({
    queryKey: ['carteira-vendedor'],
    queryFn: () => buscarParcelas({ status: '' }).then(r =>
      (r.data ?? []).filter(p => p.status !== 'pago')
    ),
  })

  // Agrupa por cliente
  const clientes = Object.values(
    parcelas.reduce((acc, p) => {
      const id = p.cliente_id ?? p.nome_cliente
      if (!acc[id]) {
        acc[id] = {
          cliente_id: p.cliente_id,
          nome: p.nome_cliente ?? '—',
          whatsapp: p.whatsapp,
          valorAberto: 0,
          diasAtrasoMax: 0,
          ultimoContato: null,
          parcelas: [],
        }
      }
      acc[id].valorAberto   += p.valor || 0
      acc[id].diasAtrasoMax  = Math.max(acc[id].diasAtrasoMax, p.dias_atraso ?? 0)
      acc[id].parcelas.push(p)
      return acc
    }, {})
  ).sort((a, b) => b.valorAberto - a.valorAberto)

  async function buscarContatosCliente(cliente_id) {
    const parcelasCliente = parcelas.filter(p => p.cliente_id === cliente_id).map(p => p.id)
    if (!parcelasCliente.length) return []
    const { data } = await supabase
      .from('contatos')
      .select('*')
      .in('parcela_id', parcelasCliente)
      .order('data_contato', { ascending: false })
    return data ?? []
  }

  async function salvarObservacao(cliente_id, texto) {
    setSalvandoObs(true)
    const { error } = await supabase
      .from('clientes')
      .update({ observacao: texto })
      .eq('id', cliente_id)
    setSalvandoObs(false)
    if (!error) queryClient.invalidateQueries({ queryKey: ['carteira-vendedor'] })
    return { error }
  }

  return { clientes, isLoading, salvandoObs, buscarContatosCliente, salvarObservacao }
}
