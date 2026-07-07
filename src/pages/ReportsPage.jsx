import { format } from 'date-fns';
import { CheckCircle2, Pencil, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api, getErrorMessage } from '../api/client.js';

const emptyForm = {
  weekStart: '',
  weekEnd: '',
  project: '',
  tasksCompleted: '',
  tasksPlanned: '',
  blockers: '',
  hoursWorked: '',
  notes: ''
};

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const grouped = useMemo(() => {
    return reports.reduce((acc, report) => {
      const week = report.weekStart.slice(0, 10);
      acc[week] = acc[week] || [];
      acc[week].push(report);
      return acc;
    }, {});
  }, [reports]);

  async function load() {
    const [reportRes, projectRes] = await Promise.all([api.get('/reports'), api.get('/projects')]);
    setReports(reportRes.data.reports);
    setProjects(projectRes.data.projects);
  }

  useEffect(() => {
    load();
  }, []);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function edit(report) {
    setEditing(report._id);
    setForm({
      weekStart: report.weekStart.slice(0, 10),
      weekEnd: report.weekEnd.slice(0, 10),
      project: report.project?._id || report.project,
      tasksCompleted: report.tasksCompleted,
      tasksPlanned: report.tasksPlanned,
      blockers: report.blockers || '',
      hoursWorked: report.hoursWorked || '',
      notes: report.notes || ''
    });
  }

  async function save(event) {
    event.preventDefault();
    setError('');
    try {
      if (editing) await api.patch(`/reports/${editing}`, form);
      else await api.post('/reports', form);
      setEditing(null);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function submitReport(id) {
    await api.post(`/reports/${id}/submit`);
    await load();
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>My Weekly Reports</h1>
          <p>Create, edit, submit, and review your fixed-format weekly history.</p>
        </div>
      </header>

      <section className="panel">
        <div className="panel-title"><Plus size={18} /> {editing ? 'Edit report' : 'New report'}</div>
        <p className="form-hint">The report structure is fixed so every team member submits the same fields in the same order.</p>
        <form className="report-form" onSubmit={save}>
          <label>Week start<input type="date" value={form.weekStart} onChange={(event) => update('weekStart', event.target.value)} required /></label>
          <label>Week end<input type="date" value={form.weekEnd} onChange={(event) => update('weekEnd', event.target.value)} required /></label>
          <label>Project / category<select value={form.project} onChange={(event) => update('project', event.target.value)} required><option value="">Select project</option>{projects.map((project) => <option key={project._id} value={project._id}>{project.name}</option>)}</select></label>
          <label>Hours worked<input type="number" min="0" max="168" value={form.hoursWorked} onChange={(event) => update('hoursWorked', event.target.value)} /></label>
          <label className="wide">Tasks completed<textarea value={form.tasksCompleted} onChange={(event) => update('tasksCompleted', event.target.value)} required /></label>
          <label className="wide">Tasks planned next week<textarea value={form.tasksPlanned} onChange={(event) => update('tasksPlanned', event.target.value)} required /></label>
          <label className="wide">Blockers / challenges<textarea value={form.blockers} onChange={(event) => update('blockers', event.target.value)} /></label>
          <label className="wide">Notes or links<textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} /></label>
          {error && <div className="error wide">{error}</div>}
          <div className="form-actions wide">
            <button className="primary-button">{editing ? 'Save changes' : 'Create draft'}</button>
            {editing && <button type="button" className="ghost-button" onClick={() => { setEditing(null); setForm(emptyForm); }}>Cancel</button>}
          </div>
        </form>
      </section>

      <section className="history">
        {!reports.length && (
          <div className="empty-state">
            <strong>No reports yet</strong>
            Create your first weekly report above. Saved drafts will appear here by week, and submitted reports become read-only.
          </div>
        )}
        {Object.entries(grouped).map(([week, items]) => (
          <div className="week-group" key={week}>
            <h2>{format(new Date(week), 'MMM d, yyyy')}</h2>
            <div className="report-list">
              {items.map((report) => (
                <article className="report-card" key={report._id}>
                  <div className="report-card-top">
                    <span className={`status ${report.status}`}>{report.status}</span>
                    <strong>{report.project?.name}</strong>
                  </div>
                  <p>{report.tasksCompleted}</p>
                  <div className="card-actions">
                    <button className="icon-button" onClick={() => edit(report)} disabled={report.status === 'submitted'} title="Edit"><Pencil size={16} /></button>
                    {report.status !== 'submitted' && <button className="primary-button compact" onClick={() => submitReport(report._id)}><CheckCircle2 size={16} /> Submit</button>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
