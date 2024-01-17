const pdfViewer = document.getElementById('pdfViewer');
const pdfContainer = document.getElementById('pdfContainer');
const previousButton = document.getElementById('previous');
const nextButton = document.getElementById('next');

let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5; // Escala inicial del PDF
let selectedArea = null; // Variable para almacenar el área seleccionada

function renderPage(pageNumber) {
  pageRendering = true;

  pdfDoc.getPage(pageNumber).then((page) => {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    pdfContainer.innerHTML = ''; // Limpiar el contenedor del PDF

    // Crear un contenedor de página que contendrá el lienzo del PDF y el elemento div para la selección de área
    const pageContainer = document.createElement('div');
    pageContainer.classList.add('page-container');
    pdfContainer.appendChild(pageContainer);

    // Agregar el lienzo del PDF al contenedor de página
    pageContainer.appendChild(canvas);

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    page.render(renderContext).promise.then(() => {
      pageRendering = false;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }

      // Agregar evento de clic para seleccionar área
      pageContainer.addEventListener('mousedown', onMouseDown);
    });
  });

  function onMouseDown(event) {
    const canvas = event.target;
    const canvasRect = canvas.getBoundingClientRect();
    const offsetX = event.clientX;
    const offsetY = event.clientY - canvasRect.top;

    selectedArea = {
      startX: offsetX,
      startY: offsetY,
      endX: offsetX,
      endY: offsetY,
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function onMouseMove(event) {
    if (!selectedArea) {
      return;
    }

    const canvas = event.target;
    const canvasRect = canvas.getBoundingClientRect();
    const offsetX = event.clientX;
    const offsetY = event.clientY - canvasRect.top;

    selectedArea.endX = offsetX;
    selectedArea.endY = offsetY;

    drawSelectedArea();
  }

  function onMouseUp(event) {
    if (!selectedArea) {
      return;
    }

    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    // Resaltar área seleccionada
    drawSelectedArea();
  }

  function drawSelectedArea() {
    if (!selectedArea) {
      return;
    }

    // Obtener el elemento div de la selección de área
    let selectionDiv = document.getElementById('selectionDiv');

    // Crear el elemento div si no existe
    if (!selectionDiv) {
      selectionDiv = document.createElement('div');
      selectionDiv.id = 'selectionDiv';
      selectionDiv.className = 'selection-area';
      pdfContainer.appendChild(selectionDiv);
    }

    // Calcular las coordenadas y dimensiones finales del área seleccionada
    const x = Math.min(selectedArea.startX, selectedArea.endX);
    const y = Math.min(selectedArea.startY, selectedArea.endY);
    const width = Math.abs(selectedArea.startX - selectedArea.endX);
    const height = Math.abs(selectedArea.startY - selectedArea.endY);

    // Aplicar estilos al elemento div para la selección de área
    selectionDiv.style.left = x + 'px';
    selectionDiv.style.top = y + 'px';
    selectionDiv.style.width = width + 'px';
    selectionDiv.style.height = height + 'px';
  }

  document.getElementById(
    'pager'
  ).textContent = `Página ${pageNumber} de ${pdfDoc.numPages}`;
}

function queueRenderPage(pageNumber) {
  if (pageRendering) {
    pageNumPending = pageNumber;
  } else {
    renderPage(pageNumber);
  }
}

function loadPdf(url) {
  pdfContainer.innerHTML = 'Cargando PDF...';

  pdfjsLib
    .getDocument(url)
    .promise.then((pdf) => {
      pdfDoc = pdf;

      renderPage(pageNum);

      previousButton.addEventListener('click', onPreviousPage);
      nextButton.addEventListener('click', onNextPage);
    })
    .catch((error) => {
      console.error('Error al cargar el PDF:', error);
    });
}

function onPreviousPage() {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
}

function onNextPage() {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
}

document.addEventListener('DOMContentLoaded', () => {
  // Obtén el archivo PDF seleccionado en renderer.js
  const fileInput = document.getElementById('file-input');

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showError('Solo se permiten archivos PDF. Por favor, intenta de nuevo.');
      return;
    }

    // Crea una URL local para el archivo seleccionado
    const fileUrl = URL.createObjectURL(file);

    // Carga y muestra el PDF en el visualizador
    loadPdf(fileUrl);
  });

  // Función para mostrar mensajes de error
  function showError(errorMessage) {
    pdfContainer.innerHTML = errorMessage;
  }
});
