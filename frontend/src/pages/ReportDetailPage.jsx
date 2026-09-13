import { Link, useParams } from 'react-router-dom'

import { useReport, useReviewReport } from '../hooks/useReports'
import { useAuth } from '../context/AuthContext'
import { toISODateString } from '../lib/week'
import { ReportContentView } from '../components/report/ReportContentView'
import { ReviewActionPanel } from '../components/report/ReviewActionPanel'
import { VersionHistoryPanel } from '../components/report/VersionHistoryPanel'

const EDITABLE_STATUSES = ['draft', 'needs_correction']

export default function ReportDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data: report, isLoading, error } = useReport(id)
  const reviewReport = useReviewReport()

  if (isLoading) {
    return <p className="text-slate-500 text-sm">Loading...</p>
  }

  if (error || !report) {
    return <p className="text-sm text-danger">You do not have access to this report.</p>
  }

  const canReview = user?.role === 'manager' && report.status === 'submitted'
  const isOwner = report.owner?._id === user?.id
  const canEdit = isOwner && EDITABLE_STATUSES.includes(report.status)

  async function handleApprove() {
    await reviewReport.mutateAsync({ id, payload: { action: 'approve' } })
  }

  async function handleRequestChanges(comment) {
    await reviewReport.mutateAsync({ id, payload: { action: 'request_changes', comment } })
  }

  return (
    <div className="space-y-6">
      {canEdit && (
        <div className="rounded-2xl border border-primary-100 bg-primary-50 p-4 flex items-center justify-between gap-3">
          <p className="text-sm text-primary-800">
            {report.status === 'needs_correction'
              ? 'This report needs changes before it can be resubmitted.'
              : 'This report is still a draft.'}
          </p>
          <Link
            to={`/reports/me?week=${toISODateString(new Date(report.weekStart))}`}
            className="text-sm font-medium text-primary-700 hover:underline whitespace-nowrap"
          >
            Edit report
          </Link>
        </div>
      )}
      <ReportContentView report={report} />
      {canReview && (
        <ReviewActionPanel
          onApprove={handleApprove}
          onRequestChanges={handleRequestChanges}
          isSubmitting={reviewReport.isPending}
        />
      )}
      <VersionHistoryPanel reportId={id} />
    </div>
  )
}
