import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function KPICard({ valor, label, variacao, variant = 'default' }) {
  const temVariacao = variacao !== undefined && variacao !== null
  const corValor = variant === 'critical' ? 'text-brand-primary' : 'text-[var(--text-primary)]'

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
    <Card variant={variant === 'critical' ? 'urgent' : undefined}>
      <CardContent className="p-5 flex flex-col gap-1">
        <span className={cn('font-display font-bold text-[32px] leading-tight', corValor)}>
          {valor}
        </span>
        <span className="text-xs text-neutral-500 font-body">
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
