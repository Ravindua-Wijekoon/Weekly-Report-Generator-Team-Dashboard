import { useState } from 'react'
import { Plus } from 'lucide-react'

import { useCreateProject, useProjects, useUpdateProject } from '../hooks/useProjects'
import { useUsers } from '../hooks/useUsers'
import { ProjectFormModal } from '../components/project/ProjectFormModal'
import { ProjectTable } from '../components/project/ProjectTable'
import { Button } from '../components/common/Button'

export default function ProjectManagementPage() {
  const { data: projects = [], isLoading, error } = useProjects()
  const { data: usersData } = useUsers({ role: 'member', isActive: true, limit: 100 })
  const members = usersData?.data || []
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [formError, setFormError] = useState('')

  async function handleCreate(form) {
    try {
      await createProject.mutateAsync(form)
      setIsCreateOpen(false)
      setFormError('')
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create project')
    }
  }

  async function handleUpdate(form) {
    try {
      await updateProject.mutateAsync({ id: editingProject._id, payload: form })
      setEditingProject(null)
      setFormError('')
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to update project')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Projects</h1>
        <Button
          className="px-4 flex items-center gap-1.5"
          onClick={() => {
            setFormError('')
            setIsCreateOpen(true)
          }}
        >
          <Plus size={16} />
          Create project
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        {isLoading && <p className="text-slate-500 text-sm">Loading projects...</p>}
        {error && <p className="text-sm text-danger">Failed to load projects.</p>}
        {!isLoading && !error && (
          <ProjectTable
            projects={projects}
            onEdit={(project) => {
              setFormError('')
              setEditingProject(project)
            }}
          />
        )}
      </div>

      {isCreateOpen && (
        <ProjectFormModal
          mode="create"
          members={members}
          onSubmit={handleCreate}
          onClose={() => setIsCreateOpen(false)}
          isSubmitting={createProject.isPending}
          error={formError}
        />
      )}

      {editingProject && (
        <ProjectFormModal
          mode="edit"
          project={editingProject}
          members={members}
          onSubmit={handleUpdate}
          onClose={() => setEditingProject(null)}
          isSubmitting={updateProject.isPending}
          error={formError}
        />
      )}
    </div>
  )
}
