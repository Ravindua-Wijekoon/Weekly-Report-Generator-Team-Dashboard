import { Button } from '../common/Button'

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

export function TaskTable({ tasks, onChange }) {
  function updateTask(index, field, value) {
    const next = tasks.map((task, i) => (i === index ? { ...task, [field]: value } : task))
    onChange(next)
  }

  function addTask() {
    onChange([...tasks, emptyTask()])
  }

  function removeTask(index) {
    onChange(tasks.filter((_, i) => i !== index))
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left min-w-[900px]">
        <thead>
          <tr className="text-slate-500 border-b border-slate-200">
            <th className="py-2 pr-2 font-medium">Task</th>
            <th className="py-2 pr-2 font-medium">Priority</th>
            <th className="py-2 pr-2 font-medium">Planned %</th>
            <th className="py-2 pr-2 font-medium">Actual %</th>
            <th className="py-2 pr-2 font-medium">Status</th>
            <th className="py-2 pr-2 font-medium">Hrs planned</th>
            <th className="py-2 pr-2 font-medium">Hrs spent</th>
            <th className="py-2 pr-2 font-medium">Output</th>
            <th className="py-2 pr-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => (
            <tr key={task._id || index} className="border-t border-slate-200">
              <td className="py-2 pr-2">
                <input
                  className="w-full rounded border border-slate-300 px-2 py-1"
                  value={task.name}
                  onChange={(event) => updateTask(index, 'name', event.target.value)}
                />
              </td>
              <td className="py-2 pr-2">
                <select
                  className="rounded border border-slate-300 px-2 py-1"
                  value={task.priority}
                  onChange={(event) => updateTask(index, 'priority', event.target.value)}
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-2 pr-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-16 rounded border border-slate-300 px-2 py-1"
                  value={task.plannedPercent}
                  onChange={(event) => updateTask(index, 'plannedPercent', Number(event.target.value))}
                />
              </td>
              <td className="py-2 pr-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-16 rounded border border-slate-300 px-2 py-1"
                  value={task.actualPercent}
                  onChange={(event) => updateTask(index, 'actualPercent', Number(event.target.value))}
                />
              </td>
              <td className="py-2 pr-2">
                <select
                  className="rounded border border-slate-300 px-2 py-1"
                  value={task.status}
                  onChange={(event) => updateTask(index, 'status', event.target.value)}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-2 pr-2">
                <input
                  type="number"
                  min="0"
                  className="w-16 rounded border border-slate-300 px-2 py-1"
                  value={task.timePlannedHours}
                  onChange={(event) => updateTask(index, 'timePlannedHours', Number(event.target.value))}
                />
              </td>
              <td className="py-2 pr-2">
                <input
                  type="number"
                  min="0"
                  className="w-16 rounded border border-slate-300 px-2 py-1"
                  value={task.timeSpentHours}
                  onChange={(event) => updateTask(index, 'timeSpentHours', Number(event.target.value))}
                />
              </td>
              <td className="py-2 pr-2">
                <input
                  className="w-full rounded border border-slate-300 px-2 py-1"
                  value={task.output || ''}
                  onChange={(event) => updateTask(index, 'output', event.target.value)}
                />
              </td>
              <td className="py-2 pr-2">
                <button
                  type="button"
                  className="text-danger text-sm hover:underline"
                  onClick={() => removeTask(index)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button type="button" onClick={addTask} className="mt-3 px-3 py-1">
        Add task
      </Button>
    </div>
  )
}
