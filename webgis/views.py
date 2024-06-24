from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User 
from django.contrib.auth.decorators import login_required
from crud.models import Profile, Registration
import secrets
from datetime import datetime, timedelta
import json
from django.http import JsonResponse
import pandas as pd
import numpy as np

# 
# from weasyprint import default_url_fetcher, HTML, CSS
from django.template.loader import render_to_string
# from weasyprint.text.fonts import FontConfiguration
from webgisApp.settings import BASE_DIR
from django.http import HttpResponse
from django.conf import settings
import os

# Create your views here.
@login_required(login_url="../../crudSystem/login/")
def tableroBiView(request):
    if request.user.profile.usercode:
        return render(request, 'tableroBI.html', {
            'viewSwitch': False
        })
    else:
        return redirect("../../crudSystem/login/")

@login_required(login_url="../../crudSystem/login/")
def backOffice (request):
    if request.method == 'POST':
        email = request.POST['newUserEmail']
        days = int(request.POST['registerExpirationDays'])
        users = User.objects.all()
        registration_link, expiration_date = send_registration_link_with_code(email, days)
        return render(request, 'userManagement.html', {
            'users': users,
            'displayTemporalRegisterLink': registration_link,
            'emailRegister': email,
            'expirationTime': expiration_date,
            'generarCodigo': True
            })
    else:
        users = User.objects.all()
        return render(request, 'userManagement.html', 
                    {'users': users,'generarCodigo': False})

@login_required(login_url="../../crudSystem/login/")
def userActivate (request, username):
    u = User.objects.get(username = username).pk
    prof = Profile.objects.filter(user = u)

    if prof.get(user = u).usercode:
        prof.update(usercode = False)
    else:
        prof.update(usercode = True)  
    return redirect('backOffice') 

@login_required(login_url="../../crudSystem/login/")
def userDelete (request, username):
    user = User.objects.get(username = username)
    user.delete()
    return redirect('backOffice')

def userEdit (request):
    if request.method == 'GET':
        return render(request, 'userEdit.html')
    else:
        user = User.objects.filter(username = request.user.username)
        userpk = User.objects.get(username = request.user.username).pk
        profile = Profile.objects.filter(user = userpk)
        user.update(
            email = request.POST['email']
        )
        profile.update(
            entity = request.POST['entity'],
            country = request.POST['country'],
            city = request.POST['city']
        )
        password_user = User.objects.get(username = request.user.username)
        if request.POST['old_password']:
            if password_user.check_password(request.POST['old_password']):
                if request.POST['password'] == request.POST['verify_password'] and request.POST['password']:
                    password_user.set_password(request.POST['password'])
                    password_user.save()
                    return redirect('/crudSystem/login')
                else:
                    return HttpResponse("Contraseñas no coinciden")
            else:
                return HttpResponse("Contraseña vieja no coincide")
        return HttpResponse(request.user.profile.entity)

def userLogout (request):
    logout(request)
    return redirect('/')

def report(request):
    context = {"name": "Area Metropolitana del Valle de Aburra"}
    html = render_to_string('informe.html', context)
    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = "inline; report.pdf"
    # font_config = FontConfiguration()
    # HTML(string=html, base_url=request.build_absolute_uri()).write_pdf(response, font_config=font_config)
    return response

# ====== VISTAS CUSTOM USERS PERMISSIONS ===============

def apiHomeView(request):
    if request.method == "GET":
        if request.user.is_authenticated and request.user.profile.usercode:
            if request.user.is_staff: return render(request, 'apiHomeSuper.html', {'viewSwitch': True,'title': 'Geo portal'})
            else: return render(request, 'apiHomeUser.html', {'viewSwitch': True,'title': 'Geo portal'})
        else: return render(request, 'apiHomeBasic.html', {'title': 'Geo portal'})

def generate_secret_code():
    return secrets.token_urlsafe(16)

def generate_registration_link(secret_code):
    return f'{secret_code}'

def send_registration_link_with_code(email, days):

    secret_code = generate_secret_code()
    expiration_date = datetime.now() + timedelta(days=days)
    try:
        registration = Registration.objects.get(email=email)
        registration.secret_code = secret_code
        registration.save()
    except:
        # Crear un objeto de Registration con el código secreto y la dirección de correo electrónico
        registration = Registration.objects.create(email=email, secret_code=secret_code, expiration_date=expiration_date)
    # Generar el enlace único
    registration_link = generate_registration_link(secret_code)

    return registration_link, expiration_date


# Filtro de puntos en polígono seleccionado por el usuario
def puntoEnPoligono(punto, vertices):
    x = punto[0]
    y = punto[1]
    dentro = False

    for i in range(len(vertices)):
        j = len(vertices) - 1 if i == 0 else i - 1
        xi, yi = vertices[i]
        xj, yj = vertices[j]

        intersecta = ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
        if intersecta:
            dentro = not dentro

    return dentro

def filtrarPuntosEnPoligono(geojson, vertices):
    puntos_filtrados = []

    for feature in geojson['features']:
        if feature.get('geometry') and feature['geometry'].get('coordinates'):
            punto = feature['geometry']['coordinates']
            if puntoEnPoligono(punto, vertices):
                puntos_filtrados.append(feature)

    return {
        "type": "FeatureCollection",
        "features": puntos_filtrados
    }

# Vista en Django para manejar la solicitud GET
def filtrarPuntos(request):
    if request.method == 'GET':
        # Obtener los vértices del polígono de los parámetros GET
        vertices_json = request.GET.get('vertices')
        vertices = json.loads(vertices_json)

        # Cargar el archivo GeoJSON
        with open('webgis/static/assets/AMVA.json', 'r') as f:
            geojson = json.load(f)

        # Filtrar los puntos en el polígono
        puntos_filtrados = filtrarPuntosEnPoligono(geojson, vertices)

        # Devolver el JSON filtrado como respuesta
        return JsonResponse(puntos_filtrados)
    else:
        return JsonResponse({'error': 'Se esperaba una solicitud GET'})


# def filterGeoTimeStamp (geoJson,startDate, finalDate, startHour, finalHour, diurnoNocturno=False, typeLabel='Diurno'):
def filterGeoTimeStamp (request):
    try:
        if request.method == 'POST':
        # Obtener los datos del formulario
            startDate = request.POST.get('iDate')
            finalDate = request.POST.get('fDate')
            startHour = int(request.POST.get('iHour'))
            finalHour = int(request.POST.get('fHour'))
            timeRange = int(request.POST.get('timeRange'))

            geoJson = pd.read_csv('webgis/static/assets/factorModificacion.csv')
            geoJson['timeStamp'] = pd.to_datetime(geoJson['timeStamp'])

            startDateFil = pd.to_datetime(startDate)
            finalDateFil = pd.to_datetime(finalDate)

            if timeRange == 1 or timeRange == 2:
                if timeRange==1: 
                    startHourFil, finalHourFil = 7,21
                    factorModificacionFiltered = geoJson[(geoJson['timeStamp'].dt.date >= startDateFil.date()) & ((geoJson['timeStamp'].dt.date <= finalDateFil.date()))]
                    factorModificacionFiltered = factorModificacionFiltered[(factorModificacionFiltered['timeStamp'].dt.hour >= startHourFil) & (factorModificacionFiltered['timeStamp'].dt.hour < finalHourFil)]
                if timeRange==2: 
                    startHourFil, finalHourFil = 7,21
                    factorModificacionFiltered = geoJson[(geoJson['timeStamp'].dt.date >= startDateFil.date()) & ((geoJson['timeStamp'].dt.date <= finalDateFil.date()))]
                    factorModificacionFiltered = factorModificacionFiltered[~((factorModificacionFiltered['timeStamp'].dt.hour >= startHourFil) & (factorModificacionFiltered['timeStamp'].dt.hour < finalHourFil))]
            else:
                startHourFil, finalHourFil = startHour,finalHour
                factorModificacionFiltered = geoJson[(geoJson['timeStamp'].dt.date >= startDateFil.date()) & ((geoJson['timeStamp'].dt.date <= finalDateFil.date()))]
                factorModificacionFiltered = factorModificacionFiltered[(factorModificacionFiltered['timeStamp'].dt.hour >= startHourFil) & (factorModificacionFiltered['timeStamp'].dt.hour < finalHourFil)]
            outputFactorsJson = factorModificacionFiltered[['Arteria Ppal','Arteria menor', 'Autopista', 'Colectora', 'Servicio']].mean().to_json()
            return JsonResponse(json.loads(outputFactorsJson))
        else:
            return JsonResponse({'error': 'Se esperaba una solicitud GET'})
    except:
        return JsonResponse({'error': 'Error interno'})



