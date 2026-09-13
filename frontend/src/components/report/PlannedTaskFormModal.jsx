import { useState } from 'react'

import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { FormField } from '../common/FormField'

export function PlannedTaskFormModal({ initialItem, onSave, onClose }) {
  const [task, setTask] = useState(initialItem?.task || '')
  const [description, setDescription] = useState(initialItem?.description || '')
  const [error, setError] = useState('')

  function handleSave() {
    if (!task.trim()) {
      setError('Task is required')
      return
    }
    onSave({ task, description })
  }

  return (
    <Modal
      title={initialItem ? 'Edit planned task' : 'Add planned task'}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="px-4">
            Cancel
          </Button>
          <Button onClick={handleSave} className="px-4">
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <FormField label="Task" id="planned-task" value={task} onChange={(event) => setTask(event.target.value)} error={error} />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="planned-description">
            Description
          </label>
          <textarea
            id="planned-description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
    </Modal>
  )
}
