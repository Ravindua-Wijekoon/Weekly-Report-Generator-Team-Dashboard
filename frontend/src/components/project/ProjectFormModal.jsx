import { useState } from 'react'

import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { FormField } from '../common/FormField'
import { MemberMultiSelect } from './MemberMultiSelect'

export function ProjectFormModal({ mode, project, members, onSubmit, onClose, isSubmitting, error }) {
  const isEdit = mode === 'edit'

  const [form, setForm] = useState(() =>
    isEdit
      ? {
          name: project.name,
          description: project.description || '',
          members: project.members?.map((member) => member._id) || [],
          isActive: project.isActive,
        }
      : { name: '', description: '', members: [] }
  )
  const [nameError, setNameError] = useState('')

  function updateField(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.name.trim()) {
      setNameError('Name is required')
      return
    }
    setNameError('')
    await onSubmit(form)
  }

  return (
    <Modal
      title={isEdit ? 'Edit project' : 'Create project'}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="px-4">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="px-4">
            {isSubmitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create project'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-danger bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>}

        <FormField
          label="Project name"
          id="project-name"
          value={form.name}
          onChange={updateField('name')}
          error={nameError}
        />
        <FormField
          label="Description"
          id="project-description"
          value={form.description}
          onChange={updateField('description')}
        />

        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="project-active">
              Status
            </label>
            <select
              id="project-active"
              value={String(form.isActive)}
              onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.value === 'true' }))}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="true">Active</option>
              <option value="false">Deactivated</option>
            </select>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-slate-700 mb-1">Assign to members (optional)</p>
          <p className="text-xs text-slate-400 mb-2">Leave empty to keep this project open to everyone.</p>
          <MemberMultiSelect
            members={members}
            selectedIds={form.members}
            onChange={(ids) => setForm((prev) => ({ ...prev, members: ids }))}
          />
        </div>
      </form>
    </Modal>
  )
}
