import './style.css';
import Konva from 'konva';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main class="w-screen h-screen bg-white">
    <div id="umlCanvas" class="w-full h-full"></div>
  </main>
`;

// Função de throttle
function throttle(func: Function, limit: number) {
  let lastFunc: number;
  let lastRan: number;
  return function (...args: any[]) {
    const context = this;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = window.setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

// Função de debounce
function debounce(func: Function, delay: number) {
  let timer: number;
  return function (...args: any[]) {
    const context = this;
    clearTimeout(timer);
    timer = window.setTimeout(() => func.apply(context, args), delay);
  };
}

const canvasContainer = document.getElementById('umlCanvas');
if (canvasContainer) {
  const stage = new Konva.Stage({
    container: 'umlCanvas',
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const staticLayer = new Konva.Layer(); // Camada para elementos estáticos
  const dynamicLayer = new Konva.Layer(); // Camada para elementos dinâmicos
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

  // Limita re-renderizações ao arrastar
  square.on('dragmove', throttle(() => {
    dynamicLayer.batchDraw();
  }, 16)); // Atualiza apenas a camada dinâmica

  // Função de Zoom e Pan com throttle aplicado
  const scaleBy = 1.02;
  let scale = 1;

  const handleZoom = throttle((e: any) => {
    e.evt.preventDefault();

    const oldScale = scale;
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? 1 : -1;
    const zoomAmount = direction > 0 ? scaleBy : 1 / scaleBy;
    scale = Math.max(0.5, Math.min(3, scale * zoomAmount)); // Limita o zoom

    stage.scale({ x: scale, y: scale });

    const newPos = {
      x: pointer.x - mousePointTo.x * scale,
      y: pointer.y - mousePointTo.y * scale,
    };

    stage.position(newPos);
    stage.batchDraw();
  }, 16); // Aplica throttle com limite de 16ms

  stage.on('wheel', handleZoom);

  // Redimensionamento da janela com debounce aplicado
  const handleResize = debounce(() => {
    stage.width(window.innerWidth);
    stage.height(window.innerHeight);
    staticLayer.batchDraw();
    dynamicLayer.batchDraw();
  }, 100); // Aplica debounce com atraso de 100ms

  window.addEventListener('resize', handleResize);

  // Evento para evitar re-renderizações desnecessárias
  stage.on('dragstart dragend', () => {
    dynamicLayer.batchDraw();
  });
}
