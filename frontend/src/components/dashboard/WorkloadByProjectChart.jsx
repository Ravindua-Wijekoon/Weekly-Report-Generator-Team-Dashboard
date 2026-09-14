import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { Card } from '../common/Card'
import { CHART_COLORS, chartAxisTick, chartGridStroke, chartTooltipProps } from '../../lib/chartTheme'

export function WorkloadByProjectChart({ data }) {
  return (
    <Card>
      <h2 className="text-sm font-semibold text-slate-700 mb-3">Workload by project</h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
          <XAxis dataKey="projectName" tick={chartAxisTick} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={chartAxisTick} axisLine={false} tickLine={false} />
          <Tooltip {...chartTooltipProps} />
          <Bar dataKey="taskCount" name="Tasks" fill={CHART_COLORS.primary} radius={[8, 8, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
