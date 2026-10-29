from django.urls import path

from . import views

urlpatterns = [
    path('save/', views.save_visualization, name='save_visualization'),
    path('mine/', views.my_visualizations, name='my_visualizations'),
    path('shared/<str:token>/', views.view_shared_visualization, name='view_shared_visualization'),
    path('<int:id>/', views.get_visualization, name='get_visualization'),
    path('<int:id>/delete/', views.delete_visualization, name='delete_visualization'),
    path('<int:id>/share/', views.share_visualization, name='share_visualization'),
]
