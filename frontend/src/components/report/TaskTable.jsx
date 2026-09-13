import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import { TaskFormModal } from './TaskFormModal'
import { Button } from '../common/Button'
import { ConfirmDialog } from '../common/ConfirmDialog'

export function TaskTable({ tasks, onChange }) {
  const [modalState, setModalState] = useState(null)
  const [deleteIndex, setDeleteIndex] = useState(null)

  function handleAdd() {
    setModalState({ index: null })
  }

  function handleEdit(index) {
    setModalState({ index })
  }

  function confirmRemove() {
    onChange(tasks.filter((_, i) => i !== deleteIndex))
    setDeleteIndex(null)
  }

  function handleSave(task) {
    if (modalState.index === null) {
      onChange([...tasks, task])
    } else {
      onChange(tasks.map((existing, i) => (i === modalState.index ? task : existing)))
    }
    setModalState(null)
  }

  return (
    <div>
      {tasks.length === 0 ? (
        <p className="text-sm text-slate-400 mb-3">No tasks yet.</p>
      ) : (
        <div className="overflow-x-auto mb-3 rounded-xl border border-slate-200">
          <table className="w-full text-sm text-left table-fixed min-w-[820px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <th className="py-2 px-3 font-semibold w-[16%]">Task</th>
                <th className="py-2 px-3 font-semibold w-[8%]">Priority</th>
                <th className="py-2 px-3 font-semibold w-[8%]">Planned %</th>
                <th className="py-2 px-3 font-semibold w-[8%]">Actual %</th>
                <th className="py-2 px-3 font-semibold w-[10%]">Status</th>
                <th className="py-2 px-3 font-semibold w-[8%]">Hrs planned</th>
                <th className="py-2 px-3 font-semibold w-[8%]">Hrs spent</th>
                <th className="py-2 px-3 font-semibold w-[24%]">Output</th>
                <th className="py-2 px-3 font-semibold w-[10%]" />
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr key={task._id || index} className="border-t border-slate-200 align-top">
                  <td className="py-2 px-3 text-slate-800">{task.name}</td>
                  <td className="py-2 px-3 text-slate-500">{task.priority}</td>
                  <td className="py-2 px-3 text-slate-500">{task.plannedPercent}%</td>
                  <td className="py-2 px-3 text-slate-500">{task.actualPercent}%</td>
                  <td className="py-2 px-3 text-slate-500">{task.status.replace('_', ' ')}</td>
                  <td className="py-2 px-3 text-slate-500">{task.timePlannedHours}</td>
                  <td className="py-2 px-3 text-slate-500">{task.timeSpentHours}</td>
                  <td className="py-2 px-3 text-slate-500 whitespace-pre-wrap">{task.output || '-'}</td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(index)}
                        className="text-slate-400 hover:text-primary-600"
                        aria-label="Edit task"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteIndex(index)}
                        className="text-slate-400 hover:text-danger"
                        aria-label="Remove task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Button type="button" variant="outline" onClick={handleAdd} className="px-3 py-1.5 flex items-center gap-1.5">
        <Plus size={16} />
        Add task
      </Button>

      {modalState && (
        <TaskFormModal
          initialTask={modalState.index !== null ? tasks[modalState.index] : null}
          onSave={handleSave}
          onClose={() => setModalState(null)}
        />
      )}

      {deleteIndex !== null && (
        <ConfirmDialog
          title="Remove task"
          message="Are you sure you want to remove this task? This cannot be undone."
          onConfirm={confirmRemove}
          onCancel={() => setDeleteIndex(null)}
        />
      )}
    </div>
  )
}
