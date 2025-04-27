from django.shortcuts import render, redirect
import math
from .models import Point, Trip
from django.contrib.auth import authenticate, login
from django.http import JsonResponse, HttpResponse
from datetime import datetime
from django.templatetags.static import static
import random, string

# Create your views here.




def displacement(p1,p2):
    return math.sqrt((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2)*100

def nearest(p1):
    all = Point.objects.all()
    dist = 1000
    num = 0
    for point in all:
        p2 = [point.lat,point.long]
        if displacement(p1,p2) < dist:
            dist = displacement(p1,p2)
            num = point.id
    return num

def genCode():
    pool = string.ascii_uppercase + string.digits
    code = ''.join(random.choice(pool) for _ in range(6))
    return code

def main(request):
    search = False
    if request.user.is_authenticated:
        all = Point.objects.all()
        if request.method == 'GET':
            query = request.GET.get("search")
            if query:
                places = Point.objects.filter(name__icontains=query)
                search = True
                out = ""
                for place in places:
                    #out += '<div id="{{place.id}}" class="place" style="background-image: url(\'{% static \'nav/images/\' %}{{ place.id }}.jpg\')">	<p id="{{place.name}}" > {{place.name}} </p> </div>'
                    image_url = static(f'nav/images/{place.id}.jpg')
                    out += f'<div id="{place.id}" class="place" style="background-image: url(\'{image_url}\')">'
                    out += f'<p id="{place.name}">{place.name}</p></div>'

                print(search)
                return HttpResponse(out, content_type='text/plain')
            else:
                search = False
                print(search)
                return render(request, 'nav/index.html', {"places":all, "all":all, "search":search})
        else:
                return render(request, 'nav/index.html', {"places":all, "all":all, "search":search})
    else:
        return redirect('login')

def filterMain(request):
    if request.user.is_authenticated:
        places = Point.objects.filter(name__icontains=request.GET.get("search"))
        return render(request, 'nav/index.html', {"places":places})
    for place in places:
        print(place.name)
    else:
        return redirect('login')



def page(request):
    return render(request, 'nav/page.html')

def place(request, place_id):
    pointID = place_id
    try:
        point = Point.objects.get(id=pointID)

        rate = 5

        latInit = float(request.GET.get("lat"))
        longInit = float(request.GET.get("long"))

        latFin = float(point.lat)
        longFin = float(point.long)

        disp = round(displacement([latInit,longInit],[latFin,longFin]),2)
        #disp = displacement([-25.7559255795962,28.228450561373222],[-25.75561636442707,28.225451851599328])
        cost = math.ceil(rate*disp)

        data = {
            "id":pointID,
            "name":point.name,
            "imageURl":'/static/nav/images/'+point.name+'.jpg',
            "displacement":disp,
            "cost":cost,
            "lat":point.lat,
            "long":point.long

        }
        return JsonResponse(data)
    except point.DoesNotExist:
        return JsonResponse({"error":"Place not found"}, status=404)

def driver(request):
    #now = datetime.now()
    #if request.method == 'GET':
    #    tripNo = int(request.GET.get("trip"))
    #    trip = Trip.objects.get(id=tripNo)

    dueTrips = Trip.objects.filter(done=False)
    return render(request, 'nav/driver.html',{'trips':dueTrips})

def book(request):
    if request.user.is_authenticated:
        if request.method == 'GET':
            Code = genCode()
            pickup = nearest([float(request.GET.get("lat")),float(request.GET.get("long"))])
            data ={
                "pickup": Point.objects.get(id=pickup).name,
                "dropoff": Point.objects.get(id=request.GET.get("dest")).name
            }
            trip = Trip(pickUp=Point.objects.get(id=pickup), dropOff= Point.objects.get(id=request.GET.get("dest")), booked=datetime.now(),code=Code, passenger=request.user)
            trip.save()
        return JsonResponse(data)
    else:
        return redirect('login')