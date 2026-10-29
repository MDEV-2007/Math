import { useCallback, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import apiClient from '../services/api'

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  const loginWithTelegram = useCallback(async (onWaiting) => {
    const start = await apiClient.post('/api/auth/telegram/start/')
    window.open(start.telegram_login_url, '_blank')
    onWaiting?.(start.telegram_login_url)

    return new Promise((resolve) => {
      const poll = setInterval(async () => {
        try {
          const status = await apiClient.get(`/api/auth/telegram/status/${start.session_id}/`)
          if (status.status === 'confirmed') {
            clearInterval(poll)
            context.setSession(status.token, status.user)
            resolve({ success: true })
          } else if (status.status === 'expired' || status.status === 'not_found') {
            clearInterval(poll)
            resolve({ success: false, error: 'Login havolasi muddati tugadi' })
          }
        } catch (err) {
          clearInterval(poll)
          resolve({ success: false, error: err.error || 'Xatolik yuz berdi' })
        }
      }, 2000)
    })
  }, [context])

  const loginDev = useCallback(async (username, role) => {
    try {
      const data = await apiClient.post('/api/auth/dev-login/', { username, role })
      context.setSession(data.token, data.user)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.error || 'Login xato' }
    }
  }, [context])

  return {
    ...context,
    loginWithTelegram,
    loginDev,
  }
}
