import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Inbox } from 'lucide-react'

import { useReports } from '../hooks/useReports'
import { Card } from '../components/common/Card'
import { Pagination } from '../components/common/Pagination'

export default function ReviewQueuePage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useReports({ status: 'submitted', sort: 'submittedAt', page, limit: 10 })

  const reports = data?.data || []
  const meta = data?.meta

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
          <Inbox size={18} />
        </span>
        <div>
          <h1 className="font-serif text-2xl text-slate-900">Review queue</h1>
          <p className="text-sm text-slate-500">Reports waiting for your review, oldest first.</p>
        </div>
      </div>

      <Card padding="p-0">
        {isLoading && <p className="text-sm text-slate-500 p-5">Loading...</p>}
        {error && <p className="text-sm text-danger p-5">Failed to load reports.</p>}

        {!isLoading && !error && reports.length === 0 && (
          <p className="text-sm text-slate-400 p-5">Nothing waiting for review. You&apos;re all caught up.</p>
        )}

        {!isLoading && !error && reports.length > 0 && (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <th className="py-2 px-4 font-semibold">Member</th>
                <th className="py-2 px-4 font-semibold">Project</th>
                <th className="py-2 px-4 font-semibold">Week</th>
                <th className="py-2 px-4 font-semibold">Submitted</th>
                <th className="py-2 px-4 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report._id} className="border-t border-slate-200">
                  <td className="py-2 px-4 text-slate-800">{report.owner?.name}</td>
                  <td className="py-2 px-4 text-slate-500">{report.project?.name}</td>
                  <td className="py-2 px-4 text-slate-500">{report.weekLabel}</td>
                  <td className="py-2 px-4 text-slate-500">
                    {report.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-2 px-4">
                    <Link to={`/reports/${report._id}`} className="text-primary-600 hover:underline">
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {meta && (
          <div className="px-4 pb-4">
            <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>
    </div>
  )
}
