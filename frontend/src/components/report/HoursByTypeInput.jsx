const FIELDS = [
  { key: 'development', label: 'Development' },
  { key: 'testing', label: 'Testing' },
  { key: 'meetings', label: 'Meetings' },
  { key: 'documentation', label: 'Documentation' },
  { key: 'other', label: 'Other' },
]

export function HoursByTypeInput({ value, onChange }) {
  function updateField(field, amount) {
    onChange({ ...value, [field]: amount })
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {FIELDS.map(({ key, label }) => (
        <div key={key}>
          <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
          <input
            type="number"
            min="0"
            className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={value?.[key] ?? 0}
            onChange={(event) => updateField(key, Number(event.target.value))}
          />
        </div>
      ))}
    </div>
  )
}
