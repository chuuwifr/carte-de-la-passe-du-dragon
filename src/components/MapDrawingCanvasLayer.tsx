import React from "react";
import { MapDrawingElement, TacticalWaypoint } from "../types";
import { calculateDistanceBetweenPoints } from "../data/tacticalRouteData";

interface MapDrawingCanvasLayerProps {
  drawings: MapDrawingElement[];
  currentDrawing: MapDrawingElement | null;
  onSelectDrawing?: (drawing: MapDrawingElement) => void;
  isDrawingActive: boolean;
}

export const MapDrawingCanvasLayer: React.FC<MapDrawingCanvasLayerProps> = ({
  drawings,
  currentDrawing,
  onSelectDrawing,
  isDrawingActive,
}) => {
  const allDrawings = currentDrawing ? [...drawings, currentDrawing] : drawings;

  if (allDrawings.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 w-[1600px] h-[1100px] select-none pointer-events-none z-18"
      viewBox="0 0 1600 1100"
    >
      <defs>
        <marker
          id="drawing-arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#e2ba7d" />
        </marker>

        {/* Tactical Route Directional Chevrons */}
        <marker
          id="tactical-chevron-gold"
          markerWidth="8"
          markerHeight="8"
          refX="5"
          refY="4"
          orient="auto"
        >
          <path d="M 1 1 L 5 4 L 1 7" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
        </marker>
        <marker
          id="tactical-chevron-cyan"
          markerWidth="8"
          markerHeight="8"
          refX="5"
          refY="4"
          orient="auto"
        >
          <path d="M 1 1 L 5 4 L 1 7" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
        </marker>
        <marker
          id="tactical-chevron-crimson"
          markerWidth="8"
          markerHeight="8"
          refX="5"
          refY="4"
          orient="auto"
        >
          <path d="M 1 1 L 5 4 L 1 7" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
        </marker>
        <marker
          id="tactical-chevron-emerald"
          markerWidth="8"
          markerHeight="8"
          refX="5"
          refY="4"
          orient="auto"
        >
          <path d="M 1 1 L 5 4 L 1 7" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
        </marker>
        <marker
          id="tactical-chevron-purple"
          markerWidth="8"
          markerHeight="8"
          refX="5"
          refY="4"
          orient="auto"
        >
          <path d="M 1 1 L 5 4 L 1 7" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
        </marker>

        {/* Glow Filters */}
        <filter id="tactical-glow-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {allDrawings.map((draw) => {
        // =====================================================================
        // TACTICAL ROUTE WITH ANIMATED DOTTED / DASHED LINES & NODES
        // =====================================================================
        if (draw.type === "tactical_route") {
          const waypoints = (draw.routeWaypoints || (draw.points as TacticalWaypoint[]) || []);
          if (waypoints.length < 2) {
            // Single point being drafted
            if (waypoints.length === 1) {
              const p = waypoints[0];
              const px = (p.x / 100) * 1600;
              const py = (p.y / 100) * 1100;
              return (
                <g key={draw.id}>
                  <circle cx={px} cy={py} r="8" fill={draw.color} fillOpacity="0.4" stroke={draw.color} strokeWidth="2" className="anim-waypoint-pulse" />
                  <circle cx={px} cy={py} r="3" fill="#ffffff" />
                  <text x={px} y={py - 12} fill="#fef08a" fontSize="11" fontWeight="bold" textAnchor="middle" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    ① {p.name || "Départ"}
                  </text>
                </g>
              );
            }
            return null;
          }

          // Build SVG Path string
          const pathD = waypoints
            .map((wp, idx) => {
              const px = (wp.x / 100) * 1600;
              const py = (wp.y / 100) * 1100;
              return `${idx === 0 ? "M" : "L"} ${px} ${py}`;
            })
            .join(" ");

          const routeColor = draw.color || "#eab308";
          const styleType = draw.routeStyle || "animated_dash";
          const speed = draw.routeSpeed || "normal";
          const isReversed = !!draw.reverseDirection;

          let animClass = "anim-tactical-dash-normal";
          if (isReversed) {
            animClass = "anim-tactical-dash-reverse";
          } else if (speed === "fast") {
            animClass = "anim-tactical-dash-fast";
          } else if (speed === "slow") {
            animClass = "anim-tactical-dash-slow";
          }

          // Determine dash array and line appearance based on routeStyle
          let dashArray = "12 8";
          let strokeCap: "round" | "square" | "butt" = "round";

          if (styleType === "animated_dots") {
            dashArray = "4 12";
            strokeCap = "round";
          } else if (styleType === "caravan_tracks") {
            dashArray = "10 6 2 6";
            strokeCap = "square";
          } else if (styleType === "glowing_pulse") {
            dashArray = "16 10";
            strokeCap = "round";
          } else if (styleType === "marching_arrows") {
            dashArray = "14 10";
            strokeCap = "round";
          }

          return (
            <g
              key={draw.id}
              id={`tactical-route-${draw.id}`}
              className={`group ${isDrawingActive ? "pointer-events-none" : "cursor-pointer pointer-events-auto"}`}
              onClick={(e) => {
                if (!isDrawingActive && onSelectDrawing) {
                  e.stopPropagation();
                  onSelectDrawing(draw);
                }
              }}
            >
              {/* Invisible wide hit-box path for effortless clicking on route */}
              {!isDrawingActive && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="pointer-events-auto cursor-pointer"
                />
              )}
              {/* 1. Underlying dark glow stroke for high contrast readability */}
              <path
                d={pathD}
                fill="none"
                stroke="#09090b"
                strokeWidth={(draw.strokeWidth || 4) + 5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.85"
              />

              {/* 2. Outer Halo / Ambient Aura */}
              <path
                d={pathD}
                fill="none"
                stroke={routeColor}
                strokeWidth={(draw.strokeWidth || 4) + 3}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.25"
                filter="url(#tactical-glow-soft)"
              />

              {/* 3. Main Animated Dotted / Dashed Line */}
              <path
                d={pathD}
                fill="none"
                stroke={routeColor}
                strokeWidth={draw.strokeWidth || 3.5}
                strokeDasharray={dashArray}
                strokeLinecap={strokeCap}
                strokeLinejoin="round"
                className={`${animClass} ${styleType === "glowing_pulse" ? "anim-tactical-pulse" : ""}`}
              />

              {/* 4. Second line for Caravan Tracks if requested */}
              {styleType === "caravan_tracks" && (
                <path
                  d={pathD}
                  fill="none"
                  stroke={routeColor}
                  strokeWidth="1.5"
                  strokeDasharray="6 8"
                  strokeLinecap="butt"
                  strokeLinejoin="round"
                  strokeOpacity="0.75"
                  className={animClass}
                />
              )}

              {/* 5. Directional Arrow Chevrons on segment midpoints */}
              {waypoints.slice(0, -1).map((wp, i) => {
                const nextWp = waypoints[i + 1];
                const x1 = (wp.x / 100) * 1600;
                const y1 = (wp.y / 100) * 1100;
                const x2 = (nextWp.x / 100) * 1600;
                const y2 = (nextWp.y / 100) * 1100;

                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;

                const angleDeg = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
                const segDistKm = calculateDistanceBetweenPoints(wp, nextWp);

                return (
                  <g key={`chevron-${i}`}>
                    {/* Direction Chevron Arrow */}
                    <g transform={`translate(${midX}, ${midY}) rotate(${angleDeg})`}>
                      <path
                        d="M -6 -4 L 2 0 L -6 4"
                        fill="none"
                        stroke={routeColor}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>

                    {/* Segment distance badge */}
                    <g transform={`translate(${midX}, ${midY - 9})`}>
                      <rect
                        x="-20"
                        y="-8"
                        width="40"
                        height="14"
                        rx="3"
                        fill="#121217"
                        fillOpacity="0.9"
                        stroke={routeColor}
                        strokeWidth="0.75"
                      />
                      <text
                        x="0"
                        y="2.5"
                        fill="#fef08a"
                        fontSize="8.5"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                        textAnchor="middle"
                      >
                        {segDistKm} km
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* 6. Waypoint Nodes (Numbered pins & POI badges) */}
              {waypoints.map((wp, i) => {
                const wx = (wp.x / 100) * 1600;
                const wy = (wp.y / 100) * 1100;
                const isStart = i === 0;
                const isEnd = i === waypoints.length - 1;

                return (
                  <g key={`wp-${i}`} transform={`translate(${wx}, ${wy})`}>
                    {/* Ring aura */}
                    <circle
                      r={isStart || isEnd ? "7" : "5"}
                      fill="#121217"
                      stroke={routeColor}
                      strokeWidth={isStart || isEnd ? "2.5" : "1.5"}
                      className={isStart || isEnd ? "anim-waypoint-pulse" : ""}
                    />
                    <circle
                      r={isStart || isEnd ? "3" : "2"}
                      fill={isStart ? "#4ade80" : isEnd ? "#f43f5e" : "#ffffff"}
                    />

                    {/* Number Badge & POI label */}
                    <g transform="translate(0, -12)">
                      <rect
                        x="-30"
                        y="-10"
                        width="60"
                        height="16"
                        rx="4"
                        fill="#0c0c10"
                        fillOpacity="0.95"
                        stroke={routeColor}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="1.5"
                        fill="#f8fafc"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                        textAnchor="middle"
                      >
                        {isStart ? "🚩 " : isEnd ? "🎯 " : `${i + 1}. `}
                        {wp.name && wp.name.length > 11 ? `${wp.name.substring(0, 10)}…` : wp.name || `P${i + 1}`}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Route Global Title / Summary at First Segment */}
              {draw.label && waypoints.length >= 2 && (
                <g
                  transform={`translate(${((waypoints[0].x + waypoints[1].x) / 200) * 1600}, ${(
                    ((waypoints[0].y + waypoints[1].y) / 200) * 1100
                  ) + 18})`}
                >
                  <rect
                    x="-50"
                    y="-9"
                    width="100"
                    height="18"
                    rx="4"
                    fill="#181824"
                    fillOpacity="0.95"
                    stroke={routeColor}
                    strokeWidth="1.2"
                  />
                  <text
                    x="0"
                    y="3"
                    fill="#fef08a"
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="serif"
                    textAnchor="middle"
                  >
                    ⚔️ {draw.label}
                  </text>
                </g>
              )}
            </g>
          );
        }

        if (draw.type === "freehand" && draw.points && draw.points.length > 1) {
          const d = draw.points
            .map((p, idx) => {
              const px = (p.x / 100) * 1600;
              const py = (p.y / 100) * 1100;
              return `${idx === 0 ? "M" : "L"} ${px} ${py}`;
            })
            .join(" ");

          return (
            <path
              key={draw.id}
              d={d}
              fill="none"
              stroke={draw.color}
              strokeWidth={draw.strokeWidth || 3}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow"
            />
          );
        }

        if (draw.type === "line" && draw.points && draw.points.length >= 2) {
          const p1 = draw.points[0];
          const p2 = draw.points[1];
          const x1 = (p1.x / 100) * 1600;
          const y1 = (p1.y / 100) * 1100;
          const x2 = (p2.x / 100) * 1600;
          const y2 = (p2.y / 100) * 1100;

          return (
            <line
              key={draw.id}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={draw.color}
              strokeWidth={draw.strokeWidth || 3}
              strokeLinecap="round"
            />
          );
        }

        if (draw.type === "arrow" && draw.points && draw.points.length >= 2) {
          const p1 = draw.points[0];
          const p2 = draw.points[1];
          const x1 = (p1.x / 100) * 1600;
          const y1 = (p1.y / 100) * 1100;
          const x2 = (p2.x / 100) * 1600;
          const y2 = (p2.y / 100) * 1100;

          // Arrowhead calculation
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const headLength = 16;
          const arrowAngle = Math.PI / 6;

          const arrowX1 = x2 - headLength * Math.cos(angle - arrowAngle);
          const arrowY1 = y2 - headLength * Math.sin(angle - arrowAngle);
          const arrowX2 = x2 - headLength * Math.cos(angle + arrowAngle);
          const arrowY2 = y2 - headLength * Math.sin(angle + arrowAngle);

          return (
            <g key={draw.id} className="drop-shadow">
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={draw.color}
                strokeWidth={draw.strokeWidth || 3}
                strokeLinecap="round"
              />
              <polygon
                points={`${x2},${y2} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
                fill={draw.color}
              />
              {draw.label && (
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 8}
                  fill={draw.color}
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="bg-black/60 px-1 py-0.5 rounded"
                >
                  {draw.label}
                </text>
              )}
            </g>
          );
        }

        if (draw.type === "rect" && draw.x !== undefined && draw.y !== undefined) {
          const rx = (draw.x / 100) * 1600;
          const ry = (draw.y / 100) * 1100;
          const rw = ((draw.width || 10) / 100) * 1600;
          const rh = ((draw.height || 10) / 100) * 1100;

          return (
            <rect
              key={draw.id}
              x={rw < 0 ? rx + rw : rx}
              y={rh < 0 ? ry + rh : ry}
              width={Math.abs(rw)}
              height={Math.abs(rh)}
              fill={draw.fillColor || `${draw.color}22`}
              stroke={draw.color}
              strokeWidth={draw.strokeWidth || 2}
              strokeDasharray="6,4"
              rx="4"
            />
          );
        }

        if (draw.type === "circle" && draw.x !== undefined && draw.y !== undefined) {
          const cx = (draw.x / 100) * 1600;
          const cy = (draw.y / 100) * 1100;
          const r = ((draw.radius || 5) / 100) * 1600;

          return (
            <circle
              key={draw.id}
              cx={cx}
              cy={cy}
              r={r}
              fill={draw.fillColor || `${draw.color}22`}
              stroke={draw.color}
              strokeWidth={draw.strokeWidth || 2}
              strokeDasharray="6,4"
            />
          );
        }

        if (draw.type === "label" && draw.x !== undefined && draw.y !== undefined) {
          const lx = (draw.x / 100) * 1600;
          const ly = (draw.y / 100) * 1100;

          return (
            <g key={draw.id} transform={`translate(${lx}, ${ly})`}>
              <rect
                x="-4"
                y="-18"
                width={((draw.text?.length || 5) * 8) + 12}
                height="22"
                rx="4"
                fill="#181820"
                fillOpacity="0.85"
                stroke={draw.color}
                strokeWidth="1"
              />
              <text
                x="4"
                y="-3"
                fill={draw.color}
                fontSize={draw.fontSize || 12}
                fontWeight="bold"
              >
                {draw.text || "Note"}
              </text>
            </g>
          );
        }

        if (draw.type === "stamp" && draw.x !== undefined && draw.y !== undefined) {
          const sx = (draw.x / 100) * 1600;
          const sy = (draw.y / 100) * 1100;

          const stampSymbols: Record<string, string> = {
            air: "⚡",
            earth: "🌾",
            death: "💀",
            moon: "🌙",
            fire: "☀️",
            chaos: "⚠️",
            camp: "⛺",
            skull: "☠️",
            treasure: "💎",
            sword: "⚔️",
            shield: "🛡️",
          };

          const symbolChar = stampSymbols[draw.stampSymbol || "air"] || "📍";

          return (
            <g key={draw.id} transform={`translate(${sx}, ${sy})`}>
              <circle r="16" fill="#181820" stroke={draw.color} strokeWidth="2" />
              <text textAnchor="middle" dy="5" fontSize="16">
                {symbolChar}
              </text>
            </g>
          );
        }

        return null;
      })}
    </svg>
  );
};

