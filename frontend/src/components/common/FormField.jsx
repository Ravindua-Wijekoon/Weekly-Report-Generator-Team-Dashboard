export function FormField({ label, id, error, onFocus, ...inputProps }) {
  function handleFocus(event) {
    if (inputProps.type === 'number') {
      event.target.select()
    }
    onFocus?.(event)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        onFocus={handleFocus}
        className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        {...inputProps}
      />
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  )
}
