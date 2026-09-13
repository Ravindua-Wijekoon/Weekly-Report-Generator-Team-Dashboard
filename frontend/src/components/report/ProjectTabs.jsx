const STATUS_DOT = {
  draft: 'bg-slate-400',
  submitted: 'bg-primary-500',
  needs_correction: 'bg-amber-500',
  approved: 'bg-emerald-500',
}

export function ProjectTabs({ reports, selectedProjectId, onSelect, availableProjects, onAddProject }) {
  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      {reports.map((report) => {
        const projectId = report.project?._id || report.project
        const isActive = projectId === selectedProjectId
        return (
          <button
            key={report._id}
            type="button"
            onClick={() => onSelect(projectId)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              isActive
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[report.status]}`} />
            {report.project?.name}
          </button>
        )
      })}

      {availableProjects.length > 0 && (
        <select
          value=""
          onChange={(event) => {
            if (event.target.value) onAddProject(event.target.value)
          }}
          className="text-sm border border-dashed border-slate-300 rounded-full px-3 py-1.5 text-slate-500 bg-white"
        >
          <option value="">+ Add project report</option>
          {availableProjects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
