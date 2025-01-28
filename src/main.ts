import './style.css';
import Konva from 'konva';

const ZOOM_SCALE_BY = 1.02;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const THROTTLE_LIMIT_MS = 16;
const DEBOUNCE_DELAY_MS = 100;

const appContainer = document.querySelector<HTMLDivElement>('#app');
if (!appContainer) {
  throw new Error('App container not found');
}

appContainer.innerHTML = `
  <main class="w-screen h-screen bg-white">
    <div id="umlCanvas" class="w-full h-full"></div>
  </main>
`;

// Throttle function
function throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
  let lastFunc: number;
  let lastRan: number;
  return function (this: any, ...args: Parameters<T>) {
    const context = this;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = window.setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  } as T;
}

// Debounce function
function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timer: number;
  return function (this: any, ...args: Parameters<T>) {
    const context = this;
    clearTimeout(timer);
    timer = window.setTimeout(() => func.apply(context, args), delay);
  } as T;
}

// Initialize Konva stage and layers
const canvasContainer = document.getElementById('umlCanvas');
if (!canvasContainer) {
  throw new Error('Canvas container not found');
}

const stage = new Konva.Stage({
  container: 'umlCanvas',
  width: window.innerWidth,
  height: window.innerHeight,
});

const staticLayer = new Konva.Layer(); // Layer for static elements
const dynamicLayer = new Konva.Layer(); // Layer for dynamic elements
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

// Throttled drag move handler
square.on('dragmove', throttle(() => {
  dynamicLayer.batchDraw();
}, THROTTLE_LIMIT_MS));

// Zoom and Pan functionality
let scale = 1;

const handleZoom = throttle((e: Konva.KonvaEventObject<WheelEvent>) => {
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
  stage.batchDraw();

  // Lazy rendering: only process visible objects
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
}, THROTTLE_LIMIT_MS);

stage.on('wheel', handleZoom);

// Debounced window resize handler
const handleResize = debounce(() => {
  stage.width(window.innerWidth);
  stage.height(window.innerHeight);
  staticLayer.batchDraw();
  dynamicLayer.batchDraw();
}, DEBOUNCE_DELAY_MS);

window.addEventListener('resize', handleResize);

// Prevent unnecessary re-renders during drag events
stage.on('dragstart dragend', () => {
  dynamicLayer.batchDraw();
});