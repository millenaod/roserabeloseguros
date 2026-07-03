import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { atualizarCliente as atualizarClienteService, excluirCliente as excluirClienteService } from '@/services/clientes'
import { excluirParcela } from '@/services/parcelas'

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
          cpf: p.cliente_cpf ?? '',
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

  // Lê as observações do cliente como array. Suporta retrocompat com o formato
  // antigo (texto puro), que vira uma única entrada na lista.
  async function buscarObservacao(cliente_id) {
    if (!cliente_id) return []
    const { data } = await supabase
      .from('clientes')
      .select('observacoes')
      .eq('id', cliente_id)
      .maybeSingle()
    const raw = data?.observacoes ?? ''
    if (!raw) return []
    try { return JSON.parse(raw) } catch {
      return [{ id: crypto.randomUUID(), texto: raw, criado_em: new Date(0).toISOString() }]
    }
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

  async function salvarObservacao(cliente_id, array) {
    setSalvandoObs(true)
    const { error } = await supabase
      .from('clientes')
      .update({ observacoes: JSON.stringify(array) })
      .eq('id', cliente_id)
    setSalvandoObs(false)
    return { error }
  }

  async function atualizarCliente(cliente_id, dados) {
    const { error } = await atualizarClienteService(cliente_id, dados)
    if (!error) queryClient.invalidateQueries({ queryKey: ['carteira-clientes'] })
    return { error }
  }

  async function excluirCliente(cliente_id, parcelaIds) {
    for (const id of parcelaIds) {
      const { error } = await excluirParcela(id)
      if (error) return { error }
    }
    // Apólices ficam no banco após deletar parcelas; a FK apolices→clientes
    // bloquearia a exclusão do cliente se não removermos antes.
    await supabase.from('apolices').delete().eq('cliente_id', cliente_id)
    const { error } = await excluirClienteService(cliente_id)
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['carteira-clientes'] })
      queryClient.invalidateQueries({ queryKey: ['parcelas'] })
    }
    return { error }
  }

  return { clientes, isLoading, salvandoObs, buscarContatosCliente, buscarObservacao, salvarObservacao, atualizarCliente, excluirCliente }
}
