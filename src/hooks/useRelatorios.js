import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const filtrosVazios = { data_inicio: '', data_fim: '', seguradora_id: '', status: '' }

export function useRelatorios() {
  const [filtros, setFiltros] = useState(filtrosVazios)
  const [aplicados, setAplicados] = useState(null)

  const { data: parcelas = [], isLoading, isFetching } = useQuery({
    queryKey: ['relatorio', aplicados],
    queryFn: async () => {
      if (!aplicados) return []
      let q = supabase.from('v_parcelas_ui').select('*')
      if (aplicados.data_inicio)    q = q.gte('data_vencimento', aplicados.data_inicio)
      if (aplicados.data_fim)       q = q.lte('data_vencimento', aplicados.data_fim)
      if (aplicados.seguradora_id)  q = q.eq('seguradora_id', aplicados.seguradora_id)
      if (aplicados.status)         q = q.eq('status', aplicados.status)
      q = q.order('data_vencimento', { ascending: false })
      const { data } = await q
      return data ?? []
    },
    enabled: !!aplicados,
  })

  const totais = {
    quantidade: parcelas.length,
    valor: parcelas.reduce((acc, p) => acc + (p.valor || 0), 0),
    pagos: parcelas.filter(p => p.status === 'pago').reduce((acc, p) => acc + (p.valor || 0), 0),
  }

  function aplicar() { setAplicados({ ...filtros }) }
  function limpar()  { setFiltros(filtrosVazios); setAplicados(null) }
  function atualizar(campo, valor) { setFiltros(prev => ({ ...prev, [campo]: valor })) }

  return { filtros, parcelas, totais, isLoading: isLoading && isFetching, aplicados, atualizar, aplicar, limpar }
}
