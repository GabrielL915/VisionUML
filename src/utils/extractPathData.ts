export function extractPathData(svgText: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, "image/svg+xml");
    const pathElement = doc.querySelector("path");
    return pathElement?.getAttribute("d") || "";
  }
  