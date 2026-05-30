import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useParcelas } from '@/hooks/useParcelas'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import KPICard from '@/components/KPICard'
import ParcelaRow from '@/components/ParcelaRow'
import ParcelaCard from '@/components/ParcelaCard'
import EmptyState from '@/components/EmptyState'
import ConfirmDialog from '@/components/ConfirmDialog'
import { formatarMoeda } from '@/utils/format'
import { PlusCircle, SlidersHorizontal, ClipboardList } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

const STATUS_OPCOES = [
  { value: 'pendente',  label: 'Pendente' },
  { value: 'enviado',   label: 'Enviado' },
  { value: 'pago',      label: 'Pago' },
  { value: 'erro',      label: 'Erro' },
  { value: 'escalado',  label: 'Escalado' },
  { value: 'remarcado', label: 'Remarcado' },
]

function FiltrosForm({ filtros, onChange, onLimpar }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Status</Label>
        <Select value={filtros.status} onValueChange={v => onChange({ status: v === 'todos' ? '' : v })}>
          <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {STATUS_OPCOES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Vencimento até</Label>
        <Input type="date" value={filtros.vencimento_ate} onChange={e => onChange({ vencimento_ate: e.target.value })} />
      </div>
      <Button variant="outline" onClick={onLimpar} className="w-full">Limpar filtros</Button>
    </div>
  )
}

function SkeletonTabela() {
  return (
    <div className="flex flex-col gap-3 p-6">
      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-md" />)}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { parcelas, isLoading, filtros, kpis, executando, aplicarFiltros, limparFiltros, pagar, escalar, remarcar } = useParcelas()

  const [confirmPagar, setConfirmPagar]     = useState(null)
  const [confirmEscalar, setConfirmEscalar] = useState(null)
  const [remarcarId, setRemarcarId]         = useState(null)
  const [novaData, setNovaData]             = useState('')

  async function handlePagar() {
    await pagar(confirmPagar)
    setConfirmPagar(null)
    toast({ title: 'Parcela marcada como paga!' })
  }

  async function handleEscalar() {
    await escalar(confirmEscalar)
    setConfirmEscalar(null)
    toast({ title: 'Parcela escalada para vendedor.' })
  }

  async function handleRemarcar() {
    if (!novaData) return
    const { error } = await remarcar(remarcarId, novaData)
    setRemarcarId(null)
    setNovaData('')
    if (!error) toast({ title: 'Parcela remarcada!' })
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Toaster />

      {/* Cabeçalho */}
      <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between">
        <div>
          <h1 className="font-display font-semibold text-2xl text-[var(--text-primary)]">Parcelas</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{parcelas.length} parcela{parcelas.length !== 1 ? 's' : ''} encontrada{parcelas.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => navigate('/nova-parcela')} style={{ backgroundColor: 'var(--brand)', color: 'white' }}>
          <PlusCircle className="w-4 h-4 mr-2" /> Nova Parcela
        </Button>
      </div>

      <div className="px-6 py-6 flex flex-col gap-6">

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard valor={formatarMoeda(kpis.totalAberto)} label="Total em aberto" />
          <KPICard valor={kpis.enviados} label="Enviados" />
          <KPICard valor={kpis.aguardandoRetorno} label="Aguardando retorno" />
          <KPICard valor={formatarMoeda(kpis.pagosMes)} label="Pagos este mês" />
        </div>

        {/* Filtros desktop */}
        <div className="hidden md:flex items-end gap-3">
          <div className="w-48">
            <Select value={filtros.status} onValueChange={v => aplicarFiltros({ status: v === 'todos' ? '' : v })}>
              <SelectTrigger><SelectValue placeholder="Todos os status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                {STATUS_OPCOES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-44">
            <Input type="date" value={filtros.vencimento_ate} onChange={e => aplicarFiltros({ vencimento_ate: e.target.value })} />
          </div>
          {(filtros.status || filtros.vencimento_ate) && (
            <Button variant="ghost" size="sm" onClick={limparFiltros} className="text-[var(--text-secondary)]">
              Limpar
            </Button>
          )}
        </div>

        {/* Filtros mobile — botão abre Sheet */}
        <div className="md:hidden flex justify-end">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="w-4 h-4 mr-2" /> Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-xl">
              <SheetHeader className="mb-4">
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <FiltrosForm filtros={filtros} onChange={aplicarFiltros} onLimpar={limparFiltros} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Conteúdo */}
        {isLoading ? (
          <SkeletonTabela />
        ) : parcelas.length === 0 ? (
          <EmptyState
            icone={ClipboardList}
            titulo="Nenhuma parcela encontrada"
            descricao="Tente ajustar os filtros ou cadastre uma nova parcela."
            acaoLabel="Nova Parcela"
            onAcao={() => navigate('/nova-parcela')}
          />
        ) : (
          <>
            {/* Tabela desktop */}
            <div className="hidden md:block rounded-md border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
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
                    <ParcelaRow
                      key={p.id}
                      parcela={p}
                      onClick={() => navigate(`/parcelas/${p.id}`)}
                      onPagar={() => setConfirmPagar(p.id)}
                      onRemarcar={() => { setRemarcarId(p.id); setNovaData('') }}
                      onEscalar={() => setConfirmEscalar(p.id)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Cards mobile */}
            <div className="md:hidden flex flex-col gap-3">
              {parcelas.map(p => (
                <ParcelaCard
                  key={p.id}
                  parcela={p}
                  onPagar={() => setConfirmPagar(p.id)}
                  onRemarcar={() => { setRemarcarId(p.id); setNovaData('') }}
                  onEscalar={() => setConfirmEscalar(p.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Dialogs de confirmação */}
      <ConfirmDialog
        aberto={!!confirmPagar}
        onFechar={() => setConfirmPagar(null)}
        onConfirmar={handlePagar}
        titulo="Marcar como paga?"
        descricao="Esta ação irá atualizar o status da parcela para pago."
        labelConfirmar="Marcar como paga"
        carregando={executando}
      />

      <ConfirmDialog
        aberto={!!confirmEscalar}
        onFechar={() => setConfirmEscalar(null)}
        onConfirmar={handleEscalar}
        titulo="Escalar para vendedor?"
        descricao="O status será atualizado para escalado."
        labelConfirmar="Escalar"
        carregando={executando}
      />

      <Dialog open={!!remarcarId} onOpenChange={v => !v && setRemarcarId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Remarcar parcela</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5 py-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Nova data de vencimento</Label>
            <Input type="date" value={novaData} onChange={e => setNovaData(e.target.value)} autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemarcarId(null)}>Cancelar</Button>
            <Button onClick={handleRemarcar} disabled={!novaData} style={{ backgroundColor: 'var(--brand)', color: 'white' }}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
