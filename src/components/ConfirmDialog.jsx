import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function ConfirmDialog({
  aberto,
  onFechar,
  onConfirmar,
  titulo,
  descricao,
  labelConfirmar = 'Confirmar',
  labelCancelar = 'Cancelar',
  variante = 'default',
  carregando = false,
}) {
  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg text-[var(--text-primary)]">
            {titulo}
          </DialogTitle>
          {descricao && (
            <DialogDescription className="text-[var(--text-secondary)]">
              {descricao}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onFechar} disabled={carregando}>
            {labelCancelar}
          </Button>
          <Button
            variant={variante}
            onClick={onConfirmar}
            disabled={carregando}
            style={variante === 'default' ? { backgroundColor: 'var(--brand)', color: 'white' } : {}}
          >
            {carregando ? 'Aguarde…' : labelConfirmar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
