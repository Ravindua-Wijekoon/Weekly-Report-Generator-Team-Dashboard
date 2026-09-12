import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useReports } from '../hooks/useReports'
import { useUser } from '../hooks/useUsers'
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

export default function TeamMemberProfilePage() {
  const { userId } = useParams()
  const [page, setPage] = useState(1)
  const { data: member } = useUser(userId)
  const { data, isLoading } = useReports({ owner: userId, page, limit: 10, sort: '-weekStart' })

  const reports = data?.data || []
  const meta = data?.meta
  const memberName = member?.name || 'Team member'

  const approvedCount = reports.filter((report) => report.status === 'approved').length
  const needsCorrectionCount = reports.filter((report) => report.status === 'needs_correction').length

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800 mb-1">{memberName}</h1>
      <p className="text-sm text-slate-500 mb-6">{member?.email || 'Full report history'}</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-slate-500">Total reports</p>
          <p className="text-2xl font-semibold text-slate-800">{meta?.total ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-slate-500">Approved (this page)</p>
          <p className="text-2xl font-semibold text-slate-800">{approvedCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-slate-500">Needs correction (this page)</p>
          <p className="text-2xl font-semibold text-slate-800">{needsCorrectionCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        {isLoading && <p className="text-sm text-slate-500">Loading...</p>}
        {!isLoading && reports.length === 0 && <p className="text-sm text-slate-400">No reports yet.</p>}
        {!isLoading && reports.length > 0 && (
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
