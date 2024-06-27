let puntosFiltrados_deployMap = null
let polygonVertices_deployMap = null
// Obtener las coordenadas de los vértices del polígono
function getPolygonVertices() {
    // Obtener todas las capas dibujadas en el mapa
    var features = draw.getAll();

    // Filtrar solo las capas de tipo 'Polygon'
    var polygons = features.features.filter(function (feature) {
        return feature.geometry.type === 'Polygon';
    });

    // Obtener las coordenadas de los vértices de cada polígono
    var vertices = [];
    polygons.forEach(function (polygon) {
        polygon.geometry.coordinates[0].forEach(function (coordinate) {
            vertices.push(coordinate);
        });
    });

    polygonVertices_deployMap = vertices
    return vertices;
}

async function obtenerYProcesarPuntosFiltrados(vertices) {
    try {
        // Serializar los vértices a JSON
        var verticesJSON = JSON.stringify(vertices);

        // URL de la vista en Django
        var url = '/webGisApi/geoJsonFilterApi/';

        // Hacer la solicitud GET al view en Django y esperar a que se resuelva la promesa
        var response = await fetch(url + '?vertices=' + encodeURIComponent(verticesJSON));
        var data = await response.json();

        // Recibir el JSON filtrado como respuesta
        // console.log('Datos filtrados:', data);

        // Aquí puedes hacer algo con los datos filtrados, por ejemplo, asignarlos a una variable
        var puntosFiltrados = data;
        puntosFiltrados_deployMap = JSON.parse(JSON.stringify(puntosFiltrados))
        // Devolver los puntos filtrados
        return puntosFiltrados;
    } catch (error) {
        alert('Error al obtener y procesar los puntos filtrados:', error);
        // Manejar el error según sea necesario
    }
}

var customCalculateBtn = document.getElementById('custom-polyCalculate-btn');
const refPolygonArea = 10000 // Kilometros cuadradados

customCalculateBtn.addEventListener('click', function () {
    draw.changeMode('simple_select');
    var polygonVertices = getPolygonVertices();
    if (polygonVertices.length != 0) {
        var turfPolygon = turf.polygon([polygonVertices])
        var polygonArea = Math.round(turf.area(turfPolygon)/1000)
        var scaleFactor = Math.sqrt(refPolygonArea / polygonArea);
        if (scaleFactor < 1) {
            polygonVertices = turf.coordAll(turf.transformScale(turfPolygon, scaleFactor));
            turfPolygon = turf.polygon([polygonVertices])
            draw.delete(featureId);
            turfPolygon.id = featureId
            draw.add(turfPolygon);
            alert("Usted superó el área máxima permitida. Su área (" + polygonArea + " km2) debe ser menor o igual a " + refPolygonArea + " km2 (límite). Así que su polígono será escalado para cumplir dicha condición.")
        }
        displayMap(polygonVertices);
    } else {
        alert('Para desplegar, usted debe seleccionar previamente un área en el mapa con el botón "Dibujar".')
    }
    isDrawing = false;
    // draw.trash();
    // $('#hideBeforePolygon').toggle();
    // $('#reDrawPolygon').toggle();
    // $('#polygonSelectionModule').toggle();
    // setColorBar("colorBar")
});


