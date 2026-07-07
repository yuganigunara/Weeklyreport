import { Report } from '../models/Report.js';
import { AppError } from '../utils/AppError.js';
import { dateRangeQuery } from '../utils/dates.js';

function canAccessReport(user, report) {
  return ['manager', 'admin'].includes(user.role) || String(report.user._id || report.user) === String(user._id);
}

export async function listReports(req, res, next) {
  try {
    const { member, project, weekStart, from, to } = req.validated?.query || {};
    const query = { ...dateRangeQuery({ weekStart, from, to }) };
    if (project) query.project = project;
    if (['manager', 'admin'].includes(req.user.role)) {
      if (member) query.user = member;
    } else {
      query.user = req.user._id;
    }

    const reports = await Report.find(query)
      .populate('user', 'name email role')
      .populate('project', 'name color')
      .sort({ weekStart: -1, createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    next(error);
  }
}

export async function createReport(req, res, next) {
  try {
    const report = await Report.create({
      ...req.validated.body,
      user: req.user._id,
      weekStart: new Date(req.validated.body.weekStart),
      weekEnd: new Date(req.validated.body.weekEnd)
    });
    await report.populate('project', 'name color');
    res.status(201).json({ report });
  } catch (error) {
    next(error);
  }
}

export async function updateReport(req, res, next) {
  try {
    const report = await Report.findById(req.validated.params.id);
    if (!report) throw new AppError('Report not found', 404);
    if (!canAccessReport(req.user, report)) throw new AppError('You cannot edit this report', 403);

    if (report.status === 'submitted' && req.user.role === 'member') {
      throw new AppError('Submitted reports can only be changed by managers or admins', 403);
    }

    Object.assign(report, req.validated.body);
    if (req.validated.body.weekStart) report.weekStart = new Date(req.validated.body.weekStart);
    if (req.validated.body.weekEnd) report.weekEnd = new Date(req.validated.body.weekEnd);
    await report.save();
    await report.populate([{ path: 'user', select: 'name email role' }, { path: 'project', select: 'name color' }]);
    res.json({ report });
  } catch (error) {
    next(error);
  }
}

export async function submitReport(req, res, next) {
  try {
    const report = await Report.findById(req.validated.params.id);
    if (!report) throw new AppError('Report not found', 404);
    if (!canAccessReport(req.user, report)) throw new AppError('You cannot submit this report', 403);

    report.status = 'submitted';
    report.submittedAt = new Date();
    await report.save();
    await report.populate([{ path: 'user', select: 'name email role' }, { path: 'project', select: 'name color' }]);
    res.json({ report });
  } catch (error) {
    next(error);
  }
}
