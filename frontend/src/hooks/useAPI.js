import { useCallback } from 'react'
import apiClient from '../services/api'

export function useAPI() {
  const get = useCallback((url, config) => apiClient.get(url, config), [])
  const post = useCallback((url, data, config) => apiClient.post(url, data, config), [])
  const patch = useCallback((url, data, config) => apiClient.patch(url, data, config), [])
  const del = useCallback((url, config) => apiClient.delete(url, config), [])

  return { get, post, patch, delete: del }
}
