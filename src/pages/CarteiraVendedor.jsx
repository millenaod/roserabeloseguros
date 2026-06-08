import { useState } from 'react'
import { useCarteiraVendedor } from '@/hooks/useCarteiraVendedor'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import StatusBadge from '@/components/StatusBadge'
import TimelineContatos from '@/components/TimelineContatos'
import EmptyState from '@/components/EmptyState'
import { formatarMoeda, formatarData } from '@/utils/format'
import { linkWhatsApp } from '@/utils/whatsapp'
import { Briefcase, AlertTriangle, MessageCircle } from 'lucide-react'

export default function CarteiraVendedor() {
  const { toast } = useToast()
  const { clientes, isLoading, salvandoObs, buscarContatosCliente, buscarObservacao, salvarObservacao } = useCarteiraVendedor()

  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [contatos, setContatos] = useState([])
  const [carregandoContatos, setCarregandoContatos] = useState(false)
  const [observacao, setObservacao] = useState('')

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
    if (error) {
      toast({ title: 'Erro ao salvar', description: 'Tente novamente.', variant: 'destructive' })
    } else {
      toast({ title: 'Observação salva!' })
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Toaster />

      <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--surface)]">
        <h1 className="font-display font-semibold text-2xl text-[var(--text-primary)]">Minha Carteira</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} com parcelas em aberto
        </p>
      </div>

      <div className="px-4 md:px-6 py-6">
        {isLoading ? (
          <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col gap-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : clientes.length === 0 ? (
          <EmptyState
            icone={Briefcase}
            titulo="Nenhum cliente em aberto"
            descricao="Sua carteira está em dia."
          />
        ) : (
          <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--surface-raised)]">
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell text-center">Parcelas em aberto</TableHead>
                  <TableHead className="hidden md:table-cell text-center">Maior atraso</TableHead>
                  <TableHead className="text-right">Valor em aberto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map(c => {
                  const urgente = c.diasAtrasoMax > 30
                  return (
                    <TableRow
                      key={c.cliente_id ?? c.nome}
                      className="cursor-pointer"
                      onClick={() => abrirDetalhe(c)}
                    >
                      <TableCell className="font-medium text-[var(--text-primary)]">
                        <div className="flex items-center gap-2">
                          {urgente && <AlertTriangle className="w-4 h-4 text-[var(--status-error)] shrink-0" />}
                          {c.nome}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-center text-[var(--text-secondary)]">
                        {c.parcelas.length}
                      </TableCell>
                      <TableCell className={`hidden md:table-cell text-center ${urgente ? 'text-[var(--status-error)] font-medium' : 'text-[var(--text-secondary)]'}`}>
                        {c.diasAtrasoMax}d
                      </TableCell>
                      <TableCell className="text-right font-semibold text-[var(--text-primary)]">
                        {formatarMoeda(c.valorAberto)}
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
              {formatarMoeda(clienteSelecionado?.valorAberto ?? 0)} em aberto
            </p>
          </SheetHeader>

          {/* Contato por WhatsApp Web — abre a conversa do cliente com a mensagem pronta */}
          {clienteSelecionado?.parcelas?.[0] && (
            <Button
              className="w-full justify-center gap-2 mb-6"
              style={{ backgroundColor: '#25D366', color: 'white' }}
              onClick={() => window.open(linkWhatsApp(clienteSelecionado.parcelas[0]), '_blank', 'noopener')}
            >
              <MessageCircle className="w-4 h-4" /> Falar no WhatsApp
            </Button>
          )}

          {/* Parcelas do cliente */}
          <div className="flex flex-col gap-3 mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Parcelas</h3>
            {clienteSelecionado?.parcelas.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-md bg-[var(--surface-raised)] text-sm">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{p.seguradora}</p>
                  <p className="text-xs text-[var(--text-secondary)]">Venc. {formatarData(p.data_vencimento)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--text-primary)]">{formatarMoeda(p.valor)}</span>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
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
