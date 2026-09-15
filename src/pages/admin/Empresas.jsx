import { useEffect, useState } from 'react'
import { Building2, Plus, Users, FileText } from 'lucide-react'
import { listarEmpresas } from '@/services/admin'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

function PlanoBadge({ plano }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-cobra-tint text-cobra">
      {plano}
    </span>
  )
}

export default function AdminEmpresas() {
  const [empresas, setEmpresas] = useState(null) // null = carregando
  const [erro, setErro] = useState('')

  useEffect(() => {
    listarEmpresas().then(({ data, error }) => {
      if (error) setErro('Não foi possível carregar as empresas.')
      setEmpresas(data)
    })
  }, [])

  return (
    <div className="cobra-theme px-6 py-6 md:px-10 md:py-8 max-w-5xl">
      {/* Cabeçalho estilo referência: título + subtítulo + divisória */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cobra-ink">Empresas</h1>
          <p className="text-sm text-cobra-muted mt-0.5">Todas as corretoras na plataforma CobraAI</p>
        </div>
        <Button variant="cobra" disabled title="Em breve">
          <Plus className="w-4 h-4" /> Nova empresa
        </Button>
      </div>
      <div className="border-t border-cobra-border mt-4 mb-6" />

      {erro && (
        <p className="text-sm text-[var(--status-error)] bg-[var(--status-error-bg)] px-3 py-2 rounded-md mb-4">
          {erro}
        </p>
      )}

      {/* Carregando */}
      {empresas === null && (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Vazio */}
      {empresas && empresas.length === 0 && !erro && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-cobra-tint flex items-center justify-center">
            <Building2 className="w-7 h-7 text-cobra" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-bold text-cobra-ink">Nenhuma empresa ainda</p>
            <p className="text-sm text-cobra-muted max-w-xs">
              As corretoras aparecem aqui conforme criam conta ou você as cadastra.
            </p>
          </div>
        </div>
      )}

      {/* Lista */}
      {empresas && empresas.length > 0 && (
        <div className="flex flex-col gap-3">
          {empresas.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-cobra-border bg-white p-4 hover:border-cobra/40 transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-cobra-ink truncate">{e.nome}</p>
                  <PlanoBadge plano={e.plano} />
                  {!e.ativo && (
                    <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      Inativa
                    </span>
                  )}
                </div>
                <p className="text-xs text-cobra-faint truncate mt-0.5">/{e.slug}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0 text-sm text-cobra-muted">
                <span className="flex items-center gap-1.5" title="Usuários">
                  <Users className="w-4 h-4" /> {e.total_usuarios}
                </span>
                <span className="flex items-center gap-1.5" title="Parcelas">
                  <FileText className="w-4 h-4" /> {e.total_parcelas}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
