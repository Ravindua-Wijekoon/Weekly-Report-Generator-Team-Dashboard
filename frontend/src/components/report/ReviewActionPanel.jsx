import { useState } from 'react'

import { Button } from '../common/Button'
import { FormField } from '../common/FormField'

export function ReviewActionPanel({ onApprove, onRequestChanges, isSubmitting }) {
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  async function handleRequestChanges() {
    if (!comment.trim()) {
      setError('A comment is required to request changes')
      return
    }
    setError('')
    await onRequestChanges(comment)
    setComment('')
  }

  async function handleApprove() {
    await onApprove()
  }

  return (
    <section className="bg-white rounded-lg shadow p-6">
      <h2 className="text-sm font-semibold text-slate-700 mb-3">Review this report</h2>
      <FormField
        label="Comment (required to request changes)"
        id="review-comment"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        error={error}
      />
      <div className="flex gap-3 mt-3">
        <Button onClick={handleApprove} disabled={isSubmitting} className="px-4">
          Approve
        </Button>
        <button
          type="button"
          onClick={handleRequestChanges}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium rounded border border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-50"
        >
          Request changes
        </button>
      </div>
    </section>
  )
}
