import './style.css';
import Konva from 'konva';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main class="w-screen h-screen bg-white">
    <div id="umlCanvas" class="w-full h-full"></div>
  </main>
`;

const canvasContainer = document.getElementById('umlCanvas');
if (canvasContainer) {
  const stage = new Konva.Stage({
    container: 'umlCanvas',
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const gridLayer = new Konva.Layer();
  stage.add(gridLayer);

  const gridSize = 20;

  // Desenha o grid
  for (let i = 0; i < stage.width() / gridSize; i++) {
    gridLayer.add(
      new Konva.Line({
        points: [i * gridSize, 0, i * gridSize, stage.height()],
        stroke: '#e0e0e0',
        strokeWidth: 1,
      })
    );
  }
  for (let j = 0; j < stage.height() / gridSize; j++) {
    gridLayer.add(
      new Konva.Line({
        points: [0, j * gridSize, stage.width(), j * gridSize],
        stroke: '#e0e0e0',
        strokeWidth: 1,
      })
    );
  }
  gridLayer.draw();

  const layer = new Konva.Layer();
  stage.add(layer);

  const square = new Konva.Rect({
    x: stage.width() / 2 - 50,
    y: stage.height() / 2 - 50,
    width: 100,
    height: 100,
    fill: 'blue',
    draggable: true,
  });

  layer.add(square);
  layer.draw();

  // Função de Zoom
  const scaleBy = 1.02; // Fator de zoom ajustado para maior fluidez
  let scale = 1.1; // Controle do nível de zoom

  stage.on('wheel', (e) => {
    e.evt.preventDefault();

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? 1 : -1;
    const zoomAmount = direction > 0 ? scaleBy : 1 / scaleBy;
    scale = Math.max(0.5, Math.min(3, scale * zoomAmount)); // Limita o zoom entre 0.5x e 3x

    stage.scale({ x: scale, y: scale });

    const newPos = {
      x: pointer.x - mousePointTo.x * scale,
      y: pointer.y - mousePointTo.y * scale,
    };

    stage.position(newPos);
    stage.batchDraw();
  });

  // Ajuste o palco e o grid ao redimensionar
  window.addEventListener('resize', () => {
    stage.width(window.innerWidth);
    stage.height(window.innerHeight);

    gridLayer.destroyChildren();
    for (let i = 0; i < stage.width() / gridSize; i++) {
      gridLayer.add(
        new Konva.Line({
          points: [i * gridSize, 0, i * gridSize, stage.height()],
          stroke: '#e0e0e0',
          strokeWidth: 1,
        })
      );
    }
    for (let j = 0; j < stage.height() / gridSize; j++) {
      gridLayer.add(
        new Konva.Line({
          points: [0, j * gridSize, stage.width(), j * gridSize],
          stroke: '#e0e0e0',
          strokeWidth: 1,
        })
      );
    }

    gridLayer.draw();
    layer.draw();
  });
}
