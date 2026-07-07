import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import { useAuth } from './state/AuthContext.jsx';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="app-loading">Loading workspace...</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <AuthPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={user?.role === 'member' ? '/reports' : '/dashboard'} />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="dashboard" element={<ProtectedRoute roles={['manager', 'admin']}><DashboardPage /></ProtectedRoute>} />
        <Route path="projects" element={<ProtectedRoute roles={['manager', 'admin']}><ProjectsPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
