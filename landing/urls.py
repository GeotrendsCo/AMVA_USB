from django.urls import path
from . import views


urlpatterns = [
    path('', views.landingView),
    # path('informe', views.informe)
]