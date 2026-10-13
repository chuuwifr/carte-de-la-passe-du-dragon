import React, { useState, useRef, useCallback } from "react";
import { Maximize2, Minimize2, Map as MapIcon, Compass } from "lucide-react";
import { PointOfInterest } from "../types";

interface MapMinimapRadarProps {
  zoom: number;
  pan: { x: number; y: number };
  containerWidth: number;
  containerHeight: number;
  onPanTo: (pan: { x: number; y: number }) => void;
  locations: PointOfInterest[];
}

export const MapMinimapRadar: React.FC<MapMinimapRadarProps> = ({
  zoom,
  pan,
  containerWidth,
  containerHeight,
  onPanTo,
  locations,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const radarRef = useRef<HTMLDivElement>(null);

  // Radar dimension (fixed aspect ratio 1600 / 1100 = 1.4545)
  const radarWidth = 180;
  const radarHeight = 124;

  const mapTotalWidth = 1600;
  const mapTotalHeight = 1100;

  // Viewport calculation
  // Visible region width in unzoomed map coordinates: containerWidth / zoom
  const visibleWidthInMap = Math.min(mapTotalWidth, containerWidth / zoom);
  const visibleHeightInMap = Math.min(mapTotalHeight, containerHeight / zoom);

  // Top-left visible corner in unzoomed map coordinates
  const visibleLeftInMap = Math.max(0, Math.min(mapTotalWidth - visibleWidthInMap, -pan.x / zoom));
  const visibleTopInMap = Math.max(0, Math.min(mapTotalHeight - visibleHeightInMap, -pan.y / zoom));

  // Scale down to radar coordinates
  const scaleX = radarWidth / mapTotalWidth;
  const scaleY = radarHeight / mapTotalHeight;

  const boxX = visibleLeftInMap * scaleX;
  const boxY = visibleTopInMap * scaleY;
  const boxW = Math.min(radarWidth, visibleWidthInMap * scaleX);
  const boxH = Math.min(radarHeight, visibleHeightInMap * scaleY);

  const handleRadarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!radarRef.current) return;
      const rect = radarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Click in unzoomed map coordinates
      const targetMapX = (clickX / radarWidth) * mapTotalWidth;
      const targetMapY = (clickY / radarHeight) * mapTotalHeight;

      // Target pan to center this point on screen
      const newPanX = containerWidth / 2 - targetMapX * zoom;
      const newPanY = containerHeight / 2 - targetMapY * zoom;

      onPanTo({ x: newPanX, y: newPanY });
    },
    [containerWidth, containerHeight, zoom, onPanTo]
  );

  return (
    <div
      id="map-minimap-radar"
      className="absolute bottom-4 right-4 z-30 select-none transition-all duration-300"
    >
      <div className="bg-[#141419]/95 backdrop-blur-md border border-[#2d2d35] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-2.5 py-1 bg-[#1a1a22] border-b border-[#2d2d35] flex items-center justify-between text-[10px] text-[#8e8e93]">
          <div className="flex items-center gap-1.5 font-bold text-[#e2ba7d] uppercase tracking-wider">
            <Compass className="w-3 h-3 text-[#e2ba7d]" />
            <span>Radar Dragon Pass</span>
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-0.5 hover:text-white transition"
            title={isMinimized ? "Agrandir le radar" : "Réduire"}
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
        </div>

        {/* Radar Canvas Body */}
        {!isMinimized && (
          <div
            ref={radarRef}
            onClick={handleRadarClick}
            className="relative cursor-crosshair bg-[#0d0d12] overflow-hidden"
            style={{ width: `${radarWidth}px`, height: `${radarHeight}px` }}
          >
            {/* Background SVG representation */}
            <svg
              width={radarWidth}
              height={radarHeight}
              viewBox="0 0 1600 1100"
              className="absolute inset-0 pointer-events-none opacity-40"
            >
              {/* Rivers */}
              <path
                d="M 300 200 Q 600 400 700 800"
                stroke="#0284c7"
                strokeWidth="24"
                fill="none"
              />
              <path
                d="M 800 200 Q 900 500 1200 900"
                stroke="#0284c7"
                strokeWidth="20"
                fill="none"
              />

              {/* Major Mountains (Kero Fin, Dragon Spine) */}
              <polygon points="704,330 730,420 678,420" fill="#78350f" />
              <polygon points="850,280 880,360 820,360" fill="#78350f" />

              {/* Major Town Dots */}
              {locations.slice(0, 15).map((loc) => (
                <circle
                  key={loc.id}
                  cx={(loc.coords.x / 100) * 1600}
                  cy={(loc.coords.y / 100) * 1100}
                  r="16"
                  fill="#e2ba7d"
                />
              ))}
            </svg>

            {/* Viewport Rectangle Box (Where the camera is looking) */}
            <div
              className="absolute border-2 border-[#e2ba7d] bg-[#e2ba7d]/20 rounded-xs shadow-[0_0_8px_rgba(226,186,125,0.4)] pointer-events-none transition-all duration-75"
              style={{
                left: `${boxX}px`,
                top: `${boxY}px`,
                width: `${Math.max(8, boxW)}px`,
                height: `${Math.max(8, boxH)}px`,
              }}
            >
              {/* Center Crosshair in box */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-full bg-[#e2ba7d]" />
              </div>
            </div>

            {/* Radar Sweep Animation Effect */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-[#e2ba7d]/5 to-transparent animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};
