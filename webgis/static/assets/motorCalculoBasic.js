var isAforo = false;

function valueRoadTypeUpdate(elem, value) {
    elem.innerHTML = 'Value: ' + value + ' %';
};

console.log('Inicio Motor Básico (Consulta)')

// Función para filtrar puntos dentro del polígono
function filtrarPuntosEnPoligono(geojson, vertices) {
    var puntosFiltrados = geojson.features.filter(function (feature) {
        if (feature.geometry && feature.geometry.coordinates) {
            var punto = feature.geometry.coordinates;
            return puntoEnPoligono(punto, vertices);
        } else {
            return false; // O puedes decidir cómo manejar los puntos sin coordenadas
        }
    });

    return {
        "type": "FeatureCollection",
        "features": puntosFiltrados
    };
}

// Función para verificar si un punto está dentro de un polígono
function puntoEnPoligono(punto, vertices) {
    var x = punto[0];
    var y = punto[1];
    var dentro = false;

    for (var i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        var xi = vertices[i][0];
        var yi = vertices[i][1];
        var xj = vertices[j][0];
        var yj = vertices[j][1];

        var intersecta = ((yi > y) != (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersecta) dentro = !dentro;
    }

    return dentro;
}

function calculateRadiusBasedOnZoom(zoom) {
    // Customize this function based on your scaling logic
    // Inverse relationship: The maximum radius occurs at the minimum zoom, and vice versa.
    var minZoom = map.getMinZoom();
    var maxZoom = map.getMaxZoom();
    var minRadius = 4; // Adjust the maximum radius
    var maxRadius = 1;  // Adjust the minimum radius

    // Linear interpolation to calculate radius based on zoom
    return minRadius + (maxRadius - minRadius) * (1 - (zoom - minZoom) / (maxZoom - minZoom));
}

function refreshZoom () {
    var currentZoom = map.getZoom();
    var radius = calculateRadiusBasedOnZoom(currentZoom);
    // Update the circle radius
    map.setPaintProperty('mapEnginePoints', 'circle-radius', radius);
}

var baseMap;
var AMVAFiltrado;
var poligono;

async function displayMap(vertices) {
    document.getElementById('spinLoaderId').style.display = 'block';
    // // Filtrar puntos dentro del polígono
    // AMVAFiltrado = filtrarPuntosEnPoligono(AMVA, vertices);
    var puntosFiltrados = await obtenerYProcesarPuntosFiltrados(vertices);
    poligono = turf.polygon([vertices]);
    baseMap = puntosFiltrados

    document.getElementById('spinLoaderId').style.display = 'none';
    $('#mapIndicator').toggle()
    document.getElementById('mapIndicator').innerHTML = '<b>Mapa de ruido Oficial AMVA 2022</b>'
    
    draw.trash();
    $('#hideBeforePolygon').toggle();
    $('#reDrawPolygon').toggle();
    $('#polygonSelectionModule').toggle();

    map.addSource('mapEngine', {
        'type': 'geojson',
        'data': baseMap
    });
    // Set initial radius based on min zoom
    var initialRadius = calculateRadiusBasedOnZoom(map.getZoom());

    map.addLayer({
        'id': 'mapEnginePoints',
        'type': 'circle',
        'source': 'mapEngine',
        'paint': {
            'circle-radius': initialRadius,
            'circle-opacity': 0.8,
            'circle-color': {
                'property': 'sumTotal',
                'type': 'interval',
                'stops': [
                    [30, 'transparent'],
                    [35, '#c3ff86'],
                    [40, '#007800'],
                    [45, '#ffff02'],
                    [50, '#ffcd69'],
                    [55, '#ffaa00'],
                    [60, '#ff7777'],
                    [65, '#ff1111'],
                    [70, '#ff00ff'],
                    [75, '#00c5ff'],
                    [80, '#000078'],
                ]
            }
        },
    });

    map.on('zoom', refreshZoom);

    map.addSource('poligono', {
        'type': 'geojson',
        'data': poligono
    });

    // Líneas exteriores de color negro
    map.addLayer({
        'id': 'lineas-exteriores',
        'type': 'line',
        'source': 'poligono',
        'layout': {},
        'paint': {
            'line-color': 'grey',
            'line-width': 1
        }
    });

    // Puntos de color rojo
    // map.addLayer({
    //     'id': 'puntos',
    //     'type': 'circle',
    //     'source': 'poligono',
    //     'paint': {
    //         'circle-color': 'red',
    //         'circle-radius': 6,
    //         'circle-opacity': 1
    //     }
    // });
}