import { useEffect, useRef, useState } from 'react'

import { TaskTable } from './TaskTable'
import { PlannedTaskList } from './PlannedTaskList'
import { ListEditor } from './ListEditor'
import { HoursByTypeInput } from './HoursByTypeInput'
import { Card } from '../common/Card'
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

const AUTOSAVE_DELAY_MS = 900

function toFormState(report) {
  return {
    tasksCompleted: report.content.tasksCompleted || [],
    tasksPlannedNextWeek: report.content.tasksPlannedNextWeek || [],
    blockers: report.content.blockers || [],
    achievements: report.content.achievements || [],
    hoursByType: report.content.hoursByType || {},
    notes: report.content.notes || '',
  }
}

export function ReportForm({ report, onSave, onSubmit, isSubmitting }) {
  const [form, setForm] = useState(() => toFormState(report))
  const [actionError, setActionError] = useState('')
  const [saveStatus, setSaveStatus] = useState('saved')
  const isEditable = report.status === 'draft' || report.status === 'needs_correction'
  const canSubmit =
    form.tasksCompleted.some((task) => task.name && task.name.trim()) &&
    form.tasksPlannedNextWeek.some((task) => task.task && task.task.trim())

  const isFirstRender = useRef(true)
  const formRef = useRef(form)

  useEffect(() => {
    formRef.current = form
  }, [form])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    if (!isEditable) {
      return undefined
    }
    if (isFirstRender.current) {
      isFirstRender.current = false
      return undefined
    }

    setSaveStatus('saving')
    const timeout = setTimeout(async () => {
      try {
        await onSave({ content: form })
        setSaveStatus('saved')
        setActionError('')
      } catch (error) {
        setSaveStatus('error')
        setActionError(error.response?.data?.error || 'Failed to save')
      }
    }, AUTOSAVE_DELAY_MS)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  useEffect(() => {
    return () => {
      if (isEditable) {
        onSave({ content: formRef.current }).catch(() => {})
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmitClick() {
    setActionError('')
    try {
      await onSave({ content: form })
      await onSubmit()
    } catch (error) {
      setActionError(error.response?.data?.error || 'Failed to submit')
    }
  }

  return (
    <div className="space-y-6">
      <Card className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Project</p>
          <p className="text-slate-900 mt-1">{report.project?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditable && (
            <span className="text-xs text-slate-400">
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'saved' && 'All changes saved'}
              {saveStatus === 'error' && 'Failed to save'}
            </span>
          )}
          <StatusBadge tone={STATUS_TONES[report.status]}>{STATUS_LABELS[report.status]}</StatusBadge>
        </div>
      </Card>

      {report.status === 'needs_correction' && report.latestComment?.comment && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          <p className="font-medium mb-1">Manager requested changes</p>
          <p>{report.latestComment.comment}</p>
        </div>
      )}

      <Card>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Tasks completed</h2>
        <TaskTable tasks={form.tasksCompleted} onChange={(tasks) => update('tasksCompleted', tasks)} />
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Tasks planned for next week</h2>
        <PlannedTaskList
          items={form.tasksPlannedNextWeek}
          onChange={(items) => update('tasksPlannedNextWeek', items)}
        />
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Blockers / challenges</h2>
        <ListEditor
          items={form.blockers}
          onChange={(items) => update('blockers', items)}
          withKeyFlag
          keyLabel="Flag as the key issue for the week"
          addLabel="Add blocker"
        />
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Achievements / highlights</h2>
        <ListEditor
          items={form.achievements}
          onChange={(items) => update('achievements', items)}
          withKeyFlag
          keyLabel="Flag as the key achievement for the week"
          addLabel="Add achievement"
        />
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Hours worked by type (optional)</h2>
        <HoursByTypeInput value={form.hoursByType} onChange={(value) => update('hoursByType', value)} />
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Notes / links (optional)</h2>
        <textarea
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          rows={3}
          value={form.notes}
          onChange={(event) => update('notes', event.target.value)}
        />
      </Card>

      {isEditable && (
        <div>
          {actionError && <p className="text-sm text-danger mb-2">{actionError}</p>}
          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={handleSubmitClick} disabled={!canSubmit || isSubmitting} className="px-4">
              {isSubmitting ? 'Submitting...' : 'Submit for review'}
            </Button>
            {!canSubmit && (
              <p className="text-xs text-slate-400">
                Add at least one completed task and one planned task to submit.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
