function getWeekStart(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  if (day !== 1) {
    d.setUTCDate(d.getUTCDate() - (day - 1));
  }
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(weekStart) {
  const end = new Date(weekStart);
  end.setUTCDate(end.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}

function getISOWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo };
}

function getWeekLabel(date) {
  const { year, week } = getISOWeekNumber(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

function resolveWeek(dateInput) {
  const date = dateInput ? new Date(dateInput) : new Date();
  const weekStart = getWeekStart(date);
  const weekEnd = getWeekEnd(weekStart);
  const weekLabel = getWeekLabel(weekStart);
  return { weekStart, weekEnd, weekLabel };
}

module.exports = { resolveWeek, getWeekStart, getWeekEnd, getWeekLabel };
