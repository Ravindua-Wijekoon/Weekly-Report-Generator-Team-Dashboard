import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { Card } from '../common/Card'
import { CHART_COLORS, chartAxisTick, chartGridStroke, chartTooltipProps } from '../../lib/chartTheme'

export function TrendChart({ data }) {
  return (
    <Card>
      <h2 className="text-sm font-semibold text-slate-700 mb-3">Tasks completed trend</h2>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="tasksTrendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.35} />
              <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
          <XAxis dataKey="weekLabel" tick={chartAxisTick} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={chartAxisTick} axisLine={false} tickLine={false} />
          <Tooltip {...chartTooltipProps} />
          <Area
            type="monotone"
            dataKey="tasksCompleted"
            name="Tasks completed"
            stroke={CHART_COLORS.primary}
            strokeWidth={2.5}
            fill="url(#tasksTrendGradient)"
            activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
