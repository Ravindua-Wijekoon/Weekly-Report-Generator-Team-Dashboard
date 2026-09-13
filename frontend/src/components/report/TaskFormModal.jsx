import { useState } from 'react'

import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { FormField } from '../common/FormField'

const PRIORITIES = ['low', 'medium', 'high']
const STATUSES = ['not_started', 'in_progress', 'completed', 'blocked']

function emptyTask() {
  return {
    name: '',
    priority: 'medium',
    plannedPercent: 0,
    actualPercent: 0,
    status: 'not_started',
    timePlannedHours: 0,
    timeSpentHours: 0,
    output: '',
  }
}

export function TaskFormModal({ initialTask, onSave, onClose }) {
  const [task, setTask] = useState(initialTask || emptyTask())
  const [error, setError] = useState('')

  function update(field, value) {
    setTask((prev) => ({ ...prev, [field]: value }))
  }

  function handleSave() {
    if (!task.name.trim()) {
      setError('Task name is required')
      return
    }
    onSave(task)
  }

  return (
    <Modal
      title={initialTask ? 'Edit task' : 'Add task'}
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
        <FormField
          label="Task name"
          id="task-name"
          value={task.name}
          onChange={(event) => update('name', event.target.value)}
          error={error}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="task-priority">
              Priority
            </label>
            <select
              id="task-priority"
              value={task.priority}
              onChange={(event) => update('priority', event.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="task-status">
              Status
            </label>
            <select
              id="task-status"
              value={task.status}
              onChange={(event) => update('status', event.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Planned %"
            id="task-planned"
            type="number"
            min="0"
            max="100"
            value={task.plannedPercent}
            onChange={(event) => update('plannedPercent', Number(event.target.value))}
          />
          <FormField
            label="Actual %"
            id="task-actual"
            type="number"
            min="0"
            max="100"
            value={task.actualPercent}
            onChange={(event) => update('actualPercent', Number(event.target.value))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Hours planned"
            id="task-hours-planned"
            type="number"
            min="0"
            value={task.timePlannedHours}
            onChange={(event) => update('timePlannedHours', Number(event.target.value))}
          />
          <FormField
            label="Hours spent"
            id="task-hours-spent"
            type="number"
            min="0"
            value={task.timeSpentHours}
            onChange={(event) => update('timeSpentHours', Number(event.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="task-output">
            Output / deliverable
          </label>
          <textarea
            id="task-output"
            rows={3}
            value={task.output}
            onChange={(event) => update('output', event.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
    </Modal>
  )
}
