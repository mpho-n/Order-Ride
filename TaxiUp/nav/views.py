from django.shortcuts import render, redirect
import math
from .models import Point
from django.contrib.auth import authenticate, login

# Create your views here.




def displacement(p1,p2):
    return math.sqrt((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2)




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
    return render(request, 'nav/place.html')





def loginView(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('dashboard')
        else:
            return render(request, 'login.html', {'error': 'Invalid credentials'})
    
    return render(request, 'login.html')