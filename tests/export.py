import uuid
from io import BytesIO
from xml.sax.saxutils import escape

from django.http import FileResponse
from django.shortcuts import get_object_or_404
from docx import Document
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from utils.latex import latex_to_readable

from .models import Problem, ShareLink

# Base-14 PDF fonts can't render ×, ÷, √, ≤, ≥, ≠, π, ... -- register a
# Unicode-capable system font so converted LaTeX symbols actually show up.
_PDF_FONT = 'Helvetica'
try:
    pdfmetrics.registerFont(TTFont('Arial', 'C:/Windows/Fonts/arial.ttf'))
    pdfmetrics.registerFont(TTFont('Arial-Bold', 'C:/Windows/Fonts/arialbd.ttf'))
    _PDF_FONT = 'Arial'
except Exception:
    pass


class ProblemExporter:

    @staticmethod
    def export_to_pdf(problems):
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        story = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontName=_PDF_FONT + '-Bold' if _PDF_FONT == 'Arial' else 'Helvetica-Bold',
            fontSize=16,
            textColor=HexColor('#347ADD'),
            spaceAfter=12,
        )
        body_style = ParagraphStyle('CustomBody', parent=styles['Normal'], fontName=_PDF_FONT, fontSize=11)

        for problem in problems:
            story.append(Paragraph(escape(problem.title), title_style))
            story.append(Paragraph(escape(latex_to_readable(problem.question_text)), body_style))
            story.append(Spacer(1, 0.2 * inch))

            if problem.options:
                for key, value in problem.options.items():
                    readable = latex_to_readable(value)
                    story.append(Paragraph(f"{escape(key)}. {escape(readable)}", body_style))

            story.append(PageBreak())

        doc.build(story)
        buffer.seek(0)
        return buffer

    @staticmethod
    def export_to_docx(problems):
        doc = Document()

        for i, problem in enumerate(problems, 1):
            doc.add_heading(f"{i}. {problem.title}", level=2)
            doc.add_paragraph(latex_to_readable(problem.question_text))

            if problem.options:
                for key, value in problem.options.items():
                    doc.add_paragraph(f"{key}. {latex_to_readable(value)}", style='List Bullet')

            doc.add_paragraph()

        buffer = BytesIO()
        doc.save(buffer)
        buffer.seek(0)
        return buffer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_problem_pdf(request, id):
    problem = get_object_or_404(Problem, id=id, created_by=request.user)
    buffer = ProblemExporter.export_to_pdf([problem])
    return FileResponse(
        buffer, as_attachment=True, filename=f"masala_{id}.pdf", content_type='application/pdf'
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_problem_docx(request, id):
    problem = get_object_or_404(Problem, id=id, created_by=request.user)
    buffer = ProblemExporter.export_to_docx([problem])
    return FileResponse(
        buffer, as_attachment=True, filename=f"masala_{id}.docx",
        content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_share_link(request, id):
    problem = get_object_or_404(Problem, id=id, created_by=request.user)

    share_token = uuid.uuid4().hex[:8]
    ShareLink.objects.create(problem=problem, unique_token=share_token)

    return Response({
        'share_url': f"{request.build_absolute_uri('/')[:-1]}/api/share/{share_token}/",
        'token': share_token,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def access_shared_problem(request, token):
    share_link = get_object_or_404(ShareLink, unique_token=token)

    problem = share_link.problem
    share_link.access_count += 1
    share_link.save(update_fields=['access_count'])

    return Response({
        'id': problem.id,
        'title': problem.title,
        'question_text': problem.question_text,
        'options': problem.options,
        'question_type': problem.question_type,
    })
