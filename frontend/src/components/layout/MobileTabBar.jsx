import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  FileText,
  FolderKanban,
  History,
  Home,
  Inbox,
  LayoutDashboard,
  MoreHorizontal,
  Users as UsersIcon,
  X,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'

const BASE_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/reports/me', label: 'Report', icon: FileText },
  { to: '/reports/history', label: 'History', icon: History },
]

const MORE_ITEMS = [
  { to: '/dashboard', label: 'Team dashboard', icon: LayoutDashboard },
  { to: '/reviews', label: 'Review queue', icon: Inbox },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/users', label: 'Users', icon: UsersIcon },
]

export function MobileTabBar() {
  const { user } = useAuth()
  const [showMore, setShowMore] = useState(false)
  const isManager = user?.role === 'manager'

  return (
    <>
      {showMore && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/30" onClick={() => setShowMore(false)}>
          <div
            className="absolute bottom-16 inset-x-4 bg-white rounded-2xl shadow-lg border border-slate-200 p-2"
            onClick={(event) => event.stopPropagation()}
          >
            {MORE_ITEMS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setShowMore(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 flex items-center justify-around py-2 z-20">
        {BASE_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-xs font-medium ${
                isActive ? 'text-primary-700' : 'text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`p-1.5 rounded-full ${isActive ? 'bg-primary-50' : ''}`}>
                  <Icon size={20} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}

        {isManager && (
          <button
            type="button"
            onClick={() => setShowMore((prev) => !prev)}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-xs font-medium text-slate-400"
          >
            <span className="p-1.5 rounded-full">{showMore ? <X size={20} /> : <MoreHorizontal size={20} />}</span>
            More
          </button>
        )}
      </nav>
    </>
  )
}
