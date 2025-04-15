from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator

# Create your models here.

class Point(models.Model):
    name = models.CharField(max_length=50)
    lat = models.FloatField()
    long = models.FloatField()
    full = models.CharField(max_length=21,validators=[MinLengthValidator(19)])

    def __str__(self):
        return self.name
