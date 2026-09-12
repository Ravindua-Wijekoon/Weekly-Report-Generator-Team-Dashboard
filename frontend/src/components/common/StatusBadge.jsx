const TONES = {
  neutral: 'bg-slate-100 text-slate-600',
  success: 'bg-green-100 text-green-700',
  info: 'bg-primary-100 text-primary-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
}

export function StatusBadge({ tone = 'neutral', children }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TONES[tone]}`}>
      {children}
    </span>
  )
}
