import { StatusBadge } from '../common/StatusBadge'

const STATUS_TONES = {
  draft: 'neutral',
  submitted: 'info',
  needs_correction: 'warning',
  approved: 'success',
}

const STATUS_LABELS = {
  draft: 'Draft',
  submitted: 'Submitted',
  needs_correction: 'Needs correction',
  approved: 'Approved',
}

const HOURS_FIELDS = ['development', 'testing', 'meetings', 'documentation', 'other']

export function ReportContentView({ report }) {
  const { content } = report

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">{report.owner?.name}</h1>
          <p className="text-sm text-slate-500">
            {report.project?.name} &middot; Week {report.weekLabel}
          </p>
        </div>
        <StatusBadge tone={STATUS_TONES[report.status]}>{STATUS_LABELS[report.status]}</StatusBadge>
      </div>

      {report.latestComment?.comment && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <p className="font-medium mb-1">
            {report.latestComment.action === 'approved' ? 'Approval note' : 'Latest reviewer comment'}
          </p>
          <p>{report.latestComment.comment}</p>
        </div>
      )}

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Tasks completed</h2>
        {content.tasksCompleted.length === 0 ? (
          <p className="text-sm text-slate-400">No tasks recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[800px]">
              <thead>
                <tr className="text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4 font-medium">Task</th>
                  <th className="py-2 pr-4 font-medium">Priority</th>
                  <th className="py-2 pr-4 font-medium">Planned %</th>
                  <th className="py-2 pr-4 font-medium">Actual %</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Hrs planned</th>
                  <th className="py-2 pr-4 font-medium">Hrs spent</th>
                  <th className="py-2 pr-4 font-medium">Output</th>
                </tr>
              </thead>
              <tbody>
                {content.tasksCompleted.map((task, index) => (
                  <tr key={task._id || index} className="border-t border-slate-200">
                    <td className="py-2 pr-4 text-slate-800">{task.name}</td>
                    <td className="py-2 pr-4 text-slate-500">{task.priority}</td>
                    <td className="py-2 pr-4 text-slate-500">{task.plannedPercent}%</td>
                    <td className="py-2 pr-4 text-slate-500">{task.actualPercent}%</td>
                    <td className="py-2 pr-4 text-slate-500">{task.status.replace('_', ' ')}</td>
                    <td className="py-2 pr-4 text-slate-500">{task.timePlannedHours}</td>
                    <td className="py-2 pr-4 text-slate-500">{task.timeSpentHours}</td>
                    <td className="py-2 pr-4 text-slate-500">{task.output || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Tasks planned for next week</h2>
        <ReadOnlyList items={content.tasksPlannedNextWeek} emptyText="Nothing planned." />
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Blockers / challenges</h2>
        <ReadOnlyList items={content.blockers} emptyText="No blockers reported." showKey />
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Achievements / highlights</h2>
        <ReadOnlyList items={content.achievements} emptyText="No achievements recorded." showKey />
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Hours worked by type</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
          {HOURS_FIELDS.map((key) => (
            <div key={key}>
              <p className="text-xs text-slate-400 capitalize">{key}</p>
              <p className="text-slate-700">{content.hoursByType?.[key] || 0}</p>
            </div>
          ))}
        </div>
      </section>

      {content.notes && (
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Notes / links</h2>
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{content.notes}</p>
        </section>
      )}
    </div>
  )
}

function ReadOnlyList({ items, emptyText, showKey = false }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-slate-400">{emptyText}</p>
  }

  return (
    <ul className="space-y-1 text-sm text-slate-700">
      {items.map((item, index) => (
        <li key={item._id || index} className="flex items-center gap-2">
          {showKey && item.isKey && <StatusBadge tone="warning">Key</StatusBadge>}
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  )
}
