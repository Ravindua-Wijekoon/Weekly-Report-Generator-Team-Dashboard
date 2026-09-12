import { useState } from 'react'

import { useSection } from '../../hooks/useDashboard'
import { StatusBadge } from '../common/StatusBadge'

export function SectionAcrossTeam({ week }) {
  const [section, setSection] = useState('blockers')
  const { data = [], isLoading } = useSection(week, section)

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-700">Team view by section</h2>
        <select
          value={section}
          onChange={(event) => setSection(event.target.value)}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        >
          <option value="blockers">Blockers</option>
          <option value="achievements">Achievements</option>
        </select>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Loading...</p>}

      {!isLoading && data.length === 0 && <p className="text-sm text-slate-400">No reports for this week.</p>}

      <div className="grid sm:grid-cols-2 gap-3">
        {data.map((entry, index) => (
          <div key={index} className="border border-slate-200 rounded-lg p-3">
            <p className="text-sm font-medium text-slate-700">{entry.ownerName}</p>
            <p className="text-xs text-slate-400 mb-2">{entry.projectName}</p>
            {entry.items.length === 0 ? (
              <p className="text-xs text-slate-400">None reported.</p>
            ) : (
              <ul className="space-y-1">
                {entry.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-sm text-slate-600 flex items-center gap-2">
                    {item.isKey && <StatusBadge tone="warning">Key</StatusBadge>}
                    {item.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
