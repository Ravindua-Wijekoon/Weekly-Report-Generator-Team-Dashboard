import { useState } from 'react'

import { useAuth } from '../../context/AuthContext'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { FormField } from '../common/FormField'

export function UserFormModal({ mode, user, onSubmit, onClose, isSubmitting, error }) {
  const { user: currentUser } = useAuth()
  const isEdit = mode === 'edit'
  const isManager = isEdit && user.role === 'manager'
  const isSelf = isEdit && user.id === currentUser?.id

  const [form, setForm] = useState(() =>
    isEdit
      ? { name: user.name, role: user.role, isActive: user.isActive }
      : { name: '', email: '', password: '', role: 'member' }
  )
  const [errors, setErrors] = useState({})

  function updateField(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  function updateActive(event) {
    setForm((prev) => ({ ...prev, isActive: event.target.value === 'true' }))
  }

  function validate() {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Name is required'
    if (!isEdit) {
      if (!form.email.trim()) {
        nextErrors.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        nextErrors.email = 'Enter a valid email'
      }
      if (!form.password || form.password.length < 8) {
        nextErrors.password = 'Password must be at least 8 characters'
      }
    }
    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }
    await onSubmit(form)
  }

  return (
    <Modal
      title={isEdit ? 'Edit user' : 'Create user'}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="px-4">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="px-4">
            {isSubmitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create user'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-danger bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>}

        <FormField label="Name" id="user-name" value={form.name} onChange={updateField('name')} error={errors.name} />

        {!isEdit && (
          <>
            <FormField
              label="Email"
              id="user-email"
              type="email"
              value={form.email}
              onChange={updateField('email')}
              error={errors.email}
            />
            <FormField
              label="Temporary password"
              id="user-password"
              type="password"
              value={form.password}
              onChange={updateField('password')}
              error={errors.password}
            />
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="user-role">
            Role
          </label>
          {isManager ? (
            <p className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded px-3 py-2">
              Manager (cannot be changed)
            </p>
          ) : (
            <select
              id="user-role"
              value={form.role}
              onChange={updateField('role')}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="member">Member</option>
              <option value="manager">Manager</option>
            </select>
          )}
        </div>

        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="user-active">
              Status
            </label>
            {isSelf ? (
              <p className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded px-3 py-2">
                Active (you cannot deactivate your own account)
              </p>
            ) : (
              <select
                id="user-active"
                value={String(form.isActive)}
                onChange={updateActive}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="true">Active</option>
                <option value="false">Deactivated</option>
              </select>
            )}
          </div>
        )}
      </form>
    </Modal>
  )
}
