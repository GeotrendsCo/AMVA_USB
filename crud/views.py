from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from .models import Profile, Registration
from django.db import IntegrityError
import string
import random
from django.db.models.signals import post_save
from datetime import datetime, timedelta, timezone
# from django.http import HttpResponseRedirect

# Generate random code.
N = 7
code_r = ''.join(random.choices(string.ascii_lowercase + string.digits, k=N))


# Create your views here.
# def userList (request):
#     clients = userAttributes.objects.all()
#     return render(request, 'listUsers.html',
#                   {'clients': clients})

def userRegister(request):
    if request.method == 'GET':
        return render(request, 'register.html')
    if request.method == 'POST':
        # Verificar que exista el codigo secreto
        try:
            registration = Registration.objects.get(secret_code=request.POST['secret_code'], email=request.POST["email"])
        except Registration.DoesNotExist:
            return render(request, 'register.html', {
                        "error": "Código secreto no válido. No se puede completar el registro."
                    })

        # Verificar si el código secreto ha expirado
        if registration.expiration_date and datetime.now(timezone.utc) > registration.expiration_date:
            registration.delete()
            return render(request, 'register.html', {
                            "error": "El enlace de registro ha caducado. Solicite uno nuevo."
                        })
        
        if (request.POST["password"] == request.POST["verify_password"]) and (request.POST["email"] == request.POST["verify_email"]):
            try:
                user = User.objects.create_user(
                    username=request.POST['username'],
                    first_name=request.POST["first_name"],
                    last_name=request.POST["last_name"],
                    email=request.POST["email"],
                    password=request.POST['password'],
                )
            except IntegrityError:
                return render(request, 'register.html', {
                    "error": "Este usuario ya existe."
                })
            
            # actualizar el perfil automáticamente
            user.profile.country = request.POST['country']
            user.profile.entity = request.POST['entity']
            user.profile.city = request.POST['city']
            user.profile.save()

            # Eliminar la entrada de Registration después de que el usuario se haya registrado
            registration.delete()
            return redirect('apiHome')
        else:
            return render(request, 'register.html', {
                "error": "Usuario o contraseña no coinciden"
            })

    return HttpResponse("Don't create anithing.")

def recoverPassword(request):
    return render(request, 'recover.html')


def contactPage(request):
    return render(request, 'contact.html')


def successRegister(request):
    return render(request, 'success.html')


def userLogin(request):
    if request.method == 'GET':
        return render(request, 'login.html', {
            'title': 'Login',
        })
    else:
        user = authenticate(request,
                            username=request.POST['username'],
                            password=request.POST['password']
                            )

        if user is None:
            return render(request, 'login.html', {
                'userTrigger': 2,
                'userExists': 'Username or password is incorrect.'
            })
        else:
            login(request, user)
            return redirect('/webGisApi/apiHome/')
