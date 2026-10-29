import uuid

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Visualization
from .serializers import VisualizationSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_visualization(request):
    """POST /api/visualizations/save/"""

    serializer = VisualizationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(user=request.user)
    return Response(serializer.data, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_visualizations(request):
    """GET /api/visualizations/mine/"""

    qs = Visualization.objects.filter(user=request.user)
    tool_type = request.query_params.get('tool_type')
    if tool_type:
        qs = qs.filter(tool_type=tool_type)
    return Response(VisualizationSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_visualization(request, id):
    """GET /api/visualizations/<id>/"""

    viz = get_object_or_404(Visualization, id=id, user=request.user)
    return Response(VisualizationSerializer(viz).data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_visualization(request, id):
    """DELETE /api/visualizations/<id>/delete/"""

    viz = get_object_or_404(Visualization, id=id, user=request.user)
    viz.delete()
    return Response(status=204)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def share_visualization(request, id):
    """POST /api/visualizations/<id>/share/"""

    viz = get_object_or_404(Visualization, id=id, user=request.user)
    if not viz.share_link:
        viz.share_link = uuid.uuid4().hex[:10]
    viz.is_shared = True
    viz.save(update_fields=['share_link', 'is_shared'])

    return Response({
        'share_url': f"{request.build_absolute_uri('/')[:-1]}/api/visualizations/shared/{viz.share_link}/",
        'token': viz.share_link,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def view_shared_visualization(request, token):
    """GET /api/visualizations/shared/<token>/ - public, no auth required"""

    viz = get_object_or_404(Visualization, share_link=token, is_shared=True)
    viz.views_count += 1
    viz.save(update_fields=['views_count'])
    return Response(VisualizationSerializer(viz).data)
