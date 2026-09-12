import { useCreateUser, useUpdateUser, useUsers } from '../hooks/useUsers'
import { UserForm } from '../components/user/UserForm'
import { UserTable } from '../components/user/UserTable'

export default function UserManagementPage() {
  const { data, isLoading, error } = useUsers()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const users = data?.data || []

  async function handleCreate(form) {
    await createUser.mutateAsync(form)
  }

  async function handleUpdate(id, payload) {
    await updateUser.mutateAsync({ id, payload })
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800 mb-6">User management</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <UserForm onSubmit={handleCreate} isSubmitting={createUser.isPending} />
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        {isLoading && <p className="text-slate-500 text-sm">Loading...</p>}
        {error && <p className="text-sm text-danger">Failed to load users.</p>}
        {!isLoading && !error && (
          <UserTable users={users} onUpdate={handleUpdate} isUpdating={updateUser.isPending} />
        )}
      </div>
    </div>
  )
}
