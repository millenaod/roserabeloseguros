import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function KPICard({ valor, label, variacao }) {
  const temVariacao = variacao !== undefined && variacao !== null

  const variacaoPositiva = variacao > 0
  const variacaoNeutra   = variacao === 0

  const IconeVariacao = variacaoNeutra
    ? Minus
    : variacaoPositiva
      ? TrendingUp
      : TrendingDown

  const corVariacao = variacaoNeutra
    ? 'text-[var(--text-muted)]'
    : variacaoPositiva
      ? 'text-[var(--status-paid)]'
      : 'text-[var(--status-error)]'

  return (
    <Card className="bg-[var(--surface)] border-[var(--border)]">
      <CardContent className="p-5 flex flex-col gap-1">
        <span className="font-display font-bold text-[32px] leading-tight text-[var(--text-primary)]">
          {valor}
        </span>
        <span className="text-xs text-[var(--text-muted)] font-body">
          {label}
        </span>
        {temVariacao && (
          <span className={cn('flex items-center gap-1 text-xs font-medium mt-1', corVariacao)}>
            <IconeVariacao className="w-3.5 h-3.5" />
            {Math.abs(variacao)}% vs mês anterior
          </span>
        )}
      </CardContent>
    </Card>
  )
}
