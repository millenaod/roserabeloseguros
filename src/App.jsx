import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/AppLayout'
import RotaProtegida from '@/components/RotaProtegida'
import { Skeleton } from '@/components/ui/skeleton'

const Login            = lazy(() => import('@/pages/Login'))
const Dashboard        = lazy(() => import('@/pages/Parcelas'))
const NovaParcela      = lazy(() => import('@/pages/NovaParcela'))
const DetalheParcela   = lazy(() => import('@/pages/DetalheParcela'))
const DashboardRose    = lazy(() => import('@/pages/DashboardRose'))
const Relatorios       = lazy(() => import('@/pages/Relatorios'))
const Aprovacoes       = lazy(() => import('@/pages/Aprovacoes'))
const CarteiraVendedor = lazy(() => import('@/pages/CarteiraVendedor'))

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

          <Route element={<RotaProtegida />}>
            <Route element={<AppLayout />}>
              <Route path="/"             element={<Dashboard />} />
              <Route path="/nova-parcela" element={<NovaParcela />} />
              <Route path="/parcelas/:id" element={<DetalheParcela />} />
              <Route path="/carteira"     element={<CarteiraVendedor />} />

              <Route element={<RotaProtegida perfisPermitidos={['rose']} />}>
                <Route path="/dashboard-rose" element={<DashboardRose />} />
                <Route path="/relatorios"     element={<Relatorios />} />
                <Route path="/aprovacoes"     element={<Aprovacoes />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
