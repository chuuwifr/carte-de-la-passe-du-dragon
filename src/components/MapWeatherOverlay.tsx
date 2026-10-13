import React, { useState } from "react";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudFog,
  Zap,
  Wind,
  Flame,
  Sparkles,
  Snowflake,
  Tornado,
  Dices,
  Info,
} from "lucide-react";
import {
  WeatherSystemState,
  GloranthaCalendar,
  RegionKey,
  WeatherType,
  RegionWeatherState,
} from "../types";
import {
  GLORANTHA_WEATHER_CATALOG,
  generateRandomWeather,
} from "../data/weatherData";

interface MapWeatherOverlayProps {
  weather?: WeatherSystemState;
  calendar?: GloranthaCalendar;
  opacityMultiplier?: number;
  showBadges?: boolean;
  isGmMode?: boolean;
  activeRegion?: RegionKey;
  onSelectRegion?: (region: RegionKey) => void;
  onUpdateWeather?: (region: RegionKey, newType: WeatherType) => void;
}

interface RegionZone {
  key: RegionKey;
  labelFr: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  driftAnim: string;
}

const DRAGON_PASS_WEATHER_ZONES: RegionZone[] = [
  {
    key: "sartar",
    labelFr: "Sartar",
    cx: 680,
    cy: 560,
    rx: 240,
    ry: 160,
    driftAnim: "anim-cloud-drift-1",
  },
  {
    key: "tarsh",
    labelFr: "Tarsh",
    cx: 420,
    cy: 220,
    rx: 200,
    ry: 130,
    driftAnim: "anim-cloud-drift-2",
  },
  {
    key: "prax",
    labelFr: "Prax",
    cx: 1220,
    cy: 520,
    rx: 220,
    ry: 190,
    driftAnim: "anim-cloud-drift-3",
  },
  {
    key: "esrolia",
    labelFr: "Esrolia",
    cx: 260,
    cy: 860,
    rx: 170,
    ry: 130,
    driftAnim: "anim-cloud-drift-1",
  },
  {
    key: "paturages",
    labelFr: "Pâturages",
    cx: 380,
    cy: 480,
    rx: 130,
    ry: 100,
    driftAnim: "anim-cloud-drift-2",
  },
  {
    key: "vallee_betes",
    labelFr: "Vallée des Bêtes",
    cx: 520,
    cy: 720,
    rx: 130,
    ry: 100,
    driftAnim: "anim-cloud-drift-3",
  },
  {
    key: "dagori_inkarth",
    labelFr: "Dâgori Inkarth",
    cx: 920,
    cy: 280,
    rx: 170,
    ry: 120,
    driftAnim: "anim-cloud-drift-2",
  },
  {
    key: "pays_heort",
    labelFr: "Pays d'Héort",
    cx: 820,
    cy: 750,
    rx: 160,
    ry: 120,
    driftAnim: "anim-cloud-drift-1",
  },
  {
    key: "comte_soleil",
    labelFr: "Comté du Soleil",
    cx: 1100,
    cy: 760,
    rx: 140,
    ry: 110,
    driftAnim: "anim-cloud-drift-3",
  },
  {
    key: "comte_pavis",
    labelFr: "Pavis & Zola Fel",
    cx: 1380,
    cy: 600,
    rx: 130,
    ry: 110,
    driftAnim: "anim-cloud-drift-2",
  },
];

export const MapWeatherOverlay: React.FC<MapWeatherOverlayProps> = ({
  weather,
  calendar = { year: 1625, seasonIndex: 0, weekNumber: 1, dayIndex: 0 },
  opacityMultiplier = 1,
  showBadges = true,
  isGmMode = false,
  activeRegion,
  onSelectRegion,
  onUpdateWeather,
}) => {
  const [selectedZoneKey, setSelectedZoneKey] = useState<RegionKey | null>(null);

  // Helper to get weather for a region
  const getRegionWeather = (regionKey: RegionKey): RegionWeatherState => {
    if (weather?.regionWeathers && weather.regionWeathers[regionKey]) {
      return weather.regionWeathers[regionKey]!;
    }
    // Fallback based on calendar season
    const defaultWeatherTypes: Record<number, WeatherType> = {
      0: "drizzle", // Mer
      1: "clear_sky", // Feu
      2: "gentle_breeze", // Terre
      3: "freezing_chill", // Obscurité
      4: "thunderstorm", // Tempêtes
      5: "mystic_aurora", // Temps Sacré
    };
    const wType = defaultWeatherTypes[calendar.seasonIndex] || "clear_sky";
    return {
      region: regionKey,
      weatherType: wType,
      temperature: "tempere",
      wind: "brise",
      precipitation: "aucune",
    };
  };

  const renderWeatherIcon = (type: WeatherType, className = "w-3.5 h-3.5") => {
    switch (type) {
      case "clear_sky":
        return <Sun className={`${className} text-amber-400`} />;
      case "gentle_breeze":
        return <Wind className={`${className} text-sky-300`} />;
      case "heavy_clouds":
        return <Cloud className={`${className} text-slate-300`} />;
      case "drizzle":
        return <CloudDrizzle className={`${className} text-teal-300`} />;
      case "torrential_rain":
        return <CloudRain className={`${className} text-blue-400`} />;
      case "thunderstorm":
        return <Zap className={`${className} text-amber-300`} />;
      case "heatwave":
        return <Flame className={`${className} text-orange-400`} />;
      case "dust_storm":
        return <Tornado className={`${className} text-amber-500`} />;
      case "thick_fog":
        return <CloudFog className={`${className} text-indigo-300`} />;
      case "freezing_chill":
        return <Snowflake className={`${className} text-cyan-300`} />;
      case "blizzard":
        return <CloudSnow className={`${className} text-sky-200`} />;
      case "mystic_aurora":
        return <Sparkles className={`${className} text-purple-300`} />;
      case "ash_and_smoke":
        return <Flame className={`${className} text-rose-500`} />;
      default:
        return <Sun className={`${className} text-amber-400`} />;
    }
  };

  return (
    <div
      id="map-weather-overlay-container"
      className="absolute inset-0 w-[1600px] h-[1100px] pointer-events-none z-15 overflow-hidden"
      style={{ opacity: opacityMultiplier }}
    >
      {/* SVG Layer for animated clouds, rain, snow, and atmospheric effects */}
      <svg
        id="weather-clouds-svg-layer"
        viewBox="0 0 1600 1100"
        width="1600"
        height="1100"
        className="w-[1600px] h-[1100px] absolute inset-0 pointer-events-none"
      >
        <defs>
          {/* Cloud Gradients */}
          <radialGradient id="cloud-white-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#f1f5f9" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="cloud-dark-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#475569" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#334155" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="cloud-storm-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#312e81" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="cloud-dust-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#b45309" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#d97706" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="cloud-fog-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#64748b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#475569" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="cloud-frost-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#bae6fd" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="aurora-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="heat-grad-1" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Render weather clouds for each zone */}
        {DRAGON_PASS_WEATHER_ZONES.map((zone) => {
          const wState = getRegionWeather(zone.key);
          const wType = wState.weatherType;

          return (
            <g
              key={`weather-zone-${zone.key}`}
              id={`weather-group-${zone.key}`}
              className={zone.driftAnim}
            >
              {/* CLEAR SKY: Soft light sunny puffs */}
              {wType === "clear_sky" && (
                <g opacity="0.3">
                  <ellipse
                    cx={zone.cx - 40}
                    cy={zone.cy - 30}
                    rx={zone.rx * 0.55}
                    ry={zone.ry * 0.45}
                    fill="url(#cloud-white-grad)"
                  />
                  <ellipse
                    cx={zone.cx + 50}
                    cy={zone.cy + 20}
                    rx={zone.rx * 0.45}
                    ry={zone.ry * 0.4}
                    fill="url(#cloud-white-grad)"
                  />
                </g>
              )}

              {/* GENTLE BREEZE: Moving airy white clouds */}
              {wType === "gentle_breeze" && (
                <g opacity="0.45">
                  <ellipse
                    cx={zone.cx - 60}
                    cy={zone.cy - 20}
                    rx={zone.rx * 0.7}
                    ry={zone.ry * 0.45}
                    fill="url(#cloud-white-grad)"
                  />
                  <ellipse
                    cx={zone.cx + 40}
                    cy={zone.cy - 10}
                    rx={zone.rx * 0.6}
                    ry={zone.ry * 0.5}
                    fill="url(#cloud-white-grad)"
                  />
                  {/* Wind streaks */}
                  <line
                    x1={zone.cx - zone.rx * 0.6}
                    y1={zone.cy + 30}
                    x2={zone.cx + zone.rx * 0.7}
                    y2={zone.cy + 25}
                    stroke="#e2e8f0"
                    strokeWidth="2.5"
                    strokeDasharray="18 12"
                    opacity="0.5"
                  />
                </g>
              )}

              {/* HEAVY CLOUDS: Overcast dark rolling cloudbank */}
              {wType === "heavy_clouds" && (
                <g opacity="0.75">
                  <ellipse
                    cx={zone.cx - 50}
                    cy={zone.cy - 30}
                    rx={zone.rx * 0.85}
                    ry={zone.ry * 0.65}
                    fill="url(#cloud-dark-grad)"
                  />
                  <ellipse
                    cx={zone.cx + 40}
                    cy={zone.cy - 10}
                    rx={zone.rx * 0.9}
                    ry={zone.ry * 0.7}
                    fill="url(#cloud-dark-grad)"
                  />
                  <ellipse
                    cx={zone.cx}
                    cy={zone.cy + 25}
                    rx={zone.rx * 0.75}
                    ry={zone.ry * 0.55}
                    fill="url(#cloud-dark-grad)"
                  />
                </g>
              )}

              {/* DRIZZLE: Rainclouds + gentle falling rain streaks */}
              {wType === "drizzle" && (
                <g opacity="0.7">
                  <ellipse
                    cx={zone.cx - 40}
                    cy={zone.cy - 30}
                    rx={zone.rx * 0.8}
                    ry={zone.ry * 0.6}
                    fill="url(#cloud-dark-grad)"
                  />
                  <ellipse
                    cx={zone.cx + 45}
                    cy={zone.cy - 15}
                    rx={zone.rx * 0.75}
                    ry={zone.ry * 0.55}
                    fill="url(#cloud-dark-grad)"
                  />
                  {/* Rain drops */}
                  <g className="anim-rain-fall" opacity="0.6">
                    {[ -60, -30, 0, 30, 60 ].map((offset, i) => (
                      <line
                        key={`rain-${zone.key}-${i}`}
                        x1={zone.cx + offset}
                        y1={zone.cy + 10}
                        x2={zone.cx + offset - 8}
                        y2={zone.cy + 45}
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="4 6"
                        strokeLinecap="round"
                      />
                    ))}
                  </g>
                </g>
              )}

              {/* TORRENTIAL RAIN: Heavy dark clouds + intense rain */}
              {wType === "torrential_rain" && (
                <g opacity="0.85">
                  <ellipse
                    cx={zone.cx - 40}
                    cy={zone.cy - 30}
                    rx={zone.rx * 0.9}
                    ry={zone.ry * 0.7}
                    fill="url(#cloud-storm-grad)"
                  />
                  <ellipse
                    cx={zone.cx + 50}
                    cy={zone.cy - 10}
                    rx={zone.rx * 0.85}
                    ry={zone.ry * 0.65}
                    fill="url(#cloud-storm-grad)"
                  />
                  <g className="anim-rain-fall" opacity="0.85">
                    {[ -80, -50, -20, 10, 40, 70 ].map((offset, i) => (
                      <line
                        key={`heavyrain-${zone.key}-${i}`}
                        x1={zone.cx + offset}
                        y1={zone.cy + 10}
                        x2={zone.cx + offset - 15}
                        y2={zone.cy + 65}
                        stroke="#0284c7"
                        strokeWidth="2.5"
                        strokeDasharray="8 6"
                        strokeLinecap="round"
                      />
                    ))}
                  </g>
                </g>
              )}

              {/* THUNDERSTORM: Dark storm clouds with electric lightning flash */}
              {wType === "thunderstorm" && (
                <g opacity="0.88">
                  <ellipse
                    cx={zone.cx - 50}
                    cy={zone.cy - 35}
                    rx={zone.rx * 0.95}
                    ry={zone.ry * 0.75}
                    fill="url(#cloud-storm-grad)"
                  />
                  <ellipse
                    cx={zone.cx + 40}
                    cy={zone.cy - 15}
                    rx={zone.rx * 0.9}
                    ry={zone.ry * 0.7}
                    fill="url(#cloud-storm-grad)"
                  />
                  <ellipse
                    cx={zone.cx - 10}
                    cy={zone.cy + 25}
                    rx={zone.rx * 0.8}
                    ry={zone.ry * 0.6}
                    fill="url(#cloud-storm-grad)"
                  />
                  {/* Flashing Lightning Bolt */}
                  <path
                    d={`M ${zone.cx - 15} ${zone.cy} L ${zone.cx - 5} ${zone.cy + 28} L ${zone.cx - 20} ${zone.cy + 30} L ${zone.cx} ${zone.cy + 65}`}
                    fill="none"
                    stroke="#fde047"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="anim-lightning-pulse"
                    filter="drop-shadow(0 0 8px #facc15)"
                  />
                  {/* Rain */}
                  <g className="anim-rain-fall" opacity="0.75">
                    {[ -70, -35, 10, 45, 80 ].map((offset, i) => (
                      <line
                        key={`stormrain-${zone.key}-${i}`}
                        x1={zone.cx + offset}
                        y1={zone.cy + 15}
                        x2={zone.cx + offset - 18}
                        y2={zone.cy + 60}
                        stroke="#60a5fa"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                      />
                    ))}
                  </g>
                </g>
              )}

              {/* DUST STORM: Ocre desert swirling clouds */}
              {wType === "dust_storm" && (
                <g opacity="0.7" className="anim-dust-swirl">
                  <ellipse
                    cx={zone.cx - 40}
                    cy={zone.cy - 20}
                    rx={zone.rx * 0.9}
                    ry={zone.ry * 0.7}
                    fill="url(#cloud-dust-grad)"
                  />
                  <ellipse
                    cx={zone.cx + 50}
                    cy={zone.cy}
                    rx={zone.rx * 0.85}
                    ry={zone.ry * 0.65}
                    fill="url(#cloud-dust-grad)"
                  />
                  {/* Swirling wind ribbons */}
                  <path
                    d={`M ${zone.cx - zone.rx * 0.7} ${zone.cy - 20} Q ${zone.cx} ${zone.cy - 50} ${zone.cx + zone.rx * 0.7} ${zone.cy} T ${zone.cx - zone.rx * 0.3} ${zone.cy + 40}`}
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="3"
                    strokeDasharray="12 8"
                    opacity="0.6"
                  />
                </g>
              )}

              {/* THICK FOG: Low lying mist banks */}
              {wType === "thick_fog" && (
                <g opacity="0.65">
                  <ellipse
                    cx={zone.cx - 50}
                    cy={zone.cy}
                    rx={zone.rx * 0.95}
                    ry={zone.ry * 0.55}
                    fill="url(#cloud-fog-grad)"
                  />
                  <ellipse
                    cx={zone.cx + 40}
                    cy={zone.cy + 15}
                    rx={zone.rx * 0.9}
                    ry={zone.ry * 0.5}
                    fill="url(#cloud-fog-grad)"
                  />
                  <ellipse
                    cx={zone.cx}
                    cy={zone.cy - 20}
                    rx={zone.rx * 0.75}
                    ry={zone.ry * 0.45}
                    fill="url(#cloud-fog-grad)"
                  />
                </g>
              )}

              {/* FREEZING CHILL / BLIZZARD: Icy clouds and drifting snowflakes */}
              {(wType === "freezing_chill" || wType === "blizzard") && (
                <g opacity={wType === "blizzard" ? "0.85" : "0.6"}>
                  <ellipse
                    cx={zone.cx - 40}
                    cy={zone.cy - 25}
                    rx={zone.rx * 0.85}
                    ry={zone.ry * 0.65}
                    fill="url(#cloud-frost-grad)"
                  />
                  <ellipse
                    cx={zone.cx + 40}
                    cy={zone.cy - 10}
                    rx={zone.rx * 0.8}
                    ry={zone.ry * 0.6}
                    fill="url(#cloud-frost-grad)"
                  />
                  {/* Floating snow dots */}
                  <g className="anim-snow-float">
                    {[
                      { ox: -50, oy: 10, r: 2.5 },
                      { ox: -20, oy: 25, r: 3 },
                      { ox: 15, oy: 15, r: 2 },
                      { ox: 45, oy: 30, r: 3.5 },
                      { ox: -35, oy: 45, r: 2 },
                      { ox: 25, oy: 50, r: 2.5 },
                    ].map((snow, i) => (
                      <circle
                        key={`snow-${zone.key}-${i}`}
                        cx={zone.cx + snow.ox}
                        cy={zone.cy + snow.oy}
                        r={snow.r}
                        fill="#ffffff"
                        opacity="0.8"
                        filter="drop-shadow(0 0 2px #38bdf8)"
                      />
                    ))}
                  </g>
                </g>
              )}

              {/* HEATWAVE: Golden shimmering heatwaves */}
              {wType === "heatwave" && (
                <g opacity="0.5" className="anim-heat-shimmer">
                  <ellipse
                    cx={zone.cx}
                    cy={zone.cy}
                    rx={zone.rx * 0.9}
                    ry={zone.ry * 0.65}
                    fill="url(#heat-grad-1)"
                  />
                  <path
                    d={`M ${zone.cx - zone.rx * 0.6} ${zone.cy + 20} Q ${zone.cx - zone.rx * 0.3} ${zone.cy - 10} ${zone.cx} ${zone.cy + 20} T ${zone.cx + zone.rx * 0.6} ${zone.cy + 20}`}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeDasharray="14 10"
                    opacity="0.4"
                  />
                </g>
              )}

              {/* MYSTIC AURORA: Ethereal flowing light ribbons */}
              {wType === "mystic_aurora" && (
                <g opacity="0.65" className="anim-aurora-glow">
                  <path
                    d={`M ${zone.cx - zone.rx * 0.9} ${zone.cy - 30} Q ${zone.cx - zone.rx * 0.3} ${zone.cy - 70} ${zone.cx + zone.rx * 0.2} ${zone.cy - 20} T ${zone.cx + zone.rx * 0.9} ${zone.cy - 50} L ${zone.cx + zone.rx * 0.8} ${zone.cy + 20} Q ${zone.cx} ${zone.cy + 10} ${zone.cx - zone.rx * 0.8} ${zone.cy + 30} Z`}
                    fill="url(#aurora-grad-1)"
                    filter="drop-shadow(0 0 12px #a855f7)"
                  />
                </g>
              )}

              {/* ASH AND SMOKE: Dark volcanic smoke clouds */}
              {wType === "ash_and_smoke" && (
                <g opacity="0.75" className="anim-dust-swirl">
                  <ellipse
                    cx={zone.cx - 30}
                    cy={zone.cy - 30}
                    rx={zone.rx * 0.85}
                    ry={zone.ry * 0.65}
                    fill="url(#cloud-dark-grad)"
                  />
                  <ellipse
                    cx={zone.cx + 35}
                    cy={zone.cy - 15}
                    rx={zone.rx * 0.8}
                    ry={zone.ry * 0.6}
                    fill="url(#cloud-dark-grad)"
                  />
                  {/* Rising glowing embers */}
                  <circle cx={zone.cx - 20} cy={zone.cy + 10} r="2" fill="#ef4444" opacity="0.9" />
                  <circle cx={zone.cx + 15} cy={zone.cy} r="2.5" fill="#f97316" opacity="0.8" />
                  <circle cx={zone.cx + 35} cy={zone.cy + 25} r="1.5" fill="#eab308" opacity="0.9" />
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* HTML Regional Weather Badges Overlay (clickable & interactive) */}
      {showBadges && (
        <div className="absolute inset-0 pointer-events-none">
          {DRAGON_PASS_WEATHER_ZONES.map((zone) => {
            const wState = getRegionWeather(zone.key);
            const meta =
              GLORANTHA_WEATHER_CATALOG[wState.weatherType] ||
              GLORANTHA_WEATHER_CATALOG.clear_sky;
            const isSelected = selectedZoneKey === zone.key;
            const isActive = activeRegion === zone.key;

            // Convert 1600x1100 coords to percentages
            const leftPct = (zone.cx / 1600) * 100;
            const topPct = (zone.cy / 1100) * 100;

            return (
              <div
                key={`badge-${zone.key}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
              >
                {/* Weather Circular Icon Badge (No text for clean map view) */}
                <button
                  onClick={() => {
                    const nextSelected = isSelected ? null : zone.key;
                    setSelectedZoneKey(nextSelected);
                    if (onSelectRegion) {
                      onSelectRegion(zone.key);
                    }
                  }}
                  className={`relative flex items-center justify-center w-7 h-7 rounded-full border shadow-xl backdrop-blur-md transition-all transform hover:scale-125 active:scale-95 ${
                    isSelected || isActive
                      ? "bg-[#16161a] border-amber-400 text-amber-300 ring-2 ring-amber-400/50 ring-offset-1 ring-offset-black z-30 scale-110 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                      : "bg-[#16161a]/90 border-[#3a3a45] text-[#d1d1d6] hover:border-amber-400/60 hover:text-amber-300"
                  }`}
                  title={`${zone.labelFr} : ${meta.nameFr} (${meta.effect.travelSpeedLabelFr}) - Cliquer pour détails & ambiance`}
                >
                  {renderWeatherIcon(wState.weatherType, "w-4 h-4")}
                  {isActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  )}
                </button>

                {/* Popover Card for GM to inspect & change weather for this region */}
                {isSelected && (
                  <div className="absolute top-7 left-1/2 -translate-x-1/2 w-64 bg-[#16161a]/95 border border-amber-500/50 rounded-xl p-3 shadow-2xl text-xs text-[#d1d1d6] z-40 backdrop-blur-md animate-fade-in pointer-events-auto">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#2d2d35]">
                      <span className="font-bold text-amber-300 flex items-center gap-1.5">
                        {renderWeatherIcon(wState.weatherType, "w-4 h-4")}
                        {zone.labelFr}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedZoneKey(null);
                        }}
                        className="text-[#8e8e93] hover:text-white text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mt-2 space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-[#8e8e93]">Météo active :</span>
                        <span className="font-semibold text-[#e2ba7d]">{meta.nameFr}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8e8e93]">Vitesse de voyage :</span>
                        <span
                          className={`font-semibold ${
                            meta.effect.travelSpeedMultiplier < 1
                              ? "text-rose-400"
                              : meta.effect.travelSpeedMultiplier > 1
                              ? "text-emerald-400"
                              : "text-amber-300"
                          }`}
                        >
                          {meta.effect.travelSpeedLabelFr}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8e8e93]">Combat à distance :</span>
                        <span className="font-semibold text-[#d1d1d6]">
                          {meta.effect.combatRangeModifier !== 0
                            ? `${meta.effect.combatRangeModifier}%`
                            : "Normal (0%)"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8e8e93]">Perception (Vue/Écoute) :</span>
                        <span className="font-semibold text-[#d1d1d6]">
                          {meta.effect.perceptionModifier !== 0
                            ? `${meta.effect.perceptionModifier}%`
                            : "Normal (0%)"}
                        </span>
                      </div>
                    </div>

                    {/* Quick Reroll or Select for GM */}
                    {isGmMode && onUpdateWeather && (
                      <div className="mt-3 pt-2 border-t border-[#2d2d35] flex items-center justify-between gap-1.5">
                        <button
                          onClick={() => {
                            const rolled = generateRandomWeather(
                              zone.key,
                              calendar.seasonIndex
                            );
                            onUpdateWeather(zone.key, rolled.weatherType);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 bg-[#25252b] hover:bg-[#32323a] text-amber-300 text-[10px] rounded-lg border border-amber-500/30 font-semibold"
                          title="Tirer aléatoirement la météo de cette région"
                        >
                          <Dices className="w-3 h-3" />
                          <span>Tirer Dé Météo</span>
                        </button>

                        <select
                          value={wState.weatherType}
                          onChange={(e) => {
                            onUpdateWeather(
                              zone.key,
                              e.target.value as WeatherType
                            );
                          }}
                          className="bg-[#25252b] border border-[#3a3a45] text-amber-200 text-[10px] rounded-lg px-2 py-1 outline-none focus:border-amber-400"
                        >
                          {Object.keys(GLORANTHA_WEATHER_CATALOG).map((k) => (
                            <option key={k} value={k}>
                              {GLORANTHA_WEATHER_CATALOG[k as WeatherType].nameFr}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
