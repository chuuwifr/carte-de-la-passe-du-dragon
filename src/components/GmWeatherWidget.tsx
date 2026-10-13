import React, { useState } from "react";
import {
  CloudSun,
  CloudRain,
  CloudSnow,
  CloudFog,
  Zap,
  Wind,
  Flame,
  Sparkles,
  Sun,
  Tornado,
  Dices,
  Sliders,
  Eye,
  Check,
  Compass,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  WeatherSystemState,
  GloranthaCalendar,
  RegionKey,
  WeatherType,
  RegionWeatherState,
  Campaign,
} from "../types";
import {
  GLORANTHA_WEATHER_CATALOG,
  generateRandomWeather,
} from "../data/weatherData";
import { GLORANTHA_SEASONS } from "../data/gloranthaLore";
import { MapDisplayLayersState } from "./MapLayersMenu";

interface GmWeatherWidgetProps {
  weather?: WeatherSystemState;
  calendar?: GloranthaCalendar;
  activeRegion: RegionKey;
  onSelectRegion: (region: RegionKey) => void;
  onUpdateCampaign?: (updater: (prev: Campaign) => Campaign) => void;
  layersState: {
    showWeatherClouds: boolean;
    showWeatherParticles: boolean;
    showWeatherBadges: boolean;
    weatherParticleIntensity: number;
    weatherCloudOpacity: number;
  };
  onChangeLayersState: React.Dispatch<React.SetStateAction<MapDisplayLayersState>>;
  compact?: boolean;
}

const REGION_OPTIONS: { key: RegionKey; labelFr: string; defaultBiome: string }[] = [
  { key: "sartar", labelFr: "Sartar", defaultBiome: "Montagnes & Clans" },
  { key: "prax", labelFr: "Prax", defaultBiome: "Plaines arides & Nomades" },
  { key: "tarsh", labelFr: "Tarsh", defaultBiome: "Collines & Forteresses" },
  { key: "esrolia", labelFr: "Esrolia", defaultBiome: "Champs fertiles & Mer" },
  { key: "paturages", labelFr: "Pâturages", defaultBiome: "Hautes terres des Éleveurs" },
  { key: "vallee_betes", labelFr: "Vallée des Bêtes", defaultBiome: "Forêt enchantée & Brumes" },
  { key: "dagori_inkarth", labelFr: "Dâgori Inkarth", defaultBiome: "Terres sombres des Trolls" },
  { key: "pays_heort", labelFr: "Pays d'Héort", defaultBiome: "Plateaux côtiers" },
  { key: "comte_soleil", labelFr: "Comté du Soleil", defaultBiome: "Plaines solaires de Yelmalio" },
  { key: "comte_pavis", labelFr: "Pavis & Zola Fel", defaultBiome: "Oasis & Vallée fluviale" },
];

const PRESET_WEATHERS: {
  type: WeatherType;
  label: string;
  icon: React.ReactNode;
  color: string;
  category: "rain" | "snow" | "sand" | "storm" | "fog" | "sun" | "magic";
}[] = [
  {
    type: "torrential_rain",
    label: "Pluie Battante",
    icon: <CloudRain className="w-4 h-4 text-blue-400" />,
    color: "hover:border-blue-400 hover:bg-blue-950/40 text-blue-300",
    category: "rain",
  },
  {
    type: "drizzle",
    label: "Bruine Légère",
    icon: <CloudRain className="w-4 h-4 text-sky-300" />,
    color: "hover:border-sky-400 hover:bg-sky-950/40 text-sky-200",
    category: "rain",
  },
  {
    type: "blizzard",
    label: "Blizzard & Neige",
    icon: <CloudSnow className="w-4 h-4 text-cyan-200" />,
    color: "hover:border-cyan-300 hover:bg-cyan-950/40 text-cyan-100",
    category: "snow",
  },
  {
    type: "freezing_chill",
    label: "Givre & Froid",
    icon: <CloudSnow className="w-4 h-4 text-blue-200" />,
    color: "hover:border-blue-300 hover:bg-blue-950/40 text-blue-100",
    category: "snow",
  },
  {
    type: "dust_storm",
    label: "Tempête de Sable",
    icon: <Tornado className="w-4 h-4 text-amber-500" />,
    color: "hover:border-amber-500 hover:bg-amber-950/40 text-amber-300",
    category: "sand",
  },
  {
    type: "thunderstorm",
    label: "Orage d'Orlanth",
    icon: <Zap className="w-4 h-4 text-yellow-400" />,
    color: "hover:border-yellow-400 hover:bg-yellow-950/40 text-yellow-200",
    category: "storm",
  },
  {
    type: "thick_fog",
    label: "Brouillard Épais",
    icon: <CloudFog className="w-4 h-4 text-slate-300" />,
    color: "hover:border-slate-400 hover:bg-slate-900/60 text-slate-200",
    category: "fog",
  },
  {
    type: "heatwave",
    label: "Canicule de Feu",
    icon: <Flame className="w-4 h-4 text-orange-400" />,
    color: "hover:border-orange-400 hover:bg-orange-950/40 text-orange-300",
    category: "sun",
  },
  {
    type: "clear_sky",
    label: "Ciel Dégagé",
    icon: <Sun className="w-4 h-4 text-amber-400" />,
    color: "hover:border-amber-400 hover:bg-amber-950/40 text-amber-300",
    category: "sun",
  },
  {
    type: "mystic_aurora",
    label: "Aurore Runique",
    icon: <Sparkles className="w-4 h-4 text-purple-400" />,
    color: "hover:border-purple-400 hover:bg-purple-950/40 text-purple-300",
    category: "magic",
  },
];

export const GmWeatherWidget: React.FC<GmWeatherWidgetProps> = ({
  weather,
  calendar = { year: 1625, seasonIndex: 0, weekNumber: 1, dayIndex: 0 },
  activeRegion,
  onSelectRegion,
  onUpdateCampaign,
  layersState,
  onChangeLayersState,
  compact = false,
}) => {
  const [applyToAllRegions, setApplyToAllRegions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!compact);

  // Current active region's weather state
  const currentRegionWeather = weather?.regionWeathers?.[activeRegion] || {
    region: activeRegion,
    weatherType: "clear_sky",
    temperature: "tempere",
    wind: "brise",
    precipitation: "aucune",
  };

  const currentMeta = GLORANTHA_WEATHER_CATALOG[currentRegionWeather.weatherType] || GLORANTHA_WEATHER_CATALOG.clear_sky;
  const currentSeason = GLORANTHA_SEASONS[calendar.seasonIndex] || GLORANTHA_SEASONS[0];

  // Set weather for active region or all regions
  const applyWeather = (newType: WeatherType) => {
    if (!onUpdateCampaign) return;

    onUpdateCampaign((prev) => {
      const existingWeathers = prev.weather?.regionWeathers || {};

      if (applyToAllRegions) {
        const updated: Partial<Record<RegionKey, RegionWeatherState>> = {};
        REGION_OPTIONS.forEach((r) => {
          const oldState = existingWeathers[r.key] || {
            region: r.key,
            weatherType: newType,
            temperature: "tempere",
            wind: "brise",
            precipitation: "aucune",
          };
          updated[r.key] = {
            ...oldState,
            weatherType: newType,
          };
        });

        return {
          ...prev,
          weather: {
            selectedRegion: activeRegion,
            isAutoSeasonSync: false,
            regionWeathers: updated,
          },
          lastSaved: new Date().toISOString(),
        };
      } else {
        return {
          ...prev,
          weather: {
            selectedRegion: activeRegion,
            isAutoSeasonSync: prev.weather?.isAutoSeasonSync ?? true,
            regionWeathers: {
              ...existingWeathers,
              [activeRegion]: {
                ...currentRegionWeather,
                weatherType: newType,
              },
            },
          },
          lastSaved: new Date().toISOString(),
        };
      }
    });

    // Make sure weather layers are turned on if setting an active weather effect
    if (!layersState.showWeatherClouds) {
      onChangeLayersState((prev) => ({ ...prev, showWeatherClouds: true }));
    }
  };

  // Roll seasonal random weather for all regions or active region
  const rollSeasonWeather = () => {
    if (!onUpdateCampaign) return;

    if (applyToAllRegions) {
      const newWeathers: Partial<Record<RegionKey, RegionWeatherState>> = {};
      REGION_OPTIONS.forEach((r) => {
        newWeathers[r.key] = generateRandomWeather(r.key, calendar.seasonIndex);
      });

      onUpdateCampaign((prev) => ({
        ...prev,
        weather: {
          selectedRegion: activeRegion,
          isAutoSeasonSync: true,
          regionWeathers: newWeathers,
        },
        lastSaved: new Date().toISOString(),
      }));
    } else {
      const generated = generateRandomWeather(activeRegion, calendar.seasonIndex);
      onUpdateCampaign((prev) => ({
        ...prev,
        weather: {
          ...prev.weather,
          selectedRegion: activeRegion,
          regionWeathers: {
            ...(prev.weather?.regionWeathers || {}),
            [activeRegion]: generated,
          },
        },
        lastSaved: new Date().toISOString(),
      }));
    }
  };

  return (
    <div
      id="gm-weather-control-widget"
      className="bg-[#16161a]/95 backdrop-blur-md border border-amber-500/40 rounded-2xl p-4 shadow-2xl text-xs text-[#d1d1d6] select-none"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2d2d35]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <CloudSun className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#e2ba7d] text-xs uppercase tracking-wider">
                Contrôle Météo MJ
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-700/50 font-mono">
                OVERLAY CSS ACTIF
              </span>
            </div>
            <span className="text-[10px] text-[#8e8e93]">
              Saison : {currentSeason.nameFr} (An {calendar.year})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={rollSeasonWeather}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition"
            title="Générer un tirage aléatoire selon les tables de Glorantha pour la saison"
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Dés Météo</span>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-[#8e8e93] hover:text-white rounded-md hover:bg-white/5"
            title={isExpanded ? "Réduire" : "Développer"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3.5 space-y-3.5">
          {/* Target Region Selector & Global Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#202026] p-2.5 rounded-xl border border-[#2d2d35]">
            <div>
              <label className="text-[10px] uppercase font-semibold text-[#8e8e93] block mb-1">
                Région Ciblée :
              </label>
              <select
                value={activeRegion}
                onChange={(e) => onSelectRegion(e.target.value as RegionKey)}
                disabled={applyToAllRegions}
                className="w-full bg-[#16161a] border border-[#3a3a45] rounded-lg px-2 py-1 text-xs text-[#e2ba7d] font-semibold outline-none focus:border-[#e2ba7d] disabled:opacity-50"
              >
                {REGION_OPTIONS.map((reg) => (
                  <option key={reg.key} value={reg.key}>
                    {reg.labelFr} ({reg.defaultBiome})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer p-1 rounded-lg hover:bg-white/5 transition">
                <input
                  type="checkbox"
                  checked={applyToAllRegions}
                  onChange={(e) => setApplyToAllRegions(e.target.checked)}
                  className="rounded border-[#3a3a45] bg-[#16161a] text-amber-400 focus:ring-0"
                />
                <span className="text-[11px] font-semibold text-amber-200">
                  Appliquer à toute la Passe
                </span>
              </label>
              <span className="text-[9px] text-[#8e8e93] pl-6">
                Modifie le climat de tout le plateau d'un seul clic
              </span>
            </div>
          </div>

          {/* Quick Weather Preset Buttons Grid */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-semibold text-[#8e8e93] tracking-wider">
                Atmosphère & Overlays Dynamiques (Pluie, Neige, Sable...) :
              </span>
              <span className="text-[10px] text-amber-300 font-bold">
                Actuel : {currentMeta.nameFr}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {PRESET_WEATHERS.map((preset) => {
                const isActive = currentRegionWeather.weatherType === preset.type;
                return (
                  <button
                    key={preset.type}
                    onClick={() => applyWeather(preset.type)}
                    className={`flex items-center gap-1.5 p-2 rounded-xl border text-left transition-all relative ${
                      isActive
                        ? "bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)] ring-1 ring-amber-400"
                        : `bg-[#202026] border-[#2d2d35] text-[#d1d1d6] ${preset.color}`
                    }`}
                  >
                    <div className="flex-shrink-0">{preset.icon}</div>
                    <span className="text-[11px] truncate leading-tight">{preset.label}</span>
                    {isActive && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Effect Sliders: Cloud Opacity & Particle Intensity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#202026] p-3 rounded-xl border border-[#2d2d35]">
            {/* Cloud & CSS Overlay Opacity */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-[#8e8e93]">Opacité Overlay & Nuages :</span>
                <span className="font-mono text-amber-300 font-semibold">
                  {Math.round(layersState.weatherCloudOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.15"
                max="1.0"
                step="0.05"
                value={layersState.weatherCloudOpacity}
                onChange={(e) =>
                  onChangeLayersState((prev) => ({
                    ...prev,
                    weatherCloudOpacity: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-amber-400 h-1.5 bg-[#16161a] rounded-lg cursor-pointer"
              />
            </div>

            {/* Particle Intensity */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-[#8e8e93]">Simulation Particules :</span>
                <span className="font-mono text-cyan-300 font-semibold">
                  {Math.round(layersState.weatherParticleIntensity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={layersState.weatherParticleIntensity}
                onChange={(e) =>
                  onChangeLayersState((prev) => ({
                    ...prev,
                    weatherParticleIntensity: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-cyan-400 h-1.5 bg-[#16161a] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  onChangeLayersState((prev) => ({
                    ...prev,
                    showWeatherClouds: !prev.showWeatherClouds,
                  }))
                }
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                  layersState.showWeatherClouds
                    ? "bg-amber-500 text-black border-amber-400"
                    : "bg-[#202026] text-[#8e8e93] border-[#3a3a45]"
                }`}
              >
                {layersState.showWeatherClouds ? "✓ Overlays CSS ON" : "Overlays CSS OFF"}
              </button>

              <button
                onClick={() =>
                  onChangeLayersState((prev) => ({
                    ...prev,
                    showWeatherParticles: !prev.showWeatherParticles,
                  }))
                }
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                  layersState.showWeatherParticles
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/60"
                    : "bg-[#202026] text-[#8e8e93] border-[#3a3a45]"
                }`}
              >
                {layersState.showWeatherParticles ? "✓ Particules ON" : "Particules OFF"}
              </button>

              <button
                onClick={() =>
                  onChangeLayersState((prev) => ({
                    ...prev,
                    showWeatherBadges: !prev.showWeatherBadges,
                  }))
                }
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                  layersState.showWeatherBadges
                    ? "bg-amber-500/20 text-amber-300 border-amber-400/50"
                    : "bg-[#202026] text-[#8e8e93] border-[#3a3a45]"
                }`}
              >
                {layersState.showWeatherBadges ? "✓ Pastilles Carte" : "Pastilles Masquées"}
              </button>
            </div>
          </div>

          {/* GM Mechanics & Lore Guide Box */}
          <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-amber-300 font-bold">
              <span>Impact MJ : {currentMeta.effect.travelSpeedLabelFr}</span>
              {currentMeta.effect.combatRangeModifier !== 0 && (
                <span className="text-red-400">
                  Tir/Perception : {currentMeta.effect.combatRangeModifier}%
                </span>
              )}
            </div>
            <p className="text-[#8e8e93] leading-relaxed">
              {currentMeta.effect.descriptionFr} {currentMeta.effect.mechanicalNotesFr}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
