import Konva from "konva";
import { stage, dynamicLayer, updateZoom, initializeStage } from "./stage";
import { extractPathData } from "./utils/extractPathData";

export function initializeUI() {
  const appContainer = document.querySelector<HTMLDivElement>("#app");
  if (!appContainer) throw new Error("App container not found");

  // Tela de Boas-vindas inicial
  appContainer.innerHTML = `
    <div class="w-screen h-screen bg-white flex flex-col items-center justify-center">
      <div class="text-center mb-8">
      <img src="/visionUML.png" alt="VisionUML Logo" class="w-64 h-auto mx-auto mb-4">
        <p class="text-gray-600">Dados são salvos no navegador</p>
      </div>
      <div class="flex flex-col gap-4">
        <button id="newProject" class="bg-[#FFDE00] hover:bg-[#FFDE00]/90 text-gray-600 px-6 py-3 rounded-lg transition-colors">
          Novo Diagrama
        </button>
        <div class="flex gap-4">
          <button class="text-gray-600 hover:bg-[#fffbdf]/90 px-4 py-2 rounded-lg transition-colors">
            Abrir
          </button>
          <button class="text-gray-600 hover:bg-[#fffbdf]/90 px-4 py-2 rounded-lg transition-colors">
            Github
          </button>
        </div>
      </div>
    </div>
  `;

  // Evento para transição ao Quadro Branco
  document.getElementById("newProject")?.addEventListener("click", () => {
    loadWhiteboardInterface(appContainer);
  });
}

function loadWhiteboardInterface(container: HTMLDivElement) {
  container.innerHTML = `
    <div class="w-screen h-screen bg-white relative">
      <div id="umlCanvas" class="w-full h-full"></div>
      
      <!-- Toolbar Vertical Topo Direito -->
      <div class="fixed top-4 right-4 flex flex-col bg-white rounded-lg shadow-lg p-2 gap-2 pointer-events-auto">
        <button id="selectButton" title="Selecionar">
          <img src="Arrow.png" alt="Selecionar" class="w-6 h-6" />
        </button>
        <button id="dragButton" title="Arrastar">
          <img src="Grab.png" alt="Arrastar" class="w-6 h-6" />
        </button>
        <button id="exportButton" title="Exportar">
          <img src="use-case.svg" alt="Exportar" class="w-6 h-6" />
        </button>
      </div>
      
      <!-- Toolbar Inferior -->
      <div class="fixed bottom-4 left-0 right-0 flex justify-center pointer-events-none">
        <div class="absolute left-4 bottom-0 bg-white rounded-lg shadow-lg p-2 flex items-center gap-2 pointer-events-auto">
          <button id="zoomOut" class="px-3 py-1 hover:bg-gray-100 rounded">-</button>
          <span id="zoomLevel" class="text-sm w-12 text-center">100%</span>
          <button id="zoomIn" class="px-3 py-1 hover:bg-gray-100 rounded">+</button>
        </div>
        <div class="bg-black rounded-lg shadow-lg p-2 flex space-x-4 items-center pointer-events-auto">
          <button id="useCaseButton" class="px-4 py-1 bg-white text-blue-500 rounded hover:bg-blue-50 transition-colors">UseCase</button>
          <button class="px-4 py-1 bg-white text-blue-500 rounded hover:bg-blue-50 transition-colors">Teste</button>
          <button class="px-4 py-1 bg-white text-blue-500 rounded hover:bg-blue-50 transition-colors">Teste</button>
          <div class="h-4 w-px bg-blue-300"></div>
          <button class="px-4 py-1 bg-white text-blue-500 rounded hover:bg-blue-50 transition-colors">Oi</button>
        </div>
      </div>
    </div>
  `;

  initializeStage();
  setupWhiteboardEvents();
}

function setupWhiteboardEvents() {
  document.getElementById("zoomIn")?.addEventListener("click", () => updateZoom(1));
  document.getElementById("zoomOut")?.addEventListener("click", () => updateZoom(-1));
  document.getElementById("useCaseButton")?.addEventListener("click", addUseCase);
}

async function addUseCase() {
  try {
    const svgText = await fetch("/use-case.svg").then((res) => res.text());
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