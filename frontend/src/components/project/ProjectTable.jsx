import { Pencil } from 'lucide-react'

import { StatusBadge } from '../common/StatusBadge'

export function ProjectTable({ projects, onEdit }) {
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
          <th className="py-2 pr-4 font-medium">Members</th>
          <th className="py-2 pr-4 font-medium" />
        </tr>
      </thead>
      <tbody>
        {projects.map((project) => (
          <tr key={project._id} className="border-t border-slate-200">
            <td className="py-2 pr-4 text-slate-800">{project.name}</td>
            <td className="py-2 pr-4 text-slate-500">{project.description || '-'}</td>
            <td className="py-2 pr-4">
              <StatusBadge tone={project.isActive ? 'success' : 'neutral'}>
                {project.isActive ? 'Active' : 'Inactive'}
              </StatusBadge>
            </td>
            <td className="py-2 pr-4 text-slate-500">
              {project.members?.length > 0 ? project.members.map((member) => member.name).join(', ') : 'All members'}
            </td>
            <td className="py-2 pr-4">
              <button
                type="button"
                className="text-slate-400 hover:text-primary-600"
                onClick={() => onEdit(project)}
                aria-label={`Edit ${project.name}`}
              >
                <Pencil size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
