import { useEffect, useState } from 'react'
import { Building2, Plus, Users, FileText } from 'lucide-react'
import { listarEmpresas, criarEmpresa } from '@/services/admin'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'

const emailValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const inputCobra = 'border-cobra-border focus-visible:border-cobra focus-visible:shadow-focus-cobra'

function PlanoBadge({ plano }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-cobra-tint text-cobra">
      {plano}
    </span>
  )
}

function NovaEmpresaDialog({ open, onOpenChange, onCriada }) {
  const { toast } = useToast()
  const [empresa, setEmpresa] = useState('')
  const [nomeDono, setNomeDono] = useState('')
  const [email, setEmail] = useState('')
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)

  function reset() {
    setEmpresa(''); setNomeDono(''); setEmail(''); setErros({}); setSalvando(false)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const e = {}
    if (!empresa.trim()) e.empresa = 'Informe o nome da empresa'
    if (!emailValido(email)) e.email = 'E-mail inválido'
    setErros(e)
    if (Object.keys(e).length) return

    setSalvando(true)
    const { error } = await criarEmpresa({
      nomeEmpresa: empresa.trim(),
      emailDono: email.trim(),
      nomeDono: nomeDono.trim(),
    })
    setSalvando(false)

    if (error) {
      toast({ title: error, variant: 'destructive' })
      return
    }
    toast({ title: `Empresa criada — convite enviado para ${email.trim()}` })
    reset()
    onOpenChange(false)
    onCriada()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="cobra-theme sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-cobra-ink">Nova empresa</DialogTitle>
          <DialogDescription className="text-cobra-muted">
            A empresa é criada e o dono recebe um e-mail para definir a senha e entrar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-cobra-muted">Nome da empresa</Label>
            <Input value={empresa} onChange={(e) => setEmpresa(e.target.value)} className={inputCobra} placeholder="Ex: Rabelo Seguros" autoFocus />
            {erros.empresa && <p className="text-xs text-[var(--status-error)]">{erros.empresa}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-cobra-muted">Nome do dono (opcional)</Label>
            <Input value={nomeDono} onChange={(e) => setNomeDono(e.target.value)} className={inputCobra} placeholder="Responsável pela conta" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-cobra-muted">E-mail do dono</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCobra} placeholder="dono@empresa.com" />
            {erros.email && <p className="text-xs text-[var(--status-error)]">{erros.email}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 mt-1">
            <Button type="button" variant="cobra-ghost" onClick={() => onOpenChange(false)} disabled={salvando}>
              Cancelar
            </Button>
            <Button type="submit" variant="cobra" disabled={salvando}>
              {salvando ? 'Criando…' : 'Criar e convidar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminEmpresas() {
  const [empresas, setEmpresas] = useState(null) // null = carregando
  const [erro, setErro] = useState('')
  const [dialogAberto, setDialogAberto] = useState(false)

  async function carregar() {
    const { data, error } = await listarEmpresas()
    if (error) setErro('Não foi possível carregar as empresas.')
    setEmpresas(data)
  }

  useEffect(() => {
    let ativo = true
    listarEmpresas().then(({ data, error }) => {
      if (!ativo) return
      if (error) setErro('Não foi possível carregar as empresas.')
      setEmpresas(data)
    })
    return () => { ativo = false }
  }, [])

  return (
    <div className="cobra-theme px-6 py-6 md:px-10 md:py-8 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cobra-ink">Empresas</h1>
          <p className="text-sm text-cobra-muted mt-0.5">Todas as corretoras na plataforma CobraAI</p>
        </div>
        <Button variant="cobra" onClick={() => setDialogAberto(true)}>
          <Plus className="w-4 h-4" /> Nova empresa
        </Button>
      </div>
      <div className="border-t border-cobra-border mt-4 mb-6" />

      {erro && (
        <p className="text-sm text-[var(--status-error)] bg-[var(--status-error-bg)] px-3 py-2 rounded-md mb-4">
          {erro}
        </p>
      )}

      {empresas === null && (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      )}

      {empresas && empresas.length === 0 && !erro && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-cobra-tint flex items-center justify-center">
            <Building2 className="w-7 h-7 text-cobra" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-bold text-cobra-ink">Nenhuma empresa ainda</p>
            <p className="text-sm text-cobra-muted max-w-xs">
              Crie a primeira empresa ou espere uma corretora se cadastrar.
            </p>
          </div>
          <Button variant="cobra" onClick={() => setDialogAberto(true)}>
            <Plus className="w-4 h-4" /> Nova empresa
          </Button>
        </div>
      )}

      {empresas && empresas.length > 0 && (
        <div className="flex flex-col gap-3">
          {empresas.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-cobra-border bg-white p-4 hover:border-cobra/40 transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-cobra-ink truncate">{e.nome}</p>
                  <PlanoBadge plano={e.plano} />
                  {!e.ativo && (
                    <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      Inativa
                    </span>
                  )}
                </div>
                <p className="text-xs text-cobra-faint truncate mt-0.5">/{e.slug}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0 text-sm text-cobra-muted">
                <span className="flex items-center gap-1.5" title="Usuários">
                  <Users className="w-4 h-4" /> {e.total_usuarios}
                </span>
                <span className="flex items-center gap-1.5" title="Parcelas">
                  <FileText className="w-4 h-4" /> {e.total_parcelas}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <NovaEmpresaDialog open={dialogAberto} onOpenChange={setDialogAberto} onCriada={carregar} />
      <Toaster />
    </div>
  )
}
