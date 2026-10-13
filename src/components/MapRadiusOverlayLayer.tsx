import React from "react";
import { MapRadiusZone } from "../types";

interface MapRadiusOverlayLayerProps {
  zones: MapRadiusZone[];
  selectedZoneId: string | null;
  onSelectZone: (zone: MapRadiusZone) => void;
}

export const MapRadiusOverlayLayer: React.FC<MapRadiusOverlayLayerProps> = ({
  zones,
  selectedZoneId,
  onSelectZone,
}) => {
  if (!zones || zones.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 w-[1600px] h-[1100px] pointer-events-none z-15 select-none"
      viewBox="0 0 1600 1100"
    >
      <defs>
        <filter id="radius-pulse-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {zones
        .filter((zone) => zone.visible)
        .map((zone) => {
          // Convert percentage center to pixel canvas coordinates (1600 x 1100)
          const cx = (zone.center.x / 100) * 1600;
          const cy = (zone.center.y / 100) * 1100;

          // Convert radiusKm to pixel radius (1600px = 320km => 5px per km)
          const rPx = zone.radiusKm * 5;

          const isSelected = selectedZoneId === zone.id;

          return (
            <g
              key={zone.id}
              className="cursor-pointer pointer-events-auto group"
              onClick={(e) => {
                e.stopPropagation();
                onSelectZone(zone);
              }}
            >
              {/* Animated Outer Pulse Ring */}
              {zone.pulseAnimation && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={rPx + 6}
                  fill="none"
                  stroke={zone.strokeColor || zone.color}
                  strokeWidth="1.5"
                  strokeDasharray="6,6"
                  opacity="0.4"
                  className="animate-pulse"
                />
              )}

              {/* Main Area Fill Circle */}
              <circle
                cx={cx}
                cy={cy}
                r={rPx}
                fill={zone.color}
                fillOpacity={zone.fillOpacity || 0.15}
                stroke={zone.strokeColor || zone.color}
                strokeWidth={isSelected ? 3 : 2}
                strokeDasharray={zone.type === "watch_tower" ? "4,4" : undefined}
                filter={isSelected ? "url(#radius-pulse-glow)" : undefined}
                className="transition-all duration-200 group-hover:stroke-width-3"
              />

              {/* Center Anchor Point */}
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? 6 : 4}
                fill={zone.strokeColor || zone.color}
                stroke="#ffffff"
                strokeWidth="1.5"
              />

              {/* Floating Label */}
              <g transform={`translate(${cx}, ${cy - rPx - 8})`}>
                <rect
                  x="-80"
                  y="-18"
                  width="160"
                  height="22"
                  rx="6"
                  fill="#141419"
                  fillOpacity="0.9"
                  stroke={zone.strokeColor || zone.color}
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="-3"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                  letterSpacing="0.5"
                >
                  {zone.label || zone.name}
                </text>
              </g>

              {/* Stades / KM Indicator */}
              <text
                x={cx}
                y={cy + 18}
                textAnchor="middle"
                fill={zone.strokeColor || zone.color}
                fontSize="10"
                fontWeight="bold"
                opacity="0.8"
                className="pointer-events-none drop-shadow"
              >
                Ø {zone.radiusKm * 2} km ({zone.radiusStades * 2} st.)
              </text>
            </g>
          );
        })}
    </svg>
  );
};
