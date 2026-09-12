import { useState } from 'react'

import { FormField } from '../common/FormField'
import { Button } from '../common/Button'
import { StatusBadge } from '../common/StatusBadge'

function ProjectRow({ project, onUpdate, onToggleActive, isUpdating }) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({ name: project.name, description: project.description || '' })

  function updateField(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  async function handleSave() {
    await onUpdate(project._id, form)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <tr className="border-t border-slate-200">
        <td className="py-2 pr-4">
          <FormField id={`name-${project._id}`} value={form.name} onChange={updateField('name')} />
        </td>
        <td className="py-2 pr-4">
          <FormField
            id={`description-${project._id}`}
            value={form.description}
            onChange={updateField('description')}
          />
        </td>
        <td className="py-2 pr-4">
          <StatusBadge tone={project.isActive ? 'success' : 'neutral'}>
            {project.isActive ? 'Active' : 'Inactive'}
          </StatusBadge>
        </td>
        <td className="py-2 pr-4 space-x-2 whitespace-nowrap">
          <Button className="px-3 py-1" onClick={handleSave} disabled={isUpdating}>
            Save
          </Button>
          <button
            type="button"
            className="text-sm text-slate-500 hover:text-slate-700"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </button>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-t border-slate-200">
      <td className="py-2 pr-4 text-slate-800">{project.name}</td>
      <td className="py-2 pr-4 text-slate-500">{project.description || '-'}</td>
      <td className="py-2 pr-4">
        <StatusBadge tone={project.isActive ? 'success' : 'neutral'}>
          {project.isActive ? 'Active' : 'Inactive'}
        </StatusBadge>
      </td>
      <td className="py-2 pr-4 space-x-3 whitespace-nowrap">
        <button
          type="button"
          className="text-sm text-primary-600 hover:underline"
          onClick={() => setIsEditing(true)}
        >
          Edit
        </button>
        <button
          type="button"
          className="text-sm text-slate-500 hover:underline"
          onClick={() => onToggleActive(project)}
        >
          {project.isActive ? 'Deactivate' : 'Reactivate'}
        </button>
      </td>
    </tr>
  )
}

export function ProjectTable({ projects, onUpdate, onToggleActive, isUpdating }) {
  if (projects.length === 0) {
    return <p className="text-slate-500 text-sm">No projects yet.</p>
  }

  return (
    <table className="w-full text-sm text-left">
      <thead>
        <tr className="text-slate-500 border-b border-slate-200">
          <th className="py-2 pr-4 font-medium">Name</th>
          <th className="py-2 pr-4 font-medium">Description</th>
          <th className="py-2 pr-4 font-medium">Status</th>
          <th className="py-2 pr-4 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        {projects.map((project) => (
          <ProjectRow
            key={project._id}
            project={project}
            onUpdate={onUpdate}
            onToggleActive={onToggleActive}
            isUpdating={isUpdating}
          />
        ))}
      </tbody>
    </table>
  )
}
