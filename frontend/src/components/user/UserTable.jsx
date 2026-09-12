import { StatusBadge } from '../common/StatusBadge'

export function UserTable({ users, onUpdate, isUpdating }) {
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
          <th className="py-2 pr-4 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} className="border-t border-slate-200">
            <td className="py-2 pr-4 text-slate-800">{user.name}</td>
            <td className="py-2 pr-4 text-slate-500">{user.email}</td>
            <td className="py-2 pr-4">
              <select
                value={user.role}
                disabled={isUpdating}
                onChange={(event) => onUpdate(user.id, { role: event.target.value })}
                className="rounded border border-slate-300 px-2 py-1 text-sm"
              >
                <option value="member">Member</option>
                <option value="manager">Manager</option>
              </select>
            </td>
            <td className="py-2 pr-4">
              <StatusBadge tone={user.isActive ? 'success' : 'neutral'}>
                {user.isActive ? 'Active' : 'Deactivated'}
              </StatusBadge>
            </td>
            <td className="py-2 pr-4">
              <button
                type="button"
                className="text-sm text-slate-500 hover:underline"
                disabled={isUpdating}
                onClick={() => onUpdate(user.id, { isActive: !user.isActive })}
              >
                {user.isActive ? 'Deactivate' : 'Reactivate'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
