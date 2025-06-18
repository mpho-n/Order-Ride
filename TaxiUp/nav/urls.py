from django.urls import path
from . import views

urlpatterns = [
    path('', views.main, name='home'),
    path('place/<int:place_id>/', views.place, name='place'),
    path('book/', views.book, name='book'),
    path('driver/', views.driver, name='place'),
    path('trip/', views.tripInfo, name='tripDriver'),
    path('completed/', views.tripOver, name='tripDone'),
    path('fetched/', views.pickedUp, name='fetched'),
    path('cancel/', views.cancel, name='cancel'),
    path('confirm/', views.confirm, name='confirmTrip'),
    path('status/', views.tripStatus, name='tripStatus'),
    #path('s/', views.filterMain, name='home'),
]