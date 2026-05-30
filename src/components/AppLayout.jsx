import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import BottomNav from '@/components/BottomNav'

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
