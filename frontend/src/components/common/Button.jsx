const VARIANTS = {
  dark: 'bg-slate-900 text-white hover:bg-slate-800',
  primary: 'bg-primary-600 text-white hover:bg-primary-700',
  outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'bg-danger text-white hover:bg-red-700',
}

export function Button({ children, className = '', variant = 'dark', ...props }) {
  return (
    <button
      className={`rounded-full py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
