import { formatarData } from '@/utils/format'
import { cn } from '@/lib/utils'
import { MessageCircle, ArrowUpCircle, FileText, AlertCircle } from 'lucide-react'

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
  if (msg.startsWith('Falha')) {
    const [, detalhe] = msg.split(/\r?\n/)
    return { tipo: 'erro', titulo: 'Falha no envio', detalhe: detalhe?.trim() ?? null }
  }
  return { tipo: contato.tipo, titulo: msg || contato.tipo, detalhe: null }
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
