import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useReports } from '../hooks/useReports'
import { StatusBadge } from '../components/common/StatusBadge'
import { Pagination } from '../components/common/Pagination'

const STATUS_TONES = {
  draft: 'neutral',
  submitted: 'info',
  needs_correction: 'warning',
  approved: 'success',
}

const STATUS_LABELS = {
  draft: 'Draft',
  submitted: 'Submitted',
  needs_correction: 'Needs correction',
  approved: 'Approved',
}

export default function ReportHistoryPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useReports({ page, limit: 10, sort: '-weekStart', mine: true })

  const reports = data?.data || []
  const meta = data?.meta

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800 mb-6">My report history</h1>

      <div className="bg-white rounded-lg shadow p-4">
        {isLoading && <p className="text-slate-500 text-sm">Loading...</p>}
        {error && <p className="text-sm text-danger">Failed to load reports.</p>}

        {!isLoading && !error && reports.length === 0 && (
          <p className="text-slate-500 text-sm">No reports yet.</p>
        )}

        {!isLoading && !error && reports.length > 0 && (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4 font-medium">Week</th>
                <th className="py-2 pr-4 font-medium">Project</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium" />
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report._id} className="border-t border-slate-200">
                  <td className="py-2 pr-4 text-slate-800">{report.weekLabel}</td>
                  <td className="py-2 pr-4 text-slate-500">{report.project?.name}</td>
                  <td className="py-2 pr-4">
                    <StatusBadge tone={STATUS_TONES[report.status]}>{STATUS_LABELS[report.status]}</StatusBadge>
                  </td>
                  <td className="py-2 pr-4">
                    <Link to={`/reports/${report._id}`} className="text-primary-600 hover:underline">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {meta && <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />}
      </div>
    </div>
  )
}
