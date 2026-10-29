const GREEK = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', theta: 'θ',
  pi: 'π', lambda: 'λ', mu: 'μ', sigma: 'σ', phi: 'φ', omega: 'ω',
}

const SIMPLE_REPLACEMENTS = [
  [/\\cdot/g, '×'],
  [/\\times/g, '×'],
  [/\\div/g, '÷'],
  [/\\pm/g, '±'],
  [/\\leq/g, '≤'],
  [/\\geq/g, '≥'],
  [/\\neq/g, '≠'],
  [/\\approx/g, '≈'],
  [/\\Rightarrow/g, '⇒'],
  [/\\rightarrow/g, '→'],
  [/\\infty/g, '∞'],
  [/\\%/g, '%'],
  [/\\left/g, ''],
  [/\\right/g, ''],
  [/\\,/g, ' '],
  [/\\;/g, ' '],
  [/\\ /g, ' '],
]

/**
 * Convert simple LaTeX (as produced by the Groq problem generator) into
 * plain, human-readable text: \frac{1}{2} -> (1/2), \cdot -> ×, etc.
 * Mirrors utils/latex.py on the backend so the same problem content
 * reads the same way whether it's shown in-app or exported to PDF/DOCX.
 */
export function formatMath(text) {
  if (!text) return text
  let t = text

  const fracPattern = /\\frac\{([^{}]*)\}\{([^{}]*)\}/
  for (let i = 0; i < 4; i++) {
    const next = t.replace(fracPattern, (_, num, den) => `(${num}/${den})`)
    if (next === t) break
    t = next
  }

  t = t.replace(/\\sqrt\{([^{}]*)\}/g, (_, inner) => `√(${inner})`)
  t = t.replaceAll('\\sqrt', '√')

  t = t.replace(/\^\{([^{}]*)\}/g, '^$1')
  t = t.replace(/_\{([^{}]*)\}/g, '_$1')

  for (const [name, ch] of Object.entries(GREEK)) {
    t = t.replace(new RegExp(`\\\\${name}\\b`, 'g'), ch)
  }

  for (const [pattern, repl] of SIMPLE_REPLACEMENTS) {
    t = t.replace(pattern, repl)
  }

  t = t.replace(/\\boxed\{([^{}]*)\}/g, '[$1]')
  // \text{...}, \mathrm{...}, etc. -- keep the argument, drop the command
  t = t.replace(/\\[a-zA-Z]+\{([^{}]*)\}/g, '$1')
  // any remaining unknown \command -- drop the backslash, keep the word
  t = t.replace(/\\([a-zA-Z]+)/g, '$1')

  t = t.replaceAll('{', '').replaceAll('}', '').replaceAll('$', '')
  return t.replace(/ {2,}/g, ' ').trim()
}
