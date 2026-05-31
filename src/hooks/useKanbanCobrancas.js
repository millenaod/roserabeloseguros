import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

async function fetchColunas() {
  const { data } = await supabase.from('kanban_colunas').select('*').order('ordem')
  return data ?? []
}

async function fetchParcelas() {
  const { data } = await supabase.from('v_parcelas_ui').select('*').order('dias_atraso', { ascending: false })
  return data ?? []
}

export function useKanbanCobrancas() {
  const queryClient = useQueryClient()
  const [filtros, setFiltros] = useState({ busca: '', seguradora_id: '', dias: 'todos', vip: false, risco: false })

  const { data: colunas = [], isLoading: carregandoColunas } = useQuery({
    queryKey: ['kanban-colunas'], queryFn: fetchColunas,
  })

  const { data: parcelas = [], isLoading: carregandoParcelas } = useQuery({
    queryKey: ['kanban-parcelas'], queryFn: fetchParcelas,
  })

  const isLoading = carregandoColunas || carregandoParcelas

  // Filtros aplicados
  const parcelasFiltradas = parcelas.filter(p => {
    if (filtros.busca && !p.cliente_nome?.toLowerCase().includes(filtros.busca.toLowerCase())) return false
    if (filtros.seguradora_id && p.seguradora_id !== filtros.seguradora_id) return false
    if (filtros.vip && !p.cliente_vip) return false
    if (filtros.risco && !p.cobertura_em_risco) return false
    if (filtros.dias === 'ate15' && (p.dias_atraso ?? 0) > 15) return false
    if (filtros.dias === '16a30' && ((p.dias_atraso ?? 0) < 16 || (p.dias_atraso ?? 0) > 30)) return false
    if (filtros.dias === 'mais30' && (p.dias_atraso ?? 0) <= 30) return false
    return true
  })

  // Agrupa por coluna — parcelas pagas vão sempre para "Pago"
  const parcelasPorColuna = colunas.reduce((acc, col) => {
    acc[col.nome] = parcelasFiltradas.filter(p =>
      p.status === 'pago' ? col.nome === 'Pago' : (p.kanban_coluna ?? 'Não contatado') === col.nome
    )
    return acc
  }, {})

  const { mutateAsync: moverCard } = useMutation({
    mutationFn: ({ parcelaId, coluna }) =>
      supabase.from('parcelas').update({ kanban_coluna: coluna }).eq('id', parcelaId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kanban-parcelas'] }),
  })

  const { mutateAsync: renomearColuna } = useMutation({
    mutationFn: ({ id, nome }) => supabase.from('kanban_colunas').update({ nome }).eq('id', id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kanban-colunas'] }),
  })

  const { mutateAsync: criarColuna } = useMutation({
    mutationFn: (nome) => supabase.from('kanban_colunas').insert({ nome, ordem: colunas.length + 1 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kanban-colunas'] }),
  })

  const { mutateAsync: deletarColuna } = useMutation({
    mutationFn: (id) => supabase.from('kanban_colunas').delete().eq('id', id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kanban-colunas'] }),
  })

  async function buscarContatos(parcelaId) {
    const { data } = await supabase
      .from('contatos').select('*')
      .eq('parcela_id', parcelaId)
      .order('enviado_em', { ascending: false })
    return data ?? []
  }

  return {
    colunas, parcelasPorColuna, isLoading, filtros, setFiltros,
    moverCard, renomearColuna, criarColuna, deletarColuna, buscarContatos,
  }
}
