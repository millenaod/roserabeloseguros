import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/AppLayout'
import Dashboard from '@/pages/Dashboard'
import NovaParcela from '@/pages/NovaParcela'
import DetalheParcela from '@/pages/DetalheParcela'
import DashboardRose from '@/pages/DashboardRose'
import Relatorios from '@/pages/Relatorios'
import Aprovacoes from '@/pages/Aprovacoes'
import CarteiraVendedor from '@/pages/CarteiraVendedor'
import Login from '@/pages/Login'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/nova-parcela" element={<NovaParcela />} />
          <Route path="/parcelas/:id" element={<DetalheParcela />} />
          <Route path="/dashboard-rose" element={<DashboardRose />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/aprovacoes" element={<Aprovacoes />} />
          <Route path="/carteira" element={<CarteiraVendedor />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
