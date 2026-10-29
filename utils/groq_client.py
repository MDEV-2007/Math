import json
import logging
import re

from django.conf import settings
from groq import Groq
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)


def _extract_json(text):
    """Strip markdown code fences models sometimes wrap JSON in."""
    text = text.strip()
    if text.startswith('```'):
        text = re.sub(r'^```(?:json)?\s*', '', text)
        text = re.sub(r'\s*```$', '', text)
    return text.strip()


def _fix_latex_backslashes(text):
    """
    Models often emit raw LaTeX (\\cdot, \\frac, \\boxed, ...) inside JSON
    string values. Backslash is JSON's escape character, and LaTeX macros
    routinely start with the same letters as JSON's control escapes
    (\\b, \\f, \\n, \\r, \\t, \\u) -- e.g. \\frac, \\boxed, \\neq, \\tan.
    Rather than special-case letters, only leave \\" and \\\\ alone (the
    escapes this content could plausibly need) and double every other
    backslash so the literal LaTeX source survives parsing intact.
    """
    return re.sub(r'\\(?!["\\])', r'\\\\', text)


class GroqTestGenerator:
    def __init__(self, api_key=None):
        self.api_key = api_key or settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def _call_groq(self, prompt, temperature, max_tokens):
        client = Groq(api_key=self.api_key)
        return client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
            max_tokens=max_tokens,
            top_p=0.9,
        )

    def generate_problems(self, topic, difficulty, count=5, language='uz'):
        """
        Generate test problems using Groq API.

        Returns a dict: {"success": True, "problems": [...], "count": N,
        "generation_time_ms": ms} or {"success": False, "error": ..., "message": ...}
        """
        if not self.api_key:
            return {
                "success": False,
                "error": "Groq API key not configured",
                "message": "Set GROQ_API_KEY in .env to enable AI generation",
            }

        prompt = f"""You are an Uzbek mathematics teacher creating DTM-style exam questions.

Subject: Mathematics
Topic: {topic}
Difficulty Level: {difficulty}/5
Language: Uzbek (o'zbek tili)

Generate exactly {count} unique, high-quality multiple-choice questions about "{topic}".

Requirements:
1. Format: Multiple choice with exactly 4 options (A, B, C, D)
2. Style: Similar to State Testing Center (DTM) questions
3. Exactly ONE correct answer
4. Include mathematical expressions in LaTeX format
5. Each question should be independent
6. Include a brief explanation of the solution

Output ONLY a valid JSON array, no preamble, no markdown fences:
[
  {{
    "question_text": "...",
    "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}},
    "correct_answer": "A",
    "solution": {{
      "steps": ["Step 1", "Step 2"],
      "explanation": "..."
    }}
  }}
]"""

        try:
            message = self._call_groq(prompt, temperature=0.7, max_tokens=3000)
            response_text = _fix_latex_backslashes(_extract_json(message.choices[0].message.content))
            problems = json.loads(response_text)

            if not isinstance(problems, list):
                problems = problems.get('problems', [])

            return {
                "success": True,
                "problems": problems,
                "count": len(problems),
                "generation_time_ms": int(message.usage.completion_tokens * 10),
            }

        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            return {
                "success": False,
                "error": "Invalid response format",
                "message": "Groq returned invalid JSON",
            }

        except Exception as e:
            logger.error(f"Groq API error: {e}")
            return {
                "success": False,
                "error": "Generation failed",
                "message": str(e),
            }

    def generate_feedback(self, problem, student_answer, is_correct):
        """Generate constructive feedback for a student's attempt."""
        if not self.api_key:
            return {
                "main_feedback": "To'g'ri!" if is_correct else "Noto'g'ri javob.",
                "mistake_identified": None,
                "correct_steps": problem.solution_json.get('steps', []) if problem.solution_json else [],
                "next_step": None,
            }

        prompt = f"""You are an Uzbek mathematics tutor providing feedback on a student's answer.

Problem: {problem.question_text}
Correct answer: {problem.correct_answer}
Student's answer: {student_answer}
Is correct: {is_correct}

Generate constructive feedback as a JSON object (no markdown fences):
{{
  "main_feedback": "Brief praise or encouragement",
  "mistake_identified": "What went wrong (if incorrect), else null",
  "correct_steps": ["Step 1", "Step 2"],
  "next_step": "Tip for solving similar problems"
}}

Language: Uzbek (o'zbek tili)
Tone: Supportive and encouraging"""

        try:
            message = self._call_groq(prompt, temperature=0.5, max_tokens=600)
            feedback = json.loads(_fix_latex_backslashes(_extract_json(message.choices[0].message.content)))
            return feedback
        except (json.JSONDecodeError, Exception) as e:
            logger.error(f"Groq feedback error: {e}")
            return {
                "main_feedback": "To'g'ri!" if is_correct else "Noto'g'ri javob, qayta urinib ko'ring.",
                "mistake_identified": None,
                "correct_steps": problem.solution_json.get('steps', []) if problem.solution_json else [],
                "next_step": None,
            }
