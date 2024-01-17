document.addEventListener("DOMContentLoaded", () => {
  const dropArea = document.getElementById("drop-area");
  const fileInput = document.getElementById("file-input");
  const fileNameDisplay = document.getElementById("file-name-display");

  // Evita que el navegador abra el archivo al soltarlo en el área.
  dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.classList.add("drag-over");
    dropArea.innerText = "Por favor, suelta el archivo.";
  });

  // Evita que el navegador abra el archivo al salir del área.
  dropArea.addEventListener("dragleave", (event) => {
    event.preventDefault();
    dropArea.classList.remove("drag-over");
    dropArea.innerText =
      "Arrastra y suelta un archivo PDF aquí, o haz clic para seleccionarlo desde tu computadora.";
  });

  // Maneja el evento de soltar el archivo en el área.
  dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dropArea.classList.remove("drag-over");

    const file = event.dataTransfer.files[0]; // Obtiene el primer archivo soltado

    // Valida que el archivo sea de tipo PDF
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      showError("Solo se permiten archivos PDF. Por favor, intenta de nuevo.");
      return;
    }

    // Muestra el nombre del archivo en el área designada.
    fileNameDisplay.innerText = file.name;

    // Crea una URL local para el archivo seleccionado
    const fileUrl = URL.createObjectURL(file);

    // Carga y muestra el PDF en el visualizador
    loadPdf(fileUrl);
  });

  // Maneja el evento de cambio de selección de archivo.
  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0]; // Obtiene el archivo seleccionado

    // Valida que el archivo sea de tipo PDF
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      showError("Solo se permiten archivos PDF. Por favor, intenta de nuevo.");
      return;
    }

    // Muestra el nombre del archivo en el área designada.
    fileNameDisplay.innerText = file.name;

    // Crea una URL local para el archivo seleccionado
    const fileUrl = URL.createObjectURL(file);

    // Carga y muestra el PDF en el visualizador
    //   loadPdf(fileUrl);
  });

  // Maneja el evento de clic en el área para seleccionar un archivo.
  dropArea.addEventListener("click", () => {
    // Simula el clic en el input de tipo file
    fileInput.click();
  });

  // Función para mostrar mensajes de error
  function showError(errorMessage) {
    dropArea.innerText = errorMessage;
    dropArea.classList.add("error");
    setTimeout(() => {
      dropArea.innerText =
        "Arrastra y suelta un archivo PDF aquí, o haz clic para seleccionarlo desde tu computadora.";
      dropArea.classList.remove("error");
    }, 3000); // Restaura el mensaje original después de 3 segundos
  }
});
