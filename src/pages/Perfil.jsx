import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { trocarSenha } from '@/services/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UserCircle, Mail, Shield, Check } from 'lucide-react'

const PAPEL = { rose: 'Gerente', vendedor: 'Vendedor' }

export default function Perfil() {
  const { perfil, usuario } = useAuth()

  const [atual, setAtual] = useState('')
  const [nova, setNova] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [salvando, setSalvando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro(''); setSucesso(false)

    if (!atual) { setErro('Informe sua senha atual.'); return }
    if (nova.length < 6) { setErro('A nova senha deve ter pelo menos 6 caracteres.'); return }
    if (nova !== confirmar) { setErro('A nova senha e a confirmação não coincidem.'); return }
    if (nova === atual) { setErro('A nova senha precisa ser diferente da atual.'); return }

    setSalvando(true)
    const { error } = await trocarSenha(atual, nova)
    setSalvando(false)

    if (error) { setErro(error.message); return }

    setSucesso(true)
    setAtual(''); setNova(''); setConfirmar('')
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--surface)]">
        <h1 className="font-display font-semibold text-2xl text-[var(--text-primary)]">Meu Perfil</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Seus dados e troca de senha</p>
      </div>

      <div className="px-6 py-6 flex flex-col gap-6 max-w-lg">

        {/* Dados do usuário */}
        <Card className="border-[var(--border)]">
          <CardContent className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <UserCircle className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
              <div>
                <p className="text-xs text-[var(--text-muted)]">Nome</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">{perfil?.nome ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
              <div>
                <p className="text-xs text-[var(--text-muted)]">E-mail</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">{usuario?.email ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
              <div>
                <p className="text-xs text-[var(--text-muted)]">Perfil de acesso</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">{PAPEL[perfil?.perfil] ?? 'Operacional'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trocar senha */}
        <Card className="border-[var(--border)]">
          <CardContent className="p-5">
            <h2 className="font-semibold text-sm text-[var(--text-primary)] mb-4">Trocar senha</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Senha atual</Label>
                <Input type="password" autoComplete="current-password" placeholder="Sua senha de hoje"
                  value={atual} onChange={e => setAtual(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Nova senha</Label>
                <Input type="password" autoComplete="new-password" placeholder="Mínimo 6 caracteres"
                  value={nova} onChange={e => setNova(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Confirmar nova senha</Label>
                <Input type="password" autoComplete="new-password" placeholder="Repita a nova senha"
                  value={confirmar} onChange={e => setConfirmar(e.target.value)} />
              </div>

              {erro && (
                <p className="text-xs text-[var(--status-error)] bg-[var(--status-error-bg)] px-3 py-2 rounded-md">{erro}</p>
              )}
              {sucesso && (
                <p className="flex items-center gap-2 text-xs font-medium text-[var(--status-paid)] bg-[var(--status-paid-bg,transparent)] px-3 py-2 rounded-md">
                  <Check className="w-4 h-4" /> Senha alterada com sucesso!
                </p>
              )}

              <Button type="submit" className="mt-1" disabled={salvando}
                style={{ backgroundColor: 'var(--brand)', color: 'white' }}>
                {salvando ? 'Salvando…' : 'Salvar nova senha'}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
