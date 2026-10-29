import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const navigate = useNavigate()
  const { isAuthenticated, user, loginWithTelegram, loginDev } = useAuth()

  const [telegramBusy, setTelegramBusy] = useState(false)
  const [telegramError, setTelegramError] = useState('')

  const [devUsername, setDevUsername] = useState('')
  const [devRole, setDevRole] = useState('teacher')
  const [devError, setDevError] = useState('')
  const [devBusy, setDevBusy] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(user?.role === 'teacher' ? '/teacher' : '/student')
    }
  }, [isAuthenticated, user, navigate])

  const handleTelegramLogin = async () => {
    setTelegramBusy(true)
    setTelegramError('')
    const result = await loginWithTelegram()
    setTelegramBusy(false)
    if (!result.success) {
      setTelegramError(result.error)
    }
  }

  const handleDevLogin = async (e) => {
    e.preventDefault()
    if (!devUsername.trim()) return
    setDevBusy(true)
    setDevError('')
    const result = await loginDev(devUsername.trim(), devRole)
    setDevBusy(false)
    if (!result.success) {
      setDevError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2">📐 ILM Math</h1>
        <p className="text-center text-gray-600 mb-8">
          Interaktiv matematika o'quv platformasi
        </p>

        <button
          type="button"
          onClick={handleTelegramLogin}
          disabled={telegramBusy}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 mb-2"
        >
          {telegramBusy ? 'Tasdiqlash kutilmoqda...' : 'Telegram orqali kirish'}
        </button>
        {telegramError && (
          <p className="text-red-600 text-sm text-center mb-4">{telegramError}</p>
        )}

        <p className="text-center text-sm text-gray-500 my-6">
          Parol shart emas — Telegram hisobingiz orqali kiring
        </p>

        <details className="border-t pt-4">
          <summary className="text-sm text-gray-500 cursor-pointer select-none">
            Dasturchi uchun tezkor kirish (DEBUG rejimi)
          </summary>
          <form onSubmit={handleDevLogin} className="space-y-3 mt-4">
            <input
              type="text"
              value={devUsername}
              onChange={(e) => setDevUsername(e.target.value)}
              placeholder="Foydalanuvchi nomi"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={devRole}
              onChange={(e) => setDevRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="teacher">O'qituvchi</option>
              <option value="student">O'quvchi</option>
            </select>
            {devError && <p className="text-red-600 text-sm">{devError}</p>}
            <button
              type="submit"
              disabled={devBusy}
              className="w-full bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg"
            >
              {devBusy ? 'Kirilmoqda...' : 'Kirish'}
            </button>
          </form>
        </details>
      </div>
    </div>
  )
}
