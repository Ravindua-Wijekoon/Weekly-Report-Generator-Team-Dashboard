import { AlertTriangle, CheckCircle2, ClipboardList, FileClock } from 'lucide-react'

import { StatCard } from '../common/StatCard'

export function SummaryCards({ summary }) {
  if (!summary) {
    return null
  }

  const { compliance, needsCorrectionCount, openBlockersCount, totalSubmitted } = summary
  const complianceRate = compliance.total > 0 ? Math.round((compliance.submitted / compliance.total) * 100) : 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <StatCard label="Submitted this week" value={totalSubmitted} icon={ClipboardList} tone="primary" />
      <StatCard
        label="Compliance rate"
        value={`${complianceRate}%`}
        subtitle={`${compliance.submitted} submitted, ${compliance.pending} pending, ${compliance.late} late`}
        icon={CheckCircle2}
        tone="success"
      />
      <StatCard label="Needs correction" value={needsCorrectionCount} icon={FileClock} tone="warning" />
      <StatCard label="Open blockers" value={openBlockersCount} icon={AlertTriangle} tone="danger" />
    </div>
  )
}
