// Polyfill for environments where global Iterator is not defined
if (typeof window !== "undefined" && !(window as any).Iterator) {
  try {
    (window as any).Iterator = class Iterator {};
  } catch (e) {
    // Ignore polyfill error
  }
}

import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.js?url";

let workerInitialized = false;

// In-memory document and buffer cache for instantaneous page switching & multi-scale renders
let cachedPdfDoc: pdfjsLib.PDFDocumentProxy | null = null;
let cachedPdfFingerprint: string | null = null;
let cachedPdfFileName: string | null = null;
let cachedPdfBuffer: ArrayBuffer | null = null;

function initPdfWorker() {
  if (workerInitialized || typeof window === "undefined") return;
  try {
    // In Vite/modern browsers, configure worker source with fallback
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    workerInitialized = true;
  } catch (e) {
    console.warn("Could not set primary pdf workerSrc, will use fallback mode", e);
  }
}

export interface PdfDocumentInfo {
  numPages: number;
  fileName: string;
  fingerprint: string;
}

export function getCachedPdfDoc(): {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  fileName: string | null;
  buffer: ArrayBuffer | null;
} {
  return {
    pdfDoc: cachedPdfDoc,
    fileName: cachedPdfFileName,
    buffer: cachedPdfBuffer,
  };
}

export function setCachedPdfDoc(
  doc: pdfjsLib.PDFDocumentProxy | null,
  fileName: string | null,
  buffer: ArrayBuffer | null = null
) {
  cachedPdfDoc = doc;
  cachedPdfFileName = fileName;
  if (buffer) {
    cachedPdfBuffer = buffer.slice(0);
  }
  if (doc) {
    cachedPdfFingerprint =
      (doc as any).fingerprints?.[0] ||
      (doc as any).fingerprint ||
      `pdf-${Date.now()}`;
  } else {
    cachedPdfFingerprint = null;
    cachedPdfBuffer = null;
  }
}

export async function loadPdfDocument(
  arrayBuffer: ArrayBuffer,
  fileName: string
): Promise<{
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  info: PdfDocumentInfo;
}> {
  initPdfWorker();

  // If already cached in memory, reuse the parsed PDF proxy
  if (cachedPdfDoc && cachedPdfFileName === fileName) {
    return {
      pdfDoc: cachedPdfDoc,
      info: {
        numPages: cachedPdfDoc.numPages,
        fileName,
        fingerprint: cachedPdfFingerprint || `pdf-${Date.now()}`,
      },
    };
  }

  // Create a copy of the buffer to prevent neutering across worker threads
  const bufferCopy = arrayBuffer.slice(0);
  const data = new Uint8Array(bufferCopy);

  try {
    const loadingTask = pdfjsLib.getDocument({
      data,
      cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version || "3.11.174"}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version || "3.11.174"}/standard_fonts/`,
      isEvalSupported: false,
    });

    const pdfDoc = await loadingTask.promise;
    const fp =
      (pdfDoc as any).fingerprints?.[0] ||
      (pdfDoc as any).fingerprint ||
      `pdf-${Date.now()}`;

    setCachedPdfDoc(pdfDoc, fileName, arrayBuffer);

    return {
      pdfDoc,
      info: {
        numPages: pdfDoc.numPages,
        fileName,
        fingerprint: fp,
      },
    };
  } catch (err: any) {
    console.warn("Primary PDF load failed, attempting fallback task configuration...", err);

    // Fallback: Try with local in-memory fallback
    try {
      const fallbackTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer.slice(0)),
        cMapPacked: true,
        isEvalSupported: false,
      });

      const pdfDoc = await fallbackTask.promise;
      const fp =
        (pdfDoc as any).fingerprints?.[0] ||
        (pdfDoc as any).fingerprint ||
        `pdf-${Date.now()}`;

      setCachedPdfDoc(pdfDoc, fileName, arrayBuffer);

      return {
        pdfDoc,
        info: {
          numPages: pdfDoc.numPages,
          fileName,
          fingerprint: fp,
        },
      };
    } catch (fallbackErr) {
      console.error("All PDF loading strategies failed:", fallbackErr);
      throw new Error(
        fallbackErr instanceof Error
          ? fallbackErr.message
          : "Format PDF non supporté ou document corrompu"
      );
    }
  }
}

/**
 * Direct high-performance rendering into a Canvas element.
 * Vector curves, runes and typography stay sharp without lossy compression.
 */
export async function renderPdfPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number = 3.0
): Promise<{ width: number; height: number }> {
  const page = await pdfDoc.getPage(pageNumber);

  // Auto-calculate scale based on device pixel ratio if available
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  let effectiveScale = Math.max(1.0, Math.min(6.0, scale * Math.max(1, dpr * 0.9)));
  let viewport = page.getViewport({ scale: effectiveScale });

  const maxDimension = 8192;
  if (viewport.width > maxDimension || viewport.height > maxDimension) {
    const factor = maxDimension / Math.max(viewport.width, viewport.height);
    effectiveScale = effectiveScale * factor;
    viewport = page.getViewport({ scale: effectiveScale });
  }

  const context = canvas.getContext("2d", { alpha: false });
  if (!context) {
    throw new Error("Impossible de créer le contexte 2D Canvas");
  }

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  // Clean background fill
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  const renderTask = page.render(renderContext as any);
  await (renderTask as any).promise;

  return {
    width: viewport.width,
    height: viewport.height,
  };
}

/**
 * Renders a PDF page to a crisp, high-resolution Data URL.
 * Uses PNG / high-quality WebP format instead of low-quality JPEG to prevent
 * loss of resolution, ringing artifacts, and blurry map text.
 */
export async function renderPdfPageToDataUrl(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number = 3.0
): Promise<{ dataUrl: string; width: number; height: number }> {
  const page = await pdfDoc.getPage(pageNumber);

  // Calculate viewport with high fidelity scaling (default 3.0x for razor sharp lines)
  let effectiveScale = Math.max(1.0, Math.min(6.0, scale));
  let viewport = page.getViewport({ scale: effectiveScale });

  // Max dimension 8192px for ultra-high-definition maps
  const maxDimension = 8192;
  if (viewport.width > maxDimension || viewport.height > maxDimension) {
    const factor = maxDimension / Math.max(viewport.width, viewport.height);
    effectiveScale = effectiveScale * factor;
    viewport = page.getViewport({ scale: effectiveScale });
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) {
    throw new Error("Impossible de créer le contexte 2D Canvas");
  }

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  // Background fill with clean neutral white
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  const renderTask = page.render(renderContext as any);
  await (renderTask as any).promise;

  // Use lossless PNG or near-lossless high-fidelity WebP to completely eliminate JPEG compression degradation
  let dataUrl: string;
  try {
    dataUrl = canvas.toDataURL("image/webp", 0.98);
    if (!dataUrl.startsWith("data:image/webp")) {
      dataUrl = canvas.toDataURL("image/png");
    }
  } catch {
    dataUrl = canvas.toDataURL("image/png");
  }

  return {
    dataUrl,
    width: viewport.width,
    height: viewport.height,
  };
}


