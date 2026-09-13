import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { useCreateReport, useReports, useSubmitReport, useUpdateReport } from '../hooks/useReports'
import { useProjects } from '../hooks/useProjects'
import { getWeekStart, getWeekEnd, toISODateString, formatWeekRange } from '../lib/week'
import { ReportForm } from '../components/report/ReportForm'
import { ProjectTabs } from '../components/report/ProjectTabs'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { StatusBadge } from '../components/common/StatusBadge'
import { WeekNavigator } from '../components/common/WeekNavigator'

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

  const [selectedProjectId, setSelectedProjectId] = useState(null)

  const { data: projects = [] } = useProjects({ isActive: true })
  const { data: reportsData, isLoading } = useReports({
    weekStart: weekStartParam,
    weekEnd: weekStartParam,
    mine: true,
  })
  const createReport = useCreateReport()
  const updateReport = useUpdateReport()
  const submitReport = useSubmitReport()

  const weekReports = reportsData?.data || []

  useEffect(() => {
    setSelectedProjectId(null)
  }, [weekStartParam])

  useEffect(() => {
    if (weekReports.length === 0) return
    const stillValid = weekReports.some((report) => (report.project?._id || report.project) === selectedProjectId)
    if (!selectedProjectId || !stillValid) {
      setSelectedProjectId(weekReports[0].project?._id || weekReports[0].project)
    }
  }, [weekReports, selectedProjectId])

  const selectedReport = weekReports.find((report) => (report.project?._id || report.project) === selectedProjectId)
  const isEditable = selectedReport ? EDITABLE_STATUSES.includes(selectedReport.status) : false

  const startedProjectIds = new Set(weekReports.map((report) => report.project?._id || report.project))
  const availableProjects = projects.filter((project) => !startedProjectIds.has(project._id))

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
    setSelectedProjectId(projectId)
  }

  async function handleSave(payload) {
    await updateReport.mutateAsync({ id: selectedReport._id, payload })
  }

  async function handleSubmit() {
    await submitReport.mutateAsync(selectedReport._id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-serif text-2xl text-slate-900">My weekly report</h1>
        <WeekNavigator label={formatWeekRange(weekStart, weekEnd)} onPrevious={goToPreviousWeek} onNext={goToNextWeek} />
      </div>

      {isLoading && <p className="text-slate-500 text-sm">Loading...</p>}

      {!isLoading && weekReports.length > 0 && (
        <ProjectTabs
          reports={weekReports}
          selectedProjectId={selectedProjectId}
          onSelect={setSelectedProjectId}
          availableProjects={availableProjects}
          onAddProject={handleCreate}
        />
      )}

      {!isLoading && weekReports.length === 0 && (
        <StartReportPanel projects={projects} onCreate={handleCreate} isSubmitting={createReport.isPending} />
      )}

      {!isLoading && selectedReport && isEditable && (
        <ReportForm
          key={selectedReport._id}
          report={selectedReport}
          onSave={handleSave}
          onSubmit={handleSubmit}
          isSubmitting={submitReport.isPending}
        />
      )}

      {!isLoading && selectedReport && !isEditable && (
        <Card className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-slate-600">This report is no longer editable here.</p>
            <div className="mt-2">
              <StatusBadge tone={STATUS_TONES[selectedReport.status]}>
                {STATUS_LABELS[selectedReport.status]}
              </StatusBadge>
            </div>
          </div>
          <Link to={`/reports/${selectedReport._id}`} className="text-primary-600 hover:underline text-sm">
            View report
          </Link>
        </Card>
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
    <Card>
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
    </Card>
  )
}
