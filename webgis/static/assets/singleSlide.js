function valueRoadTypeUpdate(elem, value) {
    elem.innerHTML = 'Value: ' + value + ' %';
};

var roadText4 = document.getElementById('roadText4')
var road4 = document.querySelector('#road4')
var roadText5 = document.getElementById('roadText5')
var road5 = document.querySelector('#road5')

road4.oninput = function () {
    valueRoadTypeUpdate(roadText4, road4.value)
}
road5.oninput = function () {
    valueRoadTypeUpdate(roadText5, road5.value)
}




