function valueRoadTypeUpdate(elem, value) {
    elem.innerHTML = 'Value: ' + value + ' %';
};

var autopista = document.querySelector('#road1')
var principal = document.querySelector('#road2')
var menor = document.querySelector('#road3')
var colectora = document.querySelector('#road4')
var servicio = document.querySelector('#road5')

var roadText1 = document.getElementById('roadText1')
var roadText2 = document.getElementById('roadText2')
var roadText3 = document.getElementById('roadText3')
var roadText4 = document.getElementById('roadText4')
var roadText5 = document.getElementById('roadText5')

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
var factorAforoPrincipal
var factorAforo

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
    
    autopista.oninput = function () {
        valueRoadTypeUpdate(roadText1, autopista.value)
        valueRoadTypeUpdate(roadText2, principal.value)
        valueRoadTypeUpdate(roadText3, menor.value)
        valueRoadTypeUpdate(roadText4, colectora.value)
        valueRoadTypeUpdate(roadText5, servicio.value)
        var autopistaFactor = (autopista.value / 100.001) + 1;
        var principalFactor = (principal.value / 100.001) + 1;
        var colectoraFactor = (colectora.value / 100.001) + 1;
        var menorFactor = (menor.value / 100.001) + 1;
        var servicioFactor = (servicio.value / 100.001) + 1;
        for (let i = 0; i < baseMap.features.length; i++) {
            baseMap.features[i].properties.sumTotal = 10 * Math.log10(autopistaFactor * baseMap.features[i].properties.autopista + principalFactor * baseMap.features[i].properties.principal + menorFactor * baseMap.features[i].properties.menor + colectoraFactor * baseMap.features[i].properties.colectora + servicioFactor * baseMap.features[i].properties.servicio)
        }
        map.getSource("mapEngine").setData(baseMap);
    }
    principal.oninput = function () {
        valueRoadTypeUpdate(roadText1, autopista.value)
        valueRoadTypeUpdate(roadText2, principal.value)
        valueRoadTypeUpdate(roadText3, menor.value)
        valueRoadTypeUpdate(roadText4, colectora.value)
        valueRoadTypeUpdate(roadText5, servicio.value)
        var autopistaFactor = (autopista.value / 100.001) + 1;
        var principalFactor = (principal.value / 100.001) + 1;
        var colectoraFactor = (colectora.value / 100.001) + 1;
        var menorFactor = (menor.value / 100.001) + 1;
        var servicioFactor = (servicio.value / 100.001) + 1;
        for (let i = 0; i < baseMap.features.length; i++) {
            baseMap.features[i].properties.sumTotal = 10 * Math.log10(autopistaFactor * baseMap.features[i].properties.autopista + principalFactor * baseMap.features[i].properties.principal + menorFactor * baseMap.features[i].properties.menor + colectoraFactor * baseMap.features[i].properties.colectora + servicioFactor * baseMap.features[i].properties.servicio)
        }
        map.getSource("mapEngine").setData(baseMap);
    }
    menor.oninput = function () {
        valueRoadTypeUpdate(roadText1, autopista.value)
        valueRoadTypeUpdate(roadText2, principal.value)
        valueRoadTypeUpdate(roadText3, menor.value)
        valueRoadTypeUpdate(roadText4, colectora.value)
        valueRoadTypeUpdate(roadText5, servicio.value)
        var autopistaFactor = (autopista.value / 100.001) + 1;
        var principalFactor = (principal.value / 100.001) + 1;
        var colectoraFactor = (colectora.value / 100.001) + 1;
        var menorFactor = (menor.value / 100.001) + 1;
        var servicioFactor = (servicio.value / 100.001) + 1;
        for (let i = 0; i < baseMap.features.length; i++) {
            baseMap.features[i].properties.sumTotal = 10 * Math.log10(autopistaFactor * baseMap.features[i].properties.autopista + principalFactor * baseMap.features[i].properties.principal + menorFactor * baseMap.features[i].properties.menor + colectoraFactor * baseMap.features[i].properties.colectora + servicioFactor * baseMap.features[i].properties.servicio)
        }
        map.getSource("mapEngine").setData(baseMap);
    }
    colectora.oninput = function () {
        valueRoadTypeUpdate(roadText1, autopista.value)
        valueRoadTypeUpdate(roadText2, principal.value)
        valueRoadTypeUpdate(roadText3, menor.value)
        valueRoadTypeUpdate(roadText4, colectora.value)
        valueRoadTypeUpdate(roadText5, servicio.value)
        var autopistaFactor = (autopista.value / 100.001) + 1;
        var principalFactor = (principal.value / 100.001) + 1;
        var colectoraFactor = (colectora.value / 100.001) + 1;
        var menorFactor = (menor.value / 100.001) + 1;
        var servicioFactor = (servicio.value / 100.001) + 1;
        for (let i = 0; i < baseMap.features.length; i++) {
            baseMap.features[i].properties.sumTotal = 10 * Math.log10(autopistaFactor * baseMap.features[i].properties.autopista + principalFactor * baseMap.features[i].properties.principal + menorFactor * baseMap.features[i].properties.menor + colectoraFactor * baseMap.features[i].properties.colectora + servicioFactor * baseMap.features[i].properties.servicio)
        }
        map.getSource("mapEngine").setData(baseMap);
    }
    servicio.oninput = function () {
        valueRoadTypeUpdate(roadText1, autopista.value)
        valueRoadTypeUpdate(roadText2, principal.value)
        valueRoadTypeUpdate(roadText3, menor.value)
        valueRoadTypeUpdate(roadText4, colectora.value)
        valueRoadTypeUpdate(roadText5, servicio.value)
        var autopistaFactor = (autopista.value / 100.001) + 1;
        var principalFactor = (principal.value / 100.001) + 1;
        var colectoraFactor = (colectora.value / 100.001) + 1;
        var menorFactor = (menor.value / 100.001) + 1;
        var servicioFactor = (servicio.value / 100.001) + 1;
        for (let i = 0; i < baseMap.features.length; i++) {
            baseMap.features[i].properties.sumTotal = 10 * Math.log10(autopistaFactor * baseMap.features[i].properties.autopista + principalFactor * baseMap.features[i].properties.principal + menorFactor * baseMap.features[i].properties.menor + colectoraFactor * baseMap.features[i].properties.colectora + servicioFactor * baseMap.features[i].properties.servicio)
        }
        map.getSource("mapEngine").setData(baseMap);
    }

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

    // // Relleno de color blanco con opacidad de 0.7
    // map.addLayer({
    //     'id': 'relleno',
    //     'type': 'fill',
    //     'source': 'poligono',
    //     'paint': {
    //         'fill-color': 'white',
    //         'fill-opacity': 0.7
    //     }
    // });
}

autopista.onfocus = () => {
    document.getElementById('mapIndicator').innerHTML = '<b>Modificando aforo:</b> <em>Mapa de ruido Oficial AMVA 2022</em>'
}
principal.onfocus = () => {
    document.getElementById('mapIndicator').innerHTML = '<b>Modificando aforo:</b> <em>Mapa de ruido Oficial AMVA 2022</em>'
}
menor.onfocus = () => {
    document.getElementById('mapIndicator').innerHTML = '<b>Modificando aforo:</b> <em>Mapa de ruido Oficial AMVA 2022</em>'
}
colectora.onfocus = () => {
    document.getElementById('mapIndicator').innerHTML = '<b>Modificando aforo:</b> <em>Mapa de ruido Oficial AMVA 2022</em>'
}
servicio.onfocus = () => {
    document.getElementById('mapIndicator').innerHTML = '<b>Modificando aforo:</b> <em>Mapa de ruido Oficial AMVA 2022</em>'
}