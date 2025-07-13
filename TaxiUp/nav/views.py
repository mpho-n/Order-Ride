from django.shortcuts import render, redirect
import math
from .models import Point, Trip, Vehicle
from django.contrib.auth import authenticate, login
from django.http import JsonResponse, HttpResponse
from datetime import datetime
from django.templatetags.static import static
import random, string
from django.utils import timezone
from collections import defaultdict


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

def genUniqueCode():
    today = timezone.now().date()
    count = Trip.objects.filter(created_at__date=today).count() +1
    dateStr = timezone.now().date().strftime('%y%m%d')
    index_str = str(count).zfill(5)
    return f"{dateStr}-{index_str}"


def main(request):
    search = False
    if request.user.is_authenticated:
        if not request.user.is_staff:
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


def tripsOfCode(rideID):
    trips = Trip.objects.filter(rideID=rideID, done=False)
    return list(trips)


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
        if not request.user.is_staff:
            return main(request)
    #now = datetime.now()
    #if request.method == 'GET':
    #    tripNo = int(request.GET.get("trip"))
    #    trip = Trip.objects.get(id=tripNo)
        vehicle = getattr(request.user, 'vehicle_driver', None)

        if vehicle == None:
            vehicles = Vehicle.objects.all()
            return render(request, 'nav/vehicle.html',{'vehicles':vehicles})

        dueTrips = Trip.objects.filter(done=False).exclude(booked__isnull=True).order_by('-booked')
        #bellow was an attempt to order trips 
        '''
        grouped = defaultdict(list)
        for trip in dueTrips:
            key = (trip.pickUp_id, trip.dropOff_id)
            grouped[key].append(trip)

        grouped_trips = list(grouped.values())
        flat_trips = []
        for group in grouped.values():
            flat_trips.extend(group)'''

        return render(request, 'nav/driver.html',{'trips':dueTrips})
    else:
        return redirect('login')
    

def vehicleLog(request, vehicleID):
    vehicle = Vehicle.objects.get(id=vehicleID)
    vehicle.driver = request.user
    vehicle.save()
    return driver(request)

def checkCurr(pickup, dropoff):
    result = -1
    todayTrips = Trip.objects.filter(booked=timezone.now().date())
    for trip in todayTrips:
        if ((trip.booked != None)and(trip.pickUp.id == pickup)and(trip.dropOff.id==dropoff)and(trip.pickedUp==False)and(trip.done==False)and(trip.canceled==False)and(trip.driver==None)):
            result = trip.rideID
            return result
            break
    return result


def book(request):
    if request.user.is_authenticated:
        if request.method == 'GET':
            rate = 0.35
            Code = genCode()
            pickup = nearest([float(request.GET.get("lat")),float(request.GET.get("long"))])
            dropoff = request.GET.get("dest")
            displ = displacement([float(request.GET.get("lat")),float(request.GET.get("long"))],[Point.objects.get(id=pickup).lat,Point.objects.get(id=pickup).long])
            current = checkCurr(pickup,dropoff)

            if current=="none":
                idCode = genUniqueCode()
            else: idCode=current

            trip = Trip(pickUp=Point.objects.get(id=pickup), dropOff= Point.objects.get(id=dropoff),code=Code, passenger=request.user, rideID=idCode)
            trip.save()
            data ={
                "pickup": Point.objects.get(id=pickup).name,
                "pickupID": pickup,
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
            #trips = Trip.objects.filter(rideID=request.GET.get("id"))
            trips = tripsOfCode(request.GET.get("id"))
            data ={"success":True,
                    "finished":False}
            allTrips = tripsOfCode(request.GET.get("id"))
            if len(allTrips)==0:
                data.update({"finished":True})
            else:
                names_string = ", ".join(trip.passenger.username for trip in allTrips)
                codes_string = ", ".join(trip.code for trip in allTrips)
                data.update({"names":names_string,
                              "codes":codes_string})

            for trip in trips:
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
                time = estimatedTime(latPoint,longPoint,lat,long,trip.id)

                if trip.done==True:
                    sts=0
                elif trip.canceled==True:
                    sts=10
                elif trip.driver is None: 
                    sts=1
                else: sts=2

            if len(allTrips)==0:
                sts=0
            elif allTrips[0].driver is None: 
                sts=1
            else: sts=2

            data.update({"status":sts})
    return JsonResponse(data)

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
            #trip = Trip.objects.get(id=request.GET.get("id"))
            trips = tripsOfCode(request.GET.get("id"))
            for trip in trips:
                trip.pickedUp = datetime.now()
                trip.save()
            tripUpdate(request)
            
    data ={"success":True}
    return JsonResponse(data)


def tripOver(request):
    if request.user.is_authenticated:
        if request.method == 'GET':          
            trip = Trip.objects.get(id=request.GET.get("id"))
            #trips = tripsOfCode(request.GET.get("tripID"))
            #for trip in trips:
            trip.done = True
            trip.completed = datetime.now()
            trip.save()
            tripUpdate(request)

    print('done')
    data ={"success":True,
           "finished":False}
    allTrips = tripsOfCode(request.GET.get("tripID"))
    if len(allTrips)==0:
        data.update({"finished":True})
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
            passengers = 1
            vehicle = Vehicle.objects.filter(driver=request.user).first()
            if not vehicle:
                pass
            else:
                if vehicle.seats >= 1:
                    trip = Trip.objects.get(id=request.GET.get("id")) #make it trips
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
                        "passengers":1,
                        "rideID":trip.rideID,
                    }
                    trip.driver = request.user
                    trip.save()
                if vehicle.seats>= 2:
                    if checkCurr(trip.pickUp,trip.dropOff)!=-1:
                        trip = Trip.objects.get(id=checkCurr(trip.pickUp,trip.dropOff)) #make it trips
                        dropoff = trip.dropOff
                        data.update({
                            "pickup1": str(trip.pickUp),
                            "dropoff1": str(trip.dropOff),
                            "code1":trip.code,
                            "passenger1": str(trip.passenger),
                            "date1": trip.booked.date(),
                            "time1":trip.booked.time(),
                            "destLat1": getLat(trip.dropOff.id),
                            "destLong1": getLong(trip.dropOff.id),
                            "pickLat1":getLat(trip.pickUp.id),
                            "pickLong1":getLong(trip.pickUp.id),
                            "ID1":trip.id,
                            "passengers":2,
                        })
                        trip.driver = request.user
                        trip.save()
                    else: 
                        return JsonResponse(data)
                if vehicle.seats>= 3:
                    if checkCurr(trip.pickUp,trip.dropOff)!=-1:
                        trip = Trip.objects.get(id=checkCurr(trip.pickUp,trip.dropOff)) #make it trips
                        dropoff = trip.dropOff
                        data.update({
                            "pickup2": str(trip.pickUp),
                            "dropoff2": str(trip.dropOff),
                            "code2":trip.code,
                            "passenger2": str(trip.passenger),
                            "date2": trip.booked.date(),
                            "time2":trip.booked.time(),
                            "destLat2": getLat(trip.dropOff.id),
                            "destLong2": getLong(trip.dropOff.id),
                            "pickLat2":getLat(trip.pickUp.id),
                            "pickLong2":getLong(trip.pickUp.id),
                            "ID2":trip.id,
                            "passengers":3,
                        })
                        trip.driver = request.user
                        trip.save()
                    else: 
                        return JsonResponse(data)
                if vehicle.seats>= 4:
                    if checkCurr(trip.pickUp,trip.dropOff)!=-1:
                        trip = Trip.objects.get(id=checkCurr(trip.pickUp,trip.dropOff)) #make it trips
                        dropoff = trip.dropOff
                        data.update({
                            "pickup3": str(trip.pickUp),
                            "dropoff3": str(trip.dropOff),
                            "code3":trip.code,
                            "passenger3": str(trip.passenger),
                            "date3": trip.booked.date(),
                            "time3":trip.booked.time(),
                            "destLat3": getLat(trip.dropOff.id),
                            "destLong3": getLong(trip.dropOff.id),
                            "pickLat3":getLat(trip.pickUp.id),
                            "pickLong3":getLong(trip.pickUp.id),
                            "ID3":trip.id,
                            "passengers":4,
                        })
                        trip.driver = request.user
                        trip.save()
                    else: 
                        return JsonResponse(data)

                    
        return JsonResponse(data)
    else:
        return redirect('login')
    
def cancel(request):
    if request.user.is_authenticated:
        if request.method == 'GET':          
            trip = Trip.objects.get(id=request.GET.get("id"))
            #trip.delete()
            trip.canceled = True
            trip.save()
    print('canceled')
    data ={"success":True,
           "finished":False}
    allTrips = tripsOfCode(request.GET.get("tripID"))
    if len(allTrips)==0:
        data.update({"finished":True})
    return JsonResponse(data)

