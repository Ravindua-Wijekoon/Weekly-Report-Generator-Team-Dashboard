import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { useCreateReport, useReports, useSubmitReport, useUpdateReport } from '../hooks/useReports'
import { useProjects } from '../hooks/useProjects'
import { getWeekStart, getWeekEnd, toISODateString, formatWeekRange } from '../lib/week'
import { ReportForm } from '../components/report/ReportForm'
import { Button } from '../components/common/Button'
import { StatusBadge } from '../components/common/StatusBadge'

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

const EDITABLE_STATUSES = ['draft', 'needs_correction']

export default function MyReportPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const weekParam = searchParams.get('week')
  const anchorDate = weekParam ? new Date(weekParam) : new Date()

  const weekStart = getWeekStart(anchorDate)
  const weekEnd = getWeekEnd(weekStart)
  const weekStartParam = toISODateString(weekStart)

  const { data: projects = [] } = useProjects({ isActive: true })
  const { data: reportsData, isLoading } = useReports({
    weekStart: weekStartParam,
    weekEnd: weekStartParam,
    mine: true,
  })
  const createReport = useCreateReport()
  const updateReport = useUpdateReport()
  const submitReport = useSubmitReport()

  const existingReport = reportsData?.data?.[0]
  const isEditable = existingReport ? EDITABLE_STATUSES.includes(existingReport.status) : false

  function goToWeek(date) {
    setSearchParams({ week: toISODateString(date) })
  }

  function goToPreviousWeek() {
    const prev = new Date(weekStart)
    prev.setUTCDate(prev.getUTCDate() - 7)
    goToWeek(prev)
  }

  function goToNextWeek() {
    const next = new Date(weekStart)
    next.setUTCDate(next.getUTCDate() + 7)
    goToWeek(next)
  }

  async function handleCreate(projectId) {
    await createReport.mutateAsync({ project: projectId, weekStart: weekStartParam })
  }

  async function handleSave(payload) {
    await updateReport.mutateAsync({ id: existingReport._id, payload })
  }

  async function handleSubmit() {
    await submitReport.mutateAsync(existingReport._id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-800">My weekly report</h1>
        <div className="flex items-center gap-3 text-sm">
          <button type="button" onClick={goToPreviousWeek} className="text-primary-600 hover:underline">
            Previous week
          </button>
          <span className="text-slate-500">{formatWeekRange(weekStart, weekEnd)}</span>
          <button type="button" onClick={goToNextWeek} className="text-primary-600 hover:underline">
            Next week
          </button>
        </div>
      </div>

      {isLoading && <p className="text-slate-500 text-sm">Loading...</p>}

      {!isLoading && !existingReport && (
        <StartReportPanel projects={projects} onCreate={handleCreate} isSubmitting={createReport.isPending} />
      )}

      {!isLoading && existingReport && isEditable && (
        <ReportForm
          key={existingReport._id}
          report={existingReport}
          projects={projects}
          onSave={handleSave}
          isSaving={updateReport.isPending}
          onSubmit={handleSubmit}
          isSubmitting={submitReport.isPending}
        />
      )}

      {!isLoading && existingReport && !isEditable && (
        <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-600">
              This week's report is no longer editable here.
            </p>
            <div className="mt-2">
              <StatusBadge tone={STATUS_TONES[existingReport.status]}>
                {STATUS_LABELS[existingReport.status]}
              </StatusBadge>
            </div>
          </div>
          <Link to={`/reports/${existingReport._id}`} className="text-primary-600 hover:underline text-sm">
            View report
          </Link>
        </div>
      )}
    </div>
  )
}

function StartReportPanel({ projects, onCreate, isSubmitting }) {
  const [projectId, setProjectId] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    if (!projectId) {
      setError("Select a project to start this week's report")
      return
    }
    setError('')
    await onCreate(projectId)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-slate-600 mb-4">No report yet for this week. Choose a project to start one.</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="start-project">
            Project
          </label>
          <select
            id="start-project"
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
          {error && <p className="mt-1 text-sm text-danger">{error}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting} className="px-4 whitespace-nowrap">
          {isSubmitting ? 'Starting...' : "Start this week's report"}
        </Button>
      </form>
    </div>
  )
}
