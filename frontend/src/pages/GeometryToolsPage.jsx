import { useState } from 'react'
import GeometryTools from '../components/GeometryTools'
import { useAPI } from '../hooks/useAPI'

export default function GeometryToolsPage() {
  const { post } = useAPI()
  const [message, setMessage] = useState('')

  const handleSave = async ({ tool_type, data }) => {
    try {
      await post('/api/visualizations/save/', { tool_type, data, title: `${tool_type} shakli` })
      setMessage('Saqlandi!')
    } catch {
      setMessage('Saqlashda xatolik yuz berdi')
    } finally {
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">📐 Geometriya vositalari</h1>
        <GeometryTools onSave={handleSave} />
        {message && <p className="text-center text-sm text-blue-600 mt-3">{message}</p>}
      </div>
    </div>
  )
}
