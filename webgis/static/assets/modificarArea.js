var modifyAreaBtn = document.getElementById('reDrawPolygonButton');

modifyAreaBtn.addEventListener('click', function () {
    map.off('zoom', refreshZoom);
    map.removeLayer('mapEnginePoints');
    map.removeLayer('lineas-exteriores');
    // map.removeLayer('puntos');
    map.removeSource('mapEngine');
    map.removeSource('poligono');

    $('#hideBeforePolygon').toggle();
    $('#reDrawPolygon').toggle();
    $('#polygonSelectionModule').toggle();
    $('#mapIndicator').toggle()
    isDrawing = false;

    // draw.changeMode('simple_select'); // Cambia al modo de selección simple si está desactivado
    draw.changeMode('direct_select', {featureId: featureId});
    customDrawBtn.classList.remove("draw-btn")
    isDrawing = false
    customDrawBtn.disabled = true;

    // var drawnFeatures = draw.getAll();
    // // Verificar si hay algún polígono dibujado
    // var hayPoligonos = drawnFeatures.features.some(function(feature) {
    // return feature.geometry.type === 'Polygon';
    // });

    // if (hayPoligonos) {
    //     customDrawBtn.disabled = true;
    // } else {
    //     customDrawBtn.disabled = false;
    // }
});