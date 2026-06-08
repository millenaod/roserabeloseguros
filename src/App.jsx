import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/AppLayout'
import RotaProtegida from '@/components/RotaProtegida'
import { Skeleton } from '@/components/ui/skeleton'

const Login            = lazy(() => import('@/pages/Login'))
const RedefinirSenha   = lazy(() => import('@/pages/RedefinirSenha'))
const Dashboard        = lazy(() => import('@/pages/Parcelas'))
const Tarefas          = lazy(() => import('@/pages/Tarefas'))
const NovaParcela      = lazy(() => import('@/pages/NovaParcela'))
const DetalheParcela   = lazy(() => import('@/pages/DetalheParcela'))
const DashboardRose    = lazy(() => import('@/pages/DashboardRose'))
const Relatorios       = lazy(() => import('@/pages/Relatorios'))
const CarteiraVendedor = lazy(() => import('@/pages/CarteiraVendedor'))
const Perfil           = lazy(() => import('@/pages/Perfil'))
const Ajuda            = lazy(() => import('@/pages/Ajuda'))

function PageLoader() {
  return (
    <div className="p-6 flex flex-col gap-3">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />

          <Route element={<RotaProtegida />}>
            <Route element={<AppLayout />}>
              <Route path="/"             element={<Dashboard />} />
              <Route path="/tarefas"      element={<Tarefas />} />
              <Route path="/nova-parcela" element={<NovaParcela />} />
              <Route path="/parcelas/:id" element={<DetalheParcela />} />
              <Route path="/carteira"     element={<CarteiraVendedor />} />
              <Route path="/perfil"       element={<Perfil />} />
              <Route path="/ajuda"        element={<Ajuda />} />

              <Route element={<RotaProtegida perfisPermitidos={['rose']} />}>
                <Route path="/dashboard-rose" element={<DashboardRose />} />
                <Route path="/relatorios"     element={<Relatorios />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
