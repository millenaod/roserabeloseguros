import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export default function ThemeToggle({ className = '', labelClassName = '' }) {
  const { escuro, alternar } = useTheme()
  const Icone = escuro ? Sun : Moon
  const texto = escuro ? 'Modo claro' : 'Modo escuro'

  return (
    <button onClick={alternar} title={texto} aria-label={texto} className={className}>
      <Icone className="w-5 h-5 shrink-0" />
      <span className={labelClassName}>{texto}</span>
    </button>
  )
}
