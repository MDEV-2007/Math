import { useEffect, useState } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'
import ProblemCard from '../components/ProblemCard'
import TestGenerator from '../components/TestGenerator'
import { useAPI } from '../hooks/useAPI'
import { useAuth } from '../hooks/useAuth'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const { get } = useAPI()

  const [problems, setProblems] = useState([])
  const [stats, setStats] = useState({ totalProblems: 0, totalAttempts: 0, averageScore: 0 })
  const [showGenerator, setShowGenerator] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchProblems = async () => {
    try {
      setLoading(true)
      const response = await get('/api/tests/list/')
      setProblems(response.problems)
      setStats(response.stats)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProblems()
  }, [])

  const handleGenerateSuccess = (newProblems) => {
    setProblems([...newProblems, ...problems])
    setStats((s) => ({ ...s, totalProblems: s.totalProblems + newProblems.length }))
    setShowGenerator(false)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">👨‍🏫 O'qituvchi paneli</h1>
          <p className="text-gray-600">Xush kelibsiz, {user?.username}!</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">Jami masalalar</div>
            <div className="text-4xl font-bold mt-2">{stats.totalProblems}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">Jami urinishlar</div>
            <div className="text-4xl font-bold mt-2">{stats.totalAttempts}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">O'rtacha ball</div>
            <div className="text-4xl font-bold mt-2">{Math.round(stats.averageScore || 0)}%</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Masalalar yaratish</h2>
            <button
              type="button"
              onClick={() => setShowGenerator(!showGenerator)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              {showGenerator ? 'Bekor qilish' : '+ AI bilan yaratish'}
            </button>
          </div>

          {showGenerator && (
            <div className="mt-6">
              <TestGenerator onSuccess={handleGenerateSuccess} />
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Sizning masalalaringiz ({problems.length})</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {problems.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} onUpdate={fetchProblems} />
            ))}
          </div>
          {problems.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">Hali masalalar yo'q. Boshlash uchun birini yarating!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
