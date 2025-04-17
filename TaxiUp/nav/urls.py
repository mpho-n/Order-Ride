from django.urls import path
from . import views

urlpatterns = [
    path('', views.main, name='home'),
    path('login/', views.loginView, name='login'),
    path('main/', views.main, name='home'),
    path('filter/', views.filterMain, name='home'),
    path('page/', views.page, name='home'),
    path('place/', views.place, name='home'),
    
]