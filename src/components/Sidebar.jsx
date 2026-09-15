import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Gauge,
  ListChecks,
  PlusCircle,
  BarChart2,
  Briefcase,
  LogOut,
  UserCircle,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
const navItems = [
  { to: '/dashboard-rose', icon: Gauge,           label: 'Visão Gerencial', roseOnly: true },
  { to: '/',              icon: LayoutDashboard, label: 'Parcelas' },
  { to: '/tarefas',       icon: ListChecks,      label: 'Tarefas do dia' },
  { to: '/nova-parcela',  icon: PlusCircle,      label: 'Nova Parcela' },
  { to: '/relatorios',    icon: BarChart2,        label: 'Relatórios', roseOnly: true },
  { to: '/carteira',      icon: Briefcase,        label: 'Minha Carteira' },
]

export default function Sidebar() {
  const { perfil, sair } = useAuth()

  const navVisiveis = perfil?.perfil === 'rose'
    ? navItems
    : perfil?.perfil === 'vendedor'
      ? navItems.filter(n => n.to === '/carteira')
      : navItems.filter(n => !n.roseOnly)

  return (
    <aside className="hidden md:flex flex-col h-screen bg-[#0F172A] border-r border-white/10 sticky top-0 md:w-16 lg:w-60 shrink-0 transition-all duration-200">

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 h-16">
        <div className="w-8 h-8 rounded-xl bg-white/15 ring-1 ring-white/30 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm leading-none">C</span>
        </div>
        <span className="hidden lg:block font-display font-bold text-white text-lg leading-tight truncate">
          {perfil?.organizacoes?.nome ?? 'CobraAI'}
        </span>
      </div>

      <Separator className="bg-white/10" />

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
                  ? 'bg-cobra text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="hidden lg:block truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      <Separator className="bg-white/10" />

      {/* Usuário */}
      <div className="px-2 py-4 flex flex-col gap-1">
        <NavLink
          to="/perfil"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-2 py-2 transition-colors',
              isActive ? 'bg-white/15' : 'hover:bg-white/10'
            )
          }
          title="Meu perfil e senha"
        >
          <UserCircle className="w-5 h-5 shrink-0 text-white/60" />
          <span className="hidden lg:block text-sm font-medium text-white truncate">
            {perfil?.nome ?? '—'}
          </span>
        </NavLink>
        <NavLink
          to="/ajuda"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-2 py-2 font-body text-sm font-medium transition-colors',
              isActive
                ? 'bg-cobra text-white'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
            )
          }
        >
          <HelpCircle className="w-5 h-5 shrink-0" />
          <span className="hidden lg:block">Ajuda</span>
        </NavLink>
        <button onClick={sair} className="flex items-center gap-3 rounded-md px-2 py-2 font-body text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors w-full">
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="hidden lg:block">Sair</span>
        </button>
      </div>

    </aside>
  )
}
