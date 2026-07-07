import { User } from '../models/User.js';
import { Report } from '../models/Report.js';
import { dateRangeQuery, isLate } from '../utils/dates.js';

function countTasks(text = '') {
  const bulletCount = text.split(/\n+/).filter((line) => line.trim()).length;
  return Math.max(1, bulletCount);
}

export async function getDashboard(req, res, next) {
  try {
    const { member, project, weekStart, from, to } = req.validated.query;
    const reportQuery = { ...dateRangeQuery({ weekStart, from, to }) };
    if (member) reportQuery.user = member;
    if (project) reportQuery.project = project;

    const [members, reports] = await Promise.all([
      User.find({ role: 'member', active: true }).select('name email').sort({ name: 1 }),
      Report.find(reportQuery).populate('user', 'name email').populate('project', 'name color').sort({ weekStart: -1 })
    ]);

    const submittedReports = reports.filter((report) => report.status === 'submitted');
    const selectedWeek = weekStart ? new Date(weekStart).toISOString().slice(0, 10) : null;

    const memberStatus = members.map((user) => {
      const report = reports.find((item) => String(item.user._id) === String(user._id) && (!selectedWeek || item.weekStart.toISOString().slice(0, 10) === selectedWeek));
      return {
        member: user,
        status: report ? (isLate(report) ? 'late' : report.status) : 'pending',
        reportId: report?._id
      };
    });

    const submittedMemberIds = new Set(submittedReports.map((report) => String(report.user._id)));
    const blockers = submittedReports.filter((report) => report.blockers?.trim()).length;
    const complianceRate = members.length ? Math.round((submittedMemberIds.size / members.length) * 100) : 0;

    const trendMap = new Map();
    const projectMap = new Map();
    for (const report of submittedReports) {
      const week = report.weekStart.toISOString().slice(0, 10);
      const taskCount = countTasks(report.tasksCompleted);
      trendMap.set(week, (trendMap.get(week) || 0) + taskCount);

      const projectName = report.project?.name || 'Unassigned';
      projectMap.set(projectName, (projectMap.get(projectName) || 0) + taskCount);
    }

    res.json({
      metrics: {
        submittedThisWeek: submittedReports.length,
        complianceRate,
        openBlockers: blockers,
        pendingMembers: memberStatus.filter((item) => item.status === 'pending').length
      },
      memberStatus,
      reports,
      charts: {
        tasksTrend: [...trendMap.entries()].map(([week, tasks]) => ({ week, tasks })).sort((a, b) => a.week.localeCompare(b.week)),
        projectDistribution: [...projectMap.entries()].map(([projectName, tasks]) => ({ projectName, tasks }))
      },
      activity: reports.slice(0, 8)
    });
  } catch (error) {
    next(error);
  }
}
