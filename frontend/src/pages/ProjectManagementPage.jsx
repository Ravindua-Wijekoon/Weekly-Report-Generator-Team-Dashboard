import { useCreateProject, useDeleteProject, useProjects, useUpdateProject } from '../hooks/useProjects'
import { ProjectForm } from '../components/project/ProjectForm'
import { ProjectTable } from '../components/project/ProjectTable'

export default function ProjectManagementPage() {
  const { data: projects = [], isLoading, error } = useProjects()
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()

  async function handleCreate(form) {
    await createProject.mutateAsync(form)
  }

  async function handleUpdate(id, payload) {
    await updateProject.mutateAsync({ id, payload })
  }

  async function handleToggleActive(project) {
    if (project.isActive) {
      await deleteProject.mutateAsync(project._id)
    } else {
      await updateProject.mutateAsync({ id: project._id, payload: { isActive: true } })
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800 mb-6">Projects</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <ProjectForm onSubmit={handleCreate} isSubmitting={createProject.isPending} />
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        {isLoading && <p className="text-slate-500 text-sm">Loading projects...</p>}
        {error && <p className="text-sm text-danger">Failed to load projects.</p>}
        {!isLoading && !error && (
          <ProjectTable
            projects={projects}
            onUpdate={handleUpdate}
            onToggleActive={handleToggleActive}
            isUpdating={updateProject.isPending}
          />
        )}
      </div>
    </div>
  )
}
