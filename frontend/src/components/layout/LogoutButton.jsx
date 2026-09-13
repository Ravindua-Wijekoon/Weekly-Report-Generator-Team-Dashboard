import { useState } from 'react'
import { LogOut } from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import { ConfirmDialog } from '../common/ConfirmDialog'

export function LogoutButton({ className = 'text-slate-400 hover:text-slate-700' }) {
  const { logout } = useAuth()
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setShowConfirm(true)} className={className} aria-label="Log out">
        <LogOut size={18} />
      </button>

      {showConfirm && (
        <ConfirmDialog
          title="Log out"
          message="Are you sure you want to log out?"
          confirmLabel="Log out"
          onConfirm={() => {
            setShowConfirm(false)
            logout()
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  )
}
