import { Card } from '../common/Card'
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

export function ReportContentView({ report, headerAction }) {
  const { content } = report

  return (
    <div className="space-y-6">
      <Card className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">{report.owner?.name}</h1>
          <p className="text-sm text-slate-500">
            {report.project?.name} &middot; Week {report.weekLabel}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge tone={STATUS_TONES[report.status]}>{STATUS_LABELS[report.status]}</StatusBadge>
          {headerAction}
        </div>
      </Card>

      {report.latestComment?.comment && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          <p className="font-medium mb-1">
            {report.latestComment.action === 'approved' ? 'Approval note' : 'Latest reviewer comment'}
          </p>
          <p>{report.latestComment.comment}</p>
        </div>
      )}

      <Card>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Tasks completed</h2>
        {content.tasksCompleted.length === 0 ? (
          <p className="text-sm text-slate-400">No tasks recorded.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm text-left table-fixed min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="py-2 px-3 font-semibold w-[16%]">Task</th>
                  <th className="py-2 px-3 font-semibold w-[8%]">Priority</th>
                  <th className="py-2 px-3 font-semibold w-[8%]">Planned %</th>
                  <th className="py-2 px-3 font-semibold w-[8%]">Actual %</th>
                  <th className="py-2 px-3 font-semibold w-[10%]">Status</th>
                  <th className="py-2 px-3 font-semibold w-[8%]">Hrs planned</th>
                  <th className="py-2 px-3 font-semibold w-[8%]">Hrs spent</th>
                  <th className="py-2 px-3 font-semibold w-[34%]">Output</th>
                </tr>
              </thead>
              <tbody>
                {content.tasksCompleted.map((task, index) => (
                  <tr key={task._id || index} className="border-t border-slate-200 align-top">
                    <td className="py-2 px-3 text-slate-800">{task.name}</td>
                    <td className="py-2 px-3 text-slate-500">{task.priority}</td>
                    <td className="py-2 px-3 text-slate-500">{task.plannedPercent}%</td>
                    <td className="py-2 px-3 text-slate-500">{task.actualPercent}%</td>
                    <td className="py-2 px-3 text-slate-500">{task.status.replace('_', ' ')}</td>
                    <td className="py-2 px-3 text-slate-500">{task.timePlannedHours}</td>
                    <td className="py-2 px-3 text-slate-500">{task.timeSpentHours}</td>
                    <td className="py-2 px-3 text-slate-500 whitespace-pre-wrap">{task.output || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Tasks planned for next week</h2>
        {!content.tasksPlannedNextWeek || content.tasksPlannedNextWeek.length === 0 ? (
          <p className="text-sm text-slate-400">Nothing planned.</p>
        ) : (
          <ul className="space-y-2">
            {content.tasksPlannedNextWeek.map((item, index) => (
              <li key={item._id || index}>
                <p className="text-sm font-medium text-slate-800">{item.task}</p>
                {item.description && <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Blockers / challenges</h2>
        <ReadOnlyList items={content.blockers} emptyText="No blockers reported." showKey />
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Achievements / highlights</h2>
        <ReadOnlyList items={content.achievements} emptyText="No achievements recorded." showKey />
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Hours worked by type</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
          {HOURS_FIELDS.map((key) => (
            <div key={key}>
              <p className="text-xs text-slate-400 capitalize">{key}</p>
              <p className="text-slate-700">{content.hoursByType?.[key] || 0}</p>
            </div>
          ))}
        </div>
      </Card>

      {content.notes && (
        <Card>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Notes / links</h2>
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{content.notes}</p>
        </Card>
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
          <span>{item.text}</span>
          {showKey && item.isKey && <StatusBadge tone="warning">Key</StatusBadge>}
        </li>
      ))}
    </ul>
  )
}
