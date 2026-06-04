import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { ShieldAlert, Crown, MessageCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import TimelineContatos from '@/components/TimelineContatos'
import { formatarMoeda, formatarData } from '@/utils/format'
import { cn } from '@/lib/utils'

function corDias(dias) {
  if (!dias || dias <= 15) return 'text-yellow-600 bg-yellow-50'
  if (dias <= 30) return 'text-orange-600 bg-orange-50'
  return 'text-red-600 bg-red-50'
}

export default function KanbanCard({ parcela, onBuscarContatos }) {
  const [historicoAberto, setHistoricoAberto] = useState(false)
  const [contatos, setContatos] = useState([])
  const [carregando, setCarregando] = useState(false)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: parcela.parcela_id,
    data: { parcela },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  async function abrirHistorico() {
    setHistoricoAberto(true)
    if (contatos.length === 0) {
      setCarregando(true)
      const data = await onBuscarContatos(parcela.parcela_id)
      setContatos(data)
      setCarregando(false)
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={cn(
          'bg-[var(--surface)] rounded-card border border-[var(--border)] p-3 flex flex-col gap-2 shadow-sm select-none',
          parcela.cliente_vip && 'border-l-4 border-l-yellow-400',
          parcela.cobertura_em_risco && 'ring-1 ring-red-300'
        )}
      >
        {/* Linha 1: nome + badges */}
        <div className="flex items-start justify-between gap-1">
          <p className="font-semibold text-sm text-[var(--text-primary)] leading-snug flex-1">
            {parcela.cliente_nome}
          </p>
          <div className="flex items-center gap-1 shrink-0">
            {parcela.cliente_vip && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
            {parcela.cobertura_em_risco && <ShieldAlert className="w-3.5 h-3.5 text-red-500" />}
          </div>
        </div>

        {/* Linha 2: seguradora + apólice */}
        <p className="text-xs text-[var(--text-secondary)] leading-tight">
          {parcela.seguradora_nome}
          {parcela.numero_apolice && <> · {parcela.numero_apolice}</>}
        </p>

        {/* Linha 3: valor + dias */}
        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-base tabular-nums text-[var(--text-primary)]">
            {formatarMoeda(parcela.valor)}
          </span>
          <span className={cn('text-xs font-semibold px-1.5 py-0.5 rounded', corDias(parcela.dias_atraso))}>
            {parcela.dias_atraso ?? 0}d
          </span>
        </div>

        {/* Linha 4: contatos + botão histórico */}
        <div className="flex items-center justify-between pt-0.5 border-t border-[var(--border)]">
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <MessageCircle className="w-3 h-3" />
            {parcela.total_contatos ?? 0} contato{parcela.total_contatos !== 1 ? 's' : ''}
          </div>
          <button
            onClick={e => { e.stopPropagation(); abrirHistorico() }}
            className="text-xs text-[var(--brand)] hover:underline font-medium"
          >
            Histórico
          </button>
        </div>
      </div>

      {/* Sheet de histórico */}
      <Sheet open={historicoAberto} onOpenChange={setHistoricoAberto}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display text-base">{parcela.cliente_nome}</SheetTitle>
            <p className="text-sm text-[var(--text-secondary)]">
              {parcela.seguradora_nome} · {formatarMoeda(parcela.valor)} · Venc. {formatarData(parcela.data_vencimento)}
            </p>
          </SheetHeader>
          {carregando
            ? <div className="flex flex-col gap-3"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
            : <TimelineContatos contatos={contatos} />
          }
        </SheetContent>
      </Sheet>
    </>
  )
}
