import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api/client.js';
import MetricCard from '../components/MetricCard.jsx';

const COLORS = ['#38bdf8', '#2563eb', '#0ea5e9', '#60a5fa', '#93c5fd'];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({ weekStart: '', member: '', project: '', from: '', to: '' });

  const query = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => value && params.set(key, value));
    return params.toString();
  }, [filters]);

  async function load() {
    const [dashRes, userRes, projectRes] = await Promise.all([
      api.get(`/dashboard${query ? `?${query}` : ''}`),
      api.get('/users'),
      api.get('/projects')
    ]);
    setData(dashRes.data);
    setUsers(userRes.data.users);
    setProjects(projectRes.data.projects);
  }

  useEffect(() => {
    load();
  }, [query]);

  function update(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  const activeFilters = Object.entries(filters).filter(([, value]) => Boolean(value));

  if (!data) return <div className="page">Loading dashboard...</div>;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Team Dashboard</h1>
          <p>One screen for status, workload, and team pulse.</p>
        </div>
        <div className="header-chip-row">
          <div className="header-chip">
            <span>Members</span>
            <strong>{users.filter((user) => user.role === 'member').length}</strong>
          </div>
          <div className="header-chip">
            <span>Projects</span>
            <strong>{projects.length}</strong>
          </div>
        </div>
      </header>

      <section className="panel smart-filter-panel">
        <div className="panel-title">Quick filters</div>
        <div className="filters dashboard-filters">
        <label>Week<input type="date" value={filters.weekStart} onChange={(event) => update('weekStart', event.target.value)} /></label>
        <label>From<input type="date" value={filters.from} onChange={(event) => update('from', event.target.value)} /></label>
        <label>To<input type="date" value={filters.to} onChange={(event) => update('to', event.target.value)} /></label>
        <label>Member<select value={filters.member} onChange={(event) => update('member', event.target.value)}><option value="">All members</option>{users.filter((user) => user.role === 'member').map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>
        <label>Project<select value={filters.project} onChange={(event) => update('project', event.target.value)}><option value="">All projects</option>{projects.map((project) => <option key={project._id} value={project._id}>{project.name}</option>)}</select></label>
        </div>
        <div className="filter-summary">
          <span>{activeFilters.length ? `${activeFilters.length} filter${activeFilters.length > 1 ? 's' : ''} active` : 'No filters active'}</span>
          <div className="filter-summary-chips">
            {activeFilters.map(([key, value]) => (
              <span key={key} className="summary-chip">{key}: {value}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="metrics-grid">
        <MetricCard label="Submitted" value={data.metrics.submittedThisWeek} tone="blue" />
        <MetricCard label="Compliance" value={`${data.metrics.complianceRate}%`} tone="green" />
        <MetricCard label="Open blockers" value={data.metrics.openBlockers} tone="red" />
        <MetricCard label="Pending" value={data.metrics.pendingMembers} />
      </section>

      <section className="panel">
        <div className="panel-title">Current week snapshot</div>
        <div className="dashboard-summary">
          <div>
            <strong>{data.metrics.submittedThisWeek}</strong>
            <span>reports submitted</span>
          </div>
          <div>
            <strong>{data.metrics.pendingMembers}</strong>
            <span>members still pending</span>
          </div>
          <div>
            <strong>{data.metrics.openBlockers}</strong>
            <span>open blockers to review</span>
          </div>
        </div>
      </section>

      <section className="charts-grid">
        <div className="panel chart-panel">
          <div className="panel-title">Tasks completed trend</div>
          <ResponsiveContainer height={260}>
            <LineChart data={data.charts.tasksTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="tasks" stroke="#0ea5e9" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="panel chart-panel">
          <div className="panel-title">Workload by project</div>
          <ResponsiveContainer height={260}>
            <PieChart>
              <Pie data={data.charts.projectDistribution} dataKey="tasks" nameKey="projectName" outerRadius={95} label>
                {data.charts.projectDistribution.map((entry, index) => <Cell key={entry.projectName} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="charts-grid">
        <div className="panel">
          <div className="panel-title">Submission status</div>
          <ResponsiveContainer height={240}>
            <BarChart data={data.memberStatus.map((item) => ({ name: item.member.name, submitted: item.status === 'submitted' ? 1 : 0, pending: item.status === 'pending' ? 1 : 0, late: item.status === 'late' ? 1 : 0 }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="submitted" stackId="a" fill="#0ea5e9" />
              <Bar dataKey="pending" stackId="a" fill="#93c5fd" />
              <Bar dataKey="late" stackId="a" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="panel activity-list">
          <div className="panel-title">Recent reports</div>
          {!data.activity.length && <div className="empty-state">No recent submissions match the selected filters.</div>}
          {data.activity.map((report) => (
            <article key={report._id} className="activity-item">
              <strong>{report.user?.name}</strong>
              <span>{report.project?.name} - {report.status}</span>
              <p>{report.tasksCompleted}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
