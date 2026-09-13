const PALETTE = [
  'bg-primary-100 text-primary-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
]

function initials(name = '') {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return '?'
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
}

function colorFor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i)) % PALETTE.length
  }
  return PALETTE[hash]
}

export function Avatar({ name, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm'

  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold shrink-0 ${sizeClass} ${colorFor(name)}`}
    >
      {initials(name)}
    </div>
  )
}
