import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardList, FileClock } from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import { useReports } from '../hooks/useReports'
import { useDashboardSummary } from '../hooks/useDashboard'
import { getWeekStart, getWeekEnd, toISODateString, formatWeekRange } from '../lib/week'
import { Card } from '../components/common/Card'
import { StatCard } from '../components/common/StatCard'
import { StatusBadge } from '../components/common/StatusBadge'
import { Button } from '../components/common/Button'

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

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function HomePage() {
  const { user } = useAuth()

  const weekStart = getWeekStart(new Date())
  const weekEnd = getWeekEnd(weekStart)
  const weekParam = toISODateString(weekStart)
  const isManager = user?.role === 'manager'

  const { data: thisWeekData } = useReports({ weekStart: weekParam, weekEnd: weekParam, mine: true })
  const { data: recentData } = useReports({ mine: true, limit: 50, sort: '-weekStart' })
  const { data: summary } = useDashboardSummary(weekParam, { enabled: isManager })

  const thisWeekReports = thisWeekData?.data || []
  const recentReports = recentData?.data || []

  const approvedCount = recentReports.filter((report) => report.status === 'approved').length
  const needsCorrectionCount = recentReports.filter((report) => report.status === 'needs_correction').length
  const totalReports = recentData?.meta?.total ?? recentReports.length
  const needsAttention = recentReports.find((report) => report.status === 'needs_correction')

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-400">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="font-serif text-3xl text-slate-900 mt-1">
          {getGreeting()}, {user?.name?.split(' ')[0]}
        </h1>
      </div>

      {needsAttention && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-3">
          <span className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-900">
              Your {needsAttention.weekLabel} report needs changes
            </p>
            {needsAttention.latestComment?.comment && (
              <p className="text-sm text-amber-800 mt-1">{needsAttention.latestComment.comment}</p>
            )}
          </div>
          <Link
            to={`/reports/me?week=${toISODateString(new Date(needsAttention.weekStart))}`}
            className="text-sm font-medium text-amber-900 hover:underline whitespace-nowrap"
          >
            Fix it
          </Link>
        </div>
      )}

      <Card className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-slate-500">This week ({formatWeekRange(weekStart, weekEnd)})</p>
          {thisWeekReports.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {thisWeekReports.map((report) => (
                <StatusBadge key={report._id} tone={STATUS_TONES[report.status]}>
                  {report.project?.name}: {STATUS_LABELS[report.status]}
                </StatusBadge>
              ))}
            </div>
          ) : (
            <p className="font-serif text-xl text-slate-900 mt-1">Not started yet</p>
          )}
        </div>
        <Link to="/reports/me">
          <Button className="px-5 flex items-center gap-2">
            {thisWeekReports.length > 0 ? 'Manage this week' : "Start this week's report"}
            <ArrowRight size={16} />
          </Button>
        </Link>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total reports" value={totalReports} icon={ClipboardList} tone="primary" />
        <StatCard label="Approved" value={approvedCount} icon={CheckCircle2} tone="success" />
        <StatCard label="Needs correction" value={needsCorrectionCount} icon={FileClock} tone="warning" />
      </div>

      {isManager && summary && (
        <Card className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-slate-500">Team this week</p>
            <p className="font-serif text-xl text-slate-900 mt-1">
              {summary.totalSubmitted} submitted, {summary.needsCorrectionCount} need correction
            </p>
          </div>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-primary-600 hover:underline flex items-center gap-1"
          >
            Go to team dashboard
            <ArrowRight size={14} />
          </Link>
        </Card>
      )}

      <Card padding="p-0">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Recent reports</h2>
        </div>
        {recentReports.length === 0 ? (
          <p className="text-sm text-slate-400 p-5">No reports yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentReports.slice(0, 5).map((report) => (
              <li key={report._id} className="flex items-center justify-between px-5 py-3 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">{report.weekLabel}</p>
                  <p className="text-xs text-slate-400 truncate">{report.project?.name}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge tone={STATUS_TONES[report.status]}>{STATUS_LABELS[report.status]}</StatusBadge>
                  <Link to={`/reports/${report._id}`} className="text-sm text-primary-600 hover:underline">
                    View
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
