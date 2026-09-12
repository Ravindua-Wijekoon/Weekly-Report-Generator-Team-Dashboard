export function getWeekStart(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  if (day !== 1) {
    d.setUTCDate(d.getUTCDate() - (day - 1))
  }
  d.setUTCHours(0, 0, 0, 0)
  return d
}

export function getWeekEnd(weekStart) {
  const end = new Date(weekStart)
  end.setUTCDate(end.getUTCDate() + 6)
  end.setUTCHours(23, 59, 59, 999)
  return end
}

export function toISODateString(date) {
  return date.toISOString().slice(0, 10)
}

export function formatWeekRange(weekStart, weekEnd) {
  const options = { month: 'short', day: 'numeric' }
  return `${weekStart.toLocaleDateString(undefined, options)} - ${weekEnd.toLocaleDateString(undefined, options)}`
}
