import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import { PlannedTaskFormModal } from './PlannedTaskFormModal'
import { Button } from '../common/Button'
import { ConfirmDialog } from '../common/ConfirmDialog'

export function PlannedTaskList({ items, onChange }) {
  const [modalState, setModalState] = useState(null)
  const [deleteIndex, setDeleteIndex] = useState(null)

  function handleAdd() {
    setModalState({ index: null })
  }

  function handleEdit(index) {
    setModalState({ index })
  }

  function confirmRemove() {
    onChange(items.filter((_, i) => i !== deleteIndex))
    setDeleteIndex(null)
  }

  function handleSave(item) {
    if (modalState.index === null) {
      onChange([...items, item])
    } else {
      onChange(items.map((existing, i) => (i === modalState.index ? item : existing)))
    }
    setModalState(null)
  }

  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-sm text-slate-400">Nothing planned yet.</p>}

      {items.map((item, index) => (
        <div
          key={item._id || index}
          className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800">{item.task}</p>
            {item.description && <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleEdit(index)}
              className="text-slate-400 hover:text-primary-600"
              aria-label="Edit planned task"
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              onClick={() => setDeleteIndex(index)}
              className="text-slate-400 hover:text-danger"
              aria-label="Remove planned task"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={handleAdd} className="px-3 py-1.5 flex items-center gap-1.5">
        <Plus size={16} />
        Add task
      </Button>

      {modalState && (
        <PlannedTaskFormModal
          initialItem={modalState.index !== null ? items[modalState.index] : null}
          onSave={handleSave}
          onClose={() => setModalState(null)}
        />
      )}

      {deleteIndex !== null && (
        <ConfirmDialog
          title="Remove planned task"
          message="Are you sure you want to remove this planned task? This cannot be undone."
          onConfirm={confirmRemove}
          onCancel={() => setDeleteIndex(null)}
        />
      )}
    </div>
  )
}
