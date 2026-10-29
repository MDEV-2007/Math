import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAPI } from '../hooks/useAPI'
import { useAuth } from '../hooks/useAuth'
import { formatMath } from '../utils/latex'

const DIFFICULTY_STYLES = {
  1: 'bg-green-100 text-green-800',
  2: 'bg-blue-100 text-blue-800',
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-orange-100 text-orange-800',
  5: 'bg-red-100 text-red-800',
}

export default function StudentApp() {
  const { user } = useAuth()
  const { get } = useAPI()

  const [problems, setProblems] = useState([])
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([get('/api/tests/list/'), get('/api/attempts/mine/')])
      .then(([problemsRes, attemptsRes]) => {
        setProblems(problemsRes.problems)
        setAttempts(attemptsRes)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const solvedIds = new Set(attempts.filter((a) => a.is_correct).map((a) => a.problem))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">👋 Salom, {user?.username}!</h1>
          <p className="text-gray-600">⭐ {user?.points} ball to'plangan</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-4">Mavjud masalalar ({problems.length})</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {problems.map((problem) => (
            <Link
              key={problem.id}
              to={`/student/attempt/${problem.id}`}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition block"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">{problem.title}</h3>
                {solvedIds.has(problem.id) && <span className="text-green-500 text-xl">✅</span>}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${DIFFICULTY_STYLES[problem.difficulty]}`}>
                {problem.difficulty}-daraja
              </span>
              <p className="text-gray-600 text-sm mt-3">{formatMath(problem.question_text).slice(0, 90)}...</p>
            </Link>
          ))}
        </div>
        {problems.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">Hozircha chop etilgan masala yo'q.</p>
          </div>
        )}
      </div>
    </div>
  )
}
