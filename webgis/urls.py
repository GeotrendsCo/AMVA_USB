from django.urls import path
from . import views


urlpatterns = [
    path('filterGeoTimeStampApi/',views.filterGeoTimeStamp,name='filterGeoTimeStampApi'),
    path('geoJsonFilterApi/',views.filtrarPuntos,name='geoJsonFilterApi'),
    path('apiHome/', views.apiHomeView, name='apiHome'),
    path('tableroBI/', views.tableroBiView),
    path('userLogout/', views.userLogout),
    path('backOffice/', views.backOffice, name='backOffice'),
    path('backOffice/activate/<username>', views.userActivate, name='activate'),
    path('backOffice/delete/<username>', views.userDelete, name='delete'),
    path('apiHome/informe', views.report),
    path('userEdit', views.userEdit)
]