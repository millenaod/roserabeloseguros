import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  PlusCircle,
  BarChart2,
  CheckSquare,
  Briefcase,
  LogOut,
  UserCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { to: '/',              icon: LayoutDashboard, label: 'Parcelas' },
  { to: '/nova-parcela',  icon: PlusCircle,      label: 'Nova Parcela' },
  { to: '/relatorios',    icon: BarChart2,        label: 'Relatórios' },
  { to: '/aprovacoes',    icon: CheckSquare,      label: 'Aprovações' },
  { to: '/carteira',      icon: Briefcase,        label: 'Minha Carteira' },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col h-screen bg-white border-r border-[var(--border)] sticky top-0 md:w-16 lg:w-60 shrink-0 transition-all duration-200">

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 h-16">
        <div className="w-8 h-8 rounded-full bg-[var(--brand)] flex items-center justify-center shrink-0">
          <span className="text-white font-display font-bold text-sm leading-none">R</span>
        </div>
        <span className="hidden lg:block font-display font-semibold text-[var(--brand)] text-base leading-tight truncate">
          Rose Rabelo
        </span>
      </div>

      <Separator />

      {/* Navegação */}
      <nav className="flex-1 flex flex-col gap-1 px-2 py-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--brand-light)] text-[var(--brand)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]'
              )
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="hidden lg:block truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      <Separator />

      {/* Usuário */}
      <div className="px-2 py-4 flex flex-col gap-1">
        <div className="flex items-center gap-3 px-2 py-2">
          <UserCircle className="w-5 h-5 shrink-0 text-[var(--text-secondary)]" />
          <span className="hidden lg:block text-sm font-medium text-[var(--text-primary)] truncate">
            Thainá
          </span>
        </div>
        <button className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] transition-colors w-full">
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="hidden lg:block">Sair</span>
        </button>
      </div>

    </aside>
  )
}
