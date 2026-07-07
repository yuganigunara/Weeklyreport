import { Report } from '../models/Report.js';

export async function chat(req, res, next) {
  try {
    const query = ['manager', 'admin'].includes(req.user.role) ? {} : { user: req.user._id };
    const reports = await Report.find(query).populate('user', 'name').populate('project', 'name').sort({ weekStart: -1 }).limit(30);

    const submitted = reports.filter((report) => report.status === 'submitted');
    const blockers = submitted.filter((report) => report.blockers?.trim());
    const projects = [...new Set(submitted.map((report) => report.project?.name).filter(Boolean))];
    const names = [...new Set(submitted.map((report) => report.user?.name).filter(Boolean))];

    const latestFocus = submitted
      .slice(0, 4)
      .map((report) => `${report.user.name}: ${report.project?.name || 'General work'}`)
      .join('\n');

    const answer = [
      `Team summary`,
      `${submitted.length} submitted report(s) from ${names.length || 0} contributor(s), covering ${projects.length || 0} project area(s).`,
      blockers.length
        ? `Open blockers (${blockers.length})\n${blockers.slice(0, 3).map((report) => `${report.user.name}: ${report.blockers}`).join('\n')}`
        : 'Open blockers\nNo open blockers were found in the latest submitted reports.',
      `Recent focus\n${latestFocus || 'No submitted activity yet.'}`
    ].join('\n\n');

    res.json({ answer, mode: process.env.OPENAI_API_KEY ? 'llm-ready' : 'local-summary' });
  } catch (error) {
    next(error);
  }
}
