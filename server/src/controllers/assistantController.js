import { Report } from '../models/Report.js';

export async function chat(req, res, next) {
  try {
    const query = ['manager', 'admin'].includes(req.user.role) ? {} : { user: req.user._id };
    const reports = await Report.find(query).populate('user', 'name').populate('project', 'name').sort({ weekStart: -1 }).limit(30);

    const submitted = reports.filter((report) => report.status === 'submitted');
    const blockers = submitted.filter((report) => report.blockers?.trim());
    const projects = [...new Set(submitted.map((report) => report.project?.name).filter(Boolean))];
    const names = [...new Set(submitted.map((report) => report.user?.name).filter(Boolean))];
    const pendingCount = reports.length - submitted.length;
    const currentWeek = submitted.slice(0, 7);
    const blockerCount = blockers.length;

    const latestFocus = submitted
      .slice(0, 4)
      .map((report) => `${report.user.name}: ${report.project?.name || 'General work'}`)
      .join('\n');

    const message = String(req.body.message || '').toLowerCase();
    const wantsBlockers = /(blocker|issue|risk|problem)/.test(message);
    const wantsSummary = /(summary|summarize|week|this week|today)/.test(message);
    const wantsFocus = /(focus|worked on|recent|activity)/.test(message);

    const answer = [
      wantsSummary || (!wantsBlockers && !wantsFocus)
        ? `Team summary\n${submitted.length} submitted report(s) from ${names.length || 0} contributor(s), covering ${projects.length || 0} project area(s).\n${pendingCount} report(s) are still pending.`
        : null,
      wantsBlockers || wantsSummary
        ? blockerCount
          ? `Open blockers (${blockerCount})\n${blockers.slice(0, 4).map((report) => `- ${report.user.name}: ${report.blockers}`).join('\n')}`
          : 'Open blockers\nNo open blockers were found in the latest submitted reports.'
        : null,
      wantsFocus || wantsSummary
        ? `Recent focus\n${latestFocus || 'No submitted activity yet.'}`
        : null,
      `Coverage hint\n${currentWeek.length} recent submitted report(s) are available for follow-up.`
    ].join('\n\n');

    res.json({ answer, mode: process.env.OPENAI_API_KEY ? 'llm-ready' : 'local-summary' });
  } catch (error) {
    next(error);
  }
}
