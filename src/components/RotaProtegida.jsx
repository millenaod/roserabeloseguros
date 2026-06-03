import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Skeleton } from '@/components/ui/skeleton'

export default function RotaProtegida({ perfisPermitidos }) {
  const { usuario, perfil, carregando } = useAuth()

  if (carregando) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col gap-3 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    )
  }

  if (!usuario) return <Navigate to="/login" replace />

  if (perfisPermitidos && perfil && !perfisPermitidos.includes(perfil.perfil)) {
    const destinos = { rose: '/dashboard-rose', thaina: '/', vendedor: '/carteira' }
    return <Navigate to={destinos[perfil.perfil] ?? '/'} replace />
  }

  return <Outlet />
}
