import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { Card } from '../common/Card'
import { chartAxisTick, chartGridStroke, chartTooltipProps } from '../../lib/chartTheme'

const STATUS_COLORS = {
  not_started: '#cbd5e1',
  draft: '#64748b',
  submitted: '#2563eb',
  needs_correction: '#d97706',
  approved: '#16a34a',
}

const STATUS_LABELS = {
  not_started: 'Not started',
  draft: 'Draft',
  submitted: 'Submitted',
  needs_correction: 'Needs correction',
  approved: 'Approved',
}

export function StatusByMemberChart({ members }) {
  const counts = Object.keys(STATUS_LABELS).map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: members.filter((member) => member.status === status).length,
  }))

  return (
    <Card>
      <h2 className="text-sm font-semibold text-slate-700 mb-3">Status by team member</h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={counts} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
          <XAxis
            dataKey="label"
            tick={chartAxisTick}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-15}
            textAnchor="end"
            height={50}
          />
          <YAxis allowDecimals={false} tick={chartAxisTick} axisLine={false} tickLine={false} />
          <Tooltip {...chartTooltipProps} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={48}>
            {counts.map((entry) => (
              <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
