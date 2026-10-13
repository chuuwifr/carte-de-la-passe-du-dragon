import React, { useState } from "react";
import { MapDrawingElement, TacticalRouteStyle, TacticalTravelMode } from "../types";
import { calculateTacticalRouteMetrics } from "../data/tacticalRouteData";
import {
  Route,
  Compass,
  Clock,
  Trash2,
  X,
  ArrowRightLeft,
  Palette,
  Check,
  Zap,
  Footprints,
  Layers,
} from "lucide-react";

interface TacticalRouteDetailModalProps {
  route: MapDrawingElement;
  onClose: () => void;
  onUpdateRoute: (updated: Partial<MapDrawingElement>) => void;
  onDeleteRoute: (id: string) => void;
  onPanToWaypoint?: (coords: { x: number; y: number }) => void;
}

export const TacticalRouteDetailModal: React.FC<TacticalRouteDetailModalProps> = ({
  route,
  onClose,
  onUpdateRoute,
  onDeleteRoute,
  onPanToWaypoint,
}) => {
  const [label, setLabel] = useState(route.label || "Route Tactique");
  const [color, setColor] = useState(route.color || "#eab308");
  const [style, setStyle] = useState<TacticalRouteStyle>(route.routeStyle || "animated_dash");
  const [speed, setSpeed] = useState<"slow" | "normal" | "fast">(route.routeSpeed || "normal");
  const [travelMode, setTravelMode] = useState<TacticalTravelMode>(route.travelMode || "walking");
  const [reverseDirection, setReverseDirection] = useState(!!route.reverseDirection);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const waypoints = route.routeWaypoints || [];
  const metrics = calculateTacticalRouteMetrics(waypoints, travelMode);

  const colors = [
    { label: "Or Sartar / Orlanth", hex: "#eab308" },
    { label: "Bleu Ciel Tempête", hex: "#38bdf8" },
    { label: "Pourpre Impérial Lunar", hex: "#f43f5e" },
    { label: "Vert Sève Ernalda", hex: "#22c55e" },
    { label: "Violet Sombre Humakt", hex: "#a855f7" },
    { label: "Ambre Nomade Prax", hex: "#fb923c" },
    { label: "Rouge Alerte Chaos", hex: "#ef4444" },
  ];

  const handleSave = () => {
    onUpdateRoute({
      label: label.trim(),
      color,
      routeStyle: style,
      routeSpeed: speed,
      travelMode,
      reverseDirection,
    });
    onClose();
  };

  return (
    <div
      id="tactical-route-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#14141c] border border-[#3a3a48] rounded-2xl shadow-2xl p-5 text-[#d1d1d6] flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#282836] pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center border shadow-md"
              style={{
                backgroundColor: `${color}25`,
                borderColor: `${color}60`,
                color: color,
              }}
            >
              <Route className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-white text-base">
                Détails de l'Itinéraire Tactique
              </h3>
              <p className="text-[11px] text-[#8e8e93]">
                {waypoints.length} étapes reliées • Ligne animée sur la carte
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#252533] text-[#8e8e93] hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Distance & Travel Metrics */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 bg-[#1a1a24] border border-amber-500/30 rounded-xl flex items-center gap-3">
            <Compass className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-[#8e8e93] font-semibold">Distance Totale</div>
              <div className="text-sm font-bold font-mono text-amber-300">
                {metrics.totalKm} km{" "}
                <span className="text-[10px] font-normal text-[#8e8e93]">
                  ({metrics.totalStades} stades)
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#1a1a24] border border-emerald-500/30 rounded-xl flex items-center gap-3">
            <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-[#8e8e93] font-semibold">Temps Estimé</div>
              <div className="text-sm font-bold text-emerald-300">
                ~{metrics.estimatedDays} j{" "}
                <span className="text-[10px] font-normal text-[#8e8e93]">
                  ({metrics.estimatedHours} h)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Waypoints Sequence */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-[#8e8e93] font-semibold">
            Étapes du Parcours ({waypoints.length})
          </label>
          <div className="p-2.5 bg-[#1a1a24] border border-[#2d2d38] rounded-xl flex flex-col gap-1.5 max-h-36 overflow-y-auto">
            {waypoints.map((wp, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[#22222e] border border-[#2e2e3d] group hover:border-amber-500/40 transition"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-black"
                    style={{ backgroundColor: color }}
                  >
                    {i + 1}
                  </span>
                  <span className="font-medium text-white">{wp.name || `Point ${i + 1}`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#8e8e93] font-mono">
                    {wp.x.toFixed(1)}%, {wp.y.toFixed(1)}%
                  </span>
                  {onPanToWaypoint && (
                    <button
                      type="button"
                      onClick={() => onPanToWaypoint({ x: wp.x, y: wp.y })}
                      className="px-1.5 py-0.5 rounded bg-[#181822] hover:bg-amber-500/20 text-amber-300 text-[10px] border border-[#3a3a48] transition"
                      title="Centrer la carte sur cette étape"
                    >
                      Centrer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Parameters Form */}
        <div className="space-y-3 pt-1">
          {/* Label & Color */}
          <div className="space-y-1">
            <label className="text-[11px] text-[#8e8e93] font-semibold flex items-center gap-1">
              <Palette className="w-3 h-3 text-amber-400" />
              <span>Nom du Tracé</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-[#1a1a24] border border-[#2d2d38] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <div className="flex items-center gap-1 shrink-0">
                {colors.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    className={`w-5 h-5 rounded-full border transition ${
                      color === c.hex
                        ? "ring-2 ring-white scale-110 border-black"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Style & Speed */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] text-[#8e8e93] font-semibold flex items-center gap-1">
                <Layers className="w-3 h-3 text-sky-400" />
                <span>Style Graphique</span>
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as TacticalRouteStyle)}
                className="w-full bg-[#1a1a24] border border-[#2d2d38] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400"
              >
                <option value="animated_dash">⚡ Tirets Dynamiques</option>
                <option value="animated_dots">⭕ Pointillés Ronds</option>
                <option value="marching_arrows">🏹 Chevrons Directionnels</option>
                <option value="caravan_tracks">🐪 Piste de Caravane</option>
                <option value="glowing_pulse">✨ Halo Runique Pulsé</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#8e8e93] font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Vitesse Animation</span>
              </label>
              <select
                value={speed}
                onChange={(e) => setSpeed(e.target.value as "slow" | "normal" | "fast")}
                className="w-full bg-[#1a1a24] border border-[#2d2d38] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="slow">Lente (2.4s)</option>
                <option value="normal">Normale (1.2s)</option>
                <option value="fast">Rapide (0.65s)</option>
              </select>
            </div>
          </div>

          {/* Travel Mode & Direction */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] text-[#8e8e93] font-semibold flex items-center gap-1">
                <Footprints className="w-3 h-3 text-emerald-400" />
                <span>Mode de Marche</span>
              </label>
              <select
                value={travelMode}
                onChange={(e) => setTravelMode(e.target.value as TacticalTravelMode)}
                className="w-full bg-[#1a1a24] border border-[#2d2d38] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="walking">🚶 Marche à pied</option>
                <option value="mounted">🐎 Montures</option>
                <option value="caravan">🐂 Caravane / Chariot</option>
                <option value="forced_march">⚔️ Marche Forcée</option>
                <option value="flight">🦅 Vol Sylphide</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#8e8e93] font-semibold flex items-center gap-1">
                <ArrowRightLeft className="w-3 h-3 text-cyan-400" />
                <span>Sens du Flux</span>
              </label>
              <button
                type="button"
                onClick={() => setReverseDirection(!reverseDirection)}
                className={`w-full py-1.5 rounded-lg border text-xs font-semibold transition ${
                  reverseDirection
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                    : "bg-[#1a1a24] text-[#d1d1d6] border-[#2d2d38]"
                }`}
              >
                {reverseDirection ? "Flux Inversé (Retour)" : "Flux Normal (Aller)"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#282836] pt-3 mt-1">
          {confirmDelete ? (
            <div className="flex items-center gap-1.5 bg-red-950/80 border border-red-500/50 p-1.5 rounded-xl text-xs">
              <span className="text-red-200 text-[11px] font-medium">Confirmer la suppression ?</span>
              <button
                type="button"
                onClick={() => {
                  onDeleteRoute(route.id);
                  onClose();
                }}
                className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded text-[11px] transition"
              >
                Oui
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-0.5 bg-[#252533] hover:bg-[#323242] text-[#d1d1d6] rounded text-[11px] transition"
              >
                Non
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-xl border border-red-800/40 transition text-xs font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Supprimer</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-[#20202c] hover:bg-[#2c2c3e] text-[#d1d1d6] rounded-xl transition text-xs font-medium"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl transition shadow-lg text-xs"
            >
              <Check className="w-4 h-4" />
              <span>Enregistrer les Modifications</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
