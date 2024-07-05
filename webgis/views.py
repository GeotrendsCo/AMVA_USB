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
        with open('AMVA_USB/webgis/static/assets/AMVA.json', 'r') as f:
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

            geoJson = pd.read_csv('AMVA_USB/webgis/static/assets/factorModificacion.csv')
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


# |||||||||||||||||||||| Generación de reporte |||||||||||||||||||||||||

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from datetime import datetime
from reportlab.lib.colors import black, white, gray
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.lib import colors
import geopandas as gpd
import matplotlib.pyplot as plt
import contextily as cx
import matplotlib.colors as mcolors
import matplotlib.cm as cm
from io import BytesIO

def add_header_footer(canvas, doc):
        width, height = letter
        canvas.saveState()
        add_header(canvas, width, height)
        add_footer(canvas, width, height)
        canvas.restoreState()

def add_header(c, width, height):
    # Dibujar un rectángulo blanco para el encabezado
    c.setFillColor(colors.white)
    c.rect(0, height - 80, width, 80, fill=1, stroke=0)

    # Añadir el box-shadow
    c.setFillColor(colors.gray)
    c.rect(0, height - 82, width, 2, fill=1, stroke=0)

    # Añadir el logo en el lado izquierdo con tamaño automático
    logo_path = 'webgis/static/img/logo.png'
    logo = ImageReader(logo_path)
    img_width, img_height = logo.getSize()

    # Definir el nuevo tamaño manteniendo la relación de aspecto
    aspect_ratio = img_width / img_height
    new_height = 60
    new_width = new_height * aspect_ratio

    c.drawImage(logo, 10, height - 70, width=new_width, height=new_height, mask='auto')

    # Añadir el texto en el lado derecho
    c.setFillColor(black)
    c.setFont('Helvetica-Bold', 11)
    current_date = datetime.now().strftime('%Y-%m-%d')
    c.drawRightString(width - 10, height - 50, f'Reporte generado el {current_date}')

def add_footer(c, width, height):
    footer_text = f"© {datetime.now().strftime('%Y')} Copyright Área Metropolitana del Valle de Aburrá y Universidad de San Buenaventura Medellín. Todos los derechos reservados."
    c.setFillColor(colors.black)
    c.setFont('Helvetica', 8)
    c.drawCentredString(width / 2, 30, footer_text)

def getColor(d):
    return (
        '#000078' if d >= 80 else
        '#00c5ff' if d >= 75 else
        '#ff00ff' if d >= 70 else
        '#ff1111' if d >= 65 else
        '#ff7777' if d >= 60 else
        '#ffaa00' if d >= 55 else
        '#ffcd69' if d >= 50 else
        '#ffff02' if d >= 45 else
        '#007800' if d >= 40 else
        '#c3ff86' if d >= 35 else
        'none'
    )

# Función para convertir texto en Paragraph para manejar word wrap
def create_paragraph(text):
    style = getSampleStyleSheet()['BodyText']
    return Paragraph(text, style)

def text_factorVial (factor):
    factor = (factor - 1) * 100.001
    factor = int(factor)
    return (
        f'{np.abs(factor)}% aumento del flujo vehícular' if factor > 0 else
        f'{np.abs(factor)}% reducción del flujo vehícular' if factor < 0 else
        'Sin variación de flujo'
    )

def texto_timeRange(rango):
    return (
        'Diurno' if rango == 1 else
        'Nocturno' if rango == 2 else
        'Personalizado'
    )

def generateReport(request):
    if request.method == 'POST':
        try:
            body_unicode = request.body.decode('utf-8')
            print('prier body')
            print(body_unicode)
            body_data = json.loads(body_unicode)
            print('segundo body')
            print(body_data)

            puntosGeoJson = body_data.get('puntos')
            polygonVertices = body_data.get('polygon')

            gdf = gpd.GeoDataFrame.from_features(puntosGeoJson['features'], crs="epsg:4326")
            gdf['color'] = gdf['sumTotal'].apply(getColor)

            # Crear un buffer para la imagen del gráfico
            img_buffer = BytesIO()

            plt.switch_backend('Agg')
            fig, ax = plt.subplots(figsize=(5, 5))
            gdf.plot(ax=ax, color=gdf['color'], ec='none', markersize=10, alpha=1)
            cx.add_basemap(ax, crs=gdf.crs)

            # Crear un mapa de colores para la barra de colores
            cmap = mcolors.ListedColormap([
                '#c3ff86', '#007800', '#ffff02', '#ffcd69', '#ffaa00', 
                '#ff7777', '#ff1111', '#ff00ff', '#00c5ff', '#000078'
            ])
            norm = mcolors.BoundaryNorm([35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85], cmap.N)
            sm = cm.ScalarMappable(cmap=cmap, norm=norm)
            sm.set_array([])

            cbar = fig.colorbar(sm, ax=ax, orientation='horizontal', fraction=0.05, pad=0.15)
            cbar.set_label('Nivel de Presión Sonora LAeq (dB)')

            plt.title("Mapa Ruido AMVA 2022")
            plt.xlabel("Longitud")
            plt.ylabel("Latitud")
            fig.tight_layout()
            plt.savefig(img_buffer, format='png')
            plt.close(fig)

            img_buffer.seek(0)

            buffer = BytesIO()
            
            pdf_file = buffer
            left_margin = 40
            right_margin = 40
            top_margin = 100
            bottom_margin = 40
            
            doc = SimpleDocTemplate(pdf_file, pagesize=letter,
                                    leftMargin=left_margin, rightMargin=right_margin,
                                    topMargin=top_margin, bottomMargin=bottom_margin)
            
            elements = []

            # Estilos
            styles = getSampleStyleSheet()
            estilo_titulo = styles['Heading2']
            estilo_normal = styles['Normal']

            # Añadir espaciador para separar el encabezado del contenido
            elements.append(Spacer(1, 12))  # Ajusta según sea necesario

            # Título
            titulo_texto = "LÍNEA BASE DE CONSULTA (MAPA DE RUIDO AÑO BASE 2022)"
            titulo_parrafo = Paragraph(titulo_texto, estilo_titulo)
            elements.append(titulo_parrafo)
            elements.append(Spacer(1, 12))
            # Texto normal
            texto_normal = "Los mapas de ruido ambiental permiten visualizar el comportamiento de los niveles de ruido y comprender su comportamiento en una zona específica. Este mapa muestra el aporte del tráfico rodado, la industria, sistema férreo y aeropuerto."
            
            texto_parrafo = Paragraph(texto_normal, estilo_normal)
            elements.append(texto_parrafo)

            # Espacio adicional
            elements.append(Spacer(1, 12))

            # Información en forma de tabla
            info_data = [
                ['Fuente de información:', 'Área Metropolitana del Valle de Aburrá - Mapa de ruido ambiental año base 2022'],
                ['Fecha de publicación del mapa de ruido:', 'Diciembre de 2023'],
                ['Fecha de consulta:', datetime.now().strftime('%d/%m/%Y')]
            ]

            # Convertir datos a Paragraphs para manejar word wrap
            data_paragraphs = [[create_paragraph(cell) for cell in row] for row in info_data]

            # Estilo de la tabla
            table_style = TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('INNERGRID', (0, 0), (-1, -1), 0.25, colors.black),
                ('BOX', (0, 0), (-1, -1), 0.25, colors.black),
                ('WORDWRAP', (0, 0), (-1, -1)),
            ])

            # Crear la tabla 2
            tabla = Table(data_paragraphs, style=table_style)
            elements.append(tabla)

            elements.append(Spacer(1, 12))

            # Añadir el gráfico al PDF
            elements.append(Image(img_buffer, width=400, height=400))
            elements.append(Spacer(1, 12))

            # Información en forma de tabla            
            stringVertices = ""
            for coord in polygonVertices:
                stringVertices += f"{coord} "
            
            info_data = [
                ['Ítem', 'Descripción'],
                ['Coordenadas Geográficas:', stringVertices],
                ['Característica del flujo vehícular:', 'Sin variación de flujo']
            ]

            # Convertir datos a Paragraphs para manejar word wrap
            data_paragraphs = [[create_paragraph(cell) for cell in row] for row in info_data]

            # Estilo de la tabla
            table_style = TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('BACKGROUND', (0, 0), (-1, 0), colors.gray),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('INNERGRID', (0, 0), (-1, -1), 0.25, colors.black),
                ('BOX', (0, 0), (-1, -1), 0.25, colors.black),
                ('WORDWRAP', (1, 1), (-1, -1)),
            ])

            # Crear la tabla
            tabla = Table(data_paragraphs, style=table_style)
            elements.append(tabla)
            elements.append(Spacer(1, 12))

            elements.append(Paragraph("* El mapa de ruido con año base 2022 corresponde a la última actualización, que por norma debe hacerse cada cuatro (4) años.", estilo_normal))
            elements.append(Spacer(1, 12))

            if body_data.get('factoresAforo') != None:
                factoresAforo = body_data.get('factoresAforo')

                elements.append(Paragraph("MAPA DE RUIDO CON VARIACIÓN DE CONDICIONES DE FLUJO VEHICULAR SEGÚN TIPOLOGÍA DE VÍAS", estilo_titulo))
                elements.append(Spacer(1, 12))

                elements.append(Paragraph("Este mapa representa las variaciones en los niveles de ruido del polígono seleccionado, con base en las modificaciones del flujo vehicular para las diferentes tipologías de vías.", estilo_normal))
                elements.append(Spacer(1, 12))

                gdf_scaled = gdf.copy()
                gdf_scaled['sumTotal'] = 10 * np.log10(factoresAforo['autopista'] * gdf_scaled['autopista'] + factoresAforo['principal'] * gdf_scaled['principal'] + factoresAforo['menor'] * gdf_scaled['menor'] + factoresAforo['colectora'] * gdf_scaled['colectora'] + factoresAforo['servicio'] * gdf_scaled['servicio'])
                gdf_scaled['color'] = gdf_scaled['sumTotal'].apply(getColor)

                # Crear un buffer para la imagen del gráfico
                img_buffer = BytesIO()

                plt.switch_backend('Agg')
                fig, ax = plt.subplots(figsize=(5, 5))
                gdf_scaled.plot(ax=ax, fc=gdf_scaled['color'], ec='none', markersize=10)
                cx.add_basemap(ax, crs=gdf_scaled.crs)

                cbar = fig.colorbar(sm, ax=ax, orientation='horizontal', fraction=0.05, pad=0.15)
                cbar.set_label('Nivel de Presión Sonora LAeq (dB)')

                plt.title("Mapa Ruido AMVA 2022 - Modificación Aforo")
                plt.xlabel("Longitud")
                plt.ylabel("Latitud")
                fig.tight_layout()
                plt.savefig(img_buffer, format='png')
                plt.close(fig)

                img_buffer.seek(0)

                # Añadir el gráfico al PDF
                elements.append(Image(img_buffer, width=400, height=400))
                elements.append(Spacer(1, 12))

                info_data = [
                ['Tipología de vía', 'Descripción'],
                ['Autopista', text_factorVial(factoresAforo['autopista'])],
                ['Arteria Principal:', text_factorVial(factoresAforo['principal'])],
                ['Arteria menor:', text_factorVial(factoresAforo['menor'])],
                ['Colectora:', text_factorVial(factoresAforo['colectora'])],
                ['Servicio:', text_factorVial(factoresAforo['servicio'])],
                ]

                # Convertir datos a Paragraphs para manejar word wrap
                data_paragraphs = [[create_paragraph(cell) for cell in row] for row in info_data]
                tabla = Table(data_paragraphs, style=table_style)
                elements.append(tabla)
                elements.append(Spacer(1, 12))

            if body_data.get('consulta') != None:
                # Extraer los datos del cuerpo de la solicitud
                consulta = body_data.get('consulta')
                startDate = consulta['iDate']
                finalDate = consulta['fDate']
                startHour = consulta['iHour']
                finalHour = consulta['fHour']
                timeRange = int(consulta['timeRange'])
                
                elements.append(Paragraph("INFORMACIÓN DE CONSULTA DE REGISTRO HISTÓRICO", estilo_titulo))
                elements.append(Spacer(1, 12))

                elements.append(Paragraph("Este mapa muestra la información correpondiente a reportes de aforo del proyecto CITRA, según los parámetros de consulta configurados.", estilo_normal))
                elements.append(Spacer(1, 12))

                gdf_scaled = gdf.copy()
                gdf_scaled['sumTotal'] = 10 * np.log10(consulta['factores']['autopista'] * gdf_scaled['autopista'] + consulta['factores']['principal'] * gdf_scaled['principal'] + consulta['factores']['menor'] * gdf_scaled['menor'] + consulta['factores']['colectora'] * gdf_scaled['colectora'] + consulta['factores']['servicio'] * gdf_scaled['servicio'])
                gdf_scaled['color'] = gdf_scaled['sumTotal'].apply(getColor)

                # Crear un buffer para la imagen del gráfico
                img_buffer = BytesIO()

                plt.switch_backend('Agg')
                fig, ax = plt.subplots(figsize=(5, 5))
                gdf_scaled.plot(ax=ax, fc=gdf_scaled['color'], ec='none', markersize=10)
                cx.add_basemap(ax, crs=gdf_scaled.crs)

                cbar = fig.colorbar(sm, ax=ax, orientation='horizontal', fraction=0.05, pad=0.15)
                cbar.set_label('Nivel de Presión Sonora LAeq (dB)')

                plt.title("Registro histórico (2019) - Modificación Aforo")
                plt.xlabel("Longitud")
                plt.ylabel("Latitud")
                fig.tight_layout()
                plt.savefig(img_buffer, format='png')
                plt.close(fig)

                img_buffer.seek(0)

                # Añadir el gráfico al PDF
                elements.append(Image(img_buffer, width=400, height=400))
                elements.append(Spacer(1, 12))

                info_data = [
                ['Parámetro de consulta', 'Descripción'],
                ['Fecha inicial:', startDate],
                ['Fecha final:', finalDate],
                ['Hora inicial:', startHour if timeRange != 2 else finalHour],
                ['Hora final:', finalHour if timeRange != 2 else startHour],
                ['Rango horario (R-0627 Ruido):', texto_timeRange(timeRange)],
                ['Autopista', text_factorVial(consulta['factores']['autopista'])],
                ['Arteria Principal:', text_factorVial(consulta['factores']['principal'])],
                ['Arteria menor:', text_factorVial(consulta['factores']['menor'])],
                ['Colectora:', text_factorVial(consulta['factores']['colectora'])],
                ['Servicio:', text_factorVial(consulta['factores']['servicio'])],
                ]

                # Convertir datos a Paragraphs para manejar word wrap
                data_paragraphs = [[create_paragraph(cell) for cell in row] for row in info_data]
                tabla = Table(data_paragraphs, style=table_style)
                elements.append(tabla)
                elements.append(Spacer(1, 12))

                elements.append(Paragraph("* En este momento la información de consulta corresponde al año 2019.", estilo_normal))
                elements.append(Spacer(1, 12))

            # Agregar un salto de página (opcional)
            # elements.append(PageBreak())

            # Construir el PDF
            doc.build(elements, onFirstPage=add_header_footer, onLaterPages=add_header_footer)

            buffer.seek(0)

            response = HttpResponse(content_type='application/pdf')
            # response['Content-Disposition'] = 'inline; filename="reporte.pdf"'
            response['Content-Disposition'] = 'attachment; filename="reporte.pdf"'

            return response
        
        except:
            return JsonResponse({
                'success': 0,
                'error': 'Problema con la generación de PDF'
            })
    else: 
        return JsonResponse({
            'success': 0,
            'error': 'Se esperaba una solicitud POST'
        })

