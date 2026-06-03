import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { atualizarSenha } from '@/services/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function RedefinirSenha() {
  const navigate = useNavigate()
  const [pronto, setPronto] = useState(false)
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setPronto(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return }
    if (senha !== confirmar) { setErro('As senhas não coincidem.'); return }

    setSalvando(true)
    const { error } = await atualizarSenha(senha)
    setSalvando(false)

    if (error) { setErro('Não foi possível redefinir a senha. Tente novamente.'); return }

    setSucesso(true)
    setTimeout(() => navigate('/login'), 3000)
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">

        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-[var(--brand)] flex items-center justify-center">
            <span className="font-display font-bold text-2xl text-white">R</span>
          </div>
          <h1 className="font-display font-semibold text-2xl text-[var(--text-primary)]">Rose Rabelo</h1>
          <p className="text-sm text-[var(--text-secondary)]">Redefinir senha</p>
        </div>

        <Card className="w-full border-[var(--border)]">
          <CardContent className="p-6">
            {sucesso ? (
              <div className="flex flex-col items-center gap-3 py-2 text-center">
                <p className="text-sm font-medium text-[var(--status-paid)]">Senha redefinida com sucesso!</p>
                <p className="text-xs text-[var(--text-secondary)]">Você será redirecionado para o login…</p>
              </div>
            ) : !pronto ? (
              <div className="flex flex-col gap-3 text-center py-2">
                <p className="text-sm text-[var(--text-secondary)]">Aguardando verificação do link…</p>
                <p className="text-xs text-[var(--text-muted)]">Se nada acontecer, o link pode ter expirado. Solicite um novo.</p>
                <Button variant="link" className="text-[var(--brand)]" onClick={() => navigate('/login')}>
                  Voltar ao login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Nova senha</Label>
                  <Input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Confirmar senha</Label>
                  <Input
                    type="password"
                    placeholder="Repita a nova senha"
                    value={confirmar}
                    onChange={e => setConfirmar(e.target.value)}
                  />
                </div>

                {erro && (
                  <p className="text-xs text-[var(--status-error)] bg-[var(--status-error-bg)] px-3 py-2 rounded-md">
                    {erro}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full mt-1"
                  disabled={salvando}
                  style={{ backgroundColor: 'var(--brand)', color: 'white' }}
                >
                  {salvando ? 'Salvando…' : 'Salvar nova senha'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
