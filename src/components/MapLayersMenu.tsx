import React from "react";
import {
  Layers,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  Sparkles,
  MapPin,
  Cloud,
  Navigation,
  Compass,
  Tag,
  Star,
  PlusCircle,
  Grid,
  ShieldAlert,
  Flame,
  X,
  RotateCcw,
  Sliders,
  Check,
  Mountain,
  Skull,
  Globe2,
} from "lucide-react";
import { POICategory, RegionKey, PointOfInterest, MapFloorLevel } from "../types";
import { POI_CATEGORIES, getCategoryMeta } from "../data/categories";
import { GLORANTHA_FLOORS } from "./MapFloorSwitcher";

export interface MapDisplayLayersState {
  // Master POI toggle
  showAllPois: boolean;
  // Category toggles
  visibleCategories: Record<POICategory, boolean>;
  // Text label visibility mode
  poiLabelMode: "hover" | "always" | "never";
  // Icon style & transparency
  poiIconStyle: "standard" | "transparent" | "minimal_ring" | "glow_rune";
  poiIconOpacity: number;
  poiTransparentBackground: boolean;
  poiFixedScale: boolean;
  // Filter special POIs
  showOnlyFavorites: boolean;
  showOnlyCustomPois: boolean;
  // Custom Session Pins
  showCustomPins: boolean;

  // Weather & Atmosphere
  showWeatherClouds: boolean;
  showWeatherParticles: boolean;
  showWeatherBadges: boolean;
  weatherCloudOpacity: number;
  weatherParticleIntensity: number;

  // Routing & Roads
  showRoads: boolean;
  showObstacles: boolean;
  showActiveRoute: boolean;

  // Cartography & Geography
  showRegions: boolean;
  showRegionLabels: boolean;
  showMapCartouche: boolean;
  showGrid: boolean;
  showHexGrid: boolean;
  showRadiusZones: boolean;
  showDrawings: boolean;
}

export const DEFAULT_MAP_LAYERS_STATE: MapDisplayLayersState = {
  showAllPois: true,
  visibleCategories: {
    city: true,
    temple: true,
    shrine: true,
    fortress: true,
    ruin: true,
    tomb: true,
    settlement: true,
    nature: true,
    peril: true,
    landmark: true,
    bridge: true,
    mine: true,
    market: true,
  },
  poiLabelMode: "hover",
  poiIconStyle: "standard",
  poiIconOpacity: 1.0,
  poiTransparentBackground: false,
  poiFixedScale: true,
  showOnlyFavorites: false,
  showOnlyCustomPois: false,
  showCustomPins: true,

  showWeatherClouds: true,
  showWeatherParticles: true,
  showWeatherBadges: true,
  weatherCloudOpacity: 0.85,
  weatherParticleIntensity: 0.85,

  showRoads: true,
  showObstacles: true,
  showActiveRoute: true,

  showRegions: true,
  showRegionLabels: true,
  showMapCartouche: true,
  showGrid: false,
  showHexGrid: false,
  showRadiusZones: true,
  showDrawings: true,
};

interface MapLayersMenuProps {
  isOpen: boolean;
  onClose: () => void;
  layersState: MapDisplayLayersState;
  onChangeLayersState: (updater: (prev: MapDisplayLayersState) => MapDisplayLayersState) => void;
  locations: PointOfInterest[];
  customPinsCount: number;
  favoritesCount: number;
  isGmMode?: boolean;
  currentFloor?: MapFloorLevel;
  onChangeFloor?: (floor: MapFloorLevel) => void;
}

export const MapLayersMenu: React.FC<MapLayersMenuProps> = ({
  isOpen,
  onClose,
  layersState,
  onChangeLayersState,
  locations,
  customPinsCount,
  favoritesCount,
  isGmMode = false,
  currentFloor = 0,
  onChangeFloor,
}) => {
  if (!isOpen) return null;

  // Count locations per category
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    locations.forEach((loc) => {
      counts[loc.category] = (counts[loc.category] || 0) + 1;
    });
    return counts;
  }, [locations]);

  // Active layer counter calculation
  const totalActiveLayers = React.useMemo(() => {
    let count = 0;
    if (layersState.showAllPois) {
      Object.values(layersState.visibleCategories).forEach((v) => {
        if (v) count++;
      });
    }
    if (layersState.showCustomPins && customPinsCount > 0) count++;
    if (layersState.showWeatherClouds) count++;
    if (layersState.showWeatherParticles) count++;
    if (layersState.showWeatherBadges) count++;
    if (layersState.showRoads) count++;
    if (layersState.showObstacles) count++;
    if (layersState.showRegions) count++;
    if (layersState.showRegionLabels) count++;
    if (layersState.showMapCartouche) count++;
    if (layersState.showGrid) count++;
    return count;
  }, [layersState, customPinsCount]);

  // Presets handlers
  const applyPreset = (presetKey: "all" | "player" | "gm" | "travel" | "clean") => {
    onChangeLayersState((prev) => {
      switch (presetKey) {
        case "all":
          return {
            ...prev,
            showAllPois: true,
            visibleCategories: {
              city: true,
              temple: true,
              shrine: true,
              fortress: true,
              ruin: true,
              tomb: true,
              settlement: true,
              nature: true,
              peril: true,
              landmark: true,
              bridge: true,
              mine: true,
              market: true,
            },
            poiLabelMode: "hover",
            showOnlyFavorites: false,
            showOnlyCustomPois: false,
            showCustomPins: true,
            showWeatherClouds: true,
            showWeatherParticles: true,
            showWeatherBadges: true,
            showRoads: true,
            showObstacles: true,
            showActiveRoute: true,
            showRegions: true,
            showRegionLabels: true,
            showMapCartouche: true,
            showGrid: false,
          };

        case "player": // Immersion joueur épurée
          return {
            ...prev,
            showAllPois: true,
            visibleCategories: {
              city: true,
              temple: true,
              shrine: true,
              fortress: true,
              ruin: false,
              tomb: false,
              settlement: true,
              nature: true,
              peril: false,
              landmark: true,
              bridge: true,
              mine: false,
              market: true,
            },
            poiLabelMode: "hover",
            showOnlyFavorites: false,
            showOnlyCustomPois: false,
            showCustomPins: false,
            showWeatherClouds: true,
            showWeatherParticles: true,
            showWeatherBadges: false,
            showRoads: true,
            showObstacles: false,
            showActiveRoute: true,
            showRegions: true,
            showRegionLabels: true,
            showMapCartouche: true,
            showGrid: false,
          };

        case "gm": // Vue tactique MJ intégrale
          return {
            ...prev,
            showAllPois: true,
            visibleCategories: {
              city: true,
              temple: true,
              shrine: true,
              fortress: true,
              ruin: true,
              tomb: true,
              settlement: true,
              nature: true,
              peril: true,
              landmark: true,
              bridge: true,
              mine: true,
              market: true,
            },
            poiLabelMode: "always",
            showOnlyFavorites: false,
            showOnlyCustomPois: false,
            showCustomPins: true,
            showWeatherClouds: true,
            showWeatherParticles: true,
            showWeatherBadges: true,
            showRoads: true,
            showObstacles: true,
            showActiveRoute: true,
            showRegions: true,
            showRegionLabels: true,
            showMapCartouche: true,
            showGrid: true,
          };

        case "travel": // Vue voyage et itinéraire
          return {
            ...prev,
            showAllPois: true,
            visibleCategories: {
              city: true,
              temple: false,
              shrine: false,
              fortress: true,
              ruin: false,
              tomb: false,
              settlement: true,
              nature: false,
              peril: true,
              landmark: true,
              bridge: true,
              mine: false,
              market: true,
            },
            poiLabelMode: "always",
            showOnlyFavorites: false,
            showOnlyCustomPois: false,
            showCustomPins: true,
            showWeatherClouds: true,
            showWeatherParticles: true,
            showWeatherBadges: true,
            showRoads: true,
            showObstacles: true,
            showActiveRoute: true,
            showRegions: true,
            showRegionLabels: true,
            showMapCartouche: true,
            showGrid: false,
          };

        case "clean": // Carte vierge
          return {
            ...prev,
            showAllPois: false,
            showCustomPins: false,
            showWeatherClouds: false,
            showWeatherParticles: false,
            showWeatherBadges: false,
            showRoads: false,
            showObstacles: false,
            showActiveRoute: false,
            showRegions: true,
            showRegionLabels: true,
            showMapCartouche: false,
            showGrid: false,
          };
      }
    });
  };

  // Toggle all categories at once
  const toggleAllCategories = (enabled: boolean) => {
    onChangeLayersState((prev) => {
      const nextCats: Record<POICategory, boolean> = { ...prev.visibleCategories };
      POI_CATEGORIES.forEach((c) => {
        nextCats[c.id] = enabled;
      });
      return {
        ...prev,
        showAllPois: enabled ? true : prev.showAllPois,
        visibleCategories: nextCats,
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-3 sm:p-6 pointer-events-none">
      {/* Background Dim Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs pointer-events-auto transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Main Layers Menu Panel */}
      <div
        id="map-layers-menu-drawer"
        className="relative w-full max-w-md max-h-[92vh] bg-[#16161a]/95 backdrop-blur-xl border border-[#e2ba7d]/50 rounded-2xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden text-[#d1d1d6] z-10 animate-fade-in"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#2d2d35] bg-[#1c1c22]/90 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[#e2ba7d]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#e2ba7d] uppercase tracking-wider flex items-center gap-2">
                Calques & Affichage
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono">
                  {totalActiveLayers} actifs
                </span>
              </h2>
              <p className="text-[11px] text-[#8e8e93]">
                Contrôlez tous les éléments visibles sur la carte
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8e8e93] hover:text-white hover:bg-white/10 transition"
            title="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 overflow-y-auto space-y-5 flex-1 custom-scrollbar text-xs">
          {/* Quick Presets Bar */}
          <div>
            <span className="text-[10px] font-semibold text-[#8e8e93] uppercase tracking-wider block mb-2">
              Préréglages d'affichage rapides
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              <button
                id="preset-all"
                onClick={() => applyPreset("all")}
                className="px-2.5 py-1.5 rounded-lg bg-[#25252b] hover:bg-[#2e2e36] text-[#e2ba7d] border border-[#3a3a45] hover:border-amber-400/50 flex items-center gap-1.5 transition text-left"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold truncate">Tout Afficher</span>
              </button>

              <button
                id="preset-player"
                onClick={() => applyPreset("player")}
                className="px-2.5 py-1.5 rounded-lg bg-[#25252b] hover:bg-[#2e2e36] text-[#d1d1d6] border border-[#3a3a45] hover:border-amber-400/50 flex items-center gap-1.5 transition text-left"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold truncate">Immersion Joueurs</span>
              </button>

              <button
                id="preset-gm"
                onClick={() => applyPreset("gm")}
                className="px-2.5 py-1.5 rounded-lg bg-[#25252b] hover:bg-[#2e2e36] text-[#d1d1d6] border border-[#3a3a45] hover:border-amber-400/50 flex items-center gap-1.5 transition text-left"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="font-semibold truncate">Tactique MJ</span>
              </button>

              <button
                id="preset-travel"
                onClick={() => applyPreset("travel")}
                className="px-2.5 py-1.5 rounded-lg bg-[#25252b] hover:bg-[#2e2e36] text-[#d1d1d6] border border-[#3a3a45] hover:border-amber-400/50 flex items-center gap-1.5 transition text-left"
              >
                <Navigation className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-semibold truncate">Voyage & Routes</span>
              </button>

              <button
                id="preset-clean"
                onClick={() => applyPreset("clean")}
                className="px-2.5 py-1.5 rounded-lg bg-[#25252b] hover:bg-[#2e2e36] text-[#d1d1d6] border border-[#3a3a45] hover:border-amber-400/50 flex items-center gap-1.5 transition text-left col-span-2 sm:col-span-1"
              >
                <EyeOff className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="font-semibold truncate">Carte Vierge</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 0: NIVEAUX & PLANS D'ÉTAGE (Project Zomboid Map Style)           */}
          {/* ========================================================================= */}
          {onChangeFloor && (
            <div className="bg-[#1c1c22] rounded-xl p-3 border border-[#2d2d35] space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#2d2d35]">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-[#e2ba7d]">Niveaux & Plans d'Étage</span>
                </div>
                <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Niveau Actif : {currentFloor}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                {GLORANTHA_FLOORS.map((f) => {
                  const isSelected = currentFloor === f.level;
                  return (
                    <button
                      key={f.level}
                      onClick={() => onChangeFloor(f.level)}
                      className={`p-2 rounded-lg border text-left transition flex items-start gap-2 ${
                        isSelected
                          ? `bg-[#252532] ${f.borderColor} shadow-[0_0_10px_rgba(0,0,0,0.5)]`
                          : "bg-[#16161c] border-[#2a2a33] hover:border-amber-400/40 text-[#a1a1aa] hover:text-white"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                          isSelected
                            ? "bg-[#e2ba7d] text-black"
                            : "bg-[#22222a] text-[#8e8e93] border border-[#33333f]"
                        }`}
                      >
                        {f.level}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-bold text-xs truncate ${
                              isSelected ? "text-[#e2ba7d]" : "text-white"
                            }`}
                          >
                            {f.labelFr}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-[#8e8e93] line-clamp-1 mt-0.5">
                          {f.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 1: POINTS D'INTÉRÊT & LIEUX                                       */}
          {/* ========================================================================= */}
          <div className="bg-[#1c1c22] rounded-xl p-3 border border-[#2d2d35] space-y-3">
            {/* POI Master Toggle */}
            <div className="flex items-center justify-between pb-2 border-b border-[#2d2d35]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-[#e2ba7d]">Points d'Intérêt & Marqueurs</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-[#8e8e93]">
                  {locations.length} lieux
                </span>
              </div>
              <button
                onClick={() =>
                  onChangeLayersState((p) => ({ ...p, showAllPois: !p.showAllPois }))
                }
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  layersState.showAllPois ? "bg-amber-500" : "bg-stone-700"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-black transition-transform ${
                    layersState.showAllPois ? "translate-x-4.5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {layersState.showAllPois && (
              <div className="space-y-3 pt-1">
                {/* Labels Display Mode */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-[#8e8e93] flex items-center gap-1">
                      <Tag className="w-3 h-3 text-amber-400" /> Noms des lieux sur la carte :
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 bg-[#16161a] p-1 rounded-lg border border-[#2d2d35]">
                    <button
                      onClick={() =>
                        onChangeLayersState((p) => ({ ...p, poiLabelMode: "hover" }))
                      }
                      className={`py-1 px-1.5 rounded text-[10px] font-semibold transition text-center ${
                        layersState.poiLabelMode === "hover"
                          ? "bg-amber-400 text-black shadow"
                          : "text-[#8e8e93] hover:text-white"
                      }`}
                    >
                      Au survol
                    </button>
                    <button
                      onClick={() =>
                        onChangeLayersState((p) => ({ ...p, poiLabelMode: "always" }))
                      }
                      className={`py-1 px-1.5 rounded text-[10px] font-semibold transition text-center ${
                        layersState.poiLabelMode === "always"
                          ? "bg-amber-400 text-black shadow"
                          : "text-[#8e8e93] hover:text-white"
                      }`}
                    >
                      Toujours visibles
                    </button>
                    <button
                      onClick={() =>
                        onChangeLayersState((p) => ({ ...p, poiLabelMode: "never" }))
                      }
                      className={`py-1 px-1.5 rounded text-[10px] font-semibold transition text-center ${
                        layersState.poiLabelMode === "never"
                          ? "bg-amber-400 text-black shadow"
                          : "text-[#8e8e93] hover:text-white"
                      }`}
                    >
                      Masqués
                    </button>
                  </div>
                </div>

                {/* Specific Filters (Favorites, Custom) */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() =>
                      onChangeLayersState((p) => ({
                        ...p,
                        showOnlyFavorites: !p.showOnlyFavorites,
                      }))
                    }
                    className={`flex items-center justify-between p-2 rounded-lg border text-[11px] font-medium transition ${
                      layersState.showOnlyFavorites
                        ? "bg-amber-950/60 border-amber-500/70 text-amber-300"
                        : "bg-[#16161a] border-[#2d2d35] text-[#8e8e93] hover:border-[#3a3a45]"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      Favoris seuls
                    </span>
                    <span className="font-mono text-[10px]">({favoritesCount})</span>
                  </button>

                  <button
                    onClick={() =>
                      onChangeLayersState((p) => ({
                        ...p,
                        showOnlyCustomPois: !p.showOnlyCustomPois,
                      }))
                    }
                    className={`flex items-center justify-between p-2 rounded-lg border text-[11px] font-medium transition ${
                      layersState.showOnlyCustomPois
                        ? "bg-cyan-950/60 border-cyan-500/70 text-cyan-300"
                        : "bg-[#16161a] border-[#2d2d35] text-[#8e8e93] hover:border-[#3a3a45]"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                      Lieux créés seuls
                    </span>
                    <span className="font-mono text-[10px]">
                      ({locations.filter((l) => l.isCustom || l.isModified).length})
                    </span>
                  </button>
                </div>

                {/* Style & Transparence des Icônes de Lieux */}
                <div className="pt-2 border-t border-[#2d2d35] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#e2ba7d] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Style & Rendu des Icônes :
                    </span>
                    <button
                      onClick={() =>
                        onChangeLayersState((p) => ({
                          ...p,
                          poiTransparentBackground: !p.poiTransparentBackground,
                          poiIconStyle: !p.poiTransparentBackground ? "transparent" : "standard",
                        }))
                      }
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition flex items-center gap-1 font-bold ${
                        layersState.poiTransparentBackground || layersState.poiIconStyle === "transparent"
                          ? "bg-amber-400/20 text-amber-300 border-amber-400/50"
                          : "bg-[#16161a] text-[#8e8e93] border-[#2d2d35] hover:text-white"
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{layersState.poiTransparentBackground || layersState.poiIconStyle === "transparent" ? "Mode Transparent ACTIF" : "Rendre Transparent"}</span>
                    </button>
                  </div>

                  {/* 4 Icon Style Presets */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#16161a] p-1.5 rounded-lg border border-[#2d2d35]">
                    {[
                      { id: "standard", label: "Standard", desc: "Fond plein" },
                      { id: "transparent", label: "Transparent", desc: "Fond éthéré" },
                      { id: "minimal_ring", label: "Anneau", desc: "Cercle évidé" },
                      { id: "glow_rune", label: "Luminescent", desc: "Halo & Rune" },
                    ].map((st) => {
                      const isSelected = (layersState.poiIconStyle || "standard") === st.id;
                      return (
                        <button
                          key={st.id}
                          onClick={() =>
                            onChangeLayersState((p) => ({
                              ...p,
                              poiIconStyle: st.id as any,
                              poiTransparentBackground: st.id === "transparent" || st.id === "minimal_ring" || st.id === "glow_rune",
                            }))
                          }
                          className={`p-1.5 rounded text-left transition ${
                            isSelected
                              ? "bg-amber-400 text-black font-bold shadow"
                              : "text-[#8e8e93] hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <div className="text-[10px] leading-tight">{st.label}</div>
                          <div className={`text-[8px] ${isSelected ? "text-stone-900" : "text-[#71717a]"}`}>{st.desc}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Opacity Slider */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-[#8e8e93] shrink-0">Opacité des marqueurs :</span>
                    <input
                      type="range"
                      min="0.2"
                      max="1.0"
                      step="0.05"
                      value={layersState.poiIconOpacity ?? 1.0}
                      onChange={(e) =>
                        onChangeLayersState((p) => ({
                          ...p,
                          poiIconOpacity: parseFloat(e.target.value),
                        }))
                      }
                      className="flex-1 accent-amber-400 h-1.5 bg-[#2a2a35] rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-amber-300 w-8 text-right">
                      {Math.round((layersState.poiIconOpacity ?? 1.0) * 100)}%
                    </span>
                  </div>

                  {/* Fixed Optical Size Toggle */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[10px] text-[#8e8e93]">
                      Taille fixe des icônes au zoom :
                    </span>
                    <button
                      onClick={() =>
                        onChangeLayersState((p) => ({
                          ...p,
                          poiFixedScale: p.poiFixedScale === false ? true : false,
                        }))
                      }
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition font-bold ${
                        layersState.poiFixedScale !== false
                          ? "bg-amber-400 text-black border-amber-400 shadow-sm"
                          : "bg-[#16161a] text-[#8e8e93] border-[#2d2d35] hover:text-white"
                      }`}
                    >
                      {layersState.poiFixedScale !== false ? "Fixe (Recommandé)" : "Variable"}
                    </button>
                  </div>
                </div>

                {/* Categories Breakdown */}
                <div className="pt-2 border-t border-[#2d2d35]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wider">
                      Catégories de lieux
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAllCategories(true)}
                        className="text-[10px] text-amber-400 hover:underline"
                      >
                        Tout cocher
                      </button>
                      <span className="text-[#3a3a45]">•</span>
                      <button
                        onClick={() => toggleAllCategories(false)}
                        className="text-[10px] text-[#8e8e93] hover:text-white hover:underline"
                      >
                        Tout décocher
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                    {POI_CATEGORIES.map((cat) => {
                      const isVisible = layersState.visibleCategories[cat.id] ?? true;
                      const count = categoryCounts[cat.id] || 0;

                      return (
                        <button
                          key={cat.id}
                          onClick={() =>
                            onChangeLayersState((p) => ({
                              ...p,
                              visibleCategories: {
                                ...p.visibleCategories,
                                [cat.id]: !isVisible,
                              },
                            }))
                          }
                          className={`flex items-center justify-between p-1.5 rounded-lg border text-[11px] transition text-left ${
                            isVisible
                              ? "bg-[#16161a] border-[#3a3a45] text-[#d1d1d6]"
                              : "bg-[#16161a]/40 border-[#25252b] text-[#5e5e66] opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: cat.accentColor }}
                            />
                            <span className="truncate">{cat.labelFr}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[9px] font-mono text-[#8e8e93]">{count}</span>
                            {isVisible ? (
                              <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-[#5e5e66]" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Session Custom Pins */}
                <div className="pt-2 border-t border-[#2d2d35] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <div>
                      <span className="text-xs font-semibold text-[#d1d1d6] block">
                        Épingles de Session (MJ & Joueurs)
                      </span>
                      <span className="text-[10px] text-[#8e8e93]">
                        {customPinsCount} repères temporaires posés
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      onChangeLayersState((p) => ({
                        ...p,
                        showCustomPins: !p.showCustomPins,
                      }))
                    }
                    className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors ${
                      layersState.showCustomPins ? "bg-emerald-500" : "bg-stone-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-black transition-transform ${
                        layersState.showCustomPins ? "translate-x-4" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: MÉTÉO & ATMOSPHÈRE                                             */}
          {/* ========================================================================= */}
          <div className="bg-[#1c1c22] rounded-xl p-3 border border-[#2d2d35] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#2d2d35]">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-[#e2ba7d]">Météo & Atmosphère</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {/* Cloud Layer Switch */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#d1d1d6] block">
                    Nuages & Brouillard Volumétriques
                  </span>
                  <span className="text-[10px] text-[#8e8e93]">
                    Effets de brume animés selon la météo
                  </span>
                </div>
                <button
                  onClick={() =>
                    onChangeLayersState((p) => ({
                      ...p,
                      showWeatherClouds: !p.showWeatherClouds,
                    }))
                  }
                  className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors ${
                    layersState.showWeatherClouds ? "bg-cyan-500" : "bg-stone-700"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-black transition-transform ${
                      layersState.showWeatherClouds ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Weather Particles Switch */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#d1d1d6] block">
                    Particules Dynamiques (Pluie, Neige, Cendre...)
                  </span>
                  <span className="text-[10px] text-[#8e8e93]">
                    Animations en temps réel sur la carte
                  </span>
                </div>
                <button
                  onClick={() =>
                    onChangeLayersState((p) => ({
                      ...p,
                      showWeatherParticles: !p.showWeatherParticles,
                    }))
                  }
                  className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors ${
                    layersState.showWeatherParticles ? "bg-cyan-500" : "bg-stone-700"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-black transition-transform ${
                      layersState.showWeatherParticles ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Weather Badges on Regions */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#d1d1d6] block">
                    Pastilles Météo Régionales
                  </span>
                  <span className="text-[10px] text-[#8e8e93]">
                    Boutons ronds d'icônes météo sur chaque royaume
                  </span>
                </div>
                <button
                  onClick={() =>
                    onChangeLayersState((p) => ({
                      ...p,
                      showWeatherBadges: !p.showWeatherBadges,
                    }))
                  }
                  className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors ${
                    layersState.showWeatherBadges ? "bg-cyan-500" : "bg-stone-700"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-black transition-transform ${
                      layersState.showWeatherBadges ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3: NAVIGATION & ROUTES                                            */}
          {/* ========================================================================= */}
          <div className="bg-[#1c1c22] rounded-xl p-3 border border-[#2d2d35] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#2d2d35]">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-[#e2ba7d]">Voies, Routes & Obstacles</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {/* Roads & Pathways Network */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#d1d1d6] block">
                    Réseau des Routes & Voies Royales
                  </span>
                  <span className="text-[10px] text-[#8e8e93]">
                    Tracé des grandes routes, pistes et cols
                  </span>
                </div>
                <button
                  onClick={() =>
                    onChangeLayersState((p) => ({
                      ...p,
                      showRoads: !p.showRoads,
                    }))
                  }
                  className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors ${
                    layersState.showRoads ? "bg-amber-500" : "bg-stone-700"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-black transition-transform ${
                      layersState.showRoads ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Geographic Obstacles & Danger Zones */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#d1d1d6] block">
                    Obstacles & Marais du Chaos
                  </span>
                  <span className="text-[10px] text-[#8e8e93]">
                    Zones infranchissables, marais et nids de monstres
                  </span>
                </div>
                <button
                  onClick={() =>
                    onChangeLayersState((p) => ({
                      ...p,
                      showObstacles: !p.showObstacles,
                    }))
                  }
                  className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors ${
                    layersState.showObstacles ? "bg-rose-500" : "bg-stone-700"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-black transition-transform ${
                      layersState.showObstacles ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Active Calculated Route */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#d1d1d6] block">
                    Itinéraire Actif Calculé
                  </span>
                  <span className="text-[10px] text-[#8e8e93]">
                    Ligne dorée animée du trajet entre 2 points
                  </span>
                </div>
                <button
                  onClick={() =>
                    onChangeLayersState((p) => ({
                      ...p,
                      showActiveRoute: !p.showActiveRoute,
                    }))
                  }
                  className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors ${
                    layersState.showActiveRoute ? "bg-amber-400" : "bg-stone-700"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-black transition-transform ${
                      layersState.showActiveRoute ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 4: GÉOGRAPHIE & REPÈRES CARTOGRAPHIQUES                           */}
          {/* ========================================================================= */}
          <div className="bg-[#1c1c22] rounded-xl p-3 border border-[#2d2d35] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#2d2d35]">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-[#e2ba7d]">Géographie & Repères</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {/* Region Borders */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#d1d1d6] block">
                    Frontières & Fonds des Régions
                  </span>
                  <span className="text-[10px] text-[#8e8e93]">
                    Découpage territorial (Sartar, Tarsh, Prax...)
                  </span>
                </div>
                <button
                  onClick={() =>
                    onChangeLayersState((p) => ({
                      ...p,
                      showRegions: !p.showRegions,
                    }))
                  }
                  className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors ${
                    layersState.showRegions ? "bg-emerald-500" : "bg-stone-700"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-black transition-transform ${
                      layersState.showRegions ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Region Names in Big Letters */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#d1d1d6] block">
                    Noms des Grandes Régions
                  </span>
                  <span className="text-[10px] text-[#8e8e93]">
                    Toponymes en grandes capitales calligraphiées
                  </span>
                </div>
                <button
                  onClick={() =>
                    onChangeLayersState((p) => ({
                      ...p,
                      showRegionLabels: !p.showRegionLabels,
                    }))
                  }
                  className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors ${
                    layersState.showRegionLabels ? "bg-emerald-500" : "bg-stone-700"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-black transition-transform ${
                      layersState.showRegionLabels ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Map Title Cartouche */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#d1d1d6] block">
                    Cartouche Officiel de Titre (1625 ST)
                  </span>
                  <span className="text-[10px] text-[#8e8e93]">
                    Encart doré en haut à gauche de la carte
                  </span>
                </div>
                <button
                  onClick={() =>
                    onChangeLayersState((p) => ({
                      ...p,
                      showMapCartouche: !p.showMapCartouche,
                    }))
                  }
                  className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors ${
                    layersState.showMapCartouche ? "bg-emerald-500" : "bg-stone-700"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-black transition-transform ${
                      layersState.showMapCartouche ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Survey Coordinate Grid */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#d1d1d6] block">
                    Grille d'Arpentage Rectangulaire
                  </span>
                  <span className="text-[10px] text-[#8e8e93]">
                    Maillage doré 5% x 5% pour calculs précis
                  </span>
                </div>
                <button
                  onClick={() =>
                    onChangeLayersState((p) => ({
                      ...p,
                      showGrid: !p.showGrid,
                    }))
                  }
                  className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors ${
                    layersState.showGrid ? "bg-amber-500" : "bg-stone-700"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-black transition-transform ${
                      layersState.showGrid ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Hexagonal Cartographic Grid */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#d1d1d6] block">
                    Grille Hexagonale (10 km / 50 stades)
                  </span>
                  <span className="text-[10px] text-[#8e8e93]">
                    Coordonnées alphanumériques A1..R15 pour hex-crawl
                  </span>
                </div>
                <button
                  onClick={() =>
                    onChangeLayersState((p) => ({
                      ...p,
                      showHexGrid: !p.showHexGrid,
                    }))
                  }
                  className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors ${
                    layersState.showHexGrid ? "bg-amber-500" : "bg-stone-700"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-black transition-transform ${
                      layersState.showHexGrid ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Radius Zones Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#d1d1d6] block">
                    Rayons & Auras (Magie, Dangers, Guet)
                  </span>
                  <span className="text-[10px] text-[#8e8e93]">
                    Cercles de portée interactive sur la carte
                  </span>
                </div>
                <button
                  onClick={() =>
                    onChangeLayersState((p) => ({
                      ...p,
                      showRadiusZones: !p.showRadiusZones,
                    }))
                  }
                  className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors ${
                    layersState.showRadiusZones ? "bg-sky-500" : "bg-stone-700"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-black transition-transform ${
                      layersState.showRadiusZones ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Drawings and Annotations Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#d1d1d6] block">
                    Dessins & Tracés Tactiques MJ
                  </span>
                  <span className="text-[10px] text-[#8e8e93]">
                    Flèches de manœuvre, zones de clan et annotations
                  </span>
                </div>
                <button
                  onClick={() =>
                    onChangeLayersState((p) => ({
                      ...p,
                      showDrawings: !p.showDrawings,
                    }))
                  }
                  className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors ${
                    layersState.showDrawings ? "bg-purple-500" : "bg-stone-700"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-black transition-transform ${
                      layersState.showDrawings ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#2d2d35] bg-[#1c1c22]/90 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => onChangeLayersState(() => DEFAULT_MAP_LAYERS_STATE)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#8e8e93] hover:text-white hover:bg-white/5 transition"
            title="Rétablir les paramètres par défaut"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser par défaut</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#e2ba7d] text-black font-bold text-xs hover:bg-[#edd09e] transition shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>Appliquer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
