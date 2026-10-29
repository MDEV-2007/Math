import { useState } from 'react'
import { useAPI } from '../hooks/useAPI'

const COMMON_TOPICS = [
  'Kvadrat tenglamalar',
  'Chiziqli tenglamalar',
  "Ko'phadlar",
  'Doira geometriyasi',
  'Uchburchak xossalari',
  'Trigonometriya',
  'Funksiyalar',
  'Tengsizliklar',
]

export default function TestGenerator({ onSuccess }) {
  const { post } = useAPI()

  const [formData, setFormData] = useState({ topic: '', difficulty: 3, count: 5 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await post('/api/tests/generate/', formData)
      if (response.success) {
        onSuccess(response.problems)
      } else {
        setError(response.message || response.error || 'Generatsiya muvaffaqiyatsiz')
      }
    } catch (err) {
      setError(err.message || err.error || "Xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Mavzu</label>
        <input
          type="text"
          list="topics"
          value={formData.topic}
          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Mavzuni kiriting yoki tanlang"
        />
        <datalist id="topics">
          {COMMON_TOPICS.map((topic) => (
            <option key={topic} value={topic} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Qiyinlik darajasi: {formData.difficulty}
        </label>
        <input
          type="range"
          min="1"
          max="5"
          value={formData.difficulty}
          onChange={(e) => setFormData({ ...formData, difficulty: Number.parseInt(e.target.value, 10) })}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Masalalar soni: {formData.count}
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.count}
          onChange={(e) => setFormData({ ...formData, count: Number.parseInt(e.target.value, 10) })}
          className="w-full"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>
      )}

      <button
        type="submit"
        disabled={!formData.topic || loading}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg"
      >
        {loading ? 'Generatsiya qilinmoqda...' : 'AI bilan masala yaratish'}
      </button>
    </form>
  )
}
