# Generated by Django 5.2 on 2025-07-07 13:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('nav', '0012_trip_vehicle'),
    ]

    operations = [
        migrations.AddField(
            model_name='trip',
            name='rideID',
            field=models.CharField(default='250707-00000', max_length=12),
        ),
    ]
