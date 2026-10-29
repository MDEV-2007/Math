import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Navigation from './components/Navigation'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import FunctionPlotterPage from './pages/FunctionPlotterPage'
import GeometryToolsPage from './pages/GeometryToolsPage'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import SharedProblem from './pages/SharedProblem'
import StudentApp from './pages/StudentApp'
import StudentAttempt from './pages/StudentAttempt'
import TeacherDashboard from './pages/TeacherDashboard'

function Home() {
  const { isAuthenticated, user, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={user?.role === 'teacher' ? '/teacher' : '/student'} replace />
}

function Shell() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/teacher"
          element={
            <ProtectedRoute role="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/attempt/:problemId"
          element={
            <ProtectedRoute role="student">
              <StudentAttempt />
            </ProtectedRoute>
          }
        />
        <Route
          path="/visualize/function"
          element={
            <ProtectedRoute>
              <FunctionPlotterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/visualize/geometry"
          element={
            <ProtectedRoute>
              <GeometryToolsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/share/:token" element={<SharedProblem />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Shell />
      </Router>
    </AuthProvider>
  )
}
