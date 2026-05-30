import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '@/services/auth'
import { buscarPerfil } from '@/services/auth'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const DESTINO_POR_PERFIL = {
  rose:     '/dashboard-rose',
  thaina:   '/',
  vendedor: '/carteira',
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail]   = useState('')
  const [senha, setSenha]   = useState('')
  const [erro, setErro]     = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !senha) { setErro('Preencha e-mail e senha.'); return }

    setCarregando(true)
    setErro('')

    const { data, error } = await login(email, senha)

    if (error) {
      setErro('E-mail ou senha incorretos.')
      setCarregando(false)
      return
    }

    const { data: perfil } = await buscarPerfil(data.user.id)
    const destino = DESTINO_POR_PERFIL[perfil?.perfil] ?? '/'
    navigate(destino, { replace: true })
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-[var(--brand)] flex items-center justify-center">
            <span className="font-display font-bold text-2xl text-white">R</span>
          </div>
          <h1 className="font-display font-semibold text-2xl text-[var(--text-primary)]">Rose Rabelo</h1>
          <p className="text-sm text-[var(--text-secondary)]">Sistema de Cobrança</p>
        </div>

        {/* Formulário */}
        <Card className="w-full border-[var(--border)]">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">E-mail</Label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                  autoComplete="email"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Senha</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  autoComplete="current-password"
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
                disabled={carregando}
                style={{ backgroundColor: 'var(--brand)', color: 'white' }}
              >
                {carregando ? 'Entrando…' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
