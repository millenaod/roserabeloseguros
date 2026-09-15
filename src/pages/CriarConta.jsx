import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { criarConta } from '@/services/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import AuthSplitLayout from '@/components/AuthSplitLayout'
import { Eye, EyeOff, MailCheck } from 'lucide-react'

const emailValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

// Label padrão do projeto (uppercase, muted) — em tom CobraAI.
function CampoLabel({ children }) {
  return (
    <Label className="text-xs font-semibold uppercase tracking-wide text-cobra-muted">
      {children}
    </Label>
  )
}

export default function CriarConta() {
  const navigate = useNavigate()
  const [empresa, setEmpresa] = useState('')
  const [nome, setNome]       = useState('')
  const [email, setEmail]     = useState('')
  const [senha, setSenha]     = useState('')
  const [verSenha, setVerSenha]     = useState(false)
  const [erros, setErros]           = useState({})
  const [erroGeral, setErroGeral]   = useState('')
  const [carregando, setCarregando] = useState(false)
  const [enviado, setEnviado]       = useState(false)

  // Validação no client antes de qualquer chamada ao Supabase (Nielsen #5).
  function validar() {
    const e = {}
    if (!empresa.trim()) e.empresa = 'Informe o nome da empresa'
    if (!nome.trim())    e.nome    = 'Informe seu nome'
    if (!emailValido(email)) e.email = 'E-mail inválido'
    if (senha.length < 6)    e.senha = 'Mínimo de 6 caracteres'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    setErroGeral('')
    const e = validar()
    setErros(e)
    if (Object.keys(e).length) return

    setCarregando(true)
    const { data, error } = await criarConta({
      email: email.trim(),
      senha,
      nomeEmpresa: empresa.trim(),
      nomeUsuario: nome.trim(),
    })

    if (error) {
      setCarregando(false)
      setErroGeral(
        error.message?.includes('already')
          ? 'Já existe uma conta com esse e-mail. Tente entrar.'
          : 'Não foi possível criar a conta. Verifique os dados e tente novamente.'
      )
      return
    }

    // O trigger handle_new_user já criou a empresa + o perfil 'rose' no signUp.
    // Se a confirmação de e-mail estiver ligada, não há sessão ainda: mostramos a
    // tela de "confirme seu e-mail". Se estiver desligada, entra direto.
    if (data?.session) {
      navigate('/dashboard-rose', { replace: true })
    } else {
      setEnviado(true)
    }
  }

  return (
    <AuthSplitLayout>
        <Card className="w-full border-cobra-border shadow-sm">
          <CardContent className="p-6">
            {enviado ? (
              <div className="flex flex-col items-center text-center gap-3 py-2">
                <div className="w-12 h-12 rounded-full bg-cobra-tint flex items-center justify-center">
                  <MailCheck className="w-6 h-6 text-cobra" />
                </div>
                <h1 className="text-xl font-bold text-cobra-ink">Confirme seu e-mail</h1>
                <p className="text-sm text-cobra-muted">
                  Enviamos um link de confirmação para <span className="font-semibold text-cobra-ink">{email}</span>.
                  Clique nele para ativar sua conta e entrar.
                </p>
                <p className="text-xs text-cobra-faint">
                  Não recebeu? Verifique o spam ou tente novamente em alguns minutos.
                </p>
              </div>
            ) : (
            <>
            <div className="flex flex-col gap-1 mb-5">
              <h1 className="text-xl font-bold text-cobra-ink">Criar conta</h1>
              <p className="text-sm text-cobra-muted">Comece a cobrar suas parcelas hoje.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <CampoLabel>Empresa</CampoLabel>
                <Input
                  placeholder="Ex: Rabelo Seguros"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  className="border-cobra-border focus-visible:border-cobra focus-visible:shadow-focus-cobra"
                  autoFocus
                />
                {erros.empresa && <p className="text-xs text-[var(--status-error)]">{erros.empresa}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <CampoLabel>Seu nome</CampoLabel>
                <Input
                  placeholder="Como você quer ser chamado"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="border-cobra-border focus-visible:border-cobra focus-visible:shadow-focus-cobra"
                  autoComplete="name"
                />
                {erros.nome && <p className="text-xs text-[var(--status-error)]">{erros.nome}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <CampoLabel>E-mail</CampoLabel>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-cobra-border focus-visible:border-cobra focus-visible:shadow-focus-cobra"
                  autoComplete="email"
                />
                {erros.email && <p className="text-xs text-[var(--status-error)]">{erros.email}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <CampoLabel>Senha</CampoLabel>
                <div className="relative">
                  <Input
                    type={verSenha ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pr-10 border-cobra-border focus-visible:border-cobra focus-visible:shadow-focus-cobra"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setVerSenha((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cobra-faint hover:text-cobra-ink transition-colors"
                    tabIndex={-1}
                  >
                    {verSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {erros.senha && <p className="text-xs text-[var(--status-error)]">{erros.senha}</p>}
              </div>

              {erroGeral && (
                <p className="text-xs text-[var(--status-error)] bg-[var(--status-error-bg)] px-3 py-2 rounded-md">
                  {erroGeral}
                </p>
              )}

              <Button type="submit" variant="cobra" className="w-full mt-1" disabled={carregando}>
                {carregando ? 'Criando conta…' : 'Criar conta'}
              </Button>
            </form>
            </>
            )}
          </CardContent>
        </Card>

        <p className="text-sm text-cobra-muted text-center">
          {enviado ? (
            <Link to="/login" className="font-semibold text-cobra hover:text-cobra-hover transition-colors">
              Voltar ao login
            </Link>
          ) : (
            <>
              Já tem conta?{' '}
              <Link to="/login" className="font-semibold text-cobra hover:text-cobra-hover transition-colors">
                Entrar
              </Link>
            </>
          )}
        </p>
    </AuthSplitLayout>
  )
}
