import Konva from "konva";
import { debounce } from "./utils/debounce";

export const ZOOM_BUTTON_SCALE = 1.1;
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 3;
export const DEBOUNCE_DELAY_MS = 100;

export let stage: Konva.Stage;
export let staticLayer: Konva.Layer;
export let dynamicLayer: Konva.Layer;
export let scale = 1;

export function initializeStage() {
  stage = new Konva.Stage({
    container: "umlCanvas",
    width: window.innerWidth,
    height: window.innerHeight,
  });

  staticLayer = new Konva.Layer();
  dynamicLayer = new Konva.Layer();
  stage.add(staticLayer, dynamicLayer);

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

  stage.on("wheel", (e) => {
    e.evt.preventDefault();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const direction = e.evt.deltaY > 0 ? 1 : -1;
    updateZoom(direction, pointer);
  });

  let isDragging = false;

  stage.on("dragstart", () => isDragging = true);

  stage.on("dragend", () => {
    isDragging = false;
    dynamicLayer.batchDraw();
  });

  stage.on("dragmove", () => {
    if (isDragging) {
      requestAnimationFrame(() => dynamicLayer.batchDraw());
    }
  });

  // Redimensionamento responsivo
  window.addEventListener(
    "resize",
    debounce(() => {
      stage.width(window.innerWidth);
      stage.height(window.innerHeight);
      staticLayer.batchDraw();
      dynamicLayer.batchDraw();
    }, DEBOUNCE_DELAY_MS)
  );
}

export function updateZoom(direction: number, pointer?: { x: number; y: number }) {
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

  const zoomDisplay = document.getElementById("zoomLevel")!;
  zoomDisplay.textContent = `${Math.round(scale * 100)}%`;

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