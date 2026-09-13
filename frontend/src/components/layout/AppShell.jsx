import { Outlet } from 'react-router-dom'

import { Sidebar } from './Sidebar'
import { MobileHeader } from './MobileHeader'
import { MobileTabBar } from './MobileTabBar'

export function AppShell() {
  return (
    <div className="min-h-screen flex bg-violet-50/60">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileHeader />
        <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 lg:py-8 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileTabBar />
    </div>
  )
}
