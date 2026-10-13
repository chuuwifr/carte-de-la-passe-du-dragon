import React, { useEffect, useRef, useState, useCallback } from "react";
import { MapBackgroundConfig } from "../types";
import {
  getCachedPdfDoc,
  loadPdfDocument,
  renderPdfPageToCanvas,
} from "../utils/pdfMapRenderer";
import { loadPdfBufferFromStorage } from "../utils/storage";

interface PdfMapBackgroundLayerProps {
  backgroundConfig: MapBackgroundConfig;
  currentZoom: number;
}

export const PdfMapBackgroundLayer: React.FC<PdfMapBackgroundLayerProps> = ({
  backgroundConfig,
  currentZoom,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [renderError, setRenderError] = useState(false);
  const isRenderingRef = useRef(false);
  const lastRenderedPageRef = useRef<number | null>(null);
  const lastRenderedScaleRef = useRef<number | null>(null);

  // Desired render quality scale based on settings & current zoom
  const baseScale = backgroundConfig.pdfScale || 3.0;
  // Dynamically boost scale when user zooms in deeply (capped safely)
  const dynamicScale = Math.min(5.0, Math.max(baseScale, currentZoom * 1.5));

  const pageNumber = backgroundConfig.pdfPageIndex || 1;

  const renderCanvas = useCallback(async () => {
    if (!canvasRef.current || backgroundConfig.type !== "pdf") return;
    if (isRenderingRef.current) return;

    // Check if we already rendered this exact page at sufficient scale
    if (
      lastRenderedPageRef.current === pageNumber &&
      lastRenderedScaleRef.current !== null &&
      Math.abs(lastRenderedScaleRef.current - dynamicScale) < 0.3 &&
      canvasReady
    ) {
      return;
    }

    isRenderingRef.current = true;

    try {
      let activeDoc = getCachedPdfDoc().pdfDoc;

      if (!activeDoc) {
        // Try loading from IndexedDB buffer
        const cached = await loadPdfBufferFromStorage();
        if (cached?.buffer) {
          const res = await loadPdfDocument(cached.buffer, cached.fileName);
          activeDoc = res.pdfDoc;
        }
      }

      if (activeDoc && canvasRef.current) {
        await renderPdfPageToCanvas(activeDoc, pageNumber, canvasRef.current, dynamicScale);
        lastRenderedPageRef.current = pageNumber;
        lastRenderedScaleRef.current = dynamicScale;
        setCanvasReady(true);
        setRenderError(false);
      } else {
        // Fallback to dataUrl image
        setCanvasReady(false);
      }
    } catch (err) {
      console.warn("Direct Canvas PDF render fallback to dataURL:", err);
      setRenderError(true);
      setCanvasReady(false);
    } finally {
      isRenderingRef.current = false;
    }
  }, [backgroundConfig.type, pageNumber, dynamicScale, canvasReady]);

  // Debounced render on page or zoom change
  useEffect(() => {
    const timer = setTimeout(() => {
      renderCanvas();
    }, 120);

    return () => clearTimeout(timer);
  }, [renderCanvas]);

  const fitClass =
    backgroundConfig.pdfFitMode === "cover"
      ? "object-cover"
      : backgroundConfig.pdfFitMode === "contain"
      ? "object-contain"
      : "object-fill";

  return (
    <div
      id="custom-pdf-image-map-layer"
      className="absolute inset-0 w-[1600px] h-[1100px] pointer-events-none"
      style={{
        opacity: backgroundConfig.opacity ?? 1,
        filter: `brightness(${backgroundConfig.brightness ?? 1}) contrast(${backgroundConfig.contrast ?? 1})`,
      }}
    >
      {/* High-Resolution Direct Vector Canvas (Active when PDF doc is loaded) */}
      {backgroundConfig.type === "pdf" && !renderError && (
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full pointer-events-none drop-shadow-2xl select-none transition-opacity duration-300 ${fitClass} ${
            canvasReady ? "opacity-100" : "opacity-0"
          }`}
          style={{
            imageRendering: "auto",
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
            transform: "translateZ(0)",
          }}
        />
      )}

      {/* High-Quality Image Layer (Active for Image imports or as instant backdrop while canvas renders) */}
      {backgroundConfig.pdfDataUrl && (!canvasReady || backgroundConfig.type === "image" || renderError) && (
        <img
          src={backgroundConfig.pdfDataUrl}
          alt={backgroundConfig.pdfFileName || "Fond de carte"}
          className={`w-full h-full pointer-events-none drop-shadow-2xl select-none ${fitClass}`}
          style={{
            imageRendering: "-webkit-optimize-contrast",
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
            transform: "translateZ(0)",
          }}
          referrerPolicy="no-referrer"
        />
      )}

      {/* Spinner placeholder if nothing is ready yet */}
      {!backgroundConfig.pdfDataUrl && !canvasReady && (
        <div className="absolute inset-0 w-[1600px] h-[1100px] flex flex-col items-center justify-center bg-[#18181e] text-[#e2ba7d] gap-3">
          <div className="w-10 h-10 border-3 border-[#e2ba7d] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold">Rendu haute résolution de la carte PDF...</p>
          {backgroundConfig.pdfFileName && (
            <p className="text-xs text-[#8e8e93] font-mono">{backgroundConfig.pdfFileName}</p>
          )}
        </div>
      )}
    </div>
  );
};
