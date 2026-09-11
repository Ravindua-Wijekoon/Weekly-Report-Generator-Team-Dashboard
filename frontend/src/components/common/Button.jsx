export function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`rounded bg-primary-600 text-white py-2 text-sm font-medium hover:bg-primary-700 disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
