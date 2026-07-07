import { ClipboardCheck } from 'lucide-react';
import { useState } from 'react';
import { getErrorMessage } from '../api/client.js';
import { useAuth } from '../state/AuthContext.jsx';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-mark"><ClipboardCheck size={28} /></div>
        <h1>WeeklyFlow</h1>
        <p>Structured weekly reports for teams that need clean visibility, quick submission, and manager-friendly review.</p>
        <div className="segmented">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
        </div>
        <form onSubmit={submit} className="stack-form">
          {mode === 'register' && (
            <>
              <label>Name<input value={form.name} onChange={(event) => update('name', event.target.value)} required /></label>
              <label>Role<select value={form.role} onChange={(event) => update('role', event.target.value)}><option value="member">Team Member</option><option value="manager">Manager</option></select></label>
            </>
          )}
          <label>Email<input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required /></label>
          <label>Password<input type="password" value={form.password} onChange={(event) => update('password', event.target.value)} required /></label>
          <div className="form-hint">Use the manager account to access the dashboard and project controls.</div>
          {error && <div className="error">{error}</div>}
          <button className="primary-button">{mode === 'login' ? 'Login' : 'Create account'}</button>
        </form>
      </section>
    </main>
  );
}
