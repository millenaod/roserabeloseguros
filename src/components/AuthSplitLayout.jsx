import CobraLogo from '@/components/CobraLogo'
import { CheckCircle2 } from 'lucide-react'

const beneficios = [
  'Cobrança automática por WhatsApp',
  'Templates aprovados pelo Meta',
  'Gestão de inadimplência em tempo real',
  'Multi-corretor e multi-empresa',
]

// Padrão de grid decorativo para o fundo do painel esquerdo
function GridPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.07]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  )
}

// Círculo decorativo de brilho
function GlowCircle({ className }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    />
  )
}

export function AuthPainelEsquerdo() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden min-h-screen w-[480px] shrink-0 p-12 bg-[#0F172A]">
      <GridPattern />
      <GlowCircle className="w-96 h-96 bg-blue-600/20 -top-24 -right-24" />
      <GlowCircle className="w-72 h-72 bg-indigo-500/15 bottom-20 -left-16" />

      {/* Logo */}
      <CobraLogo size={44} wordmark light />

      {/* Proposta de valor */}
      <div className="relative flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Pare de cobrar<br />parcelas na mão.
          </h1>
          <p className="text-base text-white/60 leading-relaxed max-w-xs">
            O CobraAI automatiza cada mensagem de cobrança — do aviso de vencimento até a confirmação de pagamento — via WhatsApp.
          </p>
        </div>

        <ul className="flex flex-col gap-3">
          {beneficios.map((b) => (
            <li key={b} className="flex items-center gap-3 text-sm text-white/80">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      </div>

      {/* Rodapé */}
      <p className="relative text-xs text-white/30">© 2026 CobraAI</p>
    </div>
  )
}

// Wrapper completo: painel esquerdo + área de formulário (filhos)
export default function AuthSplitLayout({ children }) {
  return (
    <div className="cobra-theme min-h-screen flex">
      <AuthPainelEsquerdo />

      {/* Painel direito — formulário */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-white min-h-screen">
        <div className="w-full max-w-sm flex flex-col gap-8">
          {/* Logo visível só no mobile (painel esq. some em < lg) */}
          <div className="flex justify-center lg:hidden">
            <CobraLogo size={40} wordmark />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
