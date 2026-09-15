import { NavLink, Outlet } from 'react-router-dom'
import { Building2, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import CobraLogo from '@/components/CobraLogo'

const navItems = [
  { to: '/admin', icon: Building2, label: 'Empresas', end: true },
]

// Layout do painel super-admin — visual CobraAI (sidebar clara, estilo referência).
// Isolado do AppLayout (Rose). Responsivo: sidebar no desktop, header no mobile.
export default function AdminLayout() {
  const { usuario, perfil, sair } = useAuth()

  return (
    <div className="cobra-theme flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-cobra-border bg-white sticky top-0 h-screen">
        <div className="px-4 py-4 flex items-center gap-2.5">
          <CobraLogo size={32} />
          <div className="leading-tight">
            <p className="font-bold text-cobra-ink text-sm">CobraAI</p>
            <p className="text-[11px] text-cobra-faint">Admin da plataforma</p>
          </div>
        </div>

        <nav className="flex-1 px-2 py-2 flex flex-col gap-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-cobra-tint text-cobra'
                    : 'text-cobra-muted hover:bg-cobra-tint hover:text-cobra'
                )
              }
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-cobra-border px-3 py-3">
          <p className="text-sm font-medium text-cobra-ink truncate">{perfil?.nome ?? '—'}</p>
          <p className="text-xs text-cobra-faint truncate mb-2">{usuario?.email}</p>
          <button
            onClick={sair}
            className="flex items-center gap-2 text-sm font-medium text-cobra-muted hover:text-cobra transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Header mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-cobra-border bg-white px-4 h-14">
        <div className="flex items-center gap-2">
          <CobraLogo size={28} />
          <span className="font-bold text-cobra-ink text-sm">CobraAI Admin</span>
        </div>
        <button onClick={sair} className="text-cobra-muted hover:text-cobra" aria-label="Sair">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 min-w-0 bg-white pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  )
}
