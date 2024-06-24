// Colores y valores para la barra

function getColor(d) {
    return d >= 80 ? '#000078' :
           d >= 75  ? '#00c5ff' :
           d >= 70  ? '#ff00ff' :
           d >= 65  ? '#ff1111' :
           d >= 60  ? '#ff7777' :
           d >= 55   ? '#ffaa00' :
           d >= 50   ? '#ffcd69' :
           d >= 45   ? '#ffff02' :
           d >= 40   ? '#007800' :
           d >= 35    ? '#c3ff86' :
                      'transparent';
}

function setColorBar (divId) {
    var div = document.getElementById(divId)
    const grades = [0, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80]
    div.innerHTML = "";
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i class="colorSingleSquare" style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + "<" + (grades[i + 1] ? '...&le;' + grades[i + 1] + '<br>' : '+');
    }
}

setColorBar("colorBar")

