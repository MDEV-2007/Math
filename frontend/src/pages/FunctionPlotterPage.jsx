import { useState } from 'react'
import FunctionPlotter from '../components/FunctionPlotter'
import { useAPI } from '../hooks/useAPI'

export default function FunctionPlotterPage() {
  const { post } = useAPI()
  const [message, setMessage] = useState('')

  const handleSave = async ({ a, b, c }) => {
    try {
      await post('/api/visualizations/save/', {
        tool_type: 'function_plotter',
        data: { a, b, c },
        title: `y = ${a}x² + ${b}x + ${c}`,
      })
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
        <h1 className="text-2xl font-bold mb-6">📈 Funksiya grafigi</h1>
        <FunctionPlotter onSave={handleSave} />
        {message && <p className="text-center text-sm text-blue-600 mt-3">{message}</p>}
      </div>
    </div>
  )
}
