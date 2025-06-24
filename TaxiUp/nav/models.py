from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.contrib.auth.models import User

# Create your models here.

class Point(models.Model):
    name = models.CharField(max_length=50)
    nicknames = models.CharField(max_length=50, null=True, blank=True)
    lat = models.FloatField()
    long = models.FloatField()
    full = models.CharField(max_length=21,validators=[MinLengthValidator(19)])

    def __str__(self):
        return self.name
    

class Trip(models.Model):
    booked = models.DateTimeField(null=True, blank=True)
    pickedUp = models.DateTimeField( null=True, blank=True)
    completed = models.DateTimeField( null=True, blank=True)

    pickUp = models.ForeignKey(Point, null=True, blank=True, on_delete=models.SET_NULL, related_name='pickup_point' )
    dropOff = models.ForeignKey(Point, null=True, blank=True, on_delete=models.SET_NULL, related_name='dropoff_point' )
    code = models.CharField(max_length=6)

    driver = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='driven_rides' )
    passenger = models.ForeignKey(User, on_delete=models.CASCADE, related_name='passenger_rides')
    
    eta = models.IntegerField(null=True, blank=True)
    PickupSec = models.FloatField(null=True, blank=True)
    TimeSec = models.FloatField(null=True, blank=True)
    speed = models.FloatField(null=True, blank=True)
    done = models.BooleanField(default=False)
    canceled = models.BooleanField(default=False)


    def __str__(self):
        if self.booked:
            return self.booked.strftime("%Y-%m-%d %H:%M:%S")
        return "Unbooked Trip"
