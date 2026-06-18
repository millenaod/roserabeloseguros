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
import { linkWhatsApp, mensagemCobrancaPadrao } from '@/utils/whatsapp'
import { labelTipoPagamento } from '@/utils/pagamento'
import { ArrowLeft, CheckCircle, CalendarClock, ArrowUpCircle, Send, MessageCircle, FileText, Archive, RotateCcw, Paperclip } from 'lucide-react'

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

  const { parcela, isLoading, contatos, executando, pagar, escalar, desconsiderar, reativar, remarcar, atualizarBoleto, cobrarDeNovo, enviarMensagem } = useDetalheParcela(id)

  const [confirmPagar, setConfirmPagar]     = useState(false)
  const [confirmEscalar, setConfirmEscalar] = useState(false)
  const [confirmDesconsiderar, setConfirmDesconsiderar] = useState(false)
  const [remarcarAberto, setRemarcarAberto] = useState(false)
  const [mensagemAberto, setMensagemAberto] = useState(false)
  const [novaData, setNovaData]             = useState('')
  const [textoMensagem, setTextoMensagem]   = useState('')
  const [enviando, setEnviando]             = useState(false)
  const [enviandoBoleto, setEnviandoBoleto] = useState(false)
  const [cobrarAberto, setCobrarAberto]     = useState(false)
  const [novoBoletoFile, setNovoBoletoFile] = useState(null)
  const [cobrando, setCobrando]             = useState(false)

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

  async function handleDesconsiderar() {
    await desconsiderar()
    setConfirmDesconsiderar(false)
    toast({ title: 'Parcela desconsiderada.', description: 'Saiu da cobrança. Você encontra em Parcelas → Desconsideradas.' })
  }

  async function handleReativar() {
    await reativar()
    toast({ title: 'Parcela reativada!', description: 'Voltou para a cobrança como "A cobrar".' })
  }

  async function handleRemarcar() {
    if (!novaData) return
    const { error } = await remarcar(novaData)
    if (!error) { setRemarcarAberto(false); setNovaData(''); toast({ title: 'Parcela remarcada!' }) }
  }

  async function handleNovoBoleto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setEnviandoBoleto(true)
    const { error } = await atualizarBoleto(file)
    setEnviandoBoleto(false)
    e.target.value = ''
    if (error) {
      toast({ title: 'Erro ao enviar boleto', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Boleto atualizado!' })
    }
  }

  async function handleCobrarDeNovo() {
    setCobrando(true)
    const { error } = await cobrarDeNovo(novoBoletoFile)
    setCobrando(false)
    setCobrarAberto(false)
    setNovoBoletoFile(null)
    if (error) toast({ title: 'Não foi possível cobrar', description: 'Tente novamente em instantes.', variant: 'destructive' })
    else toast({ title: 'Cobrança enviada!', description: `Nova mensagem disparada para ${parcela.cliente_nome}.` })
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
          <h1 className="font-display font-semibold text-xl text-[var(--text-primary)]">{parcela.cliente_nome}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm text-[var(--text-secondary)]">{parcela.seguradora_nome}</span>
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
              <InfoLinha label="Apólice"        valor={parcela.numero_apolice} />
              <InfoLinha label="Parcela"        valor={parcela.numero_parcela ? `Nº ${parcela.numero_parcela}` : null} />
              <InfoLinha label="Tipo de seguro" valor={parcela.tipo_seguro} />
              <InfoLinha label="Valor"          valor={formatarMoeda(parcela.valor)} />
              <InfoLinha label="Forma de pagamento" valor={labelTipoPagamento(parcela.tipo_pagamento)} />
              <InfoLinha label="Vencimento"     valor={formatarData(parcela.data_vencimento)} />
              <InfoLinha label="Dias em atraso" valor={parcela.dias_atraso != null ? `${parcela.dias_atraso} dias` : null} />
              <InfoLinha label="Telefone"       valor={parcela.cliente_telefone} />
              <InfoLinha label="CPF/CNPJ"       valor={parcela.cliente_cpf} />
              {parcela.eh_primeira_parcela && <InfoLinha label="Observação" valor="Primeira parcela da apólice" />}
              {parcela.cobertura_em_risco   && <InfoLinha label="⚠️ Cobertura" valor="Em risco (+15 dias de atraso)" />}
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
                onClick={() => setCobrarAberto(true)} disabled={cobrando}>
                <Send className="w-4 h-4" /> Cobrar de novo
              </Button>

              <Button className="w-full justify-start gap-2" style={{ backgroundColor: '#25D366', color: 'white' }}
                onClick={() => window.open(linkWhatsApp(parcela), '_blank', 'noopener')}>
                <MessageCircle className="w-4 h-4" /> Abrir no WhatsApp
              </Button>

              <Button variant="outline" className="w-full justify-start gap-2"
                onClick={() => { setTextoMensagem(mensagemCobrancaPadrao(parcela)); setMensagemAberto(true) }}>
                <Send className="w-4 h-4" /> Mensagem manual…
              </Button>

              {parcela.boleto_url && (
                <Button variant="outline" className="w-full justify-start gap-2"
                  onClick={() => window.open(parcela.boleto_url, '_blank', 'noopener')}>
                  <FileText className="w-4 h-4" /> Ver boleto
                </Button>
              )}

              <label className="w-full">
                <Button variant="outline" className="w-full justify-start gap-2 pointer-events-none"
                  disabled={enviandoBoleto} asChild>
                  <span>
                    <Paperclip className="w-4 h-4" />
                    {enviandoBoleto ? 'Enviando…' : parcela.boleto_url ? 'Substituir boleto…' : 'Anexar boleto…'}
                  </span>
                </Button>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  disabled={enviandoBoleto}
                  onChange={handleNovoBoleto}
                />
              </label>

              {parcela.status === 'desconsiderada' ? (
                <Button variant="outline" className="w-full justify-start gap-2 text-[var(--brand)]"
                  onClick={handleReativar} disabled={executando}>
                  <RotateCcw className="w-4 h-4" /> Reativar cobrança
                </Button>
              ) : (
                <>
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

                  <Button variant="ghost" className="w-full justify-start gap-2 text-[var(--text-secondary)]"
                    onClick={() => setConfirmDesconsiderar(true)}>
                    <Archive className="w-4 h-4" /> Desconsiderar
                  </Button>
                </>
              )}
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

      <ConfirmDialog aberto={confirmDesconsiderar} onFechar={() => setConfirmDesconsiderar(false)}
        onConfirmar={handleDesconsiderar} titulo="Desconsiderar esta parcela?"
        descricao="Ela sai da cobrança (Tarefas, Carteira e Parcelas). Fica guardada em Parcelas → Desconsideradas e pode ser reativada quando quiser."
        labelConfirmar="Desconsiderar" carregando={executando} />

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

      <Dialog open={cobrarAberto} onOpenChange={v => { if (!v) { setCobrarAberto(false); setNovoBoletoFile(null) } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Cobrar de novo</DialogTitle>
            <p className="text-sm text-[var(--text-secondary)]">Tem boleto atualizado? Anexe antes de enviar.</p>
          </DialogHeader>
          <div className="flex flex-col gap-1.5 py-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Boleto atualizado? Anexe antes de enviar</p>
            <label className="w-full cursor-pointer">
              <Button variant="outline" className="w-full justify-start gap-2 pointer-events-none" asChild>
                <span>
                  <Paperclip className="w-4 h-4" />
                  {novoBoletoFile ? novoBoletoFile.name : 'Anexar novo boleto (opcional)'}
                </span>
              </Button>
              <input type="file" accept="application/pdf,image/*" className="hidden"
                onChange={e => setNovoBoletoFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => { setCobrarAberto(false); setNovoBoletoFile(null) }}>Cancelar</Button>
            <Button onClick={handleCobrarDeNovo} disabled={cobrando} style={{ backgroundColor: 'var(--brand)', color: 'white' }}>
              {cobrando ? 'Enviando…' : 'Enviar cobrança'}
            </Button>
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
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={handleEnviarMensagem} disabled={!textoMensagem.trim() || enviando}>
              {enviando ? 'Salvando…' : 'Só registrar'}
            </Button>
            <Button onClick={() => window.open(linkWhatsApp(parcela, textoMensagem), '_blank', 'noopener')}
              disabled={!textoMensagem.trim()} className="gap-2"
              style={{ backgroundColor: '#25D366', color: 'white' }}>
              <MessageCircle className="w-4 h-4" /> Abrir no WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
