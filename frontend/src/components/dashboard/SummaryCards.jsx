function Card({ label, value, sub }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-semibold text-slate-800 mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

export function SummaryCards({ summary }) {
  if (!summary) {
    return null
  }

  const { compliance, needsCorrectionCount, openBlockersCount, totalSubmitted } = summary
  const complianceRate = compliance.total > 0 ? Math.round((compliance.submitted / compliance.total) * 100) : 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Card label="Submitted this week" value={totalSubmitted} />
      <Card
        label="Compliance rate"
        value={`${complianceRate}%`}
        sub={`${compliance.submitted} submitted, ${compliance.pending} pending, ${compliance.late} late`}
      />
      <Card label="Needs correction" value={needsCorrectionCount} />
      <Card label="Open blockers" value={openBlockersCount} />
    </div>
  )
}
