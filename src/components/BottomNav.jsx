import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, Briefcase, UserCircle, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { to: '/',             icon: LayoutDashboard, label: 'Parcelas' },
  { to: '/nova-parcela', icon: PlusCircle,      label: 'Nova' },
  { to: '/carteira',     icon: Briefcase,       label: 'Carteira' },
]

export default function BottomNav() {
  const { perfil, sair } = useAuth()
  const [perfilAberto, setPerfilAberto] = useState(false)

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 flex h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 font-body text-[11px] font-medium transition-colors',
                isActive ? 'text-brand-primary' : 'text-neutral-400'
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

        {/* Botão perfil */}
        <button
          onClick={() => setPerfilAberto(true)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 font-body text-[11px] font-medium text-neutral-400"
        >
          <UserCircle className="w-5 h-5" />
          <span>Perfil</span>
        </button>
      </nav>

      {/* Sheet de perfil */}
      <Sheet open={perfilAberto} onOpenChange={setPerfilAberto}>
        <SheetContent side="bottom" className="rounded-t-xl pb-8">
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display text-xl font-bold">
              {perfil?.nome ?? 'Meu perfil'}
            </SheetTitle>
            <p className="text-sm text-[var(--text-secondary)] -mt-1">
              {perfil?.perfil === 'rose' ? 'Gerente' : perfil?.perfil === 'vendedor' ? 'Vendedor' : 'Operacional'}
            </p>
          </SheetHeader>

          <Separator className="mb-4" />

          <div className="flex flex-col gap-1">
            <button
              onClick={() => { sair(); setPerfilAberto(false) }}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-md text-sm font-medium text-[var(--status-error)] hover:bg-[var(--status-error-bg)] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair da conta
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
