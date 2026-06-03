import { useNavigate } from 'react-router-dom'
import { useDashboardRose } from '@/hooks/useDashboardRose'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import KPICard from '@/components/KPICard'
import ParcelaRow from '@/components/ParcelaRow'
import StatusBadge from '@/components/StatusBadge'
import { formatarMoeda } from '@/utils/format'
import { Toaster } from '@/components/ui/toaster'
import { AlertTriangle } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'


export default function DashboardRose() {
  const navigate = useNavigate()
  const { isLoading, parcelas, kpis, porSeguradora, evolucaoMensal, escaladas } = useDashboardRose()

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-8">
      <Toaster />

      {/* Cabeçalho */}
      <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--surface)]">
        <h1 className="font-display font-semibold text-2xl text-[var(--text-primary)]">Visão Gerencial</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Resumo completo da carteira inadimplente</p>
      </div>

      <div className="px-6 py-6 flex flex-col gap-8">

        {/* R2 — KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <KPICard valor={formatarMoeda(kpis.valorAberto)}      label="Valor total em aberto" />
          <KPICard valor={`${kpis.taxaRecuperacao}%`}           label="Taxa de recuperação" />
          <KPICard valor={kpis.atrasadas30}                     label="Parcelas com +30 dias" />
        </div>

        {/* R3 + R4 — Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Inadimplência por seguradora */}
          <Card className="border-[var(--border)]">
            <CardContent className="p-5">
              <h2 className="font-semibold text-sm text-[var(--text-primary)] mb-4">Inadimplência por seguradora</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={porSeguradora} margin={{ top: 4, right: 4, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="seguradora" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} width={55} />
                  <Tooltip formatter={v => formatarMoeda(v)} labelStyle={{ color: 'var(--text-primary)' }} />
                  <Bar dataKey="valor" fill="var(--brand)" radius={[4, 4, 0, 0]} name="Em aberto" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Evolução mensal */}
          <Card className="border-[var(--border)]">
            <CardContent className="p-5">
              <h2 className="font-semibold text-sm text-[var(--text-primary)] mb-4">Evolução mensal</h2>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={evolucaoMensal} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <YAxis tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} width={55} />
                  <Tooltip formatter={v => formatarMoeda(v)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="recuperado" stroke="var(--status-paid)"   strokeWidth={2} dot={false} name="Recuperado" />
                  <Line type="monotone" dataKey="emAberto"   stroke="var(--status-error)"  strokeWidth={2} dot={false} name="Em aberto" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* R5 — Alertas: parcelas escaladas */}
        {escaladas.length > 0 && (
          <Card className="border-[var(--border)] border-l-4 border-l-[var(--status-escalated)]">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-[var(--status-escalated)]" />
                <h2 className="font-semibold text-sm text-[var(--text-primary)]">
                  {escaladas.length} parcela{escaladas.length > 1 ? 's' : ''} escalada{escaladas.length > 1 ? 's' : ''} para vendedor
                </h2>
              </div>
              <div className="flex flex-col gap-2">
                {escaladas.slice(0, 5).map(p => (
                  <button key={p.id} onClick={() => navigate(`/parcelas/${p.parcela_id}`)}
                    className="flex items-center justify-between text-sm py-2 px-3 rounded-md hover:bg-[var(--surface-raised)] transition-colors text-left w-full">
                    <span className="font-medium text-[var(--text-primary)]">{p.nome_cliente}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--text-secondary)]">{formatarMoeda(p.valor)}</span>
                      <StatusBadge status={p.status} />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* R6 — Listagem completa */}
        <div>
          <h2 className="font-semibold text-base text-[var(--text-primary)] mb-3">Todas as parcelas</h2>
          <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--surface-raised)]">
                  <TableHead>Cliente</TableHead>
                  <TableHead>Seguradora</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-center">Tentativas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parcelas.map(p => (
                  <ParcelaRow key={p.id} parcela={p} onClick={() => navigate(`/parcelas/${p.parcela_id}`)} />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

      </div>
    </div>
  )
}
