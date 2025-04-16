from django.shortcuts import render
import math

# Create your views here.




def displacement(p1,p2):
    return math.sqrt((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2)


def main(request):
    return render(request, 'nav/main.html')

def page(request):
    return render(request, 'nav/page.html')

def place(request):
    return render(request, 'nav/place.html')