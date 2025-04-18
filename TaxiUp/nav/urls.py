from django.urls import path
from . import views

urlpatterns = [
    path('', views.main, name='home'),
    path('place/<int:place_id>/', views.place, name='place'),
   
    #path('s/', views.filterMain, name='home'),
]