from django.urls import path
from . import views


urlpatterns = [
    path('login/', views.userLogin, name='login'),
    path('register/', views.userRegister, name='register'),
    # path('list/', views.userList, name='userList'),
    # path('list/activate/', views.userActivate, name='activate'),
    # path('list/edit/<usercode>', views.userEdit, name='edit'),
    # path('list/edit/update/<usercode>', views.userUpdate),
    # path('list/delete/<usercode>', views.userDelete, name='delete'),
    path('recoverPassword/', views.recoverPassword, name='recover'),
    path('contact/', views.contactPage, name='contact'),
    path('success/', views.successRegister, name='success')
]