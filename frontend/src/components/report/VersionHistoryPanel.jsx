import { useEffect } from 'react'

import { useReportVersions } from '../../hooks/useReports'
import { StatusBadge } from '../common/StatusBadge'
import { SlideOver } from '../common/SlideOver'

export function VersionHistoryPanel({ reportId, isOpen, onClose }) {
  const { data, isFetching, refetch } = useReportVersions(reportId)

  useEffect(() => {
    if (isOpen && !data) {
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  return (
    <SlideOver title="Version history" onClose={onClose}>
      {isFetching && <p className="text-sm text-slate-500">Loading...</p>}

      {!isFetching && data?.versions?.length === 0 && (
        <p className="text-sm text-slate-400">No past versions yet.</p>
      )}

      <div className="space-y-4">
        {!isFetching &&
          data?.versions
            ?.slice()
            .sort((a, b) => b.versionNumber - a.versionNumber)
            .map((version) => {
              const comments = data.reviewComments.filter(
                (comment) => comment.targetVersionNumber === version.versionNumber
              )
              return (
                <div key={version._id} className="border border-slate-200 rounded-xl p-4">
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
    </SlideOver>
  )
}
