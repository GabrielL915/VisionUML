import "./style.css";
import Konva from "konva";

// Constants
const ZOOM_BUTTON_SCALE = 1.1;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const DEBOUNCE_DELAY_MS = 100;

// DOM Elements
const appContainer = document.querySelector<HTMLDivElement>("#app");
if (!appContainer) throw new Error("App container not found");

appContainer.innerHTML = `
  <div class="w-screen h-screen bg-white relative">
    <div id="umlCanvas" class="w-full h-full"></div>
    <div class="fixed bottom-4 left-0 right-0 flex justify-center pointer-events-none">
      <!-- Zoom Controls -->
      <div class="absolute left-4 bottom-0 bg-white rounded-lg shadow-lg p-2 flex items-center gap-2 pointer-events-auto">
        <button id="zoomOut" class="px-3 py-1 hover:bg-gray-100 rounded">-</button>
        <span id="zoomLevel" class="text-sm w-12 text-center">100%</span>
        <button id="zoomIn" class="px-3 py-1 hover:bg-gray-100 rounded">+</button>
      </div>
      <!-- Toolbar -->
      <div class="bg-white rounded-lg shadow-lg p-4 flex space-x-4 items-center pointer-events-auto">
        <button id="useCaseButton" class="px-4 py-2 bg-white text-blue-500 rounded hover:bg-blue-50 transition-colors">UseCase</button>
        <button class="px-4 py-2 bg-white text-blue-500 rounded hover:bg-blue-50 transition-colors">Teste</button>
        <button class="px-4 py-2 bg-white text-blue-500 rounded hover:bg-blue-50 transition-colors">Teste</button>
        <div class="h-6 w-px bg-blue-300"></div>
        <button class="px-4 py-2 bg-white text-blue-500 rounded hover:bg-blue-50 transition-colors">Oi</button>
      </div>
    </div>
  </div>
`;

// Utility: Debounce function
function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timer: number;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timer);
    timer = window.setTimeout(() => func.apply(this, args), delay);
  } as T;
}

// Konva Stage Setup
const stage = new Konva.Stage({
  container: "umlCanvas",
  width: window.innerWidth,
  height: window.innerHeight,
});

const staticLayer = new Konva.Layer();
const dynamicLayer = new Konva.Layer();
stage.add(staticLayer, dynamicLayer);

// Initial Square
const square = new Konva.Rect({
  x: stage.width() / 2 - 50,
  y: stage.height() / 2 - 50,
  width: 100,
  height: 100,
  fill: "blue",
  draggable: true,
});
dynamicLayer.add(square);
dynamicLayer.draw();

// Zoom Functionality
let scale = 1;

function updateZoom(direction: number, pointer?: { x: number; y: number }) {
  const oldScale = scale;
  const zoomAmount = direction > 0 ? ZOOM_BUTTON_SCALE : 1 / ZOOM_BUTTON_SCALE;
  scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale * zoomAmount));

  const zoomCenter = pointer || { x: stage.width() / 2, y: stage.height() / 2 };
  const mousePointTo = {
    x: (zoomCenter.x - stage.x()) / oldScale,
    y: (zoomCenter.y - stage.y()) / oldScale,
  };

  stage.scale({ x: scale, y: scale });
  stage.position({
    x: zoomCenter.x - mousePointTo.x * scale,
    y: zoomCenter.y - mousePointTo.y * scale,
  });

  // Update zoom percentage display
  const zoomDisplay = document.getElementById("zoomLevel")!;
  zoomDisplay.textContent = `${Math.round(scale * 100)}%`;

  // Update visibility
  const visibleRect = {
    x: -stage.x() / scale,
    y: -stage.y() / scale,
    width: stage.width() / scale,
    height: stage.height() / scale,
  };

  dynamicLayer.children.forEach((node) => {
    const nodeBox = node.getClientRect();
    const isVisible =
      nodeBox.x + nodeBox.width > visibleRect.x &&
      nodeBox.x < visibleRect.x + visibleRect.width &&
      nodeBox.y + nodeBox.height > visibleRect.y &&
      nodeBox.y < visibleRect.y + visibleRect.height;
    node.visible(isVisible);
  });

  dynamicLayer.batchDraw();
}

// Event Listeners
stage.on("wheel", (e) => {
  e.evt.preventDefault();
  const pointer = stage.getPointerPosition();
  if (!pointer) return;
  const direction = e.evt.deltaY > 0 ? 1 : -1;
  updateZoom(direction, pointer);
});

document.getElementById("zoomIn")?.addEventListener("click", () => updateZoom(1));
document.getElementById("zoomOut")?.addEventListener("click", () => updateZoom(-1));

// UseCase Element Functionality
async function addUseCase() {
  try {
    const svgText = await fetch("/usecase.svg").then((res) => res.text());
    const pathData = extractPathData(svgText);

    const useCase = new Konva.Path({
      data: pathData,
      fill: "purple",
      stroke: "black",
      strokeWidth: 2,
      x: stage.width() / 2 - 71.5,
      y: stage.height() / 2 - 44.5,
      draggable: true,
    });

    dynamicLayer.add(useCase);
    dynamicLayer.draw();
  } catch (error) {
    console.error("Failed to load UseCase SVG:", error);
  }
}

function extractPathData(svgText: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const pathElement = doc.querySelector("path");
  return pathElement?.getAttribute("d") || "";
}

document.getElementById("useCaseButton")?.addEventListener("click", addUseCase);

// Drag Handling
let isDragging = false;

stage.on("dragstart", () => (isDragging = true));
stage.on("dragend", () => {
  isDragging = false;
  dynamicLayer.batchDraw();
});
stage.on("dragmove", () => {
  if (isDragging) requestAnimationFrame(() => dynamicLayer.batchDraw());
});

// Window Resize Handler
const handleResize = debounce(() => {
  stage.width(window.innerWidth);
  stage.height(window.innerHeight);
  staticLayer.batchDraw();
  dynamicLayer.batchDraw();
}, DEBOUNCE_DELAY_MS);

window.addEventListener("resize", handleResize);