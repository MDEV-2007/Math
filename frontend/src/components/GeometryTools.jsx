import { useEffect, useRef, useState } from 'react'

export default function GeometryTools({ onSave }) {
  const canvasRef = useRef(null)
  const [activeTab, setActiveTab] = useState('circle')
  const [radius, setRadius] = useState(100)
  const [angle, setAngle] = useState(45)
  const [measurements, setMeasurements] = useState({})

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (activeTab === 'circle') drawCircle(ctx)
    else if (activeTab === 'triangle') drawTriangle(ctx)
    else if (activeTab === 'angles') drawAngle(ctx)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, radius, angle])

  const drawCircle = (ctx) => {
    const cx = 200
    const cy = 150

    ctx.fillStyle = 'rgba(52, 122, 221, 0.1)'
    ctx.strokeStyle = 'rgb(52, 122, 221)'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = 'rgb(52, 122, 221)'
    ctx.beginPath()
    ctx.arc(cx, cy, 5, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'rgb(200, 200, 200)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + radius, cy)
    ctx.stroke()

    ctx.fillStyle = 'rgb(100, 100, 100)'
    ctx.font = '12px sans-serif'
    ctx.fillText(`r = ${radius}`, cx + radius / 2, cy - 10)

    const circumference = 2 * Math.PI * radius
    const area = Math.PI * radius * radius

    setMeasurements({
      radius,
      diameter: radius * 2,
      circumference: circumference.toFixed(1),
      area: area.toFixed(1),
    })
  }

  const drawTriangle = (ctx) => {
    const points = [
      [100, 250],
      [350, 250],
      [225, 80],
    ]

    ctx.fillStyle = 'rgba(52, 122, 221, 0.1)'
    ctx.strokeStyle = 'rgb(52, 122, 221)'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(points[0][0], points[0][1])
    ctx.lineTo(points[1][0], points[1][1])
    ctx.lineTo(points[2][0], points[2][1])
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = 'rgb(52, 122, 221)'
    for (const p of points) {
      ctx.beginPath()
      ctx.arc(p[0], p[1], 4, 0, Math.PI * 2)
      ctx.fill()
    }

    const dist = (p1, p2) => Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2) / 50
    const side1 = dist(points[0], points[1])
    const side2 = dist(points[1], points[2])
    const side3 = dist(points[2], points[0])

    const s = (side1 + side2 + side3) / 2
    const area = Math.sqrt(s * (s - side1) * (s - side2) * (s - side3))
    const perimeter = side1 + side2 + side3

    setMeasurements({
      side1: side1.toFixed(1),
      side2: side2.toFixed(1),
      side3: side3.toFixed(1),
      perimeter: perimeter.toFixed(1),
      area: area.toFixed(1),
    })

    ctx.fillStyle = 'rgb(100, 100, 100)'
    ctx.font = '11px sans-serif'
    ctx.fillText(side1.toFixed(1), 225, 270)
    ctx.fillText(side2.toFixed(1), 340, 160)
    ctx.fillText(side3.toFixed(1), 120, 160)
  }

  const drawAngle = (ctx) => {
    const cx = 200
    const cy = 150
    const arcRadius = 60

    ctx.strokeStyle = 'rgb(52, 122, 221)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx - 100, cy)
    ctx.lineTo(cx, cy)
    ctx.stroke()

    const angleRad = (angle * Math.PI) / 180
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(angleRad) * 100, cy - Math.sin(angleRad) * 100)
    ctx.stroke()

    ctx.fillStyle = 'rgba(230, 126, 34, 0.2)'
    ctx.strokeStyle = 'rgb(230, 126, 34)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(cx, cy, arcRadius, Math.PI, Math.PI - angleRad, true)
    ctx.stroke()

    ctx.fillStyle = 'rgb(100, 100, 100)'
    ctx.font = '14px sans-serif'
    ctx.fillText(`${angle}°`, cx - 40, cy - 50)

    setMeasurements({ angle, complement: 90 - angle, supplement: 180 - angle })
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-2 border-b">
        {['circle', 'triangle', 'angles'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'
            }`}
          >
            {tab === 'circle' ? '● Doira' : tab === 'triangle' ? '△ Uchburchak' : '∠ Burchak'}
          </button>
        ))}
      </div>

      {activeTab === 'circle' && (
        <div>
          <label className="block font-semibold mb-2">Radius: {radius}</label>
          <input
            type="range"
            min="10"
            max="150"
            value={radius}
            onChange={(e) => setRadius(Number.parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
      )}

      {activeTab === 'triangle' && (
        <p className="text-sm text-gray-500">Uchburchak avtomatik chizilgan, tomonlar hisoblanadi.</p>
      )}

      {activeTab === 'angles' && (
        <div>
          <label className="block font-semibold mb-2">Burchak: {angle}°</label>
          <input
            type="range"
            min="0"
            max="180"
            value={angle}
            onChange={(e) => setAngle(Number.parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        className="border border-gray-300 rounded-lg bg-white max-w-full"
      />

      <div className="grid grid-cols-2 gap-2">
        {Object.entries(measurements).map(([key, value]) => (
          <div key={key} className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-500 capitalize">{key}</div>
            <div className="text-lg font-bold">{value}</div>
          </div>
        ))}
      </div>

      {onSave && (
        <button
          type="button"
          onClick={() => onSave({ tool_type: activeTab, data: { ...measurements, radius, angle } })}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg"
        >
          Vizualizatsiyani saqlash
        </button>
      )}
    </div>
  )
}
