import re

_GREEK = {
    'alpha': 'α', 'beta': 'β', 'gamma': 'γ', 'delta': 'δ', 'theta': 'θ',
    'pi': 'π', 'lambda': 'λ', 'mu': 'μ', 'sigma': 'σ', 'phi': 'φ', 'omega': 'ω',
}

_SIMPLE_REPLACEMENTS = [
    (r'\\cdot', '×'),
    (r'\\times', '×'),
    (r'\\div', '÷'),
    (r'\\pm', '±'),
    (r'\\leq', '≤'),
    (r'\\geq', '≥'),
    (r'\\neq', '≠'),
    (r'\\approx', '≈'),
    (r'\\Rightarrow', '⇒'),
    (r'\\rightarrow', '→'),
    (r'\\infty', '∞'),
    (r'\\%', '%'),
    (r'\\left', ''),
    (r'\\right', ''),
    (r'\\,', ' '),
    (r'\\;', ' '),
    (r'\\ ', ' '),
]


def latex_to_readable(text):
    """
    Convert simple LaTeX (as produced by the Groq problem generator) into
    plain, human-readable text: \\frac{1}{2} -> (1/2), \\cdot -> ×, etc.
    Not a full LaTeX engine -- covers the handful of constructs that show
    up in DTM-style algebra problems, which is what actually gets exported.
    """
    if not text:
        return text
    t = text

    frac_pattern = re.compile(r'\\frac\{([^{}]*)\}\{([^{}]*)\}')
    for _ in range(4):
        new_t = frac_pattern.sub(lambda m: f"({m.group(1)}/{m.group(2)})", t)
        if new_t == t:
            break
        t = new_t

    t = re.sub(r'\\sqrt\{([^{}]*)\}', lambda m: f"√({m.group(1)})", t)
    t = t.replace('\\sqrt', '√')

    # Exponents/indices: keep ^ and _ as plain ASCII markers (x^2, a_1) --
    # more reliable across fonts than relying on Unicode superscript glyphs.
    t = re.sub(r'\^\{([^{}]*)\}', r'^\1', t)
    t = re.sub(r'_\{([^{}]*)\}', r'_\1', t)

    for name, ch in _GREEK.items():
        t = re.sub(rf'\\{name}\b', ch, t)

    for pattern, repl in _SIMPLE_REPLACEMENTS:
        t = re.sub(pattern, repl, t)

    t = re.sub(r'\\boxed\{([^{}]*)\}', r'[\1]', t)
    # \text{...}, \mathrm{...}, etc. -- keep the argument, drop the command
    t = re.sub(r'\\[a-zA-Z]+\{([^{}]*)\}', r'\1', t)
    # any remaining unknown \command -- drop the backslash, keep the word
    t = re.sub(r'\\([a-zA-Z]+)', r'\1', t)

    t = t.replace('{', '').replace('}', '').replace('$', '')
    return re.sub(r' {2,}', ' ', t).strip()
