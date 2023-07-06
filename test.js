var pdfDoc = null,
pageNum = 1,
pageRendering = false,
pageNumPending = null,
scale = 1.5,
pdfCanvas = document.getElementById("pdf_canvas"),
drawingCanvas = document.createElement("canvas"),
ctx = pdfCanvas.getContext("2d");

// Add the drawing canvas as a sibling of the PDF canvas
pdfCanvas.parentNode.insertBefore(drawingCanvas, pdfCanvas.nextSibling);

var fabricCanvas = new fabric.Canvas(drawingCanvas);
fabricCanvas.isDrawingMode = true;

// Render the page
function renderPage(num) {
pageRendering = true;
pdfDoc.getPage(num).then((page) => {
  var viewport = page.getViewport({ scale: scale });
  pdfCanvas.height = viewport.height;
  pdfCanvas.width = viewport.width;
  drawingCanvas.height = viewport.height;
  drawingCanvas.width = viewport.width;

  var renderCtx = {
    canvasContext: ctx,
    viewport: viewport,
  };
  var renderTask = page.render(renderCtx);
  renderTask.promise.then(() => {
    pageRendering = false;
    if (pageNumPending !== null) {
      renderPage(pageNumPending);
      pageNumPending = null;
    }
  });
});
document.getElementById("page_num").textContent = num;
}

// Queue render page
function queueRenderPage(num) {
if (pageRendering) {
  pageNumPending = num;
} else {
  renderPage(num);
}
}

// Previous page
function onPrevPage() {
if (pageNum <= 1) {
  return;
}
pageNum--;
queueRenderPage(pageNum);
}
document.getElementById("prev").addEventListener("click", onPrevPage);

// Next page
function onNextPage() {
if (pageNum >= pdfDoc.numPages) {
  return;
}
pageNum++;
queueRenderPage(pageNum);
}
document.getElementById("next").addEventListener("click", onNextPage);

// Zoom in page
function zoomIn() {
scale = scale + 0.5;
queueRenderPage(pageNum);
updateZoomedPercentage();
}
document.getElementById("zoomIn").addEventListener("click", zoomIn);

// Zoom out page
function zoomOut() {
scale = scale - 0.5;
queueRenderPage(pageNum);
updateZoomedPercentage();
}
document.getElementById("zoomOut").addEventListener("click", zoomOut);

// Zoomed percentage
function updateZoomedPercentage() {
document.getElementById("zoomed").textContent = scale * 100 + "%";
}
updateZoomedPercentage();

// Asynchronously download PDF
pdfjsLib.getDocument("test.pdf").promise.then((doc) => {
pdfDoc = doc;
document.getElementById("page_count").textContent = doc.numPages;
renderPage(pageNum);
});

// Draw
var isDrawingMode = false;

// Toggle drawing mode
function toggleDrawingMode() {
isDrawingMode = !isDrawingMode;
fabricCanvas.isDrawingMode = isDrawingMode;


// Update button text
var drawToggleBtn = document.getElementById("drawToggle");
drawToggleBtn.textContent = isDrawingMode ? "Stop Drawing" : "Draw";
}

// Add event listener to the draw toggle button
document
.getElementById("drawToggle")
.addEventListener("click", toggleDrawingMode);