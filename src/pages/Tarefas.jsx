import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { parcelasParaRevisar, solicitarNovaCobranca, atualizarStatus } from '@/services/parcelas'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import ConfirmDialog from '@/components/ConfirmDialog'
import { formatarMoeda } from '@/utils/format'
import { linkWhatsApp } from '@/utils/whatsapp'
import { Send, Check, ArrowUpRight, AlertTriangle, CheckCircle2, MessageCircle } from 'lucide-react'

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
  const [processando, setProcessando] = useState(null) // parcela_id em ação

  const { data: parcelas = [], isLoading } = useQuery({
    queryKey: ['parcelas-revisar'],
    queryFn: () => parcelasParaRevisar().then(r => r.data),
  })

  function recarregar() {
    queryClient.invalidateQueries({ queryKey: ['parcelas-revisar'] })
    queryClient.invalidateQueries({ queryKey: ['parcelas'] })
  }

  async function handleCobrar() {
    const p = confirmCobrar
    setConfirmCobrar(null)
    setProcessando(p.parcela_id)
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
    <div className="min-h-screen bg-[var(--background)]">
      <Toaster />

      <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--surface)]">
        <h1 className="font-display font-semibold text-2xl text-[var(--text-primary)]">Tarefas do dia</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Revise as parcelas que precisam de atenção e, em cada uma, cobre de novo, marque como paga ou escale.
        </p>
      </div>

      <div className="px-4 md:px-6 py-6 flex flex-col gap-3 max-w-3xl">
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : parcelas.length === 0 ? (
          <EmptyState icone={CheckCircle2} titulo="Tudo em dia! 🎉" descricao="Nenhuma parcela precisa de ação agora." />
        ) : (
          parcelas.map(p => {
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
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" disabled={ocupado} onClick={(e) => { e.stopPropagation(); setConfirmCobrar(p) }}
                      style={{ backgroundColor: 'var(--brand)', color: 'white' }}>
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
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <ConfirmDialog
        aberto={!!confirmCobrar}
        onFechar={() => setConfirmCobrar(null)}
        onConfirmar={handleCobrar}
        titulo="Enviar nova cobrança?"
        descricao={confirmCobrar ? `Vai disparar uma nova mensagem de WhatsApp com o boleto para ${confirmCobrar.cliente_nome}.` : ''}
        labelConfirmar="Enviar cobrança"
      />
    </div>
  )
}
