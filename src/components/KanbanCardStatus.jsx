import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useNavigate } from 'react-router-dom'
import { formatarMoeda, formatarDataCurta } from '@/utils/format'
import { cn } from '@/lib/utils'
import { Send } from 'lucide-react'

export default function KanbanCardStatus({ parcela, onCobrar }) {
  const navigate = useNavigate()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: parcela.parcela_id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }}
      {...listeners}
      {...attributes}
      onClick={() => navigate(`/parcelas/${parcela.parcela_id}`)}
      className={cn(
        'bg-[var(--surface)] rounded-card border border-[var(--border)] p-3 flex flex-col gap-1.5',
        'shadow-sm select-none cursor-grab active:cursor-grabbing',
        'hover:shadow-md transition-shadow',
        isDragging && 'cursor-grabbing'
      )}
    >
      <p className="font-semibold text-sm text-[var(--text-primary)] leading-snug">
        {parcela.cliente_nome}
      </p>
      <p className="text-xs text-[var(--text-secondary)]">{parcela.seguradora_nome}</p>
      <div className="flex items-center justify-between pt-0.5">
        <span className="font-display font-bold text-base tabular-nums text-[var(--text-primary)]">
          {formatarMoeda(parcela.valor)}
        </span>
        <span className="text-xs text-[var(--text-muted)]">
          {formatarDataCurta(parcela.data_vencimento)}
        </span>
      </div>
      {(parcela.dias_atraso ?? 0) > 0 && (
        <span className={cn('text-xs font-semibold self-start px-1.5 py-0.5 rounded',
          parcela.dias_atraso <= 15 ? 'text-yellow-700 bg-yellow-50' :
          parcela.dias_atraso <= 30 ? 'text-orange-700 bg-orange-50' :
          'text-red-700 bg-red-50'
        )}>
          {parcela.dias_atraso}d em atraso
        </span>
      )}
      {onCobrar && (
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onCobrar(parcela) }}
          className="flex items-center gap-1 text-xs font-semibold text-[var(--brand)] hover:underline self-start mt-0.5"
        >
          <Send className="w-3 h-3" /> Cobrar de novo
        </button>
      )}
    </div>
  )
}
