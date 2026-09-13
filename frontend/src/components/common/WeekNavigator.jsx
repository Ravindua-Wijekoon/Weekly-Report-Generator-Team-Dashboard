import { ChevronLeft, ChevronRight } from 'lucide-react'

export function WeekNavigator({ label, onPrevious, onNext }) {
  return (
    <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-full shadow-sm p-1.5">
      <button
        type="button"
        onClick={onPrevious}
        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        aria-label="Previous week"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="px-3 text-sm font-medium text-slate-700 whitespace-nowrap">{label}</span>
      <button
        type="button"
        onClick={onNext}
        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        aria-label="Next week"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
