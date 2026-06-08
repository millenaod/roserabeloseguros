import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  BarChart2,
  Briefcase,
  LogOut,
  UserCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import ThemeToggle from '@/components/ThemeToggle'

const navItems = [
  { to: '/',              icon: LayoutDashboard, label: 'Parcelas' },
  { to: '/tarefas',       icon: ListChecks,      label: 'Tarefas do dia' },
  { to: '/nova-parcela',  icon: PlusCircle,      label: 'Nova Parcela' },
  { to: '/relatorios',    icon: BarChart2,        label: 'Relatórios' },
  { to: '/carteira',      icon: Briefcase,        label: 'Minha Carteira' },
]

export default function Sidebar() {
  const { perfil, sair } = useAuth()

  const navVisiveis = perfil?.perfil === 'rose'
    ? navItems
    : perfil?.perfil === 'vendedor'
      ? navItems.filter(n => n.to === '/carteira')
      : navItems.filter(n => !['rose'].includes(n.to))

  return (
    <aside className="hidden md:flex flex-col h-screen bg-neutral-900 border-r border-neutral-800 sticky top-0 md:w-16 lg:w-60 shrink-0 transition-all duration-200">

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 h-16">
        <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center shrink-0">
          <span className="text-white font-display font-bold text-sm leading-none">R</span>
        </div>
        <span className="hidden lg:block font-display font-bold text-white text-lg leading-tight truncate">
          Rose Rabelo
        </span>
      </div>

      <Separator className="bg-neutral-800" />

      {/* Navegação */}
      <nav className="flex-1 flex flex-col gap-1 px-2 py-4">
        {navVisiveis.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-2 py-2 font-body text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-primary text-white'
                  : 'text-neutral-400 hover:bg-brand-primary/10 hover:text-brand-primary'
              )
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="hidden lg:block truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      <Separator className="bg-neutral-800" />

      {/* Usuário */}
      <div className="px-2 py-4 flex flex-col gap-1">
        <NavLink
          to="/perfil"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-2 py-2 transition-colors',
              isActive ? 'bg-brand-primary/15' : 'hover:bg-brand-primary/10'
            )
          }
          title="Meu perfil e senha"
        >
          <UserCircle className="w-5 h-5 shrink-0 text-neutral-400" />
          <span className="hidden lg:block text-sm font-medium text-white truncate">
            {perfil?.nome ?? '—'}
          </span>
        </NavLink>
        <ThemeToggle
          className="flex items-center gap-3 rounded-md px-2 py-2 font-body text-sm font-medium text-neutral-400 hover:bg-brand-primary/10 hover:text-brand-primary transition-colors w-full"
          labelClassName="hidden lg:block"
        />
        <button onClick={sair} className="flex items-center gap-3 rounded-md px-2 py-2 font-body text-sm font-medium text-neutral-400 hover:bg-brand-primary/10 hover:text-brand-primary transition-colors w-full">
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="hidden lg:block">Sair</span>
        </button>
      </div>

    </aside>
  )
}
