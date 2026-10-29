import { useMemo, useState } from 'react'
import Plot from 'react-plotly.js'

function computeGraph(a, b, c) {
  const x = Array.from({ length: 300 }, (_, i) => -15 + i * 0.1)
  const y = x.map((xi) => a * xi * xi + b * xi + c)

  const vertexX = a === 0 ? 0 : -b / (2 * a)
  const vertexY = a * vertexX * vertexX + b * vertexX + c

  const discriminant = b * b - 4 * a * c
  let roots = []
  if (a !== 0 && discriminant >= 0) {
    const sqrtDisc = Math.sqrt(discriminant)
    roots = [
      Math.round(((-b + sqrtDisc) / (2 * a)) * 100) / 100,
      Math.round(((-b - sqrtDisc) / (2 * a)) * 100) / 100,
    ]
  }

  return {
    x,
    y,
    vertexX: Math.round(vertexX * 100) / 100,
    vertexY: Math.round(vertexY * 100) / 100,
    roots,
    discriminant,
    yIntercept: c,
  }
}

export default function FunctionPlotter({ onSave }) {
  const [a, setA] = useState(1)
  const [b, setB] = useState(0)
  const [c, setC] = useState(0)

  const graph = useMemo(() => computeGraph(a, b, c), [a, b, c])

  return (
    <div className="w-full space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 text-center font-mono text-lg">
        y = {a.toFixed(1)}x² + {b.toFixed(1)}x + {c.toFixed(1)}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between">
            <label className="font-semibold">a (koeffitsient)</label>
            <span className="text-blue-600 font-bold">{a.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="-5"
            max="5"
            step="0.1"
            value={a}
            onChange={(e) => setA(Number.parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg"
          />
        </div>

        <div>
          <div className="flex justify-between">
            <label className="font-semibold">b (koeffitsient)</label>
            <span className="text-blue-600 font-bold">{b.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="-10"
            max="10"
            step="0.1"
            value={b}
            onChange={(e) => setB(Number.parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg"
          />
        </div>

        <div>
          <div className="flex justify-between">
            <label className="font-semibold">c (ozod had)</label>
            <span className="text-blue-600 font-bold">{c.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="-10"
            max="10"
            step="0.1"
            value={c}
            onChange={(e) => setC(Number.parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <Plot
          data={[
            {
              x: graph.x,
              y: graph.y,
              type: 'scatter',
              mode: 'lines',
              line: { color: 'rgb(52, 122, 221)', width: 3 },
              fill: 'tozeroy',
              fillcolor: 'rgba(52, 122, 221, 0.1)',
              hovertemplate: '(%{x}, %{y:.2f})<extra></extra>',
            },
            {
              x: [graph.vertexX],
              y: [graph.vertexY],
              type: 'scatter',
              mode: 'markers',
              marker: { size: 10, color: 'red' },
              name: `Cho'qqi (${graph.vertexX}, ${graph.vertexY})`,
            },
            ...graph.roots.map((root) => ({
              x: [root],
              y: [0],
              type: 'scatter',
              mode: 'markers',
              marker: { size: 8, color: 'green' },
              name: `Ildiz: x = ${root}`,
            })),
          ]}
          layout={{
            xaxis: { title: { text: 'x' }, zeroline: true, zerolinewidth: 2, zerolinecolor: 'rgba(0,0,0,0.2)' },
            yaxis: { title: { text: 'y' }, zeroline: true, zerolinewidth: 2, zerolinecolor: 'rgba(0,0,0,0.2)' },
            margin: { l: 50, r: 20, t: 20, b: 50 },
            plot_bgcolor: 'transparent',
            paper_bgcolor: 'transparent',
            hovermode: 'closest',
            showlegend: false,
            autosize: true,
          }}
          config={{ responsive: true, displayModeBar: false }}
          style={{ width: '100%', height: 400 }}
          useResizeHandler
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500">Cho'qqi X</div>
          <div className="text-2xl font-bold">{graph.vertexX}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500">Cho'qqi Y</div>
          <div className="text-2xl font-bold">{graph.vertexY}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500">Y-kesish</div>
          <div className="text-2xl font-bold">{graph.yIntercept}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500">Ildizlar</div>
          <div className="text-lg font-bold">
            {graph.roots.length > 0
              ? graph.roots.join(', ')
              : graph.discriminant < 0
                ? "Haqiqiy ildiz yo'q"
                : a === 0
                  ? '-'
                  : 'Karrali ildiz'}
          </div>
        </div>
      </div>

      {onSave && (
        <button
          type="button"
          onClick={() => onSave({ a, b, c })}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg"
        >
          Vizualizatsiyani saqlash
        </button>
      )}
    </div>
  )
}
