import './style.css';
import Konva from 'konva';

const ZOOM_SCALE_BY = 1.02;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const DEBOUNCE_DELAY_MS = 100;

const appContainer = document.querySelector<HTMLDivElement>('#app');
if (!appContainer) {
  throw new Error('App container not found');
}

appContainer.innerHTML = `
  <div class="w-screen h-screen bg-white relative">
    <div id="umlCanvas" class="w-full h-full"></div>
    
    <div class="fixed bottom-4 left-0 right-0 flex justify-center pointer-events-none">
      <div class="bg-blue-500 rounded-lg shadow-lg p-4 flex space-x-4 items-center pointer-events-auto">
        <button class="px-4 py-2 bg-white text-blue-500 rounded hover:bg-blue-50 transition-colors">
          Teste
        </button>
        <button class="px-4 py-2 bg-white text-blue-500 rounded hover:bg-blue-50 transition-colors">
          Teste
        </button>
        <button class="px-4 py-2 bg-white text-blue-500 rounded hover:bg-blue-50 transition-colors">
          Teste
        </button>
        <div class="h-6 w-px bg-blue-300"></div>
        <button class="px-4 py-2 bg-white text-blue-500 rounded hover:bg-blue-50 transition-colors">
          Oi
        </button>
      </div>
    </div>
  </div>
`;

function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timer: number;
  return function (this: any, ...args: Parameters<T>) {
    const context = this;
    clearTimeout(timer);
    timer = window.setTimeout(() => func.apply(context, args), delay);
  } as T;
}

const canvasContainer = document.getElementById('umlCanvas');
if (!canvasContainer) {
  throw new Error('Canvas container not found');
}

const stage = new Konva.Stage({
  container: 'umlCanvas',
  width: window.innerWidth,
  height: window.innerHeight,
});

const staticLayer = new Konva.Layer();
const dynamicLayer = new Konva.Layer();
stage.add(staticLayer);
stage.add(dynamicLayer);

const square = new Konva.Rect({
  x: stage.width() / 2 - 50,
  y: stage.height() / 2 - 50,
  width: 100,
  height: 100,
  fill: 'blue',
  draggable: true,
});

dynamicLayer.add(square);
dynamicLayer.draw();

//requestAnimationFrame for smoother updates
let isDragging = false;

stage.on('dragstart', () => {
  isDragging = true;
});

stage.on('dragend', () => {
  isDragging = false;
  dynamicLayer.batchDraw();
});

stage.on('dragmove', () => {
  if (isDragging) {
    requestAnimationFrame(() => dynamicLayer.batchDraw());
  }
});

// Zoom and Pan functionality
let scale = 1;

stage.on('wheel', (e) => {
  e.evt.preventDefault();

  const oldScale = scale;
  const pointer = stage.getPointerPosition();

  if (!pointer) return;

  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  };

  const direction = e.evt.deltaY > 0 ? 1 : -1;
  const zoomAmount = direction > 0 ? ZOOM_SCALE_BY : 1 / ZOOM_SCALE_BY;
  scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale * zoomAmount)); // Limit zoom

  stage.scale({ x: scale, y: scale });

  const newPos = {
    x: pointer.x - mousePointTo.x * scale,
    y: pointer.y - mousePointTo.y * scale,
  };

  stage.position(newPos);

  // Lazy rendering
  const visibleRect = {
    x: -newPos.x / scale,
    y: -newPos.y / scale,
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

    node.visible(isVisible); // Hide off-screen elements
  });

  dynamicLayer.batchDraw();
});

// Debounced window resize handler
const handleResize = debounce(() => {
  stage.width(window.innerWidth);
  stage.height(window.innerHeight);
  staticLayer.batchDraw();
  dynamicLayer.batchDraw();
}, DEBOUNCE_DELAY_MS);

window.addEventListener('resize', handleResize);