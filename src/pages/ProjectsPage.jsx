import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../api/client.js';

const emptyProject = { name: '', description: '', color: '#2563eb', assignedMembers: [] };

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProject);
  const [error, setError] = useState('');

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

  function toggleMember(id) {
    setForm((current) => ({
      ...current,
      assignedMembers: current.assignedMembers.includes(id)
        ? current.assignedMembers.filter((memberId) => memberId !== id)
        : [...current.assignedMembers, id]
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
      color: project.color || '#2563eb',
      assignedMembers: (project.assignedMembers || []).map((member) => member._id)
    });
  }

  async function remove(id) {
    await api.delete(`/projects/${id}`);
    await load();
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Projects & Categories</h1>
          <p>Manage reusable project tags and assign relevant team members.</p>
        </div>
      </header>

      <section className="panel">
        <div className="panel-title"><Plus size={18} /> {editing ? 'Edit project' : 'Add project'}</div>
        <form onSubmit={save} className="project-form">
          <label>Name<input value={form.name} onChange={(event) => update('name', event.target.value)} required /></label>
          <label>Color<input type="color" value={form.color} onChange={(event) => update('color', event.target.value)} /></label>
          <label className="wide">Description<textarea value={form.description} onChange={(event) => update('description', event.target.value)} /></label>
          <div className="wide member-picker">
            {users.map((user) => (
              <label key={user.id} className="check-row">
                <input type="checkbox" checked={form.assignedMembers.includes(user.id)} onChange={() => toggleMember(user.id)} />
                {user.name}
              </label>
            ))}
          </div>
          {error && <div className="error wide">{error}</div>}
          <div className="form-actions wide">
            <button className="primary-button">{editing ? 'Save project' : 'Add project'}</button>
            {editing && <button type="button" className="ghost-button" onClick={() => { setEditing(null); setForm(emptyProject); }}>Cancel</button>}
          </div>
        </form>
      </section>

      <section className="project-grid">
        {projects.map((project) => (
          <article className="project-card" key={project._id}>
            <div className="project-color" style={{ background: project.color }} />
            <div>
              <h2>{project.name}</h2>
              <p>{project.description}</p>
              <span>{project.assignedMembers?.length || 0} member(s)</span>
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
