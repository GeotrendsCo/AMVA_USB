const draw = new MapboxDraw({
    displayControlsDefault: false,
    // Select which mapbox-gl-draw control buttons to add to the map.
    controls: {
        polygon: false,
        trash: false,
    },
    // Set mapbox-gl-draw to draw by default.
    // The user does not have to click the polygon control button first.
    defaultMode: 'simple_select'
});

mapboxgl.accessToken = 'pk.eyJ1IjoiY2hlcnJlcmFhIiwiYSI6ImNrcndqNWZyMDBmd2QydWt4cXQxbjdiNXUifQ.gVOsNunVzkkHeoZomD6lEg';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/outdoors-v12', // style URL
    center: [-75.590553, 6.230833], // starting position [lng, lat]
    zoom: 10, // starting zoom
    maxZoom: 15,
    minZoom: 10,
    attributionControl: false,
    logoPosition: 'top-right',
    pitch: 0,
    // bearing: -17.6,
    container: 'map',
    antialias: true
});
map.addControl(new mapboxgl.FullscreenControl());
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.AttributionControl(), 'top-left');
var featureId;
map.on('style.load', () => {
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    map.on('draw.create', function (event) {
        // draw.changeMode('simple_select'); // Cambia al modo de selección simple si está desactivado
        featureId = event.features[0].id;
        customDrawBtn.classList.remove("draw-btn")
        customDrawBtn.disabled = true;
        customEditBtn.disabled = false;
        customTrashBtn.disabled = false;
        // customConfirmBtn.disabled = false;
        // customDrawBtn.innerHTML = 'Editando <i class="fa-solid fa-pen-to-square"></i>'
        setTimeout(function () {
            draw.changeMode('simple_select');
        }, 0);
    });

    // map.on('draw.update', function(event) {
    //     featureId = event.features[0].id;
    //     var updatedFeature = event.features[0]
    // });
    // map.addSource('mapbox-dem', {
    //     'type': 'raster-dem',
    //     'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
    //     'tileSize': 512,
    // });
    // // add the DEM source as a terrain layer with exaggerated height
    // map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 2 });

    map.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        'paint': {
            'fill-extrusion-color': 'rgba(160,160,160,1)', // Set your desired color here
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 1 // Set opacity to 1 for solid color
        }
    });
});