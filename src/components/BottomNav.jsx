import { NavLink } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, Briefcase, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/',             icon: LayoutDashboard, label: 'Parcelas' },
  { to: '/nova-parcela', icon: PlusCircle,      label: 'Nova' },
  { to: '/carteira',     icon: Briefcase,       label: 'Carteira' },
  { to: '/login',        icon: UserCircle,      label: 'Perfil' },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[var(--border)] flex h-16 safe-area-pb">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors',
              isActive
                ? 'text-[var(--brand)]'
                : 'text-[var(--text-muted)]'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
