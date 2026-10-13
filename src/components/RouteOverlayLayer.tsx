import React from "react";
import {
  RouteCalculationResult,
  DRAGON_PASS_ROAD_SEGMENTS,
  DRAGON_PASS_ROUTE_NODES,
  DRAGON_PASS_MAP_OBSTACLES,
} from "../data/routeNetwork";
import { MapPin, AlertTriangle } from "lucide-react";

interface RouteOverlayLayerProps {
  showRoads: boolean;
  showObstacles: boolean;
  routeResult: RouteCalculationResult | null;
  startPoint: { x: number; y: number; name: string } | null;
  targetPoint: { x: number; y: number; name: string } | null;
}

export const RouteOverlayLayer: React.FC<RouteOverlayLayerProps> = ({
  showRoads,
  showObstacles,
  routeResult,
  startPoint,
  targetPoint,
}) => {
  return (
    <svg
      id="route-overlay-svg-layer"
      viewBox="0 0 1600 1100"
      width="1600"
      height="1100"
      className="absolute inset-0 w-[1600px] h-[1100px] pointer-events-none z-15 select-none"
    >
      <defs>
        {/* Glow filter for active route */}
        <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Diagonal danger stripe pattern for obstacles */}
        <pattern id="obstacle-stripes" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="20" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="3" />
        </pattern>

        <pattern id="swamp-stripes" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="20" stroke="rgba(16, 185, 129, 0.35)" strokeWidth="3" />
        </pattern>
      </defs>

      {/* ============================================================ */}
      {/* 1. OBSTACLES & RESTRICTED TERRAIN POLYGONS                   */}
      {/* ============================================================ */}
      {showObstacles && (
        <g id="map-obstacles-layer">
          {DRAGON_PASS_MAP_OBSTACLES.map((obs) => {
            const pointsString = obs.polygon
              .map((p) => `${(p.x / 100) * 1600},${(p.y / 100) * 1100}`)
              .join(" ");

            const isChaos = obs.type === "chaos_nest";
            const isSwamp = obs.type === "cursed_swamp";

            const strokeColor = isChaos
              ? "rgba(239, 68, 68, 0.8)"
              : isSwamp
              ? "rgba(16, 185, 129, 0.8)"
              : "rgba(217, 119, 6, 0.7)";

            const fillColor = isChaos
              ? "url(#obstacle-stripes)"
              : isSwamp
              ? "url(#swamp-stripes)"
              : "rgba(120, 53, 15, 0.25)";

            // Calculate center of polygon for label
            const avgX = (obs.polygon.reduce((acc, p) => acc + p.x, 0) / obs.polygon.length / 100) * 1600;
            const avgY = (obs.polygon.reduce((acc, p) => acc + p.y, 0) / obs.polygon.length / 100) * 1100;

            return (
              <g key={`obs-${obs.id}`} opacity="0.9">
                <polygon
                  points={pointsString}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="2.5"
                  strokeDasharray="6,4"
                />
                <text
                  x={avgX}
                  y={avgY}
                  fill="#fecdd3"
                  fontSize="12"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                >
                  ⚠️ {obs.nameFr.split("(")[0].trim()}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {/* ============================================================ */}
      {/* 2. BASE ROAD NETWORK (When enabled)                          */}
      {/* ============================================================ */}
      {showRoads && (
        <g id="road-network-layer" opacity="0.65">
          {DRAGON_PASS_ROAD_SEGMENTS.map((seg) => {
            const fromNode = DRAGON_PASS_ROUTE_NODES.find((n) => n.id === seg.fromId);
            const toNode = DRAGON_PASS_ROUTE_NODES.find((n) => n.id === seg.toId);
            if (!fromNode || !toNode) return null;

            const x1 = (fromNode.coords.x / 100) * 1600;
            const y1 = (fromNode.coords.y / 100) * 1100;
            const x2 = (toNode.coords.x / 100) * 1600;
            const y2 = (toNode.coords.y / 100) * 1100;

            const isHighway = seg.roadType === "royal_highway";
            const strokeColor = isHighway ? "#f59e0b" : "#a1a1aa";
            const strokeWidth = isHighway ? "3" : "1.8";
            const strokeDash = isHighway ? undefined : "5,4";

            return (
              <line
                key={`road-${seg.id}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDash}
                strokeLinecap="round"
              />
            );
          })}
        </g>
      )}

      {/* ============================================================ */}
      {/* 3. CALCULATED OPTIMAL ROUTE (Glowing Polyline & Nodes)        */}
      {/* ============================================================ */}
      {routeResult && routeResult.nodes.length >= 2 && (
        <g id="active-calculated-route">
          {/* Background thick halo */}
          {routeResult.nodes.map((node, idx) => {
            if (idx === routeResult.nodes.length - 1) return null;
            const nextNode = routeResult.nodes[idx + 1];
            const x1 = (node.coords.x / 100) * 1600;
            const y1 = (node.coords.y / 100) * 1100;
            const x2 = (nextNode.coords.x / 100) * 1600;
            const y2 = (nextNode.coords.y / 100) * 1100;

            return (
              <line
                key={`route-halo-${idx}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#0f172a"
                strokeWidth="10"
                strokeLinecap="round"
                opacity="0.7"
              />
            );
          })}

          {/* Glowing Animated Main Route Line */}
          {routeResult.nodes.map((node, idx) => {
            if (idx === routeResult.nodes.length - 1) return null;
            const nextNode = routeResult.nodes[idx + 1];
            const x1 = (node.coords.x / 100) * 1600;
            const y1 = (node.coords.y / 100) * 1100;
            const x2 = (nextNode.coords.x / 100) * 1600;
            const y2 = (nextNode.coords.y / 100) * 1100;

            return (
              <g key={`route-segment-${idx}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#fbbf24"
                  strokeWidth="5"
                  strokeLinecap="round"
                  filter="url(#route-glow)"
                />
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeDasharray="8,6"
                  strokeLinecap="round"
                  className="anim-route-dash"
                />
              </g>
            );
          })}

          {/* Intermediate Waypoint Dots */}
          {routeResult.nodes.map((node, idx) => {
            const x = (node.coords.x / 100) * 1600;
            const y = (node.coords.y / 100) * 1100;
            const isStart = idx === 0;
            const isEnd = idx === routeResult.nodes.length - 1;

            if (isStart || isEnd) return null;

            return (
              <g key={`waypoint-${idx}`}>
                <circle cx={x} cy={y} r="6" fill="#18181b" stroke="#fbbf24" strokeWidth="2.5" />
                <circle cx={x} cy={y} r="2.5" fill="#fef08a" />
                <text
                  x={x}
                  y={y - 10}
                  fill="#fef08a"
                  fontSize="10"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                >
                  {node.nameFr.split("(")[0]}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {/* ============================================================ */}
      {/* 4. START (A) & TARGET (B) PIN MARKERS                        */}
      {/* ============================================================ */}
      {startPoint && (
        <g id="route-start-marker" transform={`translate(${(startPoint.x / 100) * 1600}, ${(startPoint.y / 100) * 1100})`}>
          <circle cx="0" cy="0" r="14" fill="rgba(16, 185, 129, 0.3)" className="animate-ping" />
          <circle cx="0" cy="0" r="12" fill="#065f46" stroke="#34d399" strokeWidth="3" />
          <text x="0" y="4" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            A
          </text>
          <text
            x="0"
            y="-16"
            fill="#a7f3d0"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="sans-serif"
            className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
          >
            Départ : {startPoint.name}
          </text>
        </g>
      )}

      {targetPoint && (
        <g id="route-target-marker" transform={`translate(${(targetPoint.x / 100) * 1600}, ${(targetPoint.y / 100) * 1100})`}>
          <circle cx="0" cy="0" r="14" fill="rgba(239, 68, 68, 0.3)" className="animate-ping" />
          <circle cx="0" cy="0" r="12" fill="#991b1b" stroke="#f87171" strokeWidth="3" />
          <text x="0" y="4" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            B
          </text>
          <text
            x="0"
            y="-16"
            fill="#fecaca"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="sans-serif"
            className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
          >
            Arrivée : {targetPoint.name}
          </text>
        </g>
      )}
    </svg>
  );
};
