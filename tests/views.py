import logging

from django.db.models import Avg, Count
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.permissions import IsTeacher
from utils.groq_client import GroqTestGenerator

from .models import Attempt, Problem
from .serializers import AttemptSerializer, ProblemPublicSerializer, ProblemSerializer

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsTeacher])
def generate_tests(request):
    """POST /api/tests/generate/ - AI-generate problems for a topic."""

    topic = request.data.get('topic')
    difficulty = int(request.data.get('difficulty', 3))
    count = int(request.data.get('count', 5))

    if not topic:
        return Response({"error": "Topic is required"}, status=400)
    if not (1 <= difficulty <= 5):
        return Response({"error": "Difficulty must be 1-5"}, status=400)
    if not (1 <= count <= 10):
        return Response({"error": "Count must be 1-10"}, status=400)

    generator = GroqTestGenerator()
    result = generator.generate_problems(topic=topic, difficulty=difficulty, count=count)

    if not result["success"]:
        return Response(result, status=400)

    created_problems = []
    for i, problem_data in enumerate(result["problems"], start=1):
        try:
            problem = Problem.objects.create(
                title=f"{topic} - {i}-masala",
                subject=request.data.get('subject', 'math'),
                topic=topic,
                question_text=problem_data["question_text"],
                question_type="mcq",
                difficulty=difficulty,
                options=problem_data["options"],
                correct_answer=problem_data["correct_answer"],
                solution_json=problem_data["solution"],
                created_by=request.user,
                is_published=False,
            )
            created_problems.append(ProblemSerializer(problem).data)
        except Exception as e:
            logger.error(f"Error saving problem: {e}")
            continue

    return Response({
        "success": True,
        "message": f"Generated and saved {len(created_problems)} problems",
        "problems": created_problems,
        "generation_time_ms": result["generation_time_ms"],
    }, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_problems(request):
    """GET /api/tests/list/ - problems owned by the current teacher (or all if student)."""

    if request.user.role == 'teacher':
        qs = Problem.objects.filter(created_by=request.user)
    else:
        qs = Problem.objects.filter(is_published=True)

    stats = qs.aggregate(
        total_problems=Count('id'),
        total_attempts=Count('attempts'),
        average_score=Avg('average_score'),
    )

    serializer_cls = ProblemSerializer if request.user.role == 'teacher' else ProblemPublicSerializer
    return Response({
        "problems": serializer_cls(qs, many=True).data,
        "stats": {
            "totalProblems": stats["total_problems"] or 0,
            "totalAttempts": stats["total_attempts"] or 0,
            "averageScore": stats["average_score"] or 0,
        },
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_problem(request, id):
    """GET /api/tests/<id>/ - problem detail. Students get answer/solution hidden."""

    problem = get_object_or_404(Problem, id=id)
    if request.user.role == 'teacher' and problem.created_by_id == request.user.id:
        return Response(ProblemSerializer(problem).data)
    return Response(ProblemPublicSerializer(problem).data)


@api_view(['PATCH', 'PUT'])
@permission_classes([IsAuthenticated, IsTeacher])
def update_problem(request, id):
    """PATCH /api/tests/<id>/update/"""

    problem = get_object_or_404(Problem, id=id, created_by=request.user)
    serializer = ProblemSerializer(problem, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsTeacher])
def delete_problem(request, id):
    """DELETE /api/tests/<id>/delete/"""

    problem = get_object_or_404(Problem, id=id, created_by=request.user)
    problem.delete()
    return Response(status=204)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_attempt(request):
    """POST /api/attempts/submit/ - student submits an answer, gets AI feedback."""

    problem_id = request.data.get('problem_id')
    student_answer = request.data.get('answer')

    problem = get_object_or_404(Problem, id=problem_id)

    is_correct = _validate_answer(student_answer, problem)
    generator = GroqTestGenerator()
    feedback = generator.generate_feedback(problem, student_answer, is_correct)
    score = 100 if is_correct else 0

    attempt = Attempt.objects.create(
        user=request.user,
        problem=problem,
        answer={'choice': student_answer} if isinstance(student_answer, str) else student_answer,
        is_correct=is_correct,
        score=score,
        feedback=feedback,
    )

    problem.total_attempts += 1
    if is_correct:
        problem.total_correct += 1
    problem.average_score = (problem.total_correct / problem.total_attempts) * 100
    problem.save(update_fields=['total_attempts', 'total_correct', 'average_score'])

    if is_correct:
        request.user.points += 10
        request.user.save(update_fields=['points'])

    return Response({
        'attempt_id': attempt.id,
        'is_correct': is_correct,
        'score': score,
        'main_feedback': feedback.get('main_feedback'),
        'mistake_identified': feedback.get('mistake_identified'),
        'correct_steps': feedback.get('correct_steps'),
        'next_step': feedback.get('next_step'),
        'user_points': request.user.points,
    })


def _validate_answer(student_answer, problem):
    if problem.question_type == 'mcq':
        return str(student_answer).strip().upper() == str(problem.correct_answer).strip().upper()
    return str(student_answer).strip().lower() == str(problem.correct_answer).strip().lower()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_attempts(request):
    """GET /api/attempts/mine/ - the current student's attempt history."""

    qs = Attempt.objects.filter(user=request.user).select_related('problem')
    return Response(AttemptSerializer(qs, many=True).data)
