import Konva from "konva";
import { stage, dynamicLayer, updateZoom, initializeStage } from "./stage";
import { extractPathData } from "./utils/extractPathData";

export function initializeUI() {
  const appContainer = document.querySelector<HTMLDivElement>("#app");
  if (!appContainer) throw new Error("App container not found");

  appContainer.innerHTML = `
    <div class="w-screen h-screen bg-white relative">
      <div id="umlCanvas" class="w-full h-full"></div>
      <div class="fixed bottom-4 left-0 right-0 flex justify-center pointer-events-none">
        <!-- Controles de Zoom -->
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

  initializeStage();

  document.getElementById("zoomIn")?.addEventListener("click", () => updateZoom(1));
  document.getElementById("zoomOut")?.addEventListener("click", () => updateZoom(-1));

  document.getElementById("useCaseButton")?.addEventListener("click", addUseCase);
}

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
