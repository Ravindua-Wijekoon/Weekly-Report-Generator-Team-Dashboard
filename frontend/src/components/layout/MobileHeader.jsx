import { useAuth } from '../../context/AuthContext'
import { Avatar } from '../common/Avatar'
import { LogoutButton } from './LogoutButton'

export function MobileHeader() {
  const { user } = useAuth()

  return (
    <header className="lg:hidden sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
      <span className="font-serif text-lg text-slate-900">Weekly</span>
      <div className="flex items-center gap-3">
        <Avatar name={user?.name} size="sm" />
        <LogoutButton />
      </div>
    </header>
  )
}
