import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, buscarPerfil, resetarSenha } from '@/services/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'

const DESTINO_POR_PERFIL = {
  rose:     '/dashboard-rose',
  thaina:   '/',
  vendedor: '/carteira',
}

export default function Login() {
  const navigate = useNavigate()
  const [tela, setTela] = useState('login') // 'login' | 'esqueci' | 'enviado'
  const [email, setEmail]   = useState('')
  const [senha, setSenha]   = useState('')
  const [erro, setErro]     = useState('')
  const [carregando, setCarregando] = useState(false)
  const [verSenha, setVerSenha]     = useState(false)

  async function handleLogin(e) {
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

  async function handleEsqueciSenha(e) {
    e.preventDefault()
    if (!email) { setErro('Informe seu e-mail.'); return }

    setCarregando(true)
    setErro('')

    const { error } = await resetarSenha(email)
    setCarregando(false)

    if (error) { setErro('Não foi possível enviar o e-mail. Verifique o endereço.'); return }

    setTela('enviado')
  }

  function voltarParaLogin() {
    setTela('login')
    setErro('')
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

        <Card className="w-full border-[var(--border)]">
          <CardContent className="p-6">

            {/* Tela de login */}
            {tela === 'login' && (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
                  <div className="relative">
                    <Input
                      type={verSenha ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={senha}
                      onChange={e => setSenha(e.target.value)}
                      autoComplete="current-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setVerSenha(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                      tabIndex={-1}
                    >
                      {verSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
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

                <button
                  type="button"
                  onClick={() => { setTela('esqueci'); setErro('') }}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--brand)] text-center transition-colors"
                >
                  Esqueci minha senha
                </button>
              </form>
            )}

            {/* Tela de esqueci minha senha */}
            {tela === 'esqueci' && (
              <form onSubmit={handleEsqueciSenha} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 mb-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">Redefinir senha</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Informe seu e-mail e enviaremos um link para criar uma nova senha.
                  </p>
                </div>

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

                {erro && (
                  <p className="text-xs text-[var(--status-error)] bg-[var(--status-error-bg)] px-3 py-2 rounded-md">
                    {erro}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={carregando}
                  style={{ backgroundColor: 'var(--brand)', color: 'white' }}
                >
                  {carregando ? 'Enviando…' : 'Enviar link de redefinição'}
                </Button>

                <button
                  type="button"
                  onClick={voltarParaLogin}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--brand)] text-center transition-colors"
                >
                  Voltar ao login
                </button>
              </form>
            )}

            {/* Confirmação de envio */}
            {tela === 'enviado' && (
              <div className="flex flex-col gap-4 text-center py-1">
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm font-medium text-[var(--text-primary)]">E-mail enviado!</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Verifique a caixa de entrada de <span className="font-medium">{email}</span> e clique no link para redefinir sua senha.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={voltarParaLogin}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors"
                >
                  Voltar ao login
                </button>
              </div>
            )}

          </CardContent>
        </Card>

      </div>
    </div>
  )
}
