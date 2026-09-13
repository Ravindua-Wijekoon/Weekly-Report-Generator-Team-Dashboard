import { Card } from './Card'

const TONE_TEXT = {
  slate: 'text-slate-400',
  primary: 'text-primary-600',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  danger: 'text-danger',
}

export function StatCard({ label, value, icon: Icon, subtitle, tone = 'slate' }) {
  return (
    <Card>
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
        {Icon && <Icon size={16} className={TONE_TEXT[tone]} />}
        {label}
      </div>
      <p className="font-serif text-3xl text-slate-900">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </Card>
  )
}
