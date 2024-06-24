// Añadir contenedor personalizado
var customControlsContainer = document.getElementById('custom-controls');
customControlsContainer.appendChild(draw.onAdd(map));

// Añadir evento de clic al botón personalizado de trash
var customTrashBtn = document.getElementById('custom-trash-btn');
customTrashBtn.addEventListener('click', function() {
  draw.deleteAll(); // Llama a la función trash() al hacer clic en el botón personalizado
  draw.changeMode('simple_select'); // Cambia al modo de selección simple si está desactivado
  customDrawBtn.innerHTML = 'Dibujar <i class="fa-solid fa-draw-polygon"></i>'
  customDrawBtn.classList.remove("draw-btn")
  customDrawBtn.disabled = false;
  customEditBtn.disabled = true;
  customTrashBtn.disabled = true;
  isDrawing = false
});

var customEditBtn = document.getElementById("custom-edit-btn")
var isEditing = false;
customEditBtn.addEventListener('click', function(event) {
  draw.changeMode('direct_select', {featureId: featureId});
});

// Añadir evento de clic al botón personalizado de draw
var customDrawBtn = document.getElementById('custom-draw-btn');
var isDrawing = false;
customDrawBtn.addEventListener('click', function() {
  isDrawing = !isDrawing; // Invierte el estado al hacer clic
  if (isDrawing) {
    draw.changeMode('draw_polygon'); // Cambia al modo de dibujo de polígonos si está activado
    customDrawBtn.classList.add("draw-btn")
  } else {
    draw.changeMode('simple_select'); // Cambia al modo de selección simple si está desactivado
    customDrawBtn.classList.remove("draw-btn")
  }
});