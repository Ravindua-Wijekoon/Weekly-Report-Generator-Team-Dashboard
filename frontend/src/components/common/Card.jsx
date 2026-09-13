export function Card({ children, className = '', padding = 'p-5' }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/70 shadow-sm ${padding} ${className}`}>
      {children}
    </div>
  )
}
