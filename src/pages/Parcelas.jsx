import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useParcelas } from '@/hooks/useParcelas'
import { useToast } from '@/hooks/use-toast'
import { listarSeguradoras } from '@/services/seguradoras'
import { Toaster } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { solicitarNovaCobranca, atualizarBoleto } from '@/services/parcelas'
import { Paperclip } from 'lucide-react'
import ParcelaRow from '@/components/ParcelaRow'
import NovaParcelaSheet from '@/components/NovaParcelaSheet'
import EmptyState from '@/components/EmptyState'
import ConfirmDialog from '@/components/ConfirmDialog'
import PainelKanban from '@/components/PainelKanban'
import { ClipboardList, PlusCircle, SlidersHorizontal, LayoutList, Kanban, Search } from 'lucide-react'

const STATUS_OPCOES = [
  { value: 'pendente',       label: 'A cobrar' },
  { value: 'em_cobranca',    label: 'Em cobrança' },
  { value: 'pago',           label: 'Pago' },
  { value: 'escalado',       label: 'Escalado' },
  { value: 'desconsiderada', label: '🗂️ Desconsideradas' },
]

export default function Parcelas() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [visao, setVisao] = useState('tabela')
  const [sheetAberto, setSheetAberto] = useState(false)
  const [confirmPagar, setConfirmPagar]   = useState(null)
  const [confirmEscalar, setConfirmEscalar] = useState(null)
  const [remarcarId, setRemarcarId]       = useState(null)
  const [novaData, setNovaData]           = useState('')
  const [cobrarParcela, setCobrarParcela] = useState(null)
  const [novoBoletoFile, setNovoBoletoFile] = useState(null)
  const [processandoCobrar, setProcessandoCobrar] = useState(false)

  const { parcelas, isLoading, filtros, busca, setBusca, executando, aplicarFiltros, limparFiltros, salvar, pagar, escalar, remarcar, moverKanban } = useParcelas()
  const { data: seguradoras = [] } = useQuery({ queryKey: ['seguradoras'], queryFn: () => listarSeguradoras().then(r => r.data ?? []) })

  async function handleSalvar(dados) {
    const res = await salvar(dados)
    // Conflito de CPF: a própria Sheet abre o aviso e decide; não fecha nem avisa aqui.
    if (res?.conflito) return res
    if (!res?.error) {
      toast({ title: 'Parcela cadastrada!' })
      setSheetAberto(false)
    } else {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
    return res
  }

  async function handleCobrar() {
    const p = cobrarParcela
    const arquivo = novoBoletoFile
    setCobrarParcela(null); setNovoBoletoFile(null); setProcessandoCobrar(true)
    if (arquivo) {
      const { error } = await atualizarBoleto(p.parcela_id, arquivo)
      if (error) { setProcessandoCobrar(false); toast({ title: 'Erro ao enviar boleto', variant: 'destructive' }); return }
    }
    const { error } = await solicitarNovaCobranca(p.parcela_id)
    setProcessandoCobrar(false)
    if (error) toast({ title: 'Não foi possível cobrar', variant: 'destructive' })
    else toast({ title: 'Cobrança enviada!', description: `Mensagem disparada para ${p.cliente_nome}.` })
  }

  async function handlePagar()  { await pagar(confirmPagar);   setConfirmPagar(null);   toast({ title: 'Marcada como paga!' }) }
  async function handleEscalar(){ await escalar(confirmEscalar); setConfirmEscalar(null); toast({ title: 'Escalada para vendedor.' }) }
  async function handleRemarcar(){ if (!novaData) return; await remarcar(remarcarId, novaData); setRemarcarId(null); toast({ title: 'Remarcada!' }) }

  const temFiltros = filtros.status || filtros.seguradora_id || filtros.vencimento_ate || busca

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Toaster />

      {/* Cabeçalho */}
      <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-semibold text-2xl text-[var(--text-primary)]">Parcelas</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{parcelas.length} parcela{parcelas.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle visão */}
          <div className="flex rounded-md border border-[var(--border)] overflow-hidden">
            <button onClick={() => setVisao('tabela')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${visao === 'tabela' ? 'bg-[var(--brand)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-raised)]'}`}>
              <LayoutList className="w-3.5 h-3.5" /> Tabela
            </button>
            <button onClick={() => setVisao('kanban')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-l border-[var(--border)] ${visao === 'kanban' ? 'bg-[var(--brand)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-raised)]'}`}>
              <Kanban className="w-3.5 h-3.5" /> Por status
            </button>
          </div>
          {/* Nova parcela — desktop abre inline, mobile abre sheet */}
          <Button
            className="hidden md:flex"
            style={{ backgroundColor: 'var(--brand)', color: 'white' }}
            onClick={() => setSheetAberto(true)}
          >
            <PlusCircle className="w-4 h-4 mr-2" /> Nova Parcela
          </Button>
          <Button
            className="md:hidden"
            style={{ backgroundColor: 'var(--brand)', color: 'white' }}
            onClick={() => setSheetAberto(true)}
          >
            <PlusCircle className="w-4 h-4 mr-2" /> Nova
          </Button>
        </div>
      </div>

      {/* Filtros desktop */}
      <div className="hidden md:flex px-6 py-3 border-b border-[var(--border)] bg-[var(--surface)] items-center gap-3">
        <div className="relative w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
          <Input className="pl-9" placeholder="Buscar cliente…" value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
        <Select value={filtros.status} onValueChange={v => aplicarFiltros({ status: v === 'todos' ? '' : v })}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Todos os status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {STATUS_OPCOES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtros.seguradora_id} onValueChange={v => aplicarFiltros({ seguradora_id: v === 'todas' ? '' : v })}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Todas seguradoras" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas seguradoras</SelectItem>
            {seguradoras.map(s => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" className="w-40" value={filtros.vencimento_ate} onChange={e => aplicarFiltros({ vencimento_ate: e.target.value })} />
        {temFiltros && <Button variant="ghost" size="sm" onClick={limparFiltros} className="text-[var(--text-secondary)]">Limpar</Button>}
      </div>

      {/* Filtros mobile */}
      <div className="md:hidden flex px-4 py-2 border-b border-[var(--border)] justify-end">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm"><SlidersHorizontal className="w-4 h-4 mr-2" /> Filtros</Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-xl">
            <SheetHeader className="mb-4"><SheetTitle>Filtros</SheetTitle></SheetHeader>
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
                <Input className="pl-9" placeholder="Buscar cliente…" value={busca} onChange={e => setBusca(e.target.value)} />
              </div>
              <Select value={filtros.status} onValueChange={v => aplicarFiltros({ status: v === 'todos' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {STATUS_OPCOES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filtros.seguradora_id} onValueChange={v => aplicarFiltros({ seguradora_id: v === 'todas' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Seguradora" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {seguradoras.map(s => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" value={filtros.vencimento_ate} onChange={e => aplicarFiltros({ vencimento_ate: e.target.value })} />
              {temFiltros && <Button variant="outline" onClick={limparFiltros}>Limpar filtros</Button>}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Conteúdo */}
      <div className="px-4 md:px-6 py-4">
        {visao === 'tabela' ? (
          isLoading ? (
            <div className="flex flex-col gap-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[var(--surface-raised)]">
                    <TableHead>Cliente</TableHead>
                    <TableHead>Seguradora</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-center">Contatos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parcelas.length === 0 ? (
                    <TableRow>
                      <td colSpan={7}>
                        <EmptyState
                          icone={ClipboardList}
                          titulo="Nenhuma parcela encontrada"
                          descricao="Cadastre a primeira parcela para começar."
                          acaoLabel="+ Nova Parcela"
                          onAcao={() => setSheetAberto(true)}
                        />
                      </td>
                    </TableRow>
                  ) : (
                    parcelas.map(p => (
                      <ParcelaRow
                        key={p.parcela_id}
                        parcela={p}
                        onClick={() => navigate(`/parcelas/${p.parcela_id}`)}
                        onVerDetalhe={() => navigate(`/parcelas/${p.parcela_id}`)}
                        onPagar={() => setConfirmPagar(p.parcela_id)}
                        onRemarcar={() => { setRemarcarId(p.parcela_id); setNovaData('') }}
                        onEscalar={() => setConfirmEscalar(p.parcela_id)}
                        onCobrar={() => { setCobrarParcela(p); setNovoBoletoFile(null) }}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )
        ) : (
          isLoading
            ? <div className="flex gap-4">{[...Array(4)].map((_, i) => <div key={i} className="w-60 shrink-0"><Skeleton className="h-6 w-32 mb-2" /><Skeleton className="h-28 w-full" /></div>)}</div>
            : <PainelKanban parcelas={parcelas} onMoverCard={moverKanban} onCobrar={p => { setCobrarParcela(p); setNovoBoletoFile(null) }} />
        )}
      </div>

      {/* Sheet mobile nova parcela */}
      <NovaParcelaSheet
        aberto={sheetAberto}
        onFechar={() => setSheetAberto(false)}
        seguradoras={seguradoras}
        onSalvar={handleSalvar}
      />

      {/* Dialogs */}
      <ConfirmDialog aberto={!!confirmPagar} onFechar={() => setConfirmPagar(null)} onConfirmar={handlePagar}
        titulo="Marcar como paga?" labelConfirmar="Confirmar" carregando={executando} />
      <ConfirmDialog aberto={!!confirmEscalar} onFechar={() => setConfirmEscalar(null)} onConfirmar={handleEscalar}
        titulo="Escalar para vendedor?" labelConfirmar="Escalar" carregando={executando} />

      <Dialog open={!!cobrarParcela} onOpenChange={v => { if (!v) { setCobrarParcela(null); setNovoBoletoFile(null) } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Cobrar de novo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            {cobrarParcela?.boleto_url && !novoBoletoFile && (
              <p className="text-xs text-[var(--text-secondary)]">Será enviado o boleto já anexado. Troque abaixo se tiver um atualizado.</p>
            )}
            <label className="w-full cursor-pointer">
              <Button variant="outline" className="w-full justify-start gap-2 pointer-events-none" asChild>
                <span><Paperclip className="w-4 h-4" />{novoBoletoFile ? novoBoletoFile.name : cobrarParcela?.boleto_url ? 'Substituir boleto' : 'Anexar boleto *'}</span>
              </Button>
              <input type="file" accept="application/pdf,image/*" className="hidden"
                onChange={e => setNovoBoletoFile(e.target.files?.[0] ?? null)} />
            </label>
            {!cobrarParcela?.boleto_url && !novoBoletoFile && (
              <p className="text-xs text-[var(--status-error)]">O template exige um boleto anexado.</p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => { setCobrarParcela(null); setNovoBoletoFile(null) }}>Cancelar</Button>
            <Button onClick={handleCobrar} disabled={processandoCobrar || (!cobrarParcela?.boleto_url && !novoBoletoFile)}
              style={{ backgroundColor: 'var(--brand)', color: 'white' }}>
              {processandoCobrar ? 'Enviando…' : 'Enviar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!remarcarId} onOpenChange={v => !v && setRemarcarId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Remarcar parcela</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-1.5 py-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Nova data</Label>
            <Input type="date" value={novaData} onChange={e => setNovaData(e.target.value)} autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemarcarId(null)}>Cancelar</Button>
            <Button onClick={handleRemarcar} disabled={!novaData} style={{ backgroundColor: 'var(--brand)', color: 'white' }}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
