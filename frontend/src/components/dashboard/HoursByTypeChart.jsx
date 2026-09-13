import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#7c3aed', '#16a34a', '#d97706', '#0ea5e9', '#64748b']

const LABELS = {
  development: 'Development',
  testing: 'Testing',
  meetings: 'Meetings',
  documentation: 'Documentation',
  other: 'Other',
}

export function HoursByTypeChart({ hours }) {
  const data = Object.keys(LABELS)
    .map((key) => ({ name: LABELS[key], value: hours?.[key] || 0 }))
    .filter((entry) => entry.value > 0)

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-sm font-semibold text-slate-700 mb-3">Time spent by task type</h2>
      {data.length === 0 ? (
        <p className="text-sm text-slate-400">No hours logged yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
