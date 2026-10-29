import { useState } from 'react'
import apiClient from '../services/api'
import { useAPI } from '../hooks/useAPI'
import { formatMath } from '../utils/latex'

const DIFFICULTY_STYLES = {
  1: 'bg-green-100 text-green-800',
  2: 'bg-blue-100 text-blue-800',
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-orange-100 text-orange-800',
  5: 'bg-red-100 text-red-800',
}

async function downloadFile(url, filename) {
  const blob = await apiClient.get(url, { responseType: 'blob' })
  const objectUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(objectUrl)
}

export default function ProblemCard({ problem, onUpdate }) {
  const { delete: deleteProblem, patch } = useAPI()
  const [showDetails, setShowDetails] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [busy, setBusy] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm("Bu masalani o'chirasizmi?")) return
    await deleteProblem(`/api/tests/${problem.id}/delete/`)
    onUpdate()
  }

  const handleTogglePublish = async () => {
    await patch(`/api/tests/${problem.id}/update/`, { is_published: !problem.is_published })
    onUpdate()
  }

  const handleShare = async () => {
    setBusy(true)
    try {
      const res = await apiClient.post(`/api/tests/${problem.id}/share/`)
      setShareUrl(res.share_url)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold">{problem.title}</h3>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className={`text-xs font-bold px-2 py-1 rounded ${DIFFICULTY_STYLES[problem.difficulty]}`}>
              {problem.difficulty}-daraja
            </span>
            {problem.is_published ? (
              <span className="text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-800">
                Chop etilgan
              </span>
            ) : (
              <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-800">Qoralama</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-500">{problem.total_attempts}</div>
          <div className="text-xs text-gray-500">urinishlar</div>
        </div>
      </div>

      <p className="text-gray-600 mb-4">{formatMath(problem.question_text).slice(0, 120)}...</p>

      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div>
          Muvaffaqiyat: <span className="font-bold">{Math.round(problem.average_score || 0)}%</span>
        </div>
        <div>
          Turi: <span className="font-bold">{problem.question_type}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="flex-1 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm font-medium"
        >
          {showDetails ? 'Yashirish' : "Ko'rish"}
        </button>
        <button
          type="button"
          onClick={handleTogglePublish}
          className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded text-sm font-medium"
        >
          {problem.is_published ? 'Bekor qilish' : 'Chop etish'}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium"
        >
          O'chirish
        </button>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t space-y-3">
          <p className="text-sm">
            <strong>Savol:</strong> {formatMath(problem.question_text)}
          </p>
          {problem.options && (
            <div className="text-sm">
              <strong>Variantlar:</strong>
              <ul className="list-disc pl-5">
                {Object.entries(problem.options).map(([key, value]) => (
                  <li key={key} className={problem.correct_answer === key ? 'font-bold text-green-600' : ''}>
                    {key}: {formatMath(value)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => downloadFile(`/api/tests/${problem.id}/export/pdf/`, `masala_${problem.id}.pdf`)}
              className="bg-gray-700 hover:bg-gray-800 text-white text-sm px-3 py-1.5 rounded"
            >
              PDF yuklab olish
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => downloadFile(`/api/tests/${problem.id}/export/docx/`, `masala_${problem.id}.docx`)}
              className="bg-gray-700 hover:bg-gray-800 text-white text-sm px-3 py-1.5 rounded"
            >
              Word yuklab olish
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleShare}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1.5 rounded"
            >
              Havola olish
            </button>
          </div>
          {shareUrl && (
            <input
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
              className="w-full text-xs px-2 py-1 border rounded bg-gray-50"
            />
          )}
        </div>
      )}
    </div>
  )
}
