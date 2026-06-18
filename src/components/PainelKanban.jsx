import { useState } from 'react'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import KanbanCardStatus from '@/components/KanbanCardStatus'
import { cn } from '@/lib/utils'

// Kanban enxuto: 4 colunas que cobrem o ciclo real da cobrança.
const COLUNAS = [
  { status: 'pendente',    label: 'A cobrar',    cor: 'var(--status-pending)' },
  { status: 'em_cobranca', label: 'Em cobrança', cor: '#f97316' },
  { status: 'pago',        label: 'Pago',        cor: 'var(--status-paid)' },
  { status: 'escalado',    label: 'Escalado',    cor: 'var(--status-escalated)' },
]

// Mapeia qualquer status (inclusive os antigos) para uma das 4 colunas, pra nenhuma parcela sumir.
const COLUNA_DE = {
  pendente: 'pendente', erro: 'pendente',
  em_cobranca: 'em_cobranca', enviado: 'em_cobranca', aguardando_retorno: 'em_cobranca', remarcado: 'em_cobranca',
  pago: 'pago',
  escalado: 'escalado',
}

function Coluna({ status, label, cor, parcelas, onCobrar }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex flex-col w-60 shrink-0">
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cor }} />
        <h3 className="font-display font-bold text-base text-[var(--text-primary)] truncate flex-1">{label}</h3>
        <span className="text-xs font-semibold text-[var(--text-muted)] bg-[var(--surface-raised)] px-1.5 py-0.5 rounded-full">
          {parcelas.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-col gap-2 rounded-lg p-2 min-h-[100px] transition-colors',
          isOver ? 'bg-[var(--brand-light)] ring-2 ring-dashed ring-[var(--brand)]' : 'bg-[var(--surface-raised)]'
        )}
      >
        {parcelas.map(p => (
          <KanbanCardStatus key={p.parcela_id} parcela={p} onCobrar={onCobrar} />
        ))}
        {parcelas.length === 0 && (
          <p className="text-xs text-[var(--text-muted)] text-center py-4 select-none">Vazio</p>
        )}
      </div>
    </div>
  )
}

export default function PainelKanban({ parcelas, onMoverCard, onCobrar }) {
  const [cardArrastando, setCardArrastando] = useState(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function onDragStart({ active }) {
    setCardArrastando(parcelas.find(p => p.parcela_id === active.id) ?? null)
  }

  async function onDragEnd({ active, over }) {
    setCardArrastando(null)
    if (!over || active.id === over.id) return
    await onMoverCard(active.id, over.id)
  }

  const porStatus = COLUNAS.reduce((acc, col) => { acc[col.status] = []; return acc }, {})
  parcelas.forEach(p => {
    const col = COLUNA_DE[p.status] ?? 'pendente'
    porStatus[col].push(p)
  })

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUNAS.map(col => (
          <Coluna
            key={col.status}
            status={col.status}
            label={col.label}
            cor={col.cor}
            parcelas={porStatus[col.status] ?? []}
            onCobrar={onCobrar}
          />
        ))}
      </div>

      <DragOverlay>
        {cardArrastando && <KanbanCardStatus parcela={cardArrastando} />}
      </DragOverlay>
    </DndContext>
  )
}
