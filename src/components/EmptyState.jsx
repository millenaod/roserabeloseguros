import { InboxIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function EmptyState({ icone: Icone = InboxIcon, titulo, descricao, acaoLabel, onAcao }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
      <div className="w-14 h-14 rounded-full bg-[var(--brand-light)] flex items-center justify-center">
        <Icone className="w-7 h-7 text-[var(--brand)]" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-display text-lg font-bold text-[var(--text-primary)]">{titulo}</p>
        {descricao && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs">{descricao}</p>
        )}
      </div>
      {acaoLabel && onAcao && (
        <Button variant="primary" onClick={onAcao}>
          {acaoLabel}
        </Button>
      )}
    </div>
  )
}
