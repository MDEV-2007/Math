from django.urls import path

from . import export, views

urlpatterns = [
    path('generate/', views.generate_tests, name='generate_tests'),
    path('list/', views.list_problems, name='list_problems'),
    path('<int:id>/', views.get_problem, name='get_problem'),
    path('<int:id>/update/', views.update_problem, name='update_problem'),
    path('<int:id>/delete/', views.delete_problem, name='delete_problem'),
    path('<int:id>/export/pdf/', export.export_problem_pdf, name='export_problem_pdf'),
    path('<int:id>/export/docx/', export.export_problem_docx, name='export_problem_docx'),
    path('<int:id>/share/', export.create_share_link, name='create_share_link'),
]

attempts_urlpatterns = [
    path('submit/', views.submit_attempt, name='submit_attempt'),
    path('mine/', views.my_attempts, name='my_attempts'),
]

share_urlpatterns = [
    path('<str:token>/', export.access_shared_problem, name='access_shared_problem'),
]

