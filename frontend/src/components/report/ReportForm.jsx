import { useState } from 'react'

import { TaskTable } from './TaskTable'
import { ListEditor } from './ListEditor'
import { HoursByTypeInput } from './HoursByTypeInput'
import { Button } from '../common/Button'
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

function toFormState(report) {
  return {
    project: report.project?._id || report.project,
    tasksCompleted: report.content.tasksCompleted || [],
    tasksPlannedNextWeek: report.content.tasksPlannedNextWeek || [],
    blockers: report.content.blockers || [],
    achievements: report.content.achievements || [],
    hoursByType: report.content.hoursByType || {},
    notes: report.content.notes || '',
  }
}

export function ReportForm({ report, projects, onSave, isSaving, onSubmit, isSubmitting }) {
  const [form, setForm] = useState(() => toFormState(report))
  const isEditable = report.status === 'draft' || report.status === 'needs_correction'

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    await onSave({
      project: form.project,
      content: {
        tasksCompleted: form.tasksCompleted,
        tasksPlannedNextWeek: form.tasksPlannedNextWeek,
        blockers: form.blockers,
        achievements: form.achievements,
        hoursByType: form.hoursByType,
        notes: form.notes,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="report-project">
            Project
          </label>
          <select
            id="report-project"
            value={form.project}
            disabled={!isEditable}
            onChange={(event) => update('project', event.target.value)}
            className="rounded border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
          >
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <StatusBadge tone={STATUS_TONES[report.status]}>{STATUS_LABELS[report.status]}</StatusBadge>
      </div>

      {report.status === 'needs_correction' && report.latestComment?.comment && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <p className="font-medium mb-1">Manager requested changes</p>
          <p>{report.latestComment.comment}</p>
        </div>
      )}

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Tasks completed</h2>
        <TaskTable tasks={form.tasksCompleted} onChange={(tasks) => update('tasksCompleted', tasks)} />
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Tasks planned for next week</h2>
        <ListEditor
          items={form.tasksPlannedNextWeek}
          onChange={(items) => update('tasksPlannedNextWeek', items)}
          addLabel="Add task"
        />
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Blockers / challenges</h2>
        <ListEditor
          items={form.blockers}
          onChange={(items) => update('blockers', items)}
          withKeyFlag
          groupName="blockers-key"
          addLabel="Add blocker"
        />
        <p className="text-xs text-slate-400 mt-2">Select the radio button to flag the key issue for the week.</p>
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Achievements / highlights</h2>
        <ListEditor
          items={form.achievements}
          onChange={(items) => update('achievements', items)}
          withKeyFlag
          groupName="achievements-key"
          addLabel="Add achievement"
        />
        <p className="text-xs text-slate-400 mt-2">
          Select the radio button to flag the key achievement for the week.
        </p>
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Hours worked by type (optional)</h2>
        <HoursByTypeInput value={form.hoursByType} onChange={(value) => update('hoursByType', value)} />
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Notes / links (optional)</h2>
        <textarea
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          rows={3}
          value={form.notes}
          onChange={(event) => update('notes', event.target.value)}
        />
      </section>

      {isEditable && (
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={isSaving || isSubmitting} className="px-4">
            {isSaving ? 'Saving...' : 'Save draft'}
          </Button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSaving || isSubmitting}
            className="px-4 py-2 text-sm font-medium rounded border border-primary-300 text-primary-700 hover:bg-primary-50 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit for review'}
          </button>
        </div>
      )}
    </div>
  )
}
