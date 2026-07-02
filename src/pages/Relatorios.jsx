import { useRelatorios } from '@/hooks/useRelatorios'
import { useQuery } from '@tanstack/react-query'
import { listarSeguradoras } from '@/services/seguradoras'
import { exportarCsv } from '@/utils/exportarCsv'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import { formatarMoeda, formatarData } from '@/utils/format'
import { Toaster } from '@/components/ui/toaster'
import { Search, Download, BarChart2, Info } from 'lucide-react'

const STATUS_OPCOES = ['pendente', 'enviado', 'pago', 'erro', 'escalado', 'remarcado']

export default function Relatorios() {
  const { toast } = useToast()
  const { filtros, parcelas, totais, isLoading, aplicados, atualizar, aplicar, limpar } = useRelatorios()
  const { data: seguradoras = [] } = useQuery({ queryKey: ['seguradoras'], queryFn: () => listarSeguradoras().then(r => r.data ?? []) })

  function handleExportar() {
    exportarCsv(parcelas, 'relatorio-cobranca')
    toast({ title: `${parcelas.length} registro${parcelas.length !== 1 ? 's' : ''} exportado${parcelas.length !== 1 ? 's' : ''}!` })
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Toaster />

      <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--surface)]">
        <h1 className="font-display font-semibold text-2xl text-[var(--text-primary)]">Relatórios</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Visão geral da cobrança por período</p>
      </div>

      <div className="px-6 py-6 flex flex-col gap-6 max-w-6xl">

        {/* Para que serve esta página */}
        <div className="flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-4">
          <Info className="w-5 h-5 shrink-0 text-[var(--brand)] mt-0.5" />
          <div className="text-sm text-[var(--text-secondary)] leading-relaxed">
            <span className="font-semibold text-[var(--text-primary)]">Para que serve:</span> aqui você enxerga o quadro geral da
            cobrança — quanto está em aberto, quanto já foi recuperado e como cada cliente está — filtrando por período,
            seguradora ou status. Use para acompanhar resultados, fechar o mês ou{' '}
            <span className="font-medium text-[var(--text-primary)]">exportar uma planilha (CSV)</span> pra contabilidade.
            Não é a tela do dia a dia: para cadastrar e cobrar, use <span className="font-medium text-[var(--text-primary)]">Parcelas</span>.
          </div>
        </div>

        {/* Filtros */}
        <Card className="border-[var(--border)]">
          <CardContent className="p-5">
            <h2 className="font-semibold text-sm text-[var(--text-primary)] mb-4">Filtros</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">De</Label>
                <Input type="date" value={filtros.data_inicio} onChange={e => atualizar('data_inicio', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Até</Label>
                <Input type="date" value={filtros.data_fim} onChange={e => atualizar('data_fim', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Seguradora</Label>
                <Select value={filtros.seguradora_id} onValueChange={v => atualizar('seguradora_id', v === 'todas' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {seguradoras.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Status</Label>
                <Select value={filtros.status} onValueChange={v => atualizar('status', v === 'todos' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {STATUS_OPCOES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={aplicar} style={{ backgroundColor: 'var(--brand)', color: 'white' }}>
                <Search className="w-4 h-4 mr-2" /> Consultar
              </Button>
              <Button variant="ghost" onClick={limpar} className="text-[var(--text-secondary)]">Mês atual</Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : !aplicados ? (
          <EmptyState icone={BarChart2} titulo="Defina os filtros e clique em Consultar" />
        ) : parcelas.length === 0 ? (
          <EmptyState icone={BarChart2} titulo="Nenhum resultado encontrado" descricao="Tente ajustar os filtros." />
        ) : (
          <>
            {/* Totais */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Parcelas encontradas', valor: totais.quantidade },
                { label: 'Valor total', valor: formatarMoeda(totais.valor) },
                { label: 'Valor recuperado', valor: formatarMoeda(totais.pagos) },
              ].map(({ label, valor }) => (
                <Card key={label} className="border-[var(--border)]">
                  <CardContent className="p-4">
                    <p className="font-display font-bold text-2xl text-[var(--text-primary)]">{valor}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Cabeçalho da tabela + exportar */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--text-secondary)]">{parcelas.length} resultado{parcelas.length !== 1 ? 's' : ''}</p>
              <Button variant="outline" size="sm" onClick={handleExportar}>
                <Download className="w-4 h-4 mr-2" /> Exportar CSV
              </Button>
            </div>

            <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[var(--surface-raised)]">
                    <TableHead>Cliente</TableHead>
                    <TableHead>Seguradora</TableHead>
                    <TableHead>Apólice</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Tentativas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parcelas.map(p => (
                    <TableRow key={p.id} className="hover:bg-[var(--surface-raised)] transition-colors">
                      <TableCell className="font-medium text-[var(--text-primary)]">{p.cliente_nome}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{p.seguradora}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{p.numero_apolice}</TableCell>
                      <TableCell className="font-medium">{formatarMoeda(p.valor)}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{formatarData(p.data_vencimento)}</TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                      <TableCell className="text-center text-[var(--text-secondary)]">{p.tentativas ?? 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Separator />
          </>
        )}
      </div>
    </div>
  )
}
