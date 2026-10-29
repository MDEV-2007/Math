import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navigation() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const homeLink = user.role === 'teacher' ? '/teacher' : '/student'

  return (
    <nav className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to={homeLink} className="text-lg font-bold text-blue-600">
          📐 ILM Math
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/visualize/function" className="text-gray-600 hover:text-blue-600">
            Grafik
          </Link>
          <Link to="/visualize/geometry" className="text-gray-600 hover:text-blue-600">
            Geometriya
          </Link>
          {user.role === 'student' && (
            <span className="text-gray-600">⭐ {user.points} ball</span>
          )}
          <span className="text-gray-500">{user.username}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600 font-medium"
          >
            Chiqish
          </button>
        </div>
      </div>
    </nav>
  )
}
