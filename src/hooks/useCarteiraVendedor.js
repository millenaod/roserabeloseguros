import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Uma parcela conta como "em aberto" (pendência) se não está paga nem desconsiderada.
export const parcelaEmAberto = s => s !== 'pago' && s !== 'desconsiderada'

export function useCarteiraVendedor() {
  const queryClient = useQueryClient()
  const [salvandoObs, setSalvandoObs] = useState(false)

  // Traz TODAS as parcelas (todos os status) para montar o histórico completo —
  // o cliente não some da carteira quando regulariza, só muda a situação dele.
  const { data: parcelas = [], isLoading } = useQuery({
    queryKey: ['carteira-clientes'],
    queryFn: async () => {
      const { data } = await supabase
        .from('v_parcelas_ui')
        .select('*')
        .order('data_vencimento', { ascending: false })
      return data ?? []
    },
  })

  // Agrupa por cliente — inclui clientes sem nenhuma pendência (todos quitados).
  const clientes = Object.values(
    parcelas.reduce((acc, p) => {
      const id = p.cliente_id ?? p.cliente_nome
      if (!acc[id]) {
        acc[id] = {
          cliente_id: p.cliente_id,
          nome: p.cliente_nome ?? '—',
          telefone: p.cliente_telefone,
          vip: p.cliente_vip,
          valorAberto: 0,
          diasAtrasoMax: 0,
          temPendencia: false,
          parcelas: [],
        }
      }
      const c = acc[id]
      c.parcelas.push(p)
      if (parcelaEmAberto(p.status)) {
        c.valorAberto += p.valor || 0
        c.diasAtrasoMax = Math.max(c.diasAtrasoMax, p.dias_atraso ?? 0)
        c.temPendencia = true
      }
      return acc
    }, {})
  ).sort((a, b) =>
    (Number(b.temPendencia) - Number(a.temPendencia)) ||
    (b.valorAberto - a.valorAberto) ||
    a.nome.localeCompare(b.nome)
  )

  // Lê a observação salva direto da tabela clientes (a view de parcelas não traz
  // esse campo, por isso a observação não reaparecia ao reabrir o cliente).
  async function buscarObservacao(cliente_id) {
    if (!cliente_id) return ''
    const { data } = await supabase
      .from('clientes')
      .select('observacoes')
      .eq('id', cliente_id)
      .maybeSingle()
    return data?.observacoes ?? ''
  }

  async function buscarContatosCliente(cliente_id) {
    const ids = parcelas.filter(p => p.cliente_id === cliente_id).map(p => p.parcela_id)
    if (!ids.length) return []
    const { data } = await supabase
      .from('contatos')
      .select('*')
      .in('parcela_id', ids)
      .order('data_contato', { ascending: false })
    return data ?? []
  }

  async function salvarObservacao(cliente_id, texto) {
    setSalvandoObs(true)
    const { error } = await supabase
      .from('clientes')
      .update({ observacoes: texto })
      .eq('id', cliente_id)
    setSalvandoObs(false)
    if (!error) queryClient.invalidateQueries({ queryKey: ['carteira-clientes'] })
    return { error }
  }

  return { clientes, isLoading, salvandoObs, buscarContatosCliente, buscarObservacao, salvarObservacao }
}
