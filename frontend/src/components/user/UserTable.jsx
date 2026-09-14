import { Pencil } from 'lucide-react'

import { StatusBadge } from '../common/StatusBadge'

export function UserTable({ users, onEdit }) {
  if (users.length === 0) {
    return <p className="text-slate-500 text-sm">No users yet.</p>
  }

  return (
    <table className="w-full text-sm text-left">
      <thead>
        <tr className="text-slate-500 border-b border-slate-200">
          <th className="py-2 pr-4 font-medium">Name</th>
          <th className="py-2 pr-4 font-medium">Email</th>
          <th className="py-2 pr-4 font-medium">Role</th>
          <th className="py-2 pr-4 font-medium">Status</th>
          <th className="py-2 pr-4 font-medium" />
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} className="border-t border-slate-200">
            <td className="py-2 pr-4 text-slate-800">{user.name}</td>
            <td className="py-2 pr-4 text-slate-500">{user.email}</td>
            <td className="py-2 pr-4">
              <StatusBadge tone={user.role === 'manager' ? 'info' : 'neutral'}>
                {user.role === 'manager' ? 'Manager' : 'Member'}
              </StatusBadge>
            </td>
            <td className="py-2 pr-4">
              <StatusBadge tone={user.isActive ? 'success' : 'neutral'}>
                {user.isActive ? 'Active' : 'Deactivated'}
              </StatusBadge>
            </td>
            <td className="py-2 pr-4">
              <button
                type="button"
                className="text-slate-400 hover:text-primary-600"
                onClick={() => onEdit(user)}
                aria-label={`Edit ${user.name}`}
              >
                <Pencil size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
