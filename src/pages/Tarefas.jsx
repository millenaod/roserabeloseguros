import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { parcelasParaRevisar, solicitarNovaCobranca, atualizarStatus, atualizarBoleto } from '@/services/parcelas'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import AlertaFalhaEntrega from '@/components/AlertaFalhaEntrega'
import { useFiltroTarefas, FILTROS_TAREFAS } from '@/hooks/useFiltroTarefas'
import { cn } from '@/lib/utils'
import { formatarMoeda } from '@/utils/format'
import { linkWhatsApp } from '@/utils/whatsapp'
import { Send, Check, ArrowUpRight, AlertTriangle, CheckCircle2, MessageCircle, Archive, Paperclip, Search, X, SearchX } from 'lucide-react'

function tempoDesde(iso) {
  if (!iso) return 'nunca contatado'
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (dias <= 0) return 'contatado hoje'
  if (dias === 1) return 'último contato ontem'
  return `último contato há ${dias} dias`
}

export default function Tarefas() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [confirmCobrar, setConfirmCobrar] = useState(null)
  const [novoBoletoFile, setNovoBoletoFile] = useState(null)
  const [processando, setProcessando] = useState(null) // parcela_id em ação

  const { data: parcelas = [], isLoading } = useQuery({
    queryKey: ['parcelas-revisar'],
    queryFn: () => parcelasParaRevisar().then(r => r.data),
  })

  const { busca, setBusca, filtro, setFiltro, limpar, temFiltro, filtradas, contagens } = useFiltroTarefas(parcelas)

  function recarregar() {
    queryClient.invalidateQueries({ queryKey: ['parcelas-revisar'] })
    queryClient.invalidateQueries({ queryKey: ['parcelas'] })
  }

  async function handleCobrar() {
    const p = confirmCobrar
    const arquivo = novoBoletoFile
    setConfirmCobrar(null)
    setNovoBoletoFile(null)
    setProcessando(p.parcela_id)

    if (arquivo) {
      const { error: erroBoleto } = await atualizarBoleto(p.parcela_id, arquivo)
      if (erroBoleto) {
        setProcessando(null)
        toast({ title: 'Erro ao enviar boleto', description: erroBoleto.message, variant: 'destructive' })
        return
      }
    }

    const { error } = await solicitarNovaCobranca(p.parcela_id)
    setProcessando(null)
    if (error) toast({ title: 'Não foi possível cobrar', description: 'Tente novamente em instantes.', variant: 'destructive' })
    else { toast({ title: 'Cobrança enviada!', description: `Nova mensagem disparada para ${p.cliente_nome}.` }); recarregar() }
  }

  async function handleStatus(p, status, msg) {
    setProcessando(p.parcela_id)
    const { error } = await atualizarStatus(p.parcela_id, status)
    setProcessando(null)
    if (error) toast({ title: 'Erro', description: 'Tente novamente.', variant: 'destructive' })
    else { toast({ title: msg }); recarregar() }
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--surface)]">
        <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">Tarefas do dia</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Revise as parcelas que precisam de atenção e, em cada uma, cobre de novo, marque como paga ou escale.
        </p>
      </div>

      <div className="px-4 md:px-6 py-6 flex flex-col gap-3 max-w-3xl">
        {!isLoading && parcelas.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
              <Input
                type="search"
                className="pl-9 pr-9"
                placeholder="Buscar por cliente, CPF, telefone ou seguradora…"
                aria-label="Buscar nas tarefas"
                value={busca}
                onChange={e => setBusca(e.target.value)}
              />
              {busca && (
                <button
                  type="button"
                  aria-label="Limpar busca"
                  onClick={() => setBusca('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filtros rápidos — rolam na horizontal no celular */}
            <div className="flex gap-2 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-0.5" role="group" aria-label="Filtros rápidos">
              {FILTROS_TAREFAS.map(f => {
                const ativo = filtro === f.value
                return (
                  <button
                    key={f.value || 'todas'}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => setFiltro(f.value)}
                    className={cn(
                      'shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-xs font-medium transition-colors',
                      ativo
                        ? 'bg-[var(--brand)] border-[var(--brand)] text-white'
                        : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-raised)]'
                    )}
                  >
                    {f.label}
                    <span className={cn('tabular-nums', ativo ? 'text-white/80' : 'text-[var(--text-muted)]')}>{contagens[f.value]}</span>
                  </button>
                )
              })}
            </div>

            {temFiltro && (
              <p className="text-xs text-[var(--text-muted)]" aria-live="polite">
                {filtradas.length} de {parcelas.length} parcela{parcelas.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : parcelas.length === 0 ? (
          <EmptyState icone={CheckCircle2} titulo="Tudo em dia! 🎉" descricao="Nenhuma parcela precisa de ação agora." />
        ) : filtradas.length === 0 ? (
          <EmptyState
            icone={SearchX}
            titulo="Nenhuma parcela encontrada"
            descricao={busca ? `Nada corresponde a “${busca}” neste filtro.` : 'Nenhuma parcela neste filtro.'}
            acaoLabel="Limpar busca e filtros"
            onAcao={limpar}
          />
        ) : (
          filtradas.map(p => {
            const ocupado = processando === p.parcela_id
            return (
              <Card key={p.parcela_id} className={`border-[var(--border)] ${p.cobertura_em_risco ? 'border-l-4 border-l-[var(--status-error)]' : ''}`}>
                {/* Card inteiro abre o detalhe da parcela; os botões abaixo param a propagação. */}
                <CardContent
                  className="p-4 flex flex-col gap-3 cursor-pointer"
                  onClick={() => navigate(`/parcelas/${p.parcela_id}`)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-left min-w-0">
                      <p className="font-semibold text-[var(--text-primary)] truncate">{p.cliente_nome}</p>
                      <p className="text-xs text-[var(--text-secondary)] truncate">
                        {p.seguradora_nome} · Parcela {p.numero_parcela} · {formatarMoeda(p.valor)}
                      </p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>

                  <div className="flex items-center gap-3 flex-wrap text-xs">
                    {p.cobertura_em_risco && (
                      <span className="inline-flex items-center gap-1 font-semibold text-[var(--status-error)]">
                        <AlertTriangle className="w-3.5 h-3.5" /> Cobertura em risco
                      </span>
                    )}
                    {(p.dias_atraso ?? 0) > 0 && <span className="text-[var(--text-secondary)]">{p.dias_atraso} dias de atraso</span>}
                    <span className="text-[var(--text-muted)]">· {p.total_contatos ?? 0} contato(s) · {tempoDesde(p.ultimo_contato_em)}</span>
                    <AlertaFalhaEntrega parcela={p} />
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="primary" disabled={ocupado} onClick={(e) => { e.stopPropagation(); setConfirmCobrar(p) }}>
                      <Send className="w-4 h-4 mr-1.5" /> Cobrar de novo
                    </Button>
                    <Button size="sm" variant="outline" disabled={ocupado}
                      onClick={(e) => { e.stopPropagation(); window.open(linkWhatsApp(p), '_blank', 'noopener') }}
                      style={{ borderColor: '#25D366', color: '#1ea952' }}>
                      <MessageCircle className="w-4 h-4 mr-1.5" /> WhatsApp
                    </Button>
                    <Button size="sm" variant="outline" disabled={ocupado}
                      onClick={(e) => { e.stopPropagation(); handleStatus(p, 'pago', 'Marcada como paga!') }}>
                      <Check className="w-4 h-4 mr-1.5" /> Marcar paga
                    </Button>
                    <Button size="sm" variant="ghost" disabled={ocupado} className="text-[var(--text-secondary)]"
                      onClick={(e) => { e.stopPropagation(); handleStatus(p, 'escalado', 'Escalada para o vendedor.') }}>
                      <ArrowUpRight className="w-4 h-4 mr-1.5" /> Escalar
                    </Button>
                    <Button size="sm" variant="ghost" disabled={ocupado} className="text-[var(--text-muted)]"
                      onClick={(e) => { e.stopPropagation(); handleStatus(p, 'desconsiderada', 'Parcela desconsiderada.') }}>
                      <Archive className="w-4 h-4 mr-1.5" /> Desconsiderar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <Dialog open={!!confirmCobrar} onOpenChange={v => { if (!v) { setConfirmCobrar(null); setNovoBoletoFile(null) } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Cobrar de novo</DialogTitle>
            {confirmCobrar && (
              <DialogDescription className="text-[var(--text-secondary)]">
                Tem boleto atualizado? Anexe antes de enviar para {confirmCobrar.cliente_nome}.
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="flex flex-col gap-1.5 py-1">
            {confirmCobrar?.boleto_url && !novoBoletoFile && (
              <p className="text-xs text-[var(--text-secondary)]">Será enviado o boleto já anexado. Troque abaixo se tiver um atualizado.</p>
            )}
            <label className="w-full cursor-pointer">
              <Button variant="outline" className="w-full justify-start gap-2 pointer-events-none" asChild>
                <span>
                  <Paperclip className="w-4 h-4" />
                  {novoBoletoFile ? novoBoletoFile.name : confirmCobrar?.boleto_url ? 'Substituir boleto' : 'Anexar boleto *'}
                </span>
              </Button>
              <input type="file" accept="application/pdf,image/*" className="hidden"
                onChange={e => setNovoBoletoFile(e.target.files?.[0] ?? null)} />
            </label>
            {!confirmCobrar?.boleto_url && !novoBoletoFile && (
              <p className="text-xs text-[var(--status-error)]">O template exige um boleto anexado.</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => { setConfirmCobrar(null); setNovoBoletoFile(null) }}>Cancelar</Button>
            <Button variant="primary" onClick={handleCobrar} disabled={!confirmCobrar?.boleto_url && !novoBoletoFile}>
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
