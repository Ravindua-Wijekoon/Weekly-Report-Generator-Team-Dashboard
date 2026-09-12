import { useState } from 'react'
import { Link } from 'react-router-dom'

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

  const filteredMembers = statusByMember.filter((member) => {
    if (memberFilter && member.userId !== memberFilter) return false
    if (statusFilter && member.status !== statusFilter) return false
    if (projectFilter && member.project?._id !== projectFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Team dashboard</h1>
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

      <SummaryCards summary={summary} />

      <div className="grid sm:grid-cols-2 gap-4">
        <TrendChart data={trend} />
        <StatusByMemberChart members={statusByMember} />
        <WorkloadByProjectChart data={workload} />
        <HoursByTypeChart hours={hoursByType} />
      </div>

      <ActivityFeed items={activity} />

      <SectionAcrossTeam week={weekParam} />

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-slate-700">Team members this week</h2>
          <div className="flex gap-2">
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
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded border border-slate-300 px-2 py-1 text-sm"
            >
              <option value="">All statuses</option>
              {Object.keys(STATUS_LABELS).map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredMembers.length === 0 && (
          <p className="text-sm text-slate-400">No team members match these filters.</p>
        )}

        {filteredMembers.length > 0 && (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4 font-medium">Member</th>
                <th className="py-2 pr-4 font-medium">Project</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.userId} className="border-t border-slate-200">
                  <td className="py-2 pr-4 text-slate-800">{member.name}</td>
                  <td className="py-2 pr-4 text-slate-500">{member.project?.name || '-'}</td>
                  <td className="py-2 pr-4">
                    <StatusBadge tone={STATUS_TONES[member.status]}>{STATUS_LABELS[member.status]}</StatusBadge>
                  </td>
                  <td className="py-2 pr-4 space-x-3 whitespace-nowrap">
                    <Link to={`/team/${member.userId}`} className="text-primary-600 hover:underline">
                      Profile
                    </Link>
                    {member.reportId && (
                      <Link to={`/reports/${member.reportId}`} className="text-primary-600 hover:underline">
                        Open report
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
