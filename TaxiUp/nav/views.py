from django.shortcuts import render, redirect
import math
from .models import Point
from django.contrib.auth import authenticate, login

# Create your views here.




def displacement(p1,p2):
    return math.sqrt((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2)*100




def main(request):
    if request.user.is_authenticated:
        places = Point.objects.all()
        return render(request, 'nav/index.html', {"places":places})
    else:
        return redirect('login')

def filterMain(request):
    if request.user.is_authenticated:
        places = Point.objects.filter(name=request.GET.get("filter"))
        return render(request, 'nav/index.html', {"places":places})
    else:
        return redirect('login')



def page(request):
    return render(request, 'nav/page.html')

def place(request):
    pointID = int(request.GET.get("place"))
    latInit = float(request.GET.get('lat'))
    longInit = float(request.GET.get('long'))
    point = Point.objects.get(id=pointID)
    latFin = float(point.lat)
    longFin = float(point.long)

    rate = 5


    #disp = displacement([latInit,longInit],[latFin,longFin])
    disp = displacement([-25.7559255795962,28.228450561373222],[-25.75561636442707,28.225451851599328])
    cost = math.ceil(rate*disp)
    print(disp)
    print(cost)
    return render(request, 'nav/place.html')

