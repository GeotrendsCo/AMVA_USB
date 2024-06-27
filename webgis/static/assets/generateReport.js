var generateReport = document.getElementById('generateReport')
generateReport.addEventListener('click', async (e) => {
    document.getElementById('spinLoaderId').style.display = 'block';
    var postData = {}

    try {
        if (isConsulta) {
            postData.consulta = {
                iDate: $('#initialDate').val(),
                fDate: $('#finalDate').val(),
                iHour: $('#lower').val(),
                fHour: $('#upper').val(),
                timeRange: $('#timeRange').val(),
                factores: factoresConsulta
            };
        }

        if (isAforo) {
            let factoresAforo = {
                principal: principalFactor,
                autopista: autopistaFactor,
                colectora: colectoraFactor,
                menor: menorFactor,
                servicio: servicioFactor
            };
            postData.factoresAforo = factoresAforo;
        }

        if (puntosFiltrados_deployMap) {
            postData.puntos = puntosFiltrados_deployMap;
            postData.polygon = polygonVertices_deployMap;
        }

        let response = await fetch('/AMVA_USB/webGisApi/report/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify(postData)
        });

        if (response.ok) {
            showPdf(response);
        } else {
            console.error('Error en la solicitud:', response.statusText);
        }
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
    }

    document.getElementById('spinLoaderId').style.display = 'none';
})

async function showPdf(response) {

    if (response.headers.get('Content-Type') !== 'application/pdf') {
        console.error('Error al obtener el PDF');
        return;
    }

    var blob = await response.blob();
    var pdfUrl = URL.createObjectURL(blob);
    window.open(pdfUrl, '_blank');
}

function getCsrfToken() {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, 10) === ('csrftoken=')) {
                cookieValue = decodeURIComponent(cookie.substring(10));
                break;
            }
        }
    }
    return cookieValue;
}