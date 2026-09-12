import { useParams } from 'react-router-dom'

import { useReport, useReviewReport } from '../hooks/useReports'
import { useAuth } from '../context/AuthContext'
import { ReportContentView } from '../components/report/ReportContentView'
import { ReviewActionPanel } from '../components/report/ReviewActionPanel'
import { VersionHistoryPanel } from '../components/report/VersionHistoryPanel'

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

  async function handleApprove() {
    await reviewReport.mutateAsync({ id, payload: { action: 'approve' } })
  }

  async function handleRequestChanges(comment) {
    await reviewReport.mutateAsync({ id, payload: { action: 'request_changes', comment } })
  }

  return (
    <div className="space-y-6">
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
