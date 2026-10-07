import { formatarData } from '@/utils/format'
import { cn } from '@/lib/utils'
import { entregaWhatsApp } from '@/utils/whatsapp'
import { MessageCircle, ArrowUpCircle, FileText, AlertCircle, Check, CheckCheck } from 'lucide-react'

const icones = {
  mensagem:   MessageCircle,
  escalado:   ArrowUpCircle,
  observacao: FileText,
  erro:       AlertCircle,
}

const cores = {
  mensagem:   'text-[var(--status-sent)]   bg-[var(--status-sent-bg)]',
  escalado:   'text-[var(--status-escalated)] bg-[var(--status-escalated-bg)]',
  observacao: 'text-[var(--text-secondary)] bg-neutral-100',
  erro:       'text-[var(--status-error)] bg-red-50',
}

function decodificar(texto) {
  if (!texto) return texto
  try { return decodeURIComponent(texto) } catch { return texto }
}

function parsearContato(contato) {
  const msg = decodificar(contato.mensagem_enviada ?? '')

  // Formato legado: "Falha\nDetalhe técnico" (plain text, URL-encoded)
  if (msg.startsWith('Falha')) {
    const [, detalhe] = msg.split(/\r?\n/)
    return { tipo: 'erro', titulo: 'Falha no envio', detalhe: detalhe?.trim() ?? null }
  }

  // n8n pode gravar tipo='erro' com mensagem em outros formatos (JSON, texto livre)
  if (contato.tipo === 'erro') {
    let detalhe = msg || null
    try {
      const json = JSON.parse(msg)
      // Extrai mensagem legível do JSON da API do WhatsApp (Meta) ou do n8n
      const legivel = json.message ?? json.error?.message ?? json.error ?? null
      if (typeof legivel === 'string') detalhe = legivel
    } catch { /* não é JSON — usa msg direto */ }
    return { tipo: 'erro', titulo: 'Falha no envio', detalhe }
  }

  return { tipo: contato.tipo, titulo: msg || contato.tipo, detalhe: null }
}

// Selo de entrega no estilo do WhatsApp: ✓ enviada, ✓✓ entregue, ✓✓ azul lida.
const selosEntrega = {
  enviado:  { Icone: Check,       classe: 'text-[var(--text-muted)]' },
  entregue: { Icone: CheckCheck,  classe: 'text-[var(--text-secondary)]' },
  lido:     { Icone: CheckCheck,  classe: 'text-[var(--status-sent)]' },
  falhou:   { Icone: AlertCircle, classe: 'text-[var(--status-error)]' },
}

function SeloEntrega({ entrega }) {
  const { Icone, classe } = selosEntrega[entrega.status]
  return (
    <div className="mt-1" data-testid="selo-entrega" data-status={entrega.status}>
      <p className={cn('inline-flex items-center gap-1 text-xs font-medium', classe)}>
        <Icone className="w-3.5 h-3.5" aria-hidden />
        {entrega.rotulo}
        {entrega.atualizadoEm && entrega.status !== 'enviado' && (
          <span className="font-normal text-[var(--text-muted)]"> às {formatarHora(entrega.atualizadoEm)}</span>
        )}
      </p>
      {entrega.motivo && (
        <p className="text-xs text-[var(--status-error)] mt-0.5 break-words">{entrega.motivo}</p>
      )}
    </div>
  )
}

function formatarHora(dataHora) {
  if (!dataHora) return null
  const d = typeof dataHora === 'string' ? new Date(dataHora) : dataHora
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function TimelineContatos({ contatos = [] }) {
  if (contatos.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] py-4">
        Nenhum contato registrado ainda.
      </p>
    )
  }

  return (
    <ol className="flex flex-col gap-0">
      {contatos.map((contato, i) => {
        const { tipo, titulo, detalhe } = parsearContato(contato)
        const entrega = entregaWhatsApp(contato)
        const Icone = icones[tipo] ?? MessageCircle
        const corClasse = cores[tipo] ?? cores.observacao
        const isUltimo = i === contatos.length - 1

        return (
          <li key={contato.id ?? i} className="flex gap-3">

            {/* Coluna do ícone + linha vertical */}
            <div className="flex flex-col items-center">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', corClasse)}>
                <Icone className="w-4 h-4" />
              </div>
              {!isUltimo && (
                <div className="w-px flex-1 bg-neutral-200 my-1" />
              )}
            </div>

            {/* Conteúdo */}
            <div className={cn('pb-5 flex-1', isUltimo && 'pb-0')}>
              <p className={cn('text-sm font-medium leading-snug', tipo === 'erro' ? 'text-[var(--status-error)]' : 'text-[var(--text-primary)]')}>
                {titulo}
              </p>
              {detalhe && (
                <p className="text-xs text-[var(--text-muted)] mt-0.5 break-words">{detalhe}</p>
              )}
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {formatarData(contato.enviado_em)}
                {contato.enviado_em && <> às {formatarHora(contato.enviado_em)}</>}
              </p>
              {entrega && <SeloEntrega entrega={entrega} />}
              {contato.respondido && (
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {contato.respondido_em
                    ? <>Respondido às {formatarHora(contato.respondido_em)}</>
                    : 'Respondido'}
                </p>
              )}
              {contato.gtchat_observacao && (
                <p className="text-xs text-[var(--text-secondary)] mt-1 italic">
                  {contato.gtchat_observacao}
                </p>
              )}
            </div>

          </li>
        )
      })}
    </ol>
  )
}
