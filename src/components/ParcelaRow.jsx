import { TableRow, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import StatusBadge from '@/components/StatusBadge'
import { formatarMoeda, formatarData } from '@/utils/format'
import { CheckCircle, CalendarClock, ArrowUpCircle } from 'lucide-react'

export default function ParcelaRow({ parcela, onPagar, onRemarcar, onEscalar, onClick }) {
  const {
    nome_cliente,
    seguradora,
    valor,
    data_vencimento,
    tentativas,
    status,
  } = parcela

  return (
    <TooltipProvider delayDuration={300}>
      <TableRow className="hover:bg-[var(--surface-raised)] transition-colors cursor-pointer" onClick={onClick}>
        <TableCell className="font-medium text-[var(--text-primary)]">
          {nome_cliente}
        </TableCell>
        <TableCell className="text-[var(--text-secondary)]">
          {seguradora}
        </TableCell>
        <TableCell className="text-[var(--text-primary)] font-medium">
          {formatarMoeda(valor)}
        </TableCell>
        <TableCell className="text-[var(--text-secondary)]">
          {formatarData(data_vencimento)}
        </TableCell>
        <TableCell className="text-[var(--text-secondary)] text-center">
          {tentativas ?? 0}
        </TableCell>
        <TableCell>
          <StatusBadge status={status} />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onPagar}>
                  <CheckCircle className="w-4 h-4 text-[var(--status-paid)]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Marcar como pago</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onRemarcar}>
                  <CalendarClock className="w-4 h-4 text-[var(--status-rescheduled)]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remarcar</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onEscalar}>
                  <ArrowUpCircle className="w-4 h-4 text-[var(--status-escalated)]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Escalar para vendedor</TooltipContent>
            </Tooltip>
          </div>
        </TableCell>
      </TableRow>
    </TooltipProvider>
  )
}
