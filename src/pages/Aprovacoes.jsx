import { useState } from 'react'
import { useAprovacoes } from '@/hooks/useAprovacoes'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import EmptyState from '@/components/EmptyState'
import { formatarMoeda, formatarData } from '@/utils/format'
import { CheckCircle, XCircle, CheckSquare } from 'lucide-react'

function LoteCard({ lote, onAprovar, onBloquear }) {
  const cliente   = lote.parcelas?.apolices?.clientes?.nome ?? '—'
  const seguradora = lote.parcelas?.apolices?.seguradoras?.nome ?? '—'
  const valor     = lote.parcelas?.valor

  return (
    <Card className="border-[var(--border)]">
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm text-[var(--text-primary)]">{cliente}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{seguradora} · {formatarData(lote.data_contato)}</p>
          </div>
          {valor && <span className="font-display font-bold text-base text-[var(--text-primary)] shrink-0">{formatarMoeda(valor)}</span>}
        </div>

        {lote.descricao && (
          <div className="bg-[var(--surface-raised)] rounded-md p-3">
            <p className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wide mb-1">Mensagem</p>
            <p className="text-sm text-[var(--text-primary)]">{lote.descricao}</p>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button className="flex-1 gap-2" style={{ backgroundColor: 'var(--status-paid)', color: 'white' }}
            onClick={() => onAprovar(lote.id)}>
            <CheckCircle className="w-4 h-4" /> Aprovar
          </Button>
          <Button variant="outline" className="flex-1 gap-2 text-[var(--status-error)] border-[var(--status-error-bg)]"
            onClick={() => onBloquear(lote.id)}>
            <XCircle className="w-4 h-4" /> Bloquear
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Aprovacoes() {
  const { toast } = useToast()
  const { lotes, isLoading, executando, aprovar, bloquear } = useAprovacoes()

  const [dialog, setDialog] = useState(null) // { id, acao: 'aprovar'|'bloquear' }
  const [motivo, setMotivo] = useState('')

  function abrirDialog(id, acao) {
    setDialog({ id, acao })
    setMotivo('')
  }

  async function confirmar() {
    const fn = dialog.acao === 'aprovar' ? aprovar : bloquear
    await fn(dialog.id, motivo)
    setDialog(null)
    toast({
      title: dialog.acao === 'aprovar' ? 'Lote aprovado!' : 'Lote bloqueado.',
    })
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Toaster />

      <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--surface)]">
        <h1 className="font-display font-semibold text-2xl text-[var(--text-primary)]">Aprovações</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Disparos aguardando sua aprovação</p>
      </div>

      <div className="px-6 py-6">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
          </div>
        ) : lotes.length === 0 ? (
          <EmptyState
            icone={CheckSquare}
            titulo="Nenhuma aprovação pendente"
            descricao="Quando houver disparos aguardando revisão, eles aparecerão aqui."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lotes.map(lote => (
              <LoteCard
                key={lote.id}
                lote={lote}
                onAprovar={id => abrirDialog(id, 'aprovar')}
                onBloquear={id => abrirDialog(id, 'bloquear')}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!dialog} onOpenChange={v => !v && setDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">
              {dialog?.acao === 'aprovar' ? 'Aprovar disparo' : 'Bloquear disparo'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5 py-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              Motivo <span className="normal-case font-normal">(opcional)</span>
            </Label>
            <Textarea rows={3} placeholder="Adicione um motivo se quiser…"
              value={motivo} onChange={e => setMotivo(e.target.value)} autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancelar</Button>
            <Button onClick={confirmar} disabled={executando}
              style={dialog?.acao === 'aprovar'
                ? { backgroundColor: 'var(--status-paid)', color: 'white' }
                : { backgroundColor: 'var(--status-error)', color: 'white' }}>
              {executando ? 'Aguarde…' : dialog?.acao === 'aprovar' ? 'Aprovar' : 'Bloquear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
