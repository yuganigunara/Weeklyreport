import { BarChart3, CalendarCheck2, FolderKanban, LogOut, NotebookTabs, ShieldCheck } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import AssistantWidget from './AssistantWidget.jsx';
import { useAuth } from '../state/AuthContext.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const isManager = ['manager', 'admin'].includes(user.role);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand-row">
            <div className="brand-icon"><CalendarCheck2 size={22} /></div>
            <div>
              <div className="brand">WeeklyFlow</div>
              <span className="brand-subtitle">Team reporting hub</span>
            </div>
          </div>
          <div className="identity">
            <div className="avatar">{user.name.slice(0, 1).toUpperCase()}</div>
            <div>
              <strong>{user.name}</strong>
              <span><ShieldCheck size={13} /> {user.role}</span>
            </div>
          </div>
        </div>
        <nav className="nav" aria-label="Main navigation">
          <span className="nav-section">Workspace</span>
          {isManager && <NavLink to="/dashboard"><BarChart3 size={18} /> <span>Dashboard</span></NavLink>}
          <NavLink to="/reports"><NotebookTabs size={18} /> <span>My Reports</span></NavLink>
          {isManager && <NavLink to="/projects"><FolderKanban size={18} /> <span>Projects</span></NavLink>}
        </nav>
        <div className="sidebar-footer">
          <div className="session-pill">Secure session active</div>
          <button className="ghost-button logout-button" onClick={logout}><LogOut size={18} /> Logout</button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
      <AssistantWidget />
    </div>
  );
}
