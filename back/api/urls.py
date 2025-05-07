from django.urls import path

from .views import ClassificarImagem

urlpatterns = [
    path('classificar/', ClassificarImagem.as_view(), name='classificar'),
]
