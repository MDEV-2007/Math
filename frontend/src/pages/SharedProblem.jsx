import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import apiClient from '../services/api'
import { formatMath } from '../utils/latex'

export default function SharedProblem() {
  const { token } = useParams()
  const [problem, setProblem] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    apiClient
      .get(`/api/share/${token}/`)
      .then(setProblem)
      .catch(() => setNotFound(true))
  }, [token])

  if (notFound) {
    return <div className="text-center py-16 text-gray-500">Havola topilmadi yoki muddati tugagan</div>
  }
  if (!problem) return <LoadingSpinner />

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>
        <p className="text-gray-700 mb-6">{formatMath(problem.question_text)}</p>
        {problem.options && (
          <div className="space-y-2">
            {Object.entries(problem.options).map(([key, value]) => (
              <div key={key} className="p-3 border rounded-lg">
                {key}. {formatMath(value)}
              </div>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-400 mt-6 text-center">
          To'liq platformadan foydalanish uchun ILM Math'ga kiring
        </p>
      </div>
    </div>
  )
}
