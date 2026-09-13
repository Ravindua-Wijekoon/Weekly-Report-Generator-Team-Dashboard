import { NavLink } from 'react-router-dom'
import { FileText, FolderKanban, History, Home, Inbox, LayoutDashboard, Users as UsersIcon } from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import { Avatar } from '../common/Avatar'
import { LogoutButton } from './LogoutButton'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/reports/me', label: 'My Report', icon: FileText },
  { to: '/reports/history', label: 'History', icon: History },
]

const MANAGER_NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/reviews', label: 'Review queue', icon: Inbox },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/users', label: 'Users', icon: UsersIcon },
]

function NavItem({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
          isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100'
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  )
}

export function Sidebar() {
  const { user } = useAuth()

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm m-4 sticky top-4 h-[calc(100vh-2rem)] px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-serif text-sm">
          W
        </div>
        <span className="font-serif text-lg text-slate-900">Weekly</span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        {user?.role === 'manager' && (
          <>
            <p className="px-3 pt-4 pb-1 text-xs font-medium text-slate-400 uppercase tracking-wide">Manage</p>
            {MANAGER_NAV_ITEMS.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </>
        )}
      </nav>

      <div className="border-t border-slate-200 pt-4 mt-4 flex items-center gap-3 px-2">
        <Avatar name={user?.name} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-800 truncate">{user?.name}</p>
          <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
        </div>
        <LogoutButton />
      </div>
    </aside>
  )
}
