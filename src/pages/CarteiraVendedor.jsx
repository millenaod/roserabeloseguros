import { useState } from 'react'
import { useCarteiraVendedor, parcelaEmAberto } from '@/hooks/useCarteiraVendedor'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import StatusBadge from '@/components/StatusBadge'
import TimelineContatos from '@/components/TimelineContatos'
import EmptyState from '@/components/EmptyState'
import { formatarMoeda, formatarData } from '@/utils/format'
import { linkWhatsApp, numeroWhatsApp } from '@/utils/whatsapp'
import { Briefcase, AlertTriangle, MessageCircle, Search, CheckCircle2 } from 'lucide-react'

const FILTROS = [
  { id: 'todos',     label: 'Todos' },
  { id: 'pendencia', label: 'Com pendência' },
  { id: 'emdia',     label: 'Em dia' },
]

// Link de WhatsApp do cliente: com a mensagem de cobrança se houver parcela em
// aberto; senão abre a conversa sem texto pronto (cliente já está em dia).
function linkContatoCliente(cliente) {
  const aberta = cliente.parcelas.find(p => parcelaEmAberto(p.status))
  if (aberta) return linkWhatsApp(aberta)
  return `https://wa.me/${numeroWhatsApp(cliente.telefone)}`
}

export default function CarteiraVendedor() {
  const { toast } = useToast()
  const { clientes, isLoading, salvandoObs, buscarContatosCliente, buscarObservacao, salvarObservacao } = useCarteiraVendedor()

  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [contatos, setContatos] = useState([])
  const [carregandoContatos, setCarregandoContatos] = useState(false)
  const [observacao, setObservacao] = useState('')

  const termo = busca.trim().toLowerCase()
  const visiveis = clientes.filter(c => {
    if (termo && !c.nome.toLowerCase().includes(termo)) return false
    if (filtro === 'pendencia' && !c.temPendencia) return false
    if (filtro === 'emdia' && c.temPendencia) return false
    return true
  })

  const comPendencia = clientes.filter(c => c.temPendencia).length

  async function abrirDetalhe(cliente) {
    setClienteSelecionado(cliente)
    setObservacao('')
    setCarregandoContatos(true)
    const [data, obs] = await Promise.all([
      buscarContatosCliente(cliente.cliente_id),
      buscarObservacao(cliente.cliente_id),
    ])
    setContatos(data)
    setObservacao(obs)
    setCarregandoContatos(false)
  }

  async function handleSalvarObservacao() {
    const { error } = await salvarObservacao(clienteSelecionado.cliente_id, observacao)
    if (error) toast({ title: 'Erro ao salvar', description: 'Tente novamente.', variant: 'destructive' })
    else toast({ title: 'Observação salva!' })
  }

  const parcelasAbertas  = clienteSelecionado?.parcelas.filter(p => parcelaEmAberto(p.status)) ?? []
  const parcelasFechadas = clienteSelecionado?.parcelas.filter(p => !parcelaEmAberto(p.status)) ?? []

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Toaster />

      <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--surface)]">
        <h1 className="font-display font-semibold text-2xl text-[var(--text-primary)]">Minha Carteira</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} no total
          {comPendencia > 0 && <> · <span className="text-[var(--status-error)] font-medium">{comPendencia} com pendência</span></>}
        </p>
      </div>

      {/* Busca + filtro */}
      <div className="px-4 md:px-6 py-3 border-b border-[var(--border)] bg-[var(--surface)] flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
          <Input className="pl-9" placeholder="Buscar cliente…" value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
        <div className="flex rounded-md border border-[var(--border)] overflow-hidden">
          {FILTROS.map(f => (
            <button key={f.id} onClick={() => setFiltro(f.id)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-[var(--border)] first:border-l-0 ${filtro === f.id ? 'bg-[var(--brand)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-raised)]'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 md:px-6 py-6">
        {isLoading ? (
          <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col gap-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : visiveis.length === 0 ? (
          <EmptyState
            icone={Briefcase}
            titulo={clientes.length === 0 ? 'Nenhum cliente ainda' : 'Nenhum cliente neste filtro'}
            descricao={clientes.length === 0 ? 'Os clientes aparecem aqui conforme você cadastra parcelas.' : 'Ajuste a busca ou o filtro.'}
          />
        ) : (
          <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--surface-raised)]">
                  <TableHead>Cliente</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="hidden md:table-cell text-center">Parcelas</TableHead>
                  <TableHead className="text-right">Em aberto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visiveis.map(c => {
                  const urgente = c.temPendencia && c.diasAtrasoMax > 30
                  return (
                    <TableRow key={c.cliente_id ?? c.nome} className="cursor-pointer" onClick={() => abrirDetalhe(c)}>
                      <TableCell className="font-medium text-[var(--text-primary)]">
                        <div className="flex items-center gap-2">
                          {urgente && <AlertTriangle className="w-4 h-4 text-[var(--status-error)] shrink-0" />}
                          {c.nome}
                        </div>
                      </TableCell>
                      <TableCell>
                        {c.temPendencia ? (
                          <span className={`text-sm ${urgente ? 'text-[var(--status-error)] font-medium' : 'text-[var(--text-secondary)]'}`}>
                            Em aberto{c.diasAtrasoMax > 0 ? ` · ${c.diasAtrasoMax}d` : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm text-[var(--status-paid)]">
                            <CheckCircle2 className="w-4 h-4" /> Em dia
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-center text-[var(--text-secondary)]">
                        {c.parcelas.length}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-[var(--text-primary)]">
                        {c.valorAberto > 0 ? formatarMoeda(c.valorAberto) : '—'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Sheet de detalhe do cliente */}
      <Sheet open={!!clienteSelecionado} onOpenChange={v => !v && setClienteSelecionado(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display text-lg">{clienteSelecionado?.nome}</SheetTitle>
            <p className="text-sm text-[var(--text-secondary)]">
              {clienteSelecionado?.temPendencia
                ? `${formatarMoeda(clienteSelecionado?.valorAberto ?? 0)} em aberto`
                : 'Sem pendências — em dia'}
            </p>
          </SheetHeader>

          {/* Contato por WhatsApp */}
          {clienteSelecionado?.telefone && (
            <Button
              className="w-full justify-center gap-2 mb-6"
              style={{ backgroundColor: '#25D366', color: 'white' }}
              onClick={() => window.open(linkContatoCliente(clienteSelecionado), '_blank', 'noopener')}
            >
              <MessageCircle className="w-4 h-4" /> Falar no WhatsApp
            </Button>
          )}

          {/* Parcelas em aberto (destaque) */}
          <div className="flex flex-col gap-3 mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              {parcelasAbertas.length > 0 ? 'Parcelas em aberto' : 'Nenhuma parcela em aberto'}
            </h3>
            {parcelasAbertas.map(p => (
              <div key={p.parcela_id} className="flex items-center justify-between py-2 px-3 rounded-md bg-[var(--surface-raised)] text-sm">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{p.seguradora_nome}</p>
                  <p className="text-xs text-[var(--text-secondary)]">Venc. {formatarData(p.data_vencimento)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--text-primary)]">{formatarMoeda(p.valor)}</span>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}

            {/* Histórico completo (pagas/desconsideradas) — recolhido */}
            {parcelasFechadas.length > 0 && (
              <details className="group">
                <summary className="cursor-pointer list-none text-xs font-medium text-[var(--brand)] hover:underline">
                  Ver histórico completo ({parcelasFechadas.length})
                </summary>
                <div className="flex flex-col gap-2 mt-2">
                  {parcelasFechadas.map(p => (
                    <div key={p.parcela_id} className="flex items-center justify-between py-2 px-3 rounded-md border border-[var(--border)] text-sm">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{p.seguradora_nome}</p>
                        <p className="text-xs text-[var(--text-secondary)]">Venc. {formatarData(p.data_vencimento)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--text-primary)]">{formatarMoeda(p.valor)}</span>
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>

          <Separator className="mb-6" />

          {/* Histórico de contatos */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-3">Histórico de contatos</h3>
            {carregandoContatos
              ? <Skeleton className="h-24 w-full" />
              : <TimelineContatos contatos={contatos} />
            }
          </div>

          <Separator className="mb-6" />

          {/* Observação */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              Observação sobre o cliente
            </Label>
            <Textarea
              rows={3}
              placeholder="Anote informações relevantes sobre este cliente…"
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
            />
            <Button
              size="sm"
              onClick={handleSalvarObservacao}
              disabled={salvandoObs}
              style={{ backgroundColor: 'var(--brand)', color: 'white' }}
            >
              {salvandoObs ? 'Salvando…' : 'Salvar observação'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
