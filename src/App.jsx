import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProjectProvider } from './contexts/ProjectContext'
import { AppLayout } from './components/layout/AppLayout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Tasks } from './pages/Tasks'
import { Risks } from './pages/Risks'
import { Milestones } from './pages/Milestones'
import { Suppliers } from './pages/Suppliers'
import { Meetings } from './pages/Meetings'
import { Documents } from './pages/Documents'
import { Escalations } from './pages/Escalations'
import { Reports } from './pages/Reports'
import { Settings } from './pages/Settings'
import { PageLoading } from './components/shared/Loading'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoading />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ProjectProvider>
              <AppLayout />
            </ProjectProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="risks" element={<Risks />} />
        <Route path="milestones" element={<Milestones />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="meetings" element={<Meetings />} />
        <Route path="documents" element={<Documents />} />
        <Route path="escalations" element={<Escalations />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
