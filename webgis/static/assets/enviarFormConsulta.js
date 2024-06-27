var isConsulta = false;
var factoresConsulta = null

// Obtener el token CSRF del cookie
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Verificar si el nombre de la cookie coincide
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Configurar el token CSRF en la solicitud AJAX
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        // Verificar si la solicitud es segura (protegida por CSRF)
        if (!/^http:.*/.test(settings.url) && !/^https:.*/.test(settings.url)) {
            // Obtener el token CSRF del cookie
            var csrftoken = getCookie('csrftoken');
            // Configurar el encabezado X-CSRFToken con el valor del token CSRF
            xhr.setRequestHeader('X-CSRFToken', csrftoken);
        }
    }
});

$('#formularioConsulta').submit(function (event) {
    $('#searchSpinnerLoader').toggle()

    event.preventDefault(); // Evitar el envío del formulario por defecto
    // var formData = $(this).serialize(); // Serializar los datos del formulario
    // Obtener los datos del formulario
    var formData = {
        iDate: $('#initialDate').val(),
        fDate: $('#finalDate').val(),
        iHour: $('#lower').val(),
        fHour: $('#upper').val(),
        timeRange: $('#timeRange').val()
    };

    document.getElementById('searchInitialDate').innerHTML = formData.iDate;
    document.getElementById('searchFinalDate').innerHTML = formData.fDate;
    document.getElementById('searchHourRange').innerHTML = 'Entre las <b>' + formData.iHour + ' Hrs</b> y las <b>' + formData.fHour +' Hrs</b>.' ;
    document.getElementById('searchCurrentDate').textContent = new Date().toLocaleDateString();
    
    // Enviar los datos al servidor
    $.ajax({
        url: '/webGisApi/filterGeoTimeStampApi/', // URL de la vista en tu aplicación Django
        type: 'POST', // Método de la solicitud (POST)
        data: formData, // Datos del formulario
        success: function (response) {actualizarValoresConsulta(response)},
        error: function (xhr, status, error) {
            // Manejar errores de la solicitud
            console.error('Error en la solicitud:', error);
            // Mostrar un mensaje de error al usuario, si es necesario
        }
    });

    setTimeout(() => {
        $('#searchSpinnerLoader').toggle()
        $('#searchInfo').toggle()
        $('#search-submit-btn').toggle()
        document.getElementById('mapIndicator').innerHTML = '<b>Mapa desplegado:</b> <em>Información consulta año 2019</em>'
    }, 2000);
    isConsulta = true;
});

function actualizarValoresConsulta(response) {
    // Actualizar mapa a la consulta del usuario
    // console.log('Respuesta del servidor:', response);
    factoresConsulta = {
        autopista: response['Autopista'],
        principal: response['Arteria Ppal'],
        menor: response['Arteria menor'],
        colectora: response['Colectora'],
        servicio: response['Servicio']
    }
    for (let i = 0; i < baseMap.features.length; i++) {
        baseMap.features[i].properties.sumTotal = 10 * Math.log10(response['Autopista'] * baseMap.features[i].properties.autopista + response['Arteria Ppal'] * baseMap.features[i].properties.principal + response['Arteria menor'] * baseMap.features[i].properties.menor + response['Colectora'] * baseMap.features[i].properties.colectora + response['Servicio'] * baseMap.features[i].properties.servicio)
    }
    map.getSource("mapEngine").setData(baseMap);
}

function newSearch () {
    $('#searchInfo').toggle()
    $('#search-submit-btn').toggle()
}

var newSearchBtn = document.getElementById('newSearch')
newSearchBtn.addEventListener('click', newSearch);