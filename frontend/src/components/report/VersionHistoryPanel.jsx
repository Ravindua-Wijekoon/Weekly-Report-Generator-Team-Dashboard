import { useState } from 'react'

import { useReportVersions } from '../../hooks/useReports'
import { StatusBadge } from '../common/StatusBadge'
import { Button } from '../common/Button'

export function VersionHistoryPanel({ reportId }) {
  const [isOpen, setIsOpen] = useState(false)
  const { data, isFetching, refetch } = useReportVersions(reportId)

  async function handleToggle() {
    if (!isOpen && !data) {
      await refetch()
    }
    setIsOpen((prev) => !prev)
  }

  return (
    <section className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Version history</h2>
        <Button className="px-3 py-1" onClick={handleToggle}>
          {isOpen ? 'Hide' : 'View'} history
        </Button>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4">
          {isFetching && <p className="text-sm text-slate-500">Loading...</p>}

          {!isFetching && data?.versions?.length === 0 && (
            <p className="text-sm text-slate-400">No past versions yet.</p>
          )}

          {!isFetching &&
            data?.versions
              ?.slice()
              .sort((a, b) => b.versionNumber - a.versionNumber)
              .map((version) => {
                const comments = data.reviewComments.filter(
                  (comment) => comment.targetVersionNumber === version.versionNumber
                )
                return (
                  <div key={version._id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-700">Version {version.versionNumber}</p>
                      <p className="text-xs text-slate-400">{new Date(version.savedAt).toLocaleString()}</p>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">
                      {version.content.tasksCompleted.length} task(s) completed,{' '}
                      {version.content.blockers.length} blocker(s)
                    </p>
                    {comments.map((comment) => (
                      <div key={comment._id} className="mt-2 text-sm">
                        <StatusBadge tone={comment.action === 'approved' ? 'success' : 'warning'}>
                          {comment.action === 'approved' ? 'Approved' : 'Changes requested'}
                        </StatusBadge>
                        {comment.comment && <p className="mt-1 text-slate-600">{comment.comment}</p>}
                      </div>
                    ))}
                  </div>
                )
              })}
        </div>
      )}
    </section>
  )
}
