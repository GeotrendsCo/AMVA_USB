function createIsoBands() {
    console.log('Create Isobands')
}

var tin = turf.tin(baseMap, 'sumTotal');
for (let i = 0; i < tin.features.length; i++) {
    tin.features[i].properties.a = (tin.features[i].properties.a + tin.features[i].properties.b + tin.features[i].properties.c) / 3
}

