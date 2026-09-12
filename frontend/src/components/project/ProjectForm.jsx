import { useState } from 'react'

import { FormField } from '../common/FormField'
import { Button } from '../common/Button'

export function ProjectForm({ onSubmit, isSubmitting }) {
  const [form, setForm] = useState({ name: '', description: '' })
  const [error, setError] = useState('')

  function updateField(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.name.trim()) {
      setError('Name is required')
      return
    }
    setError('')
    await onSubmit(form)
    setForm({ name: '', description: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:items-end">
      <div className="flex-1">
        <FormField
          label="Project name"
          id="project-name"
          value={form.name}
          onChange={updateField('name')}
          error={error}
        />
      </div>
      <div className="flex-1">
        <FormField
          label="Description"
          id="project-description"
          value={form.description}
          onChange={updateField('description')}
        />
      </div>
      <Button type="submit" disabled={isSubmitting} className="px-4 whitespace-nowrap">
        {isSubmitting ? 'Adding...' : 'Add project'}
      </Button>
    </form>
  )
}
