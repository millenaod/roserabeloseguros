import { useState, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Trash2 } from 'lucide-react'
import KanbanCard from '@/components/KanbanCard'
import { cn } from '@/lib/utils'

export default function KanbanColuna({ coluna, parcelas, onRenomear, onDeletar, onBuscarContatos }) {
  const [editando, setEditando] = useState(false)
  const [nomeEdit, setNomeEdit] = useState(coluna.nome)
  const inputRef = useRef(null)

  const { setNodeRef, isOver } = useDroppable({ id: coluna.nome })

  useEffect(() => {
    if (editando) inputRef.current?.focus()
  }, [editando])

  function confirmarNome() {
    if (nomeEdit.trim() && nomeEdit.trim() !== coluna.nome) {
      onRenomear(coluna.id, nomeEdit.trim())
    } else {
      setNomeEdit(coluna.nome)
    }
    setEditando(false)
  }

  return (
    <div className="flex flex-col w-64 shrink-0">
      {/* Cabeçalho da coluna */}
      <div className="flex items-center justify-between mb-2 px-1 group">
        {editando ? (
          <input
            ref={inputRef}
            value={nomeEdit}
            onChange={e => setNomeEdit(e.target.value)}
            onBlur={confirmarNome}
            onKeyDown={e => { if (e.key === 'Enter') confirmarNome(); if (e.key === 'Escape') { setNomeEdit(coluna.nome); setEditando(false) } }}
            className="font-semibold text-sm text-[var(--text-primary)] bg-transparent border-b border-[var(--brand)] outline-none w-full"
          />
        ) : (
          <h3
            onDoubleClick={() => setEditando(true)}
            title="Duplo clique para renomear"
            className="font-semibold text-sm text-[var(--text-primary)] truncate cursor-default select-none flex-1"
          >
            {coluna.nome}
          </h3>
        )}
        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-xs font-semibold text-[var(--text-muted)] bg-[var(--surface-raised)] px-1.5 py-0.5 rounded-full">
            {parcelas.length}
          </span>
          {parcelas.length === 0 && (
            <button
              onClick={() => onDeletar(coluna.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-[var(--status-error)]"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Área droppable */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-col gap-2 rounded-lg p-2 min-h-[120px] transition-colors',
          isOver ? 'bg-[var(--brand-light)] border-2 border-dashed border-[var(--brand)]' : 'bg-[var(--surface-raised)]'
        )}
      >
        {parcelas.map(p => (
          <KanbanCard
            key={p.parcela_id}
            parcela={p}
            onBuscarContatos={onBuscarContatos}
          />
        ))}
        {parcelas.length === 0 && (
          <p className="text-xs text-[var(--text-muted)] text-center py-4 select-none">Vazio</p>
        )}
      </div>
    </div>
  )
}
