import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import StatusBadge from '@/components/StatusBadge'
import { formatarMoeda, formatarDataCurta } from '@/utils/format'
import { Eye } from 'lucide-react'

export default function ParcelaCard({ parcela, onPagar, onRemarcar, onEscalar, onVerDetalhe }) {
  const { cliente_nome, seguradora_nome, numero_apolice, valor, data_vencimento, status, dias_atraso } = parcela

  const valorColor =
    status === 'pago'   ? 'text-semantic-success' :
    dias_atraso > 0     ? 'text-brand-primary' :
                          'text-[var(--text-primary)]'

  return (
    <Card variant={dias_atraso > 30 ? 'urgent' : undefined}>
      <CardContent className="p-4 flex flex-col gap-3">

        {/* Linha 1: nome + badge */}
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold text-sm text-[var(--text-primary)] leading-snug">
            {cliente_nome}
          </span>
          <StatusBadge status={status} />
        </div>

        {/* Linha 2: seguradora + apólice */}
        <span className="text-xs text-[var(--text-secondary)]">
          {seguradora_nome}
          {numero_apolice && <> · Apólice {numero_apolice}</>}
        </span>

        {/* Linha 3: valor + vencimento + atraso */}
        <div className="flex items-center justify-between">
          <span className={`font-display font-bold text-base tabular-nums ${valorColor}`}>
            {formatarMoeda(valor)}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-secondary)]">
              Venc. {formatarDataCurta(data_vencimento)}
            </span>
            {dias_atraso > 0 && (
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                dias_atraso <= 15 ? 'text-yellow-700 bg-yellow-50' :
                dias_atraso <= 30 ? 'text-orange-700 bg-orange-50' :
                'text-red-700 bg-red-50'
              }`}>
                {dias_atraso}d
              </span>
            )}
          </div>
        </div>

        {/* Linha 4: ações */}
        <div className="flex gap-1.5 pt-1 flex-wrap">
          <Button size="sm" variant="outline" className="flex-1 text-xs min-w-0" onClick={onPagar}>
            ✓ Pago
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs min-w-0" onClick={onRemarcar}>
            ↷ Remarcar
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs min-w-0" onClick={onEscalar}>
            ↑ Escalar
          </Button>
          <Button size="sm" variant="outline" className="px-2" onClick={onVerDetalhe}>
            <Eye className="w-3.5 h-3.5" />
          </Button>
        </div>

      </CardContent>
    </Card>
  )
}
