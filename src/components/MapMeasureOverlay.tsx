import React, { useState } from "react";
import {
  MeasurePoint,
  MeasureTerrainType,
  MEASURE_TERRAIN_CONFIGS,
  calculateMeasureDetails,
  MeasureCalculationResult,
} from "../data/measureTerrainData";
import {
  Ruler,
  Compass,
  Mountain,
  Trees,
  Wheat,
  Waves,
  Milestone,
  ArrowRightLeft,
  X,
  RotateCcw,
  Navigation,
  Footprints,
  Sparkles,
  Check,
  Copy,
  ChevronDown,
  Info,
} from "lucide-react";
import { PointOfInterest } from "../types";

// =============================================================================
// Helper: Get Terrain Icon
// =============================================================================
export const getMeasureTerrainIcon = (type: MeasureTerrainType, className = "w-4 h-4") => {
  switch (type) {
    case "montagne":
      return <Mountain className={className} />;
    case "foret":
      return <Trees className={className} />;
    case "marais":
      return <Waves className={className} />;
    case "route":
      return <Milestone className={className} />;
    case "plaine":
    default:
      return <Wheat className={className} />;
  }
};

// =============================================================================
// 1. MAP CANVAS LAYER (Rendered inside 1600x1100 px map-transform-layer)
// =============================================================================
interface MapMeasureCanvasLayerProps {
  points: MeasurePoint[];
  cursorHoverPoint: { x: number; y: number } | null;
  selectedTerrain: MeasureTerrainType;
  onOpenContextMenuAt: (x: number, y: number) => void;
}

export const MapMeasureCanvasLayer: React.FC<MapMeasureCanvasLayerProps> = ({
  points,
  cursorHoverPoint,
  selectedTerrain,
  onOpenContextMenuAt,
}) => {
  const p1 = points[0] || null;
  const p2 = points[1] || (points.length === 1 ? cursorHoverPoint : null);

  const isComplete = points.length >= 2;
  const isPreview = points.length === 1 && !!cursorHoverPoint;

  const calcResult = p1 && p2 ? calculateMeasureDetails(p1, p2, selectedTerrain) : null;
  const currentTerrainConfig = MEASURE_TERRAIN_CONFIGS[selectedTerrain];

  // Map 0-100% coords to 1600x1100 px canvas
  const svgP1 = p1 ? { x: (p1.x / 100) * 1600, y: (p1.y / 100) * 1100 } : null;
  const svgP2 = p2 ? { x: (p2.x / 100) * 1600, y: (p2.y / 100) * 1100 } : null;

  const midX = svgP1 && svgP2 ? (svgP1.x + svgP2.x) / 2 : 0;
  const midY = svgP1 && svgP2 ? (svgP1.y + svgP2.y) / 2 : 0;

  if (!svgP1 && !svgP2) return null;

  return (
    <div className="absolute inset-0 w-[1600px] h-[1100px] pointer-events-none z-20 select-none">
      {/* SVG Line & Glowing Ticks */}
      <svg
        id="measure-distance-svg-canvas"
        viewBox="0 0 1600 1100"
        width="1600"
        height="1100"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <defs>
          <filter id="measure-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {svgP1 && svgP2 && (
          <g id="measure-line-group">
            {/* Dark background casing */}
            <line
              x1={svgP1.x}
              y1={svgP1.y}
              x2={svgP2.x}
              y2={svgP2.y}
              stroke="#0a0a0f"
              strokeWidth="7"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Glowing Accent Line */}
            <line
              x1={svgP1.x}
              y1={svgP1.y}
              x2={svgP2.x}
              y2={svgP2.y}
              stroke={currentTerrainConfig.color}
              strokeWidth="3.5"
              strokeDasharray={isPreview ? "6,6" : "9,5"}
              strokeLinecap="round"
              filter="url(#measure-glow)"
              className={isPreview ? "animate-pulse opacity-85" : "opacity-95"}
            />

            {/* Sub-tick markers at 25%, 50%, 75% of distance */}
            {isComplete && (
              <>
                {[0.25, 0.5, 0.75].map((pct, idx) => {
                  const tx = svgP1.x + (svgP2.x - svgP1.x) * pct;
                  const ty = svgP1.y + (svgP2.y - svgP1.y) * pct;
                  return (
                    <g key={idx} transform={`translate(${tx}, ${ty})`}>
                      <circle r="4" fill="#0c0c10" stroke={currentTerrainConfig.color} strokeWidth="1.5" />
                      <circle r="1.5" fill="#ffffff" />
                    </g>
                  );
                })}
              </>
            )}
          </g>
        )}

        {/* Marker A on SVG */}
        {svgP1 && (
          <g id="measure-pin-a" transform={`translate(${svgP1.x}, ${svgP1.y})`}>
            <circle r="18" fill="#10b981" opacity="0.25" className="animate-ping" />
            <circle r="12" fill="#047857" stroke="#34d399" strokeWidth="2.5" />
            <circle r="4.5" fill="#ffffff" />
            <text
              y="1"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#ffffff"
              fontSize="10"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              A
            </text>
          </g>
        )}

        {/* Marker B on SVG */}
        {svgP2 && (
          <g id="measure-pin-b" transform={`translate(${svgP2.x}, ${svgP2.y})`}>
            <circle r="18" fill="#ef4444" opacity="0.25" className="animate-ping" />
            <circle r="12" fill="#b91c1c" stroke="#f87171" strokeWidth="2.5" />
            <circle r="4.5" fill="#ffffff" />
            <text
              y="1"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#ffffff"
              fontSize="10"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              B
            </text>
          </g>
        )}
      </svg>

      {/* Point A Label */}
      {p1 && (
        <div
          className="absolute -translate-x-1/2 mt-3.5 z-25 pointer-events-none whitespace-nowrap"
          style={{ left: `${p1.x}%`, top: `${p1.y}%` }}
        >
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-emerald-950/90 border border-emerald-500/70 shadow-lg backdrop-blur-xs">
            A: {p1.name || `${p1.x.toFixed(1)}%, ${p1.y.toFixed(1)}%`}
          </span>
        </div>
      )}

      {/* Point B Label */}
      {p2 && isComplete && (
        <div
          className="absolute -translate-x-1/2 mt-3.5 z-25 pointer-events-none whitespace-nowrap"
          style={{ left: `${p2.x}%`, top: `${p2.y}%` }}
        >
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-rose-950/90 border border-rose-500/70 shadow-lg backdrop-blur-xs">
            B: {(p2 as MeasurePoint).name || `${p2.x.toFixed(1)}%, ${p2.y.toFixed(1)}%`}
          </span>
        </div>
      )}

      {/* Midpoint Interactive Distance Badge on Map */}
      {calcResult && svgP1 && svgP2 && (
        <div
          id="measure-midpoint-badge"
          className="absolute z-30 pointer-events-auto -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-105"
          style={{
            left: `${(midX / 1600) * 100}%`,
            top: `${(midY / 1100) * 100}%`,
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenContextMenuAt(e.clientX, e.clientY);
            }}
            className="flex items-center gap-2 bg-[#14141a]/95 backdrop-blur-md border border-[#e2ba7d]/80 text-[#fcedc7] px-3 py-1.5 rounded-full shadow-[0_4px_25px_rgba(0,0,0,0.9)] hover:border-amber-400 hover:bg-[#1c1c24] transition-all cursor-pointer select-none"
            title="Cliquer pour changer de terrain ou voir les options de mesure"
          >
            <div
              className="p-1 rounded-full text-black flex-shrink-0"
              style={{ backgroundColor: currentTerrainConfig.color }}
            >
              {getMeasureTerrainIcon(selectedTerrain, "w-3 h-3")}
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-xs text-white">
                {calcResult.effectiveDistanceKm} km
              </span>
              {calcResult.effectiveDistanceKm !== calcResult.directDistanceKm && (
                <span className="text-[10px] text-[#9ca3af] font-mono">
                  ({calcResult.directDistanceKm} km vol d'oiseau)
                </span>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[10px] text-amber-300 font-semibold border-l border-[#3a3a48] pl-2">
              <Footprints className="w-3 h-3 text-amber-400" />
              <span>~{calcResult.travelTime.walkingDays} j</span>
            </div>

            <ChevronDown className="w-3 h-3 text-[#8e8e93]" />
          </button>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// 2. MAP MEASURE HUD & CONTEXT MENU (Rendered at root container level)
// =============================================================================
interface MapMeasureHUDProps {
  points: MeasurePoint[];
  selectedTerrain: MeasureTerrainType;
  onChangeTerrain: (terrain: MeasureTerrainType) => void;
  onClearPoints: () => void;
  onSwapPoints: () => void;
  onClose: () => void;
  onConvertToRoute?: (p1: MeasurePoint, p2: MeasurePoint) => void;
  contextMenuPos: { x: number; y: number } | null;
  onCloseContextMenu: () => void;
  onOpenContextMenuAt: (x: number, y: number) => void;
}

export const MapMeasureHUD: React.FC<MapMeasureHUDProps> = ({
  points,
  selectedTerrain,
  onChangeTerrain,
  onClearPoints,
  onSwapPoints,
  onClose,
  onConvertToRoute,
  contextMenuPos,
  onCloseContextMenu,
  onOpenContextMenuAt,
}) => {
  const [copiedToast, setCopiedToast] = useState(false);

  const p1 = points[0] || null;
  const p2 = points[1] || null;
  const isComplete = points.length >= 2;

  const calcResult = p1 && p2 ? calculateMeasureDetails(p1, p2, selectedTerrain) : null;
  const currentTerrainConfig = MEASURE_TERRAIN_CONFIGS[selectedTerrain];

  const handleCopySummary = () => {
    if (!calcResult) return;
    const text = `Mesure Glorantha : ${calcResult.pointA.name || "Point A"} → ${
      calcResult.pointB.name || "Point B"
    }\nDistance vol d'oiseau : ${calcResult.directDistanceKm} km\nTerrain : ${
      calcResult.terrain.nameFr
    } (Distance effective : ${calcResult.effectiveDistanceKm} km / ${
      calcResult.lieuesGloranthis
    } lieues)\nTemps de marche : ~${calcResult.travelTime.walkingDays} jours (${
      calcResult.travelTime.walkingHours
    } h à pied) | ~${calcResult.travelTime.ridingDays} jours à cheval.`;

    navigator.clipboard?.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  return (
    <>
      {/* 1. FLOATING TOP HUD CONTROL PANEL */}
      <div
        id="measure-distance-hud-bar"
        className="absolute top-16 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-3 pointer-events-auto"
      >
        <div className="bg-[#16161c]/95 backdrop-blur-xl border border-[#e2ba7d]/70 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.9)] p-3 text-[#d1d1d6]">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2 border-b border-[#2a2a35] pb-2.5 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-amber-500/20 text-[#e2ba7d] rounded-lg border border-amber-500/40">
                <Ruler className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#fcedc7] font-serif">
                    Outil de Mesure de Distance
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono font-semibold">
                    1600 px = 320 km
                  </span>
                </div>
                <p className="text-[11px] text-[#8e8e93]">
                  {points.length === 0 && "Étape 1 : Cliquez sur la carte ou sur un lieu pour placer le point A."}
                  {points.length === 1 && "Étape 2 : Cliquez pour placer le point B (ajustez le terrain ci-dessous)."}
                  {isComplete && "Distance calculée selon le terrain. Changez de terrain via les boutons ou le menu contextuel."}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#8e8e93] hover:text-white rounded-lg hover:bg-white/10 transition"
              title="Fermer l'outil de mesure"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Terrain Selector Strip */}
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-[#8e8e93]">Terrain :</span>
              <div className="flex items-center gap-1 flex-wrap">
                {(Object.keys(MEASURE_TERRAIN_CONFIGS) as MeasureTerrainType[]).map((tKey) => {
                  const cfg = MEASURE_TERRAIN_CONFIGS[tKey];
                  const isSelected = selectedTerrain === tKey;
                  return (
                    <button
                      key={tKey}
                      onClick={() => onChangeTerrain(tKey)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                        isSelected
                          ? `${cfg.bgColor} ${cfg.borderColor} ${cfg.textColor} shadow-[0_0_12px_rgba(0,0,0,0.5)] ring-1 ring-amber-400/40`
                          : "bg-[#202028] border-[#30303c] text-[#9ca3af] hover:text-white hover:bg-[#2a2a36]"
                      }`}
                      title={`${cfg.nameFr} (${cfg.detourFactor > 1 ? `+${Math.round((cfg.detourFactor - 1) * 100)}%` : "0%"} relief/détours)`}
                    >
                      {getMeasureTerrainIcon(tKey, "w-3.5 h-3.5")}
                      <span>{cfg.shortNameFr}</span>
                      {cfg.detourFactor > 1.0 && (
                        <span className="text-[9px] opacity-75 font-mono">
                          +{Math.round((cfg.detourFactor - 1) * 100)}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Context Menu Button */}
            <button
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                onOpenContextMenuAt(rect.left, rect.bottom + 8);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#252530] hover:bg-[#30303e] text-[#e2ba7d] border border-[#3a3a48] text-xs font-semibold transition"
              title="Ouvrir le menu contextuel détaillé"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Détails relief</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Results Summary Card */}
          {calcResult && (
            <div className="bg-[#121217] border border-[#2a2a36] rounded-xl p-3 flex flex-col gap-2.5">
              {/* Row 1: Points and Distance */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[9px]">
                      A
                    </span>
                    <span className="font-semibold text-white truncate max-w-[150px]">
                      {calcResult.pointA.name || `(${calcResult.pointA.x.toFixed(1)}%, ${calcResult.pointA.y.toFixed(1)}%)`}
                    </span>
                  </div>

                  <span className="text-[#8e8e93] font-bold">→</span>

                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-4 h-4 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-[9px]">
                      B
                    </span>
                    <span className="font-semibold text-white truncate max-w-[150px]">
                      {calcResult.pointB.name || `(${calcResult.pointB.x.toFixed(1)}%, ${calcResult.pointB.y.toFixed(1)}%)`}
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-[#8e8e93]">Distance estimée :</span>
                  <span className="text-lg font-black text-amber-300 font-serif tracking-tight">
                    {calcResult.effectiveDistanceKm} km
                  </span>
                  {calcResult.effectiveDistanceKm !== calcResult.directDistanceKm && (
                    <span className="text-xs text-[#8e8e93] font-mono">
                      (vol d'oiseau : {calcResult.directDistanceKm} km)
                    </span>
                  )}
                </div>
              </div>

              {/* Row 2: Travel Times & Units */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#22222d] text-xs">
                {/* Foot Travel */}
                <div className="bg-[#1a1a24] p-2 rounded-lg border border-[#2b2b38] flex flex-col">
                  <span className="text-[10px] text-[#8e8e93] flex items-center gap-1">
                    <Footprints className="w-3 h-3 text-amber-400" />
                    À pied (8h/j)
                  </span>
                  <span className="font-bold text-amber-300 mt-0.5">
                    ~{calcResult.travelTime.walkingDays} jours
                  </span>
                  <span className="text-[9px] text-[#71717a]">
                    ({calcResult.travelTime.walkingHours} heures)
                  </span>
                </div>

                {/* Mount / Riding */}
                <div className="bg-[#1a1a24] p-2 rounded-lg border border-[#2b2b38] flex flex-col">
                  <span className="text-[10px] text-[#8e8e93] flex items-center gap-1">
                    <Compass className="w-3 h-3 text-sky-400" />
                    À cheval / bison
                  </span>
                  <span className="font-bold text-sky-300 mt-0.5">
                    ~{calcResult.travelTime.ridingDays} jours
                  </span>
                  <span className="text-[9px] text-[#71717a]">
                    ({calcResult.travelTime.ridingHours} heures)
                  </span>
                </div>

                {/* Glorantha Units */}
                <div className="bg-[#1a1a24] p-2 rounded-lg border border-[#2b2b38] flex flex-col">
                  <span className="text-[10px] text-[#8e8e93] flex items-center gap-1">
                    <Milestone className="w-3 h-3 text-purple-400" />
                    Lieues Gloranthis
                  </span>
                  <span className="font-bold text-purple-300 mt-0.5">
                    {calcResult.lieuesGloranthis} lieues
                  </span>
                  <span className="text-[9px] text-[#71717a]">
                    ({calcResult.stadesGloranthis} stades)
                  </span>
                </div>

                {/* Flight */}
                <div className="bg-[#1a1a24] p-2 rounded-lg border border-[#2b2b38] flex flex-col">
                  <span className="text-[10px] text-[#8e8e93] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    Vol d'Orlanth (80 km/h)
                  </span>
                  <span className="font-bold text-amber-200 mt-0.5">
                    ~{calcResult.travelTime.flightHours} h
                  </span>
                  <span className="text-[9px] text-[#71717a]">
                    (vol direct sans relief)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-[#22222d] flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={onSwapPoints}
                    disabled={!isComplete}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#202028] hover:bg-[#2c2c38] text-xs text-[#d1d1d6] hover:text-white rounded-lg border border-[#30303c] transition disabled:opacity-40"
                    title="Inverser les points A et B"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Inverser</span>
                  </button>
                  <button
                    onClick={onClearPoints}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#202028] hover:bg-rose-950/50 text-xs text-[#d1d1d6] hover:text-rose-300 rounded-lg border border-[#30303c] hover:border-rose-700/50 transition"
                    title="Réinitialiser pour mesurer un autre trajet"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Nouveau</span>
                  </button>
                  <button
                    onClick={handleCopySummary}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#202028] hover:bg-[#2c2c38] text-xs text-[#d1d1d6] hover:text-white rounded-lg border border-[#30303c] transition"
                    title="Copier le résumé de mesure"
                  >
                    {copiedToast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedToast ? "Copié !" : "Copier"}</span>
                  </button>
                </div>

                {isComplete && onConvertToRoute && (
                  <button
                    onClick={() => onConvertToRoute(points[0], points[1])}
                    className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg shadow-md hover:shadow-amber-500/30 transition"
                    title="Calculer l'itinéraire détaillé suivant le réseau de routes"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Calculer l'itinéraire complet →</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. POPUP CONTEXT MENU (Triggered by Right-Click or Badge Click) */}
      {contextMenuPos && (
        <div
          id="measure-context-menu"
          className="fixed z-50 bg-[#18181f]/98 backdrop-blur-xl border border-[#e2ba7d]/80 rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.95)] p-3.5 text-[#d1d1d6] w-84 text-xs animate-fade-in"
          style={{
            left: `${Math.min(window.innerWidth - 350, Math.max(12, contextMenuPos.x))}px`,
            top: `${Math.min(window.innerHeight - 440, Math.max(12, contextMenuPos.y))}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#2d2d35] pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#e2ba7d]" />
              <span className="font-bold text-sm text-[#fcedc7] font-serif">
                Menu Contextuel : Terrain & Mesure
              </span>
            </div>
            <button
              onClick={onCloseContextMenu}
              className="p-1 text-[#8e8e93] hover:text-white rounded-md hover:bg-white/10 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-[#8e8e93] mb-2">
            Choisissez le type de terrain pour ajuster la distance effective (dénivelés & méandres) et la vitesse de marche :
          </p>

          {/* Terrain Choice Radio List */}
          <div className="flex flex-col gap-1.5 mb-3">
            {(Object.keys(MEASURE_TERRAIN_CONFIGS) as MeasureTerrainType[]).map((tKey) => {
              const cfg = MEASURE_TERRAIN_CONFIGS[tKey];
              const isSelected = selectedTerrain === tKey;

              return (
                <button
                  key={tKey}
                  onClick={() => {
                    onChangeTerrain(tKey);
                  }}
                  className={`flex items-start gap-2.5 p-2 rounded-xl border text-left transition-all ${
                    isSelected
                      ? `${cfg.bgColor} ${cfg.borderColor} ring-1 ring-amber-400/50`
                      : "bg-[#202028]/60 border-[#2d2d38] hover:bg-[#282833] hover:border-[#3f3f4e]"
                  }`}
                >
                  <div
                    className="p-1.5 rounded-lg text-black mt-0.5 flex-shrink-0"
                    style={{ backgroundColor: cfg.color }}
                  >
                    {getMeasureTerrainIcon(tKey, "w-3.5 h-3.5")}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-semibold text-xs ${
                          isSelected ? cfg.textColor : "text-white"
                        }`}
                      >
                        {cfg.nameFr}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-black/40 rounded text-amber-300">
                        {cfg.detourFactor > 1.0 ? `+${Math.round((cfg.detourFactor - 1) * 100)}% distance` : "Distance directe"}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#9ca3af] mt-0.5 line-clamp-1">
                      {cfg.terrainAdviceFr}
                    </p>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Distance Calculation Summary in Context Menu */}
          {calcResult && (
            <div className="bg-[#121216] border border-[#2a2a35] rounded-xl p-2.5 mb-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8e8e93]">Distance réelle de marche :</span>
                <span className="font-bold text-white font-mono">
                  {calcResult.effectiveDistanceKm} km
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#8e8e93]">Distance vol d'oiseau :</span>
                <span className="text-[#a1a1aa] font-mono">
                  {calcResult.directDistanceKm} km
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] border-t border-[#22222b] pt-1 mt-0.5">
                <span className="text-[#8e8e93]">Unités Gloranthis :</span>
                <span className="text-[#e2ba7d] font-mono">
                  {calcResult.lieuesGloranthis} lieues ({calcResult.stadesGloranthis} stades)
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#8e8e93]">Marche à pied (8h/j) :</span>
                <span className="text-amber-300 font-semibold">
                  ~{calcResult.travelTime.walkingDays} jours ({calcResult.travelTime.walkingHours} h)
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#8e8e93]">Monture (cheval/bison) :</span>
                <span className="text-sky-300 font-semibold">
                  ~{calcResult.travelTime.ridingDays} jours
                </span>
              </div>
            </div>
          )}

          {/* Context Actions */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-[#2d2d35]">
            {isComplete && onConvertToRoute && (
              <button
                onClick={() => {
                  onConvertToRoute(points[0], points[1]);
                  onCloseContextMenu();
                }}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition"
                title="Transformer cette mesure en itinéraire calculé"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Itinéraire</span>
              </button>
            )}

            {isComplete && (
              <button
                onClick={onSwapPoints}
                className="p-1.5 bg-[#25252e] hover:bg-[#32323e] text-[#d1d1d6] hover:text-white rounded-lg border border-[#3a3a46] transition"
                title="Inverser Départ ↔ Arrivée (A ↔ B)"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClearPoints}
              className="p-1.5 bg-[#25252e] hover:bg-rose-950/60 text-[#d1d1d6] hover:text-rose-300 rounded-lg border border-[#3a3a46] hover:border-rose-700/50 transition"
              title="Réinitialiser la mesure"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
