import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

function inicioPadrao() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function hoje() {
  return new Date().toISOString().slice(0, 10)
}

function filtrosPadrao() {
  return { data_inicio: inicioPadrao(), data_fim: hoje(), seguradora_id: '', status: '' }
}

export function useRelatorios() {
  const [searchParams, setSearchParams] = useSearchParams()

  function lerDaUrl() {
    return {
      data_inicio:   searchParams.get('de')     || inicioPadrao(),
      data_fim:      searchParams.get('ate')    || hoje(),
      seguradora_id: searchParams.get('seg')    || '',
      status:        searchParams.get('status') || '',
    }
  }

  const [filtros, setFiltros] = useState(lerDaUrl)
  // Inicia já aplicado (com o que vier da URL ou os padrões do mês)
  const [aplicados, setAplicados] = useState(lerDaUrl)

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

  function salvarUrl(f) {
    const p = {}
    if (f.data_inicio)   p.de     = f.data_inicio
    if (f.data_fim)      p.ate    = f.data_fim
    if (f.seguradora_id) p.seg    = f.seguradora_id
    if (f.status)        p.status = f.status
    setSearchParams(p, { replace: true })
  }

  function aplicar() {
    const f = { ...filtros }
    setAplicados(f)
    salvarUrl(f)
  }

  function limpar() {
    const f = filtrosPadrao()
    setFiltros(f)
    setAplicados(f)
    salvarUrl(f)
  }

  function atualizar(campo, valor) {
    setFiltros(prev => ({ ...prev, [campo]: valor }))
  }

  return { filtros, parcelas, totais, isLoading: isLoading && isFetching, aplicados, atualizar, aplicar, limpar }
}
