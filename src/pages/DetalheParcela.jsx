import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDetalheParcela } from '@/hooks/useDetalheParcela'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import StatusBadge from '@/components/StatusBadge'
import TimelineContatos from '@/components/TimelineContatos'
import ConfirmDialog from '@/components/ConfirmDialog'
import { formatarMoeda, formatarData } from '@/utils/format'
import { ArrowLeft, CheckCircle, CalendarClock, ArrowUpCircle, Send } from 'lucide-react'

function InfoLinha({ label, valor }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2">
      <span className="text-sm text-[var(--text-secondary)] shrink-0">{label}</span>
      <span className="text-sm font-medium text-[var(--text-primary)] text-right">{valor || '—'}</span>
    </div>
  )
}

export default function DetalheParcela() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { parcela, isLoading, contatos, executando, pagar, escalar, remarcar, enviarMensagem } = useDetalheParcela(id)

  const [confirmPagar, setConfirmPagar]     = useState(false)
  const [confirmEscalar, setConfirmEscalar] = useState(false)
  const [remarcarAberto, setRemarcarAberto] = useState(false)
  const [mensagemAberto, setMensagemAberto] = useState(false)
  const [novaData, setNovaData]             = useState('')
  const [textoMensagem, setTextoMensagem]   = useState('')
  const [enviando, setEnviando]             = useState(false)

  async function handlePagar() {
    await pagar()
    setConfirmPagar(false)
    toast({ title: 'Parcela marcada como paga!' })
  }

  async function handleEscalar() {
    await escalar()
    setConfirmEscalar(false)
    toast({ title: 'Parcela escalada para vendedor.' })
  }

  async function handleRemarcar() {
    if (!novaData) return
    const { error } = await remarcar(novaData)
    if (!error) { setRemarcarAberto(false); setNovaData(''); toast({ title: 'Parcela remarcada!' }) }
  }

  async function handleEnviarMensagem() {
    if (!textoMensagem.trim()) return
    setEnviando(true)
    const { error } = await enviarMensagem(textoMensagem.trim())
    setEnviando(false)
    if (!error) { setMensagemAberto(false); setTextoMensagem(''); toast({ title: 'Mensagem registrada!' }) }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    )
  }

  if (!parcela) {
    return (
      <div className="p-6">
        <p className="text-[var(--text-secondary)]">Parcela não encontrada.</p>
        <Button variant="link" onClick={() => navigate('/')}>Voltar</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-8">
      <Toaster />

      {/* Cabeçalho */}
      <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)] flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-display font-semibold text-xl text-[var(--text-primary)]">{parcela.nome_cliente}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm text-[var(--text-secondary)]">{parcela.seguradora}</span>
            <StatusBadge status={parcela.status} />
          </div>
        </div>
      </div>

      <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">

        {/* Coluna principal */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Dados da parcela */}
          <Card className="border-[var(--border)]">
            <CardContent className="p-5">
              <h2 className="font-semibold text-sm text-[var(--text-primary)] mb-3">Dados da parcela</h2>
              <Separator className="mb-3" />
              <InfoLinha label="Apólice" valor={parcela.numero_apolice} />
              <InfoLinha label="Parcela" valor={parcela.numero ? `Nº ${parcela.numero}` : null} />
              <InfoLinha label="Valor" valor={formatarMoeda(parcela.valor)} />
              <InfoLinha label="Vencimento" valor={formatarData(parcela.data_vencimento)} />
              <InfoLinha label="Dias em atraso" valor={parcela.dias_atraso != null ? `${parcela.dias_atraso} dias` : null} />
              {parcela.observacao && <InfoLinha label="Observação" valor={parcela.observacao} />}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border-[var(--border)]">
            <CardContent className="p-5">
              <h2 className="font-semibold text-sm text-[var(--text-primary)] mb-4">Histórico de contatos</h2>
              <TimelineContatos contatos={contatos} />
            </CardContent>
          </Card>
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-3">
          <Card className="border-[var(--border)]">
            <CardContent className="p-5 flex flex-col gap-2">
              <h2 className="font-semibold text-sm text-[var(--text-primary)] mb-1">Ações</h2>

              <Button className="w-full justify-start gap-2" style={{ backgroundColor: 'var(--brand)', color: 'white' }}
                onClick={() => setMensagemAberto(true)}>
                <Send className="w-4 h-4" /> Enviar mensagem
              </Button>

              <Button variant="outline" className="w-full justify-start gap-2 text-[var(--status-paid)]"
                onClick={() => setConfirmPagar(true)} disabled={parcela.status === 'pago'}>
                <CheckCircle className="w-4 h-4" /> Marcar como paga
              </Button>

              <Button variant="outline" className="w-full justify-start gap-2"
                onClick={() => setRemarcarAberto(true)}>
                <CalendarClock className="w-4 h-4" /> Remarcar
              </Button>

              <Button variant="outline" className="w-full justify-start gap-2 text-[var(--status-escalated)]"
                onClick={() => setConfirmEscalar(true)}>
                <ArrowUpCircle className="w-4 h-4" /> Escalar para vendedor
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog aberto={confirmPagar} onFechar={() => setConfirmPagar(false)}
        onConfirmar={handlePagar} titulo="Marcar como paga?"
        descricao="O status será atualizado para pago." labelConfirmar="Confirmar pagamento" carregando={executando} />

      <ConfirmDialog aberto={confirmEscalar} onFechar={() => setConfirmEscalar(false)}
        onConfirmar={handleEscalar} titulo="Escalar para vendedor?"
        descricao="O status será atualizado para escalado." labelConfirmar="Escalar" carregando={executando} />

      <Dialog open={remarcarAberto} onOpenChange={v => !v && setRemarcarAberto(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Remarcar parcela</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-1.5 py-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Nova data de vencimento</Label>
            <Input type="date" value={novaData} onChange={e => setNovaData(e.target.value)} autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemarcarAberto(false)}>Cancelar</Button>
            <Button onClick={handleRemarcar} disabled={!novaData} style={{ backgroundColor: 'var(--brand)', color: 'white' }}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={mensagemAberto} onOpenChange={v => !v && setMensagemAberto(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Enviar mensagem</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-1.5 py-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Texto da mensagem</Label>
            <Textarea rows={4} placeholder="Digite a mensagem…" value={textoMensagem}
              onChange={e => setTextoMensagem(e.target.value)} autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMensagemAberto(false)}>Cancelar</Button>
            <Button onClick={handleEnviarMensagem} disabled={!textoMensagem.trim() || enviando}
              style={{ backgroundColor: 'var(--brand)', color: 'white' }}>
              {enviando ? 'Enviando…' : 'Registrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
