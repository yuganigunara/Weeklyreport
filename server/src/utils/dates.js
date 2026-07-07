export function dateRangeQuery({ weekStart, from, to }) {
  if (weekStart) {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { weekStart: { $gte: start, $lte: end } };
  }

  const query = {};
  if (from || to) {
    query.weekStart = {};
    if (from) query.weekStart.$gte = new Date(from);
    if (to) query.weekStart.$lte = new Date(to);
  }
  return query;
}

export function isLate(report) {
  if (report.status !== 'submitted' || !report.submittedAt) return false;
  const due = new Date(report.weekEnd);
  due.setDate(due.getDate() + 1);
  due.setHours(17, 0, 0, 0);
  return report.submittedAt > due;
}
