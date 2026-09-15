import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { atualizarSenha } from '@/services/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import CobraLogo from '@/components/CobraLogo'

const inputCobra = 'border-cobra-border focus-visible:border-cobra focus-visible:shadow-focus-cobra'

function CampoLabel({ children }) {
  return (
    <Label className="text-xs font-semibold uppercase tracking-wide text-cobra-muted">
      {children}
    </Label>
  )
}

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
    <div className="cobra-theme min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">

        <div className="flex flex-col items-center gap-3">
          <CobraLogo size={44} wordmark />
          <p className="text-sm text-cobra-muted">Redefinir senha</p>
        </div>

        <Card className="w-full border-cobra-border shadow-sm">
          <CardContent className="p-6">

            {sucesso ? (
              <div className="flex flex-col items-center gap-3 py-2 text-center">
                <p className="text-sm font-medium text-cobra-ink">Senha redefinida com sucesso!</p>
                <p className="text-xs text-cobra-muted">Você será redirecionado para o login…</p>
              </div>
            ) : !pronto ? (
              <div className="flex flex-col gap-3 text-center py-2">
                <p className="text-sm text-cobra-muted">Aguardando verificação do link…</p>
                <p className="text-xs text-cobra-faint">
                  Se nada acontecer, o link pode ter expirado. Solicite um novo.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-xs text-cobra-muted hover:text-cobra transition-colors"
                >
                  Voltar ao login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <CampoLabel>Nova senha</CampoLabel>
                  <Input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    className={inputCobra}
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <CampoLabel>Confirmar senha</CampoLabel>
                  <Input
                    type="password"
                    placeholder="Repita a nova senha"
                    value={confirmar}
                    onChange={e => setConfirmar(e.target.value)}
                    className={inputCobra}
                  />
                </div>

                {erro && (
                  <p className="text-xs text-[var(--status-error)] bg-[var(--status-error-bg)] px-3 py-2 rounded-md">
                    {erro}
                  </p>
                )}

                <Button type="submit" variant="cobra" className="w-full mt-1" disabled={salvando}>
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
