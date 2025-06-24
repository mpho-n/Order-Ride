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
        if request.user.is_staff:
            return driver(request)
        
        all = Point.objects.all()
        if request.method == 'GET':
            query = request.GET.get("search")
            if query:
                print('chack')
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
        query = request.GET.get("search")
        places = Point.objects.filter(Q(name__icontains=query) | Q(nicknames__icontains=query))
        return render(request, 'nav/index.html', {"places":places})
        #for place in places:
            #print(place.name)
    else:
        return redirect('login')



def page(request):
    return render(request, 'nav/page.html')

def place(request, place_id):
    pointID = place_id
    try:
        point = Point.objects.get(id=pointID)

        rate = 4

        try:
            latInit = float(request.GET.get("lat"))
            longInit = float(request.GET.get("long"))
        except (TypeError, ValueError):
            return JsonResponse({"locationError": 1})

        if (latInit==None or longInit==None):
            return JsonResponse({"locationError":1})

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
            "long":point.long,
            "locationError":0,

        }
        return JsonResponse(data)
    except point.DoesNotExist:
        return JsonResponse({"error":"Place not found"}, status=404)

def driver(request):
    if request.user.is_authenticated:
        if request.user.is_staff:
            return main(request)
    #now = datetime.now()
    #if request.method == 'GET':
    #    tripNo = int(request.GET.get("trip"))
    #    trip = Trip.objects.get(id=tripNo)

        dueTrips = Trip.objects.filter(done=False).exclude(booked__isnull=True)
        return render(request, 'nav/driver.html',{'trips':dueTrips})
    else:
        return redirect('login')

def book(request):
    if request.user.is_authenticated:
        if request.method == 'GET':
            rate = 0.35
            Code = genCode()
            pickup = nearest([float(request.GET.get("lat")),float(request.GET.get("long"))])
            displ = displacement([float(request.GET.get("lat")),float(request.GET.get("long"))],[Point.objects.get(id=pickup).lat,Point.objects.get(id=pickup).long])
            trip = Trip(pickUp=Point.objects.get(id=pickup), dropOff= Point.objects.get(id=request.GET.get("dest")),code=Code, passenger=request.user)
            trip.save()
            data ={
                "pickup": Point.objects.get(id=pickup).name,
                "dropoff": Point.objects.get(id=request.GET.get("dest")).name,
                "code":Code,
                "cost": math.ceil(rate*displ),
                "displacement": round(displ,3),
                "tripID": trip.id
                #"driver": 
            }
        return JsonResponse(data)
    else:
        return redirect('login')
    
def confirm(request):
    if request.user.is_authenticated:
        if request.method == 'GET':
            trip = Trip.objects.get(id=request.GET.get("id"))
            trip.booked = datetime.now()
            trip.save()

    data ={"success":True}
    return JsonResponse(data)   

def estimatedTime(lat,long,lat1,long1,tripID):
    trip = Trip.objects.get(id=tripID)
    displ=displacement([lat,long],[lat1,long1])
    eta= math.ceil(displ*3.5)
    trip.eta = eta
    trip.save()
    return eta

def cancelTrip(request):
    if request.user.is_authenticated:
        if request.method == 'GET':          
            trip = Trip.objects.get(id=request.GET.get("id"))
            trip.canceled = True
            trip.save

def tripUpdate(request):
    if request.user.is_authenticated:
        if request.method == 'GET':          
            trip = Trip.objects.get(id=request.GET.get("id"))
            trip.pickedUp = datetime.now()

            trip.save()

            if trip.pickedUp==None:
                latPoint=trip.pickUp.lat
                longPoint=trip.pickUp.long
            else:
                latPoint=trip.dropOff.lat
                longPoint=trip.dropOff.long

            lat=float(request.GET.get("lat"))
            long=float(request.GET.get("long"))
            time = estimatedTime(latPoint,longPoint,lat,long,request.GET.get("id"))

            if trip.done==True:
                sts=0
            elif trip.canceled==True:
                sts=10
            elif trip.driver is None: 
                sts=1
            else: sts=2
    return JsonResponse({'status':sts})

def tripStatus(request):
    if request.user.is_authenticated:
        if request.method == 'GET':          
            trip = Trip.objects.get(id=request.GET.get("id"))
            trip.pickedUp = datetime.now()

            trip.save()
            if trip.done:
                sts=0
            elif trip.canceled:
                sts=10
            elif trip.driver is None: 
                sts=1
            else: sts=2

            if trip.driver is None:
                drvr="Driver almost available"
                drvrid=0
                time = 10#math.ceil(4*estimatedTime(trip.pickUp.lat, trip.pickUp.long, trip.dropOff.lat, trip.dropOff.long, request.GET.get("id")))
                print(time)
            else:
                drvr=trip.driver.username
                drvrid=trip.driver.id
                time = trip.eta
            data ={
                "name" : drvr,
                "driverID" : drvrid,
                "eta": time,
                "status": sts,
            }
            return JsonResponse(data)

def pickedUp(request):
    if request.user.is_authenticated:
        if request.method == 'GET':          
            trip = Trip.objects.get(id=request.GET.get("id"))
            trip.pickedUp = datetime.now()
            trip.save()
            tripUpdate(request)
            
    data ={"success":True}
    return JsonResponse(data)


def tripOver(request):
    if request.user.is_authenticated:
        if request.method == 'GET':          
            trip = Trip.objects.get(id=request.GET.get("id"))
            trip.done = True
            trip.completed = datetime.now()
            trip.save()
            tripUpdate(request)

    print('done')
    data ={"success":True}
    return JsonResponse(data)


def getLat(ID):
    location = Point.objects.get(id=ID)
    return location.lat

def getLong(ID):
    location = Point.objects.get(id=ID)
    return location.long

def tripInfo(request):
    if request.user.is_authenticated:
        if request.method == 'GET':          
            trip = Trip.objects.get(id=request.GET.get("id"))
            dropoff = trip.dropOff
            data ={
                "pickup": str(trip.pickUp),
                "dropoff": str(trip.dropOff),
                "code":trip.code,
                "passenger": str(trip.passenger),
                "date": trip.booked.date(),
                "time":trip.booked.time(),
                "destLat": getLat(trip.dropOff.id),
                "destLong": getLong(trip.dropOff.id),
                "pickLat":getLat(trip.pickUp.id),
                "pickLong":getLong(trip.pickUp.id),
                "ID":trip.id,
            }
            trip.driver = request.user
            trip.save()
        return JsonResponse(data)
    else:
        return redirect('login')
    
def cancel(request):
    if request.user.is_authenticated:
        if request.method == 'GET':          
            trip = Trip.objects.get(id=request.GET.get("id"))
            #trip.delete()
            trip.done = True
            trip.save()
    print('canceled')
    data ={"success":True}
    return JsonResponse(data)

