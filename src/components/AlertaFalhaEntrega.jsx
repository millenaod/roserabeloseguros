import { AlertCircle } from 'lucide-react'
import { motivoFalhaEntrega } from '@/utils/whatsapp'
import { cn } from '@/lib/utils'

// Aviso compacto para listas/cards: a última mensagem de WhatsApp da parcela
// não chegou ao cliente. Usa ultimo_status_envio/ultimo_erro_entrega de v_parcelas_ui.
export default function AlertaFalhaEntrega({ parcela, className }) {
  if (parcela?.ultimo_status_envio !== 'falhou') return null
  const motivo = motivoFalhaEntrega(parcela.ultimo_erro_entrega)
  return (
    <span
      data-testid="alerta-falha-entrega"
      title={motivo ?? 'A última mensagem não foi entregue'}
      className={cn(
        'inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded',
        'text-[var(--status-error)] bg-[var(--status-error-bg)]',
        className
      )}
    >
      <AlertCircle className="w-3 h-3 shrink-0" aria-hidden />
      Não entregue
    </span>
  )
}
