import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAPI } from '../hooks/useAPI'
import { useAuth } from '../hooks/useAuth'
import { formatMath } from '../utils/latex'

export default function StudentAttempt() {
  const { problemId } = useParams()
  const { get, post } = useAPI()
  const { updateUser } = useAuth()

  const [problem, setProblem] = useState(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    get(`/api/tests/${problemId}/`)
      .then(setProblem)
      .finally(() => setLoading(false))
  }, [problemId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const response = await post('/api/attempts/submit/', { problem_id: problemId, answer })
      setFeedback(response)
      updateUser({ points: response.user_points })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!problem) return <div className="text-center py-16">Masala topilmadi</div>

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>
        <p className="text-gray-700 mb-6">{formatMath(problem.question_text)}</p>

        {problem.question_type === 'mcq' && (
          <div className="space-y-2 mb-6">
            {Object.entries(problem.options || {}).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center p-3 border rounded-lg hover:bg-blue-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name="answer"
                  value={key}
                  checked={answer === key}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={!!feedback}
                  className="mr-3"
                />
                <span>{key}. {formatMath(value)}</span>
              </label>
            ))}
          </div>
        )}

        {problem.question_type !== 'mcq' && (
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Javobingizni kiriting..."
            disabled={!!feedback}
            className="w-full px-4 py-2 border rounded-lg mb-6"
            rows="4"
          />
        )}

        {!feedback && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!answer || submitting}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg"
          >
            {submitting ? 'Tekshirilmoqda...' : 'Javobni tekshirish'}
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`rounded-lg shadow p-6 ${
            feedback.is_correct ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            {feedback.is_correct ? (
              <>
                <span className="text-4xl">✅</span>
                <div>
                  <h2 className="text-xl font-bold text-green-700">To'g'ri!</h2>
                  <p className="text-green-600">Ball: {feedback.score}%</p>
                </div>
              </>
            ) : (
              <>
                <span className="text-4xl">❌</span>
                <div>
                  <h2 className="text-xl font-bold text-red-700">Noto'g'ri</h2>
                  <p className="text-red-600">Ball: {feedback.score}%</p>
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-bold mb-2">Izoh:</h3>
              <p className="text-gray-700">{formatMath(feedback.main_feedback)}</p>
            </div>

            {feedback.mistake_identified && (
              <div>
                <h3 className="font-bold mb-2">Nima xato bo'ldi:</h3>
                <p className="text-gray-700">{formatMath(feedback.mistake_identified)}</p>
              </div>
            )}

            {feedback.correct_steps?.length > 0 && (
              <div>
                <h3 className="font-bold mb-2">To'g'ri yechim:</h3>
                <ol className="list-decimal pl-5 space-y-1">
                  {feedback.correct_steps.map((step) => (
                    <li key={step} className="text-gray-700">{formatMath(step)}</li>
                  ))}
                </ol>
              </div>
            )}

            {feedback.next_step && (
              <div className="bg-blue-100 p-3 rounded">
                <h3 className="font-bold mb-2">💡 Maslahat:</h3>
                <p className="text-gray-700">{formatMath(feedback.next_step)}</p>
              </div>
            )}
          </div>

          <Link
            to="/student"
            className="mt-6 block text-center bg-blue-500 text-white py-2 rounded-lg font-bold hover:bg-blue-600"
          >
            Boshqa masalaga o'tish
          </Link>
        </div>
      )}
    </div>
  )
}
