from django.urls import path

from .views import *

urlpatterns = [
    path('classificar/', ClassificarMultiplasImagens.as_view(), name='classificar'),
    path("login/", SimpleLoginView.as_view(), name="login"),
    path("cadastrar/", SimpleRegisterView.as_view()),
]
