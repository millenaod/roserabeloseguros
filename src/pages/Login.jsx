import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login, buscarPerfil, resetarSenha } from '@/services/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import AuthSplitLayout from '@/components/AuthSplitLayout'
import { Eye, EyeOff } from 'lucide-react'

const DESTINO_POR_PERFIL = {
  rose:     '/dashboard-rose',
  thaina:   '/',
  vendedor: '/carteira',
}

function CampoLabel({ children }) {
  return (
    <Label className="text-xs font-semibold uppercase tracking-wide text-cobra-muted">
      {children}
    </Label>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const [tela, setTela] = useState('login') // 'login' | 'esqueci' | 'enviado'
  const [email, setEmail]   = useState('')
  const [senha, setSenha]   = useState('')
  const [erro, setErro]     = useState('')
  const [carregando, setCarregando] = useState(false)
  const [verSenha, setVerSenha]     = useState(false)

  const inputCobra = 'border-cobra-border focus-visible:border-cobra focus-visible:shadow-focus-cobra'

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
    <AuthSplitLayout>
      <Card className="w-full border-cobra-border shadow-sm">
        <CardContent className="p-6">

          {tela === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1 mb-1">
                <h1 className="text-xl font-bold text-cobra-ink">Entrar</h1>
                <p className="text-sm text-cobra-muted">Acesse sua conta CobraAI</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <CampoLabel>E-mail</CampoLabel>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputCobra}
                  autoFocus
                  autoComplete="email"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <CampoLabel>Senha</CampoLabel>
                <div className="relative">
                  <Input
                    type={verSenha ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    autoComplete="current-password"
                    className={`pr-10 ${inputCobra}`}
                  />
                  <button
                    type="button"
                    onClick={() => setVerSenha(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cobra-faint hover:text-cobra-ink transition-colors"
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

              <Button type="submit" variant="cobra" className="w-full mt-1" disabled={carregando}>
                {carregando ? 'Entrando…' : 'Entrar'}
              </Button>

              <button
                type="button"
                onClick={() => { setTela('esqueci'); setErro('') }}
                className="text-xs text-cobra-muted hover:text-cobra text-center transition-colors"
              >
                Esqueci minha senha
              </button>
            </form>
          )}

          {tela === 'esqueci' && (
            <form onSubmit={handleEsqueciSenha} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1 mb-1">
                <h1 className="text-xl font-bold text-cobra-ink">Redefinir senha</h1>
                <p className="text-sm text-cobra-muted">
                  Informe seu e-mail e enviaremos um link para criar uma nova senha.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <CampoLabel>E-mail</CampoLabel>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputCobra}
                  autoFocus
                  autoComplete="email"
                />
              </div>

              {erro && (
                <p className="text-xs text-[var(--status-error)] bg-[var(--status-error-bg)] px-3 py-2 rounded-md">
                  {erro}
                </p>
              )}

              <Button type="submit" variant="cobra" className="w-full" disabled={carregando}>
                {carregando ? 'Enviando…' : 'Enviar link de redefinição'}
              </Button>

              <button
                type="button"
                onClick={voltarParaLogin}
                className="text-xs text-cobra-muted hover:text-cobra text-center transition-colors"
              >
                Voltar ao login
              </button>
            </form>
          )}

          {tela === 'enviado' && (
            <div className="flex flex-col gap-4 text-center py-1">
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-medium text-cobra-ink">E-mail enviado!</p>
                <p className="text-xs text-cobra-muted">
                  Verifique a caixa de entrada de{' '}
                  <span className="font-medium">{email}</span> e clique no link para redefinir sua senha.
                </p>
              </div>
              <button
                type="button"
                onClick={voltarParaLogin}
                className="text-xs text-cobra-muted hover:text-cobra transition-colors"
              >
                Voltar ao login
              </button>
            </div>
          )}

        </CardContent>
      </Card>

      {tela === 'login' && (
        <p className="text-sm text-cobra-muted text-center">
          Não tem conta?{' '}
          <Link to="/criar-conta" className="font-semibold text-cobra hover:text-cobra-hover transition-colors">
            Criar conta
          </Link>
        </p>
      )}
    </AuthSplitLayout>
  )
}
