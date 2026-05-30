import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import StatusBadge from '@/components/StatusBadge'
import { formatarMoeda, formatarDataCurta } from '@/utils/format'

export default function ParcelaCard({ parcela, onPagar, onRemarcar, onEscalar }) {
  const { nome_cliente, seguradora, numero_apolice, valor, data_vencimento, status } = parcela

  return (
    <Card className="bg-[var(--surface)] border-[var(--border)]">
      <CardContent className="p-4 flex flex-col gap-3">

        {/* Linha 1: nome + badge */}
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold text-sm text-[var(--text-primary)] leading-snug">
            {nome_cliente}
          </span>
          <StatusBadge status={status} />
        </div>

        {/* Linha 2: seguradora + apólice */}
        <span className="text-xs text-[var(--text-secondary)]">
          {seguradora}
          {numero_apolice && <> · Apólice {numero_apolice}</>}
        </span>

        {/* Linha 3: valor + vencimento */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm text-[var(--text-primary)]">
            {formatarMoeda(valor)}
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            Venc. {formatarDataCurta(data_vencimento)}
          </span>
        </div>

        {/* Linha 4: ações */}
        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={onPagar}>
            Pagar
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={onRemarcar}>
            Remarcar
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={onEscalar}>
            Escalar
          </Button>
        </div>

      </CardContent>
    </Card>
  )
}
