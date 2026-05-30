import { useQuery } from '@tanstack/react-query'
import { buscarParcelas } from '@/services/parcelas'

export function useDashboardRose() {
  const { data: parcelas = [], isLoading } = useQuery({
    queryKey: ['parcelas-rose'],
    queryFn: () => buscarParcelas().then(r => r.data ?? []),
  })

  const total      = parcelas.length
  const pagas      = parcelas.filter(p => p.status === 'pago')
  const emAberto   = parcelas.filter(p => p.status !== 'pago')
  const atrasadas30 = parcelas.filter(p => (p.dias_atraso ?? 0) > 30)
  const escaladas  = parcelas.filter(p => p.status === 'escalado')

  const valorAberto = emAberto.reduce((acc, p) => acc + (p.valor || 0), 0)
  const valorPago   = pagas.reduce((acc, p) => acc + (p.valor || 0), 0)
  const taxaRecuperacao = total > 0 ? Math.round((pagas.length / total) * 100) : 0

  // Gráfico de barras: inadimplência por seguradora
  const porSeguradora = Object.values(
    emAberto.reduce((acc, p) => {
      const nome = p.seguradora || 'Outros'
      if (!acc[nome]) acc[nome] = { seguradora: nome, valor: 0, quantidade: 0 }
      acc[nome].valor      += p.valor || 0
      acc[nome].quantidade += 1
      return acc
    }, {})
  ).sort((a, b) => b.valor - a.valor).slice(0, 10)

  // Gráfico de linha: recuperação mensal (últimos 6 meses)
  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    return d.toISOString().slice(0, 7)
  })

  const evolucaoMensal = meses.map(mes => {
    const mesLabel = new Date(mes + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    const pagasMes = pagas.filter(p => p.data_vencimento?.startsWith(mes))
    const totalMes = parcelas.filter(p => p.data_vencimento?.startsWith(mes))
    return {
      mes: mesLabel,
      recuperado: pagasMes.reduce((acc, p) => acc + (p.valor || 0), 0),
      emAberto: totalMes.filter(p => p.status !== 'pago').reduce((acc, p) => acc + (p.valor || 0), 0),
    }
  })

  return {
    isLoading, parcelas,
    kpis: { valorAberto, taxaRecuperacao, atrasadas30: atrasadas30.length, valorPago },
    porSeguradora, evolucaoMensal, escaladas,
  }
}
