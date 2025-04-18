from django.urls import path
from . import views

urlpatterns = [
    path('', views.main, name='home'),
    path('place/', views.place, name='place'),
   
    path('filter/', views.filterMain, name='home'),
]