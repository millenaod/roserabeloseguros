const config = {
  pendente:            { label: 'Pendente',           color: 'var(--status-pending)',    bg: 'var(--status-pending-bg)' },
  enviado:             { label: 'Enviado',             color: 'var(--status-sent)',       bg: 'var(--status-sent-bg)' },
  aguardando_retorno:  { label: 'Aguardando Retorno',  color: 'var(--status-waiting)',    bg: 'var(--status-waiting-bg)' },
  pago:                { label: 'Pago',                color: 'var(--status-paid)',       bg: 'var(--status-paid-bg)' },
  escalado:            { label: 'Escalado',            color: 'var(--status-escalated)',  bg: 'var(--status-escalated-bg)' },
  remarcado:           { label: 'Remarcado',           color: 'var(--status-rescheduled)',bg: 'var(--status-rescheduled-bg)' },
  erro:                { label: 'Erro',                color: 'var(--status-error)',      bg: 'var(--status-error-bg)' },
}

export default function StatusBadge({ status }) {
  const { label, color, bg } = config[status] ?? config.pendente

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-body text-[11px] font-medium uppercase tracking-wide whitespace-nowrap"
      style={{ color, backgroundColor: bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}
