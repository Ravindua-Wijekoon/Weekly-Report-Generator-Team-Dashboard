import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

import {
  useActivity,
  useDashboardSummary,
  useDashboardTrend,
  useHoursByType,
  useStatusByMember,
  useWorkloadByProject,
} from '../hooks/useDashboard'
import { useProjects } from '../hooks/useProjects'
import { getWeekStart, getWeekEnd, toISODateString, formatWeekRange } from '../lib/week'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { TrendChart } from '../components/dashboard/TrendChart'
import { StatusByMemberChart } from '../components/dashboard/StatusByMemberChart'
import { WorkloadByProjectChart } from '../components/dashboard/WorkloadByProjectChart'
import { HoursByTypeChart } from '../components/dashboard/HoursByTypeChart'
import { ActivityFeed } from '../components/dashboard/ActivityFeed'
import { SectionAcrossTeam } from '../components/dashboard/SectionAcrossTeam'
import { StatusBadge } from '../components/common/StatusBadge'
import { SegmentedControl } from '../components/common/SegmentedControl'
import { Card } from '../components/common/Card'
import { WeekNavigator } from '../components/common/WeekNavigator'
import { Button } from '../components/common/Button'

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'not_started', label: 'Not started' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'needs_correction', label: 'Needs correction' },
  { value: 'approved', label: 'Approved' },
]

const STATUS_TONES = {
  not_started: 'neutral',
  draft: 'neutral',
  submitted: 'info',
  needs_correction: 'warning',
  approved: 'success',
}

const STATUS_LABELS = {
  not_started: 'Not started',
  draft: 'Draft',
  submitted: 'Submitted',
  needs_correction: 'Needs correction',
  approved: 'Approved',
}

export default function TeamDashboardPage() {
  const navigate = useNavigate()
  const [anchorDate, setAnchorDate] = useState(() => new Date())
  const [memberFilter, setMemberFilter] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const weekStart = getWeekStart(anchorDate)
  const weekEnd = getWeekEnd(weekStart)
  const weekParam = toISODateString(weekStart)

  const { data: summary } = useDashboardSummary(weekParam)
  const { data: trend = [] } = useDashboardTrend({ weeks: 8 })
  const { data: statusByMember = [] } = useStatusByMember(weekParam)
  const { data: workload = [] } = useWorkloadByProject(weekParam)
  const { data: hoursByType } = useHoursByType(weekParam)
  const { data: activity = [] } = useActivity(10)
  const { data: projects = [] } = useProjects({ isActive: true })

  function goToPreviousWeek() {
    const prev = new Date(weekStart)
    prev.setUTCDate(prev.getUTCDate() - 7)
    setAnchorDate(prev)
  }

  function goToNextWeek() {
    const next = new Date(weekStart)
    next.setUTCDate(next.getUTCDate() + 7)
    setAnchorDate(next)
  }

  function handleGenerateSummary() {
    navigate('/assistant', {
      state: { prompt: `Summarize the team's activity for the week of ${formatWeekRange(weekStart, weekEnd)}.` },
    })
  }

  const memberRows = statusByMember.flatMap((member) => {
    if (member.reports.length === 0) {
      return [{ key: member.userId, userId: member.userId, name: member.name, status: 'not_started', project: null, reportId: null }]
    }
    return member.reports.map((report) => ({
      key: report.reportId,
      userId: member.userId,
      name: member.name,
      status: report.status,
      project: report.project,
      reportId: report.reportId,
    }))
  })

  const filteredMembers = memberRows.filter((row) => {
    if (memberFilter && row.userId !== memberFilter) return false
    if (statusFilter && row.status !== statusFilter) return false
    if (projectFilter && row.project?._id !== projectFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-2xl text-slate-900">Team dashboard</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="px-3 py-1.5 flex items-center gap-1.5" onClick={handleGenerateSummary}>
            <Sparkles size={14} />
            Generate summary
          </Button>
          <WeekNavigator label={formatWeekRange(weekStart, weekEnd)} onPrevious={goToPreviousWeek} onNext={goToNextWeek} />
        </div>
      </div>

      <SummaryCards summary={summary} />

      <Card>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-sm font-semibold text-slate-700">Team members this week</h2>
          <div className="flex gap-2 flex-wrap">
            <select
              value={memberFilter}
              onChange={(event) => setMemberFilter(event.target.value)}
              className="rounded border border-slate-300 px-2 py-1 text-sm"
            >
              <option value="">All members</option>
              {statusByMember.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.name}
                </option>
              ))}
            </select>
            <select
              value={projectFilter}
              onChange={(event) => setProjectFilter(event.target.value)}
              className="rounded border border-slate-300 px-2 py-1 text-sm"
            >
              <option value="">All projects</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <SegmentedControl options={STATUS_FILTER_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
        </div>

        {filteredMembers.length === 0 && (
          <p className="text-sm text-slate-400">No team members match these filters.</p>
        )}

        {filteredMembers.length > 0 && (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <th className="py-2 px-3 font-semibold">Member</th>
                <th className="py-2 px-3 font-semibold">Project</th>
                <th className="py-2 px-3 font-semibold">Status</th>
                <th className="py-2 px-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((row) => (
                <tr key={row.key} className="border-t border-slate-200">
                  <td className="py-2 px-3 text-slate-800">{row.name}</td>
                  <td className="py-2 px-3 text-slate-500">{row.project?.name || '-'}</td>
                  <td className="py-2 px-3">
                    <StatusBadge tone={STATUS_TONES[row.status]}>{STATUS_LABELS[row.status]}</StatusBadge>
                  </td>
                  <td className="py-2 px-3 space-x-3 whitespace-nowrap">
                    <Link to={`/team/${row.userId}`} className="text-primary-600 hover:underline">
                      Profile
                    </Link>
                    {row.reportId && row.status !== 'draft' && (
                      <Link to={`/reports/${row.reportId}`} className="text-primary-600 hover:underline">
                        Open report
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <TrendChart data={trend} />
        <StatusByMemberChart members={memberRows} />
        <WorkloadByProjectChart data={workload} />
        <HoursByTypeChart hours={hoursByType} />
      </div>

      <ActivityFeed items={activity} />

      <SectionAcrossTeam week={weekParam} />
    </div>
  )
}
