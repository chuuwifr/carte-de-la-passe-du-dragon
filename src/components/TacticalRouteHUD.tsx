import React, { useState } from "react";
import {
  TacticalWaypoint,
  TacticalTravelMode,
  TacticalRouteStyle,
  MapDrawingElement,
  PointOfInterest,
} from "../types";
import {
  calculateTacticalRouteMetrics,
  TACTICAL_ROUTE_PRESETS,
  TacticalRoutePreset,
} from "../data/tacticalRouteData";
import {
  Route,
  Sparkles,
  Footprints,
  Compass,
  ArrowRightLeft,
  Undo2,
  Trash2,
  Check,
  X,
  Clock,
  Shield,
  Palette,
  Zap,
  Navigation,
  Milestone,
  Layers,
} from "lucide-react";

interface TacticalRouteHUDProps {
  waypoints: TacticalWaypoint[];
  onAddWaypoint: (wp: TacticalWaypoint) => void;
  onRemoveWaypoint: (index: number) => void;
  onUndoLastWaypoint: () => void;
  onClearWaypoints: () => void;
  onReverseRoute: () => void;
  onSaveRoute: (routeData: {
    label: string;
    color: string;
    strokeWidth: number;
    routeStyle: TacticalRouteStyle;
    routeSpeed: "slow" | "normal" | "fast";
    travelMode: TacticalTravelMode;
    reverseDirection: boolean;
  }) => void;
  onCancel: () => void;
  locations: PointOfInterest[];
}

export const TacticalRouteHUD: React.FC<TacticalRouteHUDProps> = ({
  waypoints,
  onAddWaypoint,
  onRemoveWaypoint,
  onUndoLastWaypoint,
  onClearWaypoints,
  onReverseRoute,
  onSaveRoute,
  onCancel,
  locations,
}) => {
  const [routeName, setRouteName] = useState("Route Tactique des Collines");
  const [routeColor, setRouteColor] = useState("#eab308"); // Gold default
  const [routeStrokeWidth, setRouteStrokeWidth] = useState(3.5);
  const [routeStyle, setRouteStyle] = useState<TacticalRouteStyle>("animated_dash");
  const [routeSpeed, setRouteSpeed] = useState<"slow" | "normal" | "fast">("normal");
  const [travelMode, setTravelMode] = useState<TacticalTravelMode>("walking");
  const [isReversed, setIsReversed] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showPoiPicker, setShowPoiPicker] = useState(false);
  const [poiSearch, setPoiSearch] = useState("");

  const metrics = calculateTacticalRouteMetrics(waypoints, travelMode);

  const colors = [
    { label: "Or Sartar / Orlanth", hex: "#eab308" },
    { label: "Bleu Ciel Tempête", hex: "#38bdf8" },
    { label: "Pourpre Impérial Lunar", hex: "#f43f5e" },
    { label: "Vert Sève Ernalda", hex: "#22c55e" },
    { label: "Violet Sombre Humakt", hex: "#a855f7" },
    { label: "Ambre Nomade Prax", hex: "#fb923c" },
    { label: "Rouge Alerte Chaos", hex: "#ef4444" },
    { label: "Blanc Argent Céleste", hex: "#f8fafc" },
  ];

  const applyPreset = (preset: TacticalRoutePreset) => {
    setRouteColor(preset.color);
    setRouteStyle(preset.style);
    setTravelMode(preset.travelMode);
    setRouteSpeed(preset.speed);
    setRouteName(preset.name);
    setShowPresets(false);
  };

  const filteredPois = locations.filter((loc) =>
    loc.nameFr.toLowerCase().includes(poiSearch.toLowerCase()) ||
    loc.region.toLowerCase().includes(poiSearch.toLowerCase())
  ).slice(0, 15);

  return (
    <div
      id="tactical-route-hud"
      className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl bg-[#121217]/95 backdrop-blur-xl border border-[#3a3a48] rounded-2xl shadow-2xl p-3.5 z-40 text-xs text-[#d1d1d6] animate-fade-in flex flex-col gap-3"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#282834] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300">
            <Route className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-white text-sm">
                Outil de Dessin de Route Tactique
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                Lignes Pointillées Animées
              </span>
            </div>
            <p className="text-[11px] text-[#8e8e93]">
              Cliquez sur les lieux de la carte pour relier vos étapes et calculer les distances réelles.
            </p>
          </div>
        </div>

        {/* Action Controls & Presets */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#20202a] hover:bg-[#2c2c3a] text-amber-300 border border-amber-500/30 rounded-xl transition font-medium text-[11px]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Préréglages</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPoiPicker(!showPoiPicker)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#20202a] hover:bg-[#2c2c3a] text-sky-300 border border-sky-500/30 rounded-xl transition font-medium text-[11px]"
          >
            <Milestone className="w-3.5 h-3.5" />
            <span>+ Ajouter un Lieu</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-xl hover:bg-[#2a2a36] text-[#8e8e93] hover:text-white transition"
            title="Fermer l'outil"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Presets Dropdown */}
      {showPresets && (
        <div className="p-2.5 bg-[#181822] border border-amber-500/30 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {TACTICAL_ROUTE_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className="text-left p-2 rounded-lg bg-[#222230] hover:bg-[#2c2c3e] border border-[#333345] hover:border-amber-500/50 transition group"
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="font-bold text-white group-hover:text-amber-300 text-[11px]">
                  {p.name}
                </span>
              </div>
              <p className="text-[10px] text-[#8e8e93] mt-0.5">{p.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* POI Search & Picker Dropdown */}
      {showPoiPicker && (
        <div className="p-2.5 bg-[#181822] border border-sky-500/30 rounded-xl flex flex-col gap-2">
          <input
            type="text"
            placeholder="Rechercher un lieu (Boldhome, Jonstown, Swantee...)"
            value={poiSearch}
            onChange={(e) => setPoiSearch(e.target.value)}
            className="w-full bg-[#101016] border border-[#333345] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#6e6e78] focus:outline-none focus:border-sky-400"
          />
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {filteredPois.map((poi) => (
              <button
                key={poi.id}
                onClick={() => {
                  onAddWaypoint({
                    x: poi.coords.x,
                    y: poi.coords.y,
                    name: poi.nameFr,
                    poiId: poi.id,
                  });
                  setShowPoiPicker(false);
                  setPoiSearch("");
                }}
                className="px-2.5 py-1 rounded-lg bg-[#222230] hover:bg-sky-500/20 hover:text-sky-200 text-[#d1d1d6] border border-[#333345] transition text-[11px] flex items-center gap-1.5"
              >
                <span>📍</span>
                <span className="font-medium">{poi.nameFr}</span>
                <span className="text-[9px] text-[#8e8e93]">({poi.region})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Waypoints Flow List */}
      <div className="bg-[#181822] p-2.5 rounded-xl border border-[#2d2d38] flex items-center gap-2 overflow-x-auto">
        <span className="text-[#8e8e93] font-semibold text-[11px] shrink-0">
          Étapes ({waypoints.length}) :
        </span>

        {waypoints.length === 0 ? (
          <span className="text-[#71717a] italic">
            Aucun point défini. Cliquez sur la carte ou sur "+ Ajouter un Lieu" pour débuter le tracé.
          </span>
        ) : (
          <div className="flex items-center gap-1.5 flex-nowrap">
            {waypoints.map((wp, idx) => (
              <div key={idx} className="flex items-center gap-1 shrink-0">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium"
                  style={{
                    backgroundColor: `${routeColor}15`,
                    borderColor: `${routeColor}60`,
                    color: "#f8fafc",
                  }}
                >
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-black"
                    style={{ backgroundColor: routeColor }}
                  >
                    {idx + 1}
                  </span>
                  <span className="max-w-[120px] truncate">{wp.name || `Point ${idx + 1}`}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveWaypoint(idx)}
                    className="hover:text-red-400 text-[#8e8e93] ml-0.5"
                    title="Retirer cette étape"
                  >
                    ×
                  </button>
                </div>

                {idx < waypoints.length - 1 && (
                  <span className="text-[#64748b] text-[10px] font-mono">➔</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Route Parameters: Style, Speed, Color, Mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
        {/* Route Name & Color */}
        <div className="space-y-1">
          <label className="text-[10px] text-[#8e8e93] font-semibold flex items-center gap-1">
            <Palette className="w-3 h-3 text-amber-400" />
            <span>Nom & Couleur de la Route</span>
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              className="w-full bg-[#181822] border border-[#2d2d38] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
              placeholder="Ex: Patrouille Colymar"
            />
            <div className="flex items-center gap-1 shrink-0">
              {colors.slice(0, 4).map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setRouteColor(c.hex)}
                  className={`w-5 h-5 rounded-full border transition ${
                    routeColor === c.hex
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

        {/* Style of Line */}
        <div className="space-y-1">
          <label className="text-[10px] text-[#8e8e93] font-semibold flex items-center gap-1">
            <Layers className="w-3 h-3 text-sky-400" />
            <span>Style du Marqueur Détaillé</span>
          </label>
          <select
            value={routeStyle}
            onChange={(e) => setRouteStyle(e.target.value as TacticalRouteStyle)}
            className="w-full bg-[#181822] border border-[#2d2d38] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-sky-400"
          >
            <option value="animated_dash">⚡ Tirets Dynamiques Animés</option>
            <option value="animated_dots">⭕ Pointillés Ronds Fluides</option>
            <option value="marching_arrows">🏹 Chevrons de Progression</option>
            <option value="caravan_tracks">🐪 Piste de Caravane Double</option>
            <option value="glowing_pulse">✨ Halo Runique à Pulsation</option>
          </select>
        </div>

        {/* Travel Mode */}
        <div className="space-y-1">
          <label className="text-[10px] text-[#8e8e93] font-semibold flex items-center gap-1">
            <Footprints className="w-3 h-3 text-emerald-400" />
            <span>Mode de Déplacement</span>
          </label>
          <select
            value={travelMode}
            onChange={(e) => setTravelMode(e.target.value as TacticalTravelMode)}
            className="w-full bg-[#181822] border border-[#2d2d38] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-400"
          >
            <option value="walking">🚶 Marche à pied (24 km/j)</option>
            <option value="mounted">🐎 Montures & Cavaliers (48 km/j)</option>
            <option value="caravan">🐂 Convoi & Chariots (18 km/j)</option>
            <option value="forced_march">⚔️ Marche Forcée Militaire (36 km/j)</option>
            <option value="flight">🦅 Vol Aérien / Sylphe (80 km/j)</option>
          </select>
        </div>

        {/* Animation Speed & Direction */}
        <div className="space-y-1">
          <label className="text-[10px] text-[#8e8e93] font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Vitesse d'Animation</span>
          </label>
          <div className="flex items-center gap-1 bg-[#181822] p-0.5 rounded-lg border border-[#2d2d38]">
            <button
              type="button"
              onClick={() => setRouteSpeed("slow")}
              className={`flex-1 py-1 rounded text-[10px] font-medium transition ${
                routeSpeed === "slow"
                  ? "bg-amber-500 text-black font-bold"
                  : "text-[#8e8e93] hover:text-white"
              }`}
            >
              Lente
            </button>
            <button
              type="button"
              onClick={() => setRouteSpeed("normal")}
              className={`flex-1 py-1 rounded text-[10px] font-medium transition ${
                routeSpeed === "normal"
                  ? "bg-amber-500 text-black font-bold"
                  : "text-[#8e8e93] hover:text-white"
              }`}
            >
              Normale
            </button>
            <button
              type="button"
              onClick={() => setRouteSpeed("fast")}
              className={`flex-1 py-1 rounded text-[10px] font-medium transition ${
                routeSpeed === "fast"
                  ? "bg-amber-500 text-black font-bold"
                  : "text-[#8e8e93] hover:text-white"
              }`}
            >
              Rapide
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Bar & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#282834]">
        {/* Calculated distance summary */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181824] rounded-xl border border-amber-500/30">
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-amber-300 font-bold text-xs">
              {metrics.totalKm} km
            </span>
            <span className="text-[10px] text-[#8e8e93]">
              ({metrics.totalStades} stades)
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181824] rounded-xl border border-emerald-500/30">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="font-medium text-emerald-300 text-xs">
              ~{metrics.estimatedDays} jour(s) ({metrics.estimatedHours} h)
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {waypoints.length > 0 && (
            <>
              <button
                type="button"
                onClick={onUndoLastWaypoint}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#20202a] hover:bg-[#2c2c3a] text-[#d1d1d6] rounded-xl border border-[#333345] transition text-xs font-medium"
                title="Annuler le dernier point"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Annuler</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsReversed(!isReversed);
                  onReverseRoute();
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition text-xs font-medium ${
                  isReversed
                    ? "bg-amber-500/20 border-amber-400 text-amber-300"
                    : "bg-[#20202a] hover:bg-[#2c2c3a] text-[#d1d1d6] border-[#333345]"
                }`}
                title="Inverser le sens de déplacement"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Inverser</span>
              </button>

              <button
                type="button"
                onClick={onClearWaypoints}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-xl border border-red-800/40 transition text-xs font-medium"
                title="Effacer tous les points"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Effacer</span>
              </button>
            </>
          )}

          <button
            type="button"
            disabled={waypoints.length < 2}
            onClick={() =>
              onSaveRoute({
                label: routeName.trim() || "Route Tactique",
                color: routeColor,
                strokeWidth: routeStrokeWidth,
                routeStyle,
                routeSpeed,
                travelMode,
                reverseDirection: isReversed,
              })
            }
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl transition shadow-lg text-xs"
          >
            <Check className="w-4 h-4" />
            <span>Valider & Enregistrer la Route</span>
          </button>
        </div>
      </div>
    </div>
  );
};
