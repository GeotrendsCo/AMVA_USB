function resetRoads () {

    switchMap.checked = false;

    autopista.value = 0
    principal.value = 0
    menor.value = 0
    colectora.value = 0
    servicio.value = 0

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
    document.getElementById('mapIndicator').innerHTML = '<b>Mapa de ruido Oficial AMVA 2022</b>'
}