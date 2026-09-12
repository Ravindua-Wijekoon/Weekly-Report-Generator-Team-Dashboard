import { Link, Outlet } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { Button } from '../common/Button'

export function AppShell() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-slate-900">
              Home
            </Link>
            <Link to="/reports/me" className="hover:text-slate-900">
              My Report
            </Link>
            <Link to="/reports/history" className="hover:text-slate-900">
              History
            </Link>
            {user?.role === 'manager' && (
              <>
                <Link to="/dashboard" className="hover:text-slate-900">
                  Dashboard
                </Link>
                <Link to="/projects" className="hover:text-slate-900">
                  Projects
                </Link>
              </>
            )}
          </nav>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>{user?.name}</span>
            <Button className="px-3 py-1" onClick={() => logout()}>
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
