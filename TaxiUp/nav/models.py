from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.contrib.auth.models import User

# Create your models here.

class Point(models.Model):
    name = models.CharField(max_length=50)
    lat = models.FloatField()
    long = models.FloatField()
    full = models.CharField(max_length=21,validators=[MinLengthValidator(19)])

    def __str__(self):
        return self.name
    

class Trip(models.Model):
    booked = models.DateTimeField(null=False, blank=False)
    pickedUp = models.DateTimeField( null=True, blank=True)
    completed = models.DateTimeField( null=True, blank=True)

    pickUp = models.CharField(max_length=21,validators=[MinLengthValidator(19)])
    dropOff = models.CharField(max_length=21,validators=[MinLengthValidator(19)])
    code = models.CharField(max_length=6)

    driver = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='driven_rides' )
    passenger = models.ForeignKey(User, on_delete=models.CASCADE, related_name='passenger_rides')

    PickupSec = models.FloatField(null=True, blank=True)
    TimeSec = models.FloatField(null=True, blank=True)
    speed = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.booked
