import { useState } from 'react'
import { Plus } from 'lucide-react'

import { useCreateUser, useUpdateUser, useUsers } from '../hooks/useUsers'
import { UserFormModal } from '../components/user/UserFormModal'
import { UserTable } from '../components/user/UserTable'
import { Button } from '../components/common/Button'

export default function UserManagementPage() {
  const { data, isLoading, error } = useUsers()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formError, setFormError] = useState('')

  const users = data?.data || []

  async function handleCreate(form) {
    try {
      await createUser.mutateAsync(form)
      setIsCreateOpen(false)
      setFormError('')
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create user')
    }
  }

  async function handleUpdate(form) {
    try {
      await updateUser.mutateAsync({ id: editingUser.id, payload: form })
      setEditingUser(null)
      setFormError('')
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to update user')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-800">User management</h1>
        <Button
          className="px-4 flex items-center gap-1.5"
          onClick={() => {
            setFormError('')
            setIsCreateOpen(true)
          }}
        >
          <Plus size={16} />
          Create user
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        {isLoading && <p className="text-slate-500 text-sm">Loading...</p>}
        {error && <p className="text-sm text-danger">Failed to load users.</p>}
        {!isLoading && !error && (
          <UserTable
            users={users}
            onEdit={(user) => {
              setFormError('')
              setEditingUser(user)
            }}
          />
        )}
      </div>

      {isCreateOpen && (
        <UserFormModal
          mode="create"
          onSubmit={handleCreate}
          onClose={() => setIsCreateOpen(false)}
          isSubmitting={createUser.isPending}
          error={formError}
        />
      )}

      {editingUser && (
        <UserFormModal
          mode="edit"
          user={editingUser}
          onSubmit={handleUpdate}
          onClose={() => setEditingUser(null)}
          isSubmitting={updateUser.isPending}
          error={formError}
        />
      )}
    </div>
  )
}
