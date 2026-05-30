import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useKanbanCobrancas } from '@/hooks/useKanbanCobrancas'
import { useQuery } from '@tanstack/react-query'
import { listarSeguradoras } from '@/services/seguradoras'
import KanbanColuna from '@/components/KanbanColuna'
import KanbanCard from '@/components/KanbanCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Toggle } from '@/components/ui/toggle'
import { PlusCircle, Crown, ShieldAlert } from 'lucide-react'

export default function KanbanCobrancas() {
  const navigate = useNavigate()
  const [cardArrastando, setCardArrastando] = useState(null)
  const [novaColunaNome, setNovaColunaNome] = useState('')
  const [adicionandoColuna, setAdicionandoColuna] = useState(false)

  const {
    colunas, parcelasPorColuna, isLoading, filtros, setFiltros,
    moverCard, renomearColuna, criarColuna, deletarColuna, buscarContatos,
  } = useKanbanCobrancas()

  const { data: seguradoras = [] } = useQuery({
    queryKey: ['seguradoras'],
    queryFn: () => listarSeguradoras().then(r => r.data ?? []),
    staleTime: 1000 * 60 * 10,
  })

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function onDragStart({ active }) {
    const parcela = Object.values(parcelasPorColuna).flat().find(p => p.parcela_id === active.id)
    setCardArrastando(parcela ?? null)
  }

  async function onDragEnd({ active, over }) {
    setCardArrastando(null)
    if (!over || active.id === over.id) return
    await moverCard({ parcelaId: active.id, coluna: over.id })
  }

  async function handleCriarColuna() {
    if (!novaColunaNome.trim()) return
    await criarColuna(novaColunaNome.trim())
    setNovaColunaNome('')
    setAdicionandoColuna(false)
  }

  if (isLoading) {
    return (
      <div className="p-6 flex gap-4 overflow-x-auto">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-64 shrink-0 flex flex-col gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-[var(--background)]">

      {/* Cabeçalho */}
      <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display font-semibold text-2xl text-[var(--text-primary)]">Cobranças</h1>
        <Button onClick={() => navigate('/nova-parcela')} style={{ backgroundColor: 'var(--brand)', color: 'white' }}>
          <PlusCircle className="w-4 h-4 mr-2" /> Nova Parcela
        </Button>
      </div>

      {/* Filtros */}
      <div className="px-6 py-3 border-b border-[var(--border)] bg-[var(--surface)] flex items-center gap-3 flex-wrap">
        <Input
          placeholder="Buscar cliente…"
          value={filtros.busca}
          onChange={e => setFiltros(f => ({ ...f, busca: e.target.value }))}
          className="w-48"
        />
        <Select value={filtros.seguradora_id} onValueChange={v => setFiltros(f => ({ ...f, seguradora_id: v === 'todas' ? '' : v }))}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Seguradora" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {seguradoras.map(s => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtros.dias} onValueChange={v => setFiltros(f => ({ ...f, dias: v }))}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os atrasos</SelectItem>
            <SelectItem value="ate15">Até 15 dias</SelectItem>
            <SelectItem value="16a30">16 a 30 dias</SelectItem>
            <SelectItem value="mais30">Mais de 30 dias</SelectItem>
          </SelectContent>
        </Select>
        <button
          onClick={() => setFiltros(f => ({ ...f, vip: !f.vip }))}
          className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded-md border font-medium transition-colors ${filtros.vip ? 'bg-yellow-50 border-yellow-400 text-yellow-700' : 'border-[var(--border)] text-[var(--text-secondary)]'}`}
        >
          <Crown className="w-3.5 h-3.5" /> VIP
        </button>
        <button
          onClick={() => setFiltros(f => ({ ...f, risco: !f.risco }))}
          className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded-md border font-medium transition-colors ${filtros.risco ? 'bg-red-50 border-red-400 text-red-700' : 'border-[var(--border)] text-[var(--text-secondary)]'}`}
        >
          <ShieldAlert className="w-3.5 h-3.5" /> Cobertura em risco
        </button>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="flex gap-4 h-full items-start">
            {colunas.map(col => (
              <KanbanColuna
                key={col.id}
                coluna={col}
                parcelas={parcelasPorColuna[col.nome] ?? []}
                onRenomear={renomearColuna}
                onDeletar={deletarColuna}
                onBuscarContatos={buscarContatos}
              />
            ))}

            {/* Nova coluna */}
            <div className="w-64 shrink-0">
              {adicionandoColuna ? (
                <div className="flex flex-col gap-2">
                  <Input
                    autoFocus
                    placeholder="Nome da coluna…"
                    value={novaColunaNome}
                    onChange={e => setNovaColunaNome(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleCriarColuna(); if (e.key === 'Escape') setAdicionandoColuna(false) }}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleCriarColuna} style={{ backgroundColor: 'var(--brand)', color: 'white' }}>Criar</Button>
                    <Button size="sm" variant="ghost" onClick={() => setAdicionandoColuna(false)}>Cancelar</Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAdicionandoColuna(true)}
                  className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors w-full px-2 py-2 rounded-lg hover:bg-[var(--surface-raised)]"
                >
                  <PlusCircle className="w-4 h-4" /> Nova coluna
                </button>
              )}
            </div>
          </div>

          <DragOverlay>
            {cardArrastando && (
              <KanbanCard parcela={cardArrastando} onBuscarContatos={() => []} />
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
