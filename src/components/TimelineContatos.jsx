import { formatarData } from '@/utils/format'
import { cn } from '@/lib/utils'
import { MessageCircle, ArrowUpCircle, FileText } from 'lucide-react'

const icones = {
  mensagem:   MessageCircle,
  escalado:   ArrowUpCircle,
  observacao: FileText,
}

const cores = {
  mensagem:   'text-[var(--status-sent)]   bg-[var(--status-sent-bg)]',
  escalado:   'text-[var(--status-escalated)] bg-[var(--status-escalated-bg)]',
  observacao: 'text-[var(--text-secondary)] bg-[var(--border)]',
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
        const Icone = icones[contato.tipo] ?? MessageCircle
        const corClasse = cores[contato.tipo] ?? cores.observacao
        const isUltimo = i === contatos.length - 1

        return (
          <li key={contato.id ?? i} className="flex gap-3">

            {/* Coluna do ícone + linha vertical */}
            <div className="flex flex-col items-center">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', corClasse)}>
                <Icone className="w-4 h-4" />
              </div>
              {!isUltimo && (
                <div className="w-px flex-1 bg-[var(--border)] my-1" />
              )}
            </div>

            {/* Conteúdo */}
            <div className={cn('pb-5 flex-1', isUltimo && 'pb-0')}>
              <p className="text-sm font-medium text-[var(--text-primary)] leading-snug">
                {contato.descricao}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {formatarData(contato.data_contato)}
                {contato.hora && <> às {contato.hora}</>}
              </p>
              {(contato.hora_entrega || contato.hora_leitura) && (
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {contato.hora_entrega && <>Entregue às {contato.hora_entrega}</>}
                  {contato.hora_entrega && contato.hora_leitura && ' · '}
                  {contato.hora_leitura
                    ? <>Lida às {contato.hora_leitura}</>
                    : contato.hora_entrega
                      ? '· Sem leitura'
                      : null}
                </p>
              )}
              {contato.observacao && (
                <p className="text-xs text-[var(--text-secondary)] mt-1 italic">
                  {contato.observacao}
                </p>
              )}
            </div>

          </li>
        )
      })}
    </ol>
  )
}
