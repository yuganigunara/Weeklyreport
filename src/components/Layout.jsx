import { BarChart3, CalendarDays, FolderKanban, LogOut, Menu, NotebookTabs, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import AssistantWidget from './AssistantWidget.jsx';
import { useAuth } from '../state/AuthContext.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const isManager = ['manager', 'admin'].includes(user.role);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function closeMobileNav() {
    setMobileNavOpen(false);
  }

  return (
    <div className="shell">
      <main className="content">
        <Outlet />
      </main>
      <button
        type="button"
        className="mobile-nav-trigger"
        onClick={() => setMobileNavOpen((value) => !value)}
        aria-label="Toggle navigation"
        aria-expanded={mobileNavOpen}
      >
        {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
        <span>Menu</span>
      </button>
      <div className={`mobile-backdrop ${mobileNavOpen ? 'open' : ''}`} onClick={closeMobileNav} aria-hidden="true" />
      <aside className={`sidebar ${mobileNavOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand-row">
            <div className="brand-mark" aria-hidden="true">
              <CalendarDays size={15} />
            </div>
            <div className="brand-block">
              <div className="brand">WeeklyFlow</div>
              <span className="brand-subtitle">Weekly reports, simplified</span>
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
          {isManager && <NavLink to="/dashboard" onClick={closeMobileNav}><BarChart3 size={18} /> <span>Dashboard</span></NavLink>}
          <NavLink to="/reports" onClick={closeMobileNav}><NotebookTabs size={18} /> <span>My Reports</span></NavLink>
          {isManager && <NavLink to="/projects" onClick={closeMobileNav}><FolderKanban size={18} /> <span>Projects</span></NavLink>}
        </nav>
        <div className="sidebar-footer">
          <div className="session-pill">Secure session active</div>
          <button className="ghost-button logout-button" onClick={logout}><LogOut size={18} /> Logout</button>
        </div>
      </aside>
      <AssistantWidget />
    </div>
  );
}
