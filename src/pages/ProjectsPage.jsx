import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../api/client.js';

const emptyProject = { name: '', description: '', assignedMembers: [] };

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProject);
  const [error, setError] = useState('');
  const [memberToAdd, setMemberToAdd] = useState('');

  async function load() {
    const [projectRes, userRes] = await Promise.all([api.get('/projects'), api.get('/users')]);
    setProjects(projectRes.data.projects);
    setUsers(userRes.data.users.filter((user) => user.role === 'member'));
  }

  useEffect(() => {
    load();
  }, []);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function addMember() {
    if (!memberToAdd || form.assignedMembers.includes(memberToAdd)) return;
    setForm((current) => ({
      ...current,
      assignedMembers: [...current.assignedMembers, memberToAdd]
    }));
    setMemberToAdd('');
  }

  function removeMember(id) {
    setForm((current) => ({
      ...current,
      assignedMembers: current.assignedMembers.filter((memberId) => memberId !== id)
    }));
  }

  async function save(event) {
    event.preventDefault();
    setError('');
    try {
      if (editing) await api.patch(`/projects/${editing}`, form);
      else await api.post('/projects', form);
      setEditing(null);
      setForm(emptyProject);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function edit(project) {
    setEditing(project._id);
    setForm({
      name: project.name,
      description: project.description || '',
      assignedMembers: (project.assignedMembers || []).map((member) => member._id)
    });
    setMemberToAdd('');
  }

  async function remove(id) {
    await api.delete(`/projects/${id}`);
    await load();
  }

  const assignedCount = form.assignedMembers.length;
  const projectAssignments = users.map((user) => {
    const projectCount = projects.filter((project) =>
      (project.assignedMembers || []).some((member) => member._id === user.id)
    ).length;

    return { ...user, projectCount };
  });

  const totalAssignments = projectAssignments.reduce((sum, user) => sum + user.projectCount, 0);
  const assignedEmployees = projectAssignments.filter((user) => user.projectCount > 0);
  const unassignedEmployees = projectAssignments.filter((user) => user.projectCount === 0);
  const coverageRate = users.length ? Math.round((assignedEmployees.length / users.length) * 100) : 0;
  const lowestAssigned = [...projectAssignments].sort((a, b) => a.projectCount - b.projectCount).slice(0, 5);
  const topProjects = [...projects]
    .map((project) => ({
      ...project,
      memberCount: project.assignedMembers?.length || 0
    }))
    .sort((a, b) => b.memberCount - a.memberCount);
  const availableMembers = users.filter((user) => !form.assignedMembers.includes(user.id));

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Projects & Categories</h1>
          <p>Manage reusable project tags and assign relevant team members with a simple, friendly workflow.</p>
        </div>
      </header>

      <section className="metrics-grid project-metrics">
        <article className="metric blue">
          <span>Coverage</span>
          <strong>{coverageRate}%</strong>
          <small>{assignedEmployees.length} of {users.length} members on at least one project</small>
        </article>
        <article className="metric">
          <span>Assignments</span>
          <strong>{totalAssignments}</strong>
          <small>Total member-to-project links</small>
        </article>
        <article className="metric green">
          <span>Unassigned</span>
          <strong>{unassignedEmployees.length}</strong>
          <small>Employees not on any project yet</small>
        </article>
        <article className="metric red">
          <span>Projects</span>
          <strong>{projects.length}</strong>
          <small>Active categories available</small>
        </article>
      </section>

      <section className="panel">
        <div className="panel-title"><Plus size={18} /> {editing ? 'Edit project' : 'Add project'}</div>
        <p className="form-hint">Projects help keep weekly reports consistent, searchable, and easy to compare on the manager dashboard.</p>
        <form onSubmit={save} className="project-form">
          <label>Name<input value={form.name} onChange={(event) => update('name', event.target.value)} required /></label>
          <label className="wide">Description<textarea value={form.description} onChange={(event) => update('description', event.target.value)} /></label>
          <div className="wide assignment-block">
            <div className="assignment-toolbar">
              <div className="assignment-summary">
                <strong>{assignedCount} member(s) assigned</strong>
                <span>{users.length - assignedCount} still unassigned to this project</span>
              </div>
              <div className="assignment-actions">
                <select
                  value={memberToAdd}
                  onChange={(event) => setMemberToAdd(event.target.value)}
                  className="assignment-select"
                >
                  <option value="">Add team member</option>
                  {availableMembers.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
                <button type="button" className="ghost-button" onClick={addMember} disabled={!memberToAdd}>
                  Add
                </button>
              </div>
            </div>
            <div className="assignment-table">
              <div className="assignment-table-head">
                <span>Member</span>
                <span>Status</span>
                <span></span>
              </div>
              {form.assignedMembers.length ? (
                form.assignedMembers.map((memberId) => {
                  const member = users.find((user) => user.id === memberId);
                  if (!member) return null;
                  return (
                    <div key={member.id} className="assignment-row">
                      <strong>{member.name}</strong>
                      <span className="assignment-pill">Assigned</span>
                      <button type="button" className="icon-button compact" onClick={() => removeMember(member.id)} title="Remove">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">No members assigned yet. Use the dropdown to add people to this project.</div>
              )}
            </div>
          </div>
          {error && <div className="error wide">{error}</div>}
          <div className="form-actions wide">
            <button className="primary-button">{editing ? 'Save project' : 'Add project'}</button>
            {editing && <button type="button" className="ghost-button" onClick={() => { setEditing(null); setForm(emptyProject); }}>Cancel</button>}
          </div>
        </form>
      </section>

      <section className="project-overview">
        <div className="panel">
          <div className="panel-title">Employees needing project assignment</div>
          {unassignedEmployees.length ? (
            <div className="chip-grid">
              {unassignedEmployees.map((user) => <span key={user.id} className="info-chip danger-chip">{user.name}</span>)}
            </div>
          ) : (
            <div className="empty-state">Every employee is assigned to at least one project.</div>
          )}
        </div>

        <div className="panel">
          <div className="panel-title">Lowest assigned employees</div>
          <div className="rank-list">
            {lowestAssigned.map((user, index) => (
              <div key={user.id} className="rank-row">
                <span className="rank-index">{index + 1}</span>
                <strong>{user.name}</strong>
                <span>{user.projectCount} project(s)</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">Team coverage table</div>
        <div className="coverage-table">
          <div className="coverage-head">
            <span>Employee</span>
            <span>Projects</span>
            <span>Status</span>
          </div>
          {projectAssignments.map((user) => (
            <div key={user.id} className="coverage-row">
              <strong>{user.name}</strong>
              <span>{user.projectCount}</span>
              <span className={`coverage-pill ${user.projectCount ? 'active' : 'empty'}`}>
                {user.projectCount ? 'Assigned' : 'Unassigned'}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="project-grid">
        {!projects.length && <div className="empty-state">No projects yet. Add your first category so team members can tag reports consistently.</div>}
        {projects.map((project) => (
          <article className="project-card" key={project._id}>
            <div>
              <h2>{project.name}</h2>
              <p>{project.description}</p>
              <span>{project.assignedMembers?.length || 0} assigned member(s)</span>
              <div className="assigned-list">
                {(project.assignedMembers || []).slice(0, 5).map((member) => (
                  <span key={member._id}>{member.name}</span>
                ))}
                {(project.assignedMembers?.length || 0) > 5 && <span>+{project.assignedMembers.length - 5} more</span>}
              </div>
              <div className="project-footnote">{topProjects[0]?._id === project._id ? 'Top used project' : `${project.assignedMembers?.length || 0} team links`}</div>
            </div>
            <div className="card-actions">
              <button className="icon-button" onClick={() => edit(project)} title="Edit"><Pencil size={16} /></button>
              <button className="icon-button danger" onClick={() => remove(project._id)} title="Delete"><Trash2 size={16} /></button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
