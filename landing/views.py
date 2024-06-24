from django.shortcuts import render
## Import pdf libraries
# from weasyprint import default_url_fetcher, HTML, CSS
# from django.template.loader import render_to_string
# from weasyprint.text.fonts import FontConfiguration
# from webgisApp.settings import BASE_DIR
# import os
# from django.http import HttpResponse


# Create your views here.

def landingView (request):
    return render(request, 'index.html')


# def informe(request):
#     context = {}
#     html = render_to_string('informe.html', context)
#     response = HttpResponse(content_type="application/pdf")
#     response["Content-Disposition"] = "inline; report.pdf"
#     font_config = FontConfiguration()
#     HTML(string=html).write_pdf(response, font_config=font_config)

#     return response



