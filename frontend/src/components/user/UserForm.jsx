import { useState } from 'react'

import { FormField } from '../common/FormField'
import { Button } from '../common/Button'

export function UserForm({ onSubmit, isSubmitting }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' })
  const [errors, setErrors] = useState({})

  function updateField(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  function validate() {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Name is required'
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      nextErrors.email = 'Enter a valid email'
    }
    if (!form.password || form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters'
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
    setForm({ name: '', email: '', password: '', role: 'member' })
  }

  return (
    <form onSubmit={handleSubmit} className="grid sm:grid-cols-4 gap-3 sm:items-end">
      <FormField label="Name" id="user-name" value={form.name} onChange={updateField('name')} error={errors.name} />
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
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="user-role">
          Role
        </label>
        <select
          id="user-role"
          value={form.role}
          onChange={updateField('role')}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="member">Member</option>
          <option value="manager">Manager</option>
        </select>
      </div>
      <div className="sm:col-span-4">
        <Button type="submit" disabled={isSubmitting} className="px-4">
          {isSubmitting ? 'Inviting...' : 'Invite user'}
        </Button>
      </div>
    </form>
  )
}
