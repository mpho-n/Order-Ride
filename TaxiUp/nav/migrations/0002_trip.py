# Generated by Django 5.2 on 2025-04-18 05:25

import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('nav', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Trip',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('booked', models.DateTimeField()),
                ('pickedUp', models.DateTimeField(blank=True, null=True)),
                ('completed', models.DateTimeField(blank=True, null=True)),
                ('pickUp', models.CharField(max_length=21, validators=[django.core.validators.MinLengthValidator(19)])),
                ('dropOff', models.CharField(max_length=21, validators=[django.core.validators.MinLengthValidator(19)])),
                ('code', models.CharField(max_length=6)),
                ('PickupSec', models.FloatField(blank=True, null=True)),
                ('TimeSec', models.FloatField(blank=True, null=True)),
                ('speed', models.FloatField(blank=True, null=True)),
                ('driver', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='driven_rides', to=settings.AUTH_USER_MODEL)),
                ('passenger', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='passenger_rides', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
