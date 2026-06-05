import { TableRow, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import StatusBadge from '@/components/StatusBadge'
import { formatarMoeda, formatarData } from '@/utils/format'
import { linkWhatsApp } from '@/utils/whatsapp'
import { CheckCircle, CalendarClock, ArrowUpCircle, Eye, MessageCircle } from 'lucide-react'

export default function ParcelaRow({ parcela, onPagar, onRemarcar, onEscalar, onVerDetalhe, onClick }) {
  const { cliente_nome, seguradora_nome, valor, data_vencimento, total_contatos, status } = parcela

  function stopPropagation(fn) {
    return fn ? (e) => { e.stopPropagation(); fn() } : undefined
  }

  return (
    <TooltipProvider delayDuration={300}>
      <TableRow
        className="hover:bg-[var(--surface-raised)] transition-colors cursor-pointer"
        onClick={onClick}
      >
        <TableCell className="font-medium text-[var(--text-primary)]">{cliente_nome}</TableCell>
        <TableCell className="text-[var(--text-secondary)]">{seguradora_nome}</TableCell>
        <TableCell money className={status === 'pago' ? 'text-semantic-success' : status === 'erro' ? 'text-brand-primary' : ''}>{formatarMoeda(valor)}</TableCell>
        <TableCell className="text-[var(--text-secondary)]">{formatarData(data_vencimento)}</TableCell>
        <TableCell className="text-[var(--text-secondary)] text-center">{total_contatos ?? 0}</TableCell>
        <TableCell><StatusBadge status={status} /></TableCell>
        <TableCell>
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8"
                  onClick={stopPropagation(() => window.open(linkWhatsApp(parcela), '_blank', 'noopener'))}>
                  <MessageCircle className="w-4 h-4" style={{ color: '#25D366' }} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Abrir no WhatsApp</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={stopPropagation(onPagar)}>
                  <CheckCircle className="w-4 h-4 text-[var(--status-paid)]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>✓ Pago</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={stopPropagation(onRemarcar)}>
                  <CalendarClock className="w-4 h-4 text-[var(--status-rescheduled)]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>↷ Remarcar</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={stopPropagation(onEscalar)}>
                  <ArrowUpCircle className="w-4 h-4 text-[var(--status-escalated)]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>↑ Escalar</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={stopPropagation(onVerDetalhe)}>
                  <Eye className="w-4 h-4 text-[var(--text-secondary)]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>👁 Ver detalhe</TooltipContent>
            </Tooltip>
          </div>
        </TableCell>
      </TableRow>
    </TooltipProvider>
  )
}
