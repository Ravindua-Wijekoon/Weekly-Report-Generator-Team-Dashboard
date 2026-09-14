import { StatusBadge } from '../common/StatusBadge'
import { Card } from '../common/Card'

export function ActivityFeed({ items }) {
  return (
    <Card>
      <h2 className="text-sm font-semibold text-slate-700 mb-3">Recent activity</h2>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">No review activity yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={index} className="text-sm border-b border-slate-100 pb-2 last:border-0">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-700">
                  <strong>{item.reviewerName}</strong>{' '}
                  {item.action === 'approved' ? 'approved' : 'requested changes on'}{' '}
                  <strong>{item.ownerName}</strong>&apos;s {item.weekLabel} report
                </span>
                <StatusBadge tone={item.action === 'approved' ? 'success' : 'warning'}>
                  {item.action === 'approved' ? 'Approved' : 'Changes requested'}
                </StatusBadge>
              </div>
              {item.comment && <p className="text-xs text-slate-500 mt-1">{item.comment}</p>}
              <p className="text-xs text-slate-400 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
