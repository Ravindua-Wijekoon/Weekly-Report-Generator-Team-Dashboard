import { Button } from '../common/Button'

export function ListEditor({ items, onChange, withKeyFlag = false, groupName, addLabel = 'Add item' }) {
  function updateText(index, text) {
    const next = items.map((item, i) => (i === index ? { ...item, text } : item))
    onChange(next)
  }

  function setKey(index) {
    const next = items.map((item, i) => ({ ...item, isKey: i === index }))
    onChange(next)
  }

  function addItem() {
    onChange([...items, { text: '', isKey: false }])
  }

  function removeItem(index) {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={item._id || index} className="flex items-center gap-2">
          {withKeyFlag && (
            <input
              type="radio"
              name={groupName}
              checked={Boolean(item.isKey)}
              onChange={() => setKey(index)}
            />
          )}
          <input
            className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
            value={item.text}
            onChange={(event) => updateText(index, event.target.value)}
          />
          <button type="button" className="text-danger text-sm hover:underline" onClick={() => removeItem(index)}>
            Remove
          </button>
        </div>
      ))}
      <Button type="button" onClick={addItem} className="px-3 py-1">
        {addLabel}
      </Button>
    </div>
  )
}
