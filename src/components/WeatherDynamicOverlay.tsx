import React from "react";
import { WeatherType, RegionKey, GloranthaCalendar, WeatherSystemState } from "../types";

interface WeatherDynamicOverlayProps {
  weather?: WeatherSystemState;
  calendar?: GloranthaCalendar;
  activeRegion?: RegionKey;
  opacityMultiplier?: number;
  enabled?: boolean;
}

export const WeatherDynamicOverlay: React.FC<WeatherDynamicOverlayProps> = ({
  weather,
  calendar = { year: 1625, seasonIndex: 0, weekNumber: 1, dayIndex: 0 },
  activeRegion = "sartar",
  opacityMultiplier = 0.8,
  enabled = true,
}) => {
  if (!enabled) return null;

  const currentRegion = activeRegion || weather?.selectedRegion || "sartar";
  const regionWeather = weather?.regionWeathers?.[currentRegion];

  let weatherType: WeatherType = "clear_sky";
  if (regionWeather?.weatherType) {
    weatherType = regionWeather.weatherType;
  } else {
    // Season default fallback
    const defaultWeatherTypes: Record<number, WeatherType> = {
      0: "drizzle", // Mer
      1: "clear_sky", // Feu
      2: "gentle_breeze", // Terre
      3: "freezing_chill", // Obscurité
      4: "thunderstorm", // Tempêtes
      5: "mystic_aurora", // Temps Sacré
    };
    weatherType = defaultWeatherTypes[calendar.seasonIndex] || "clear_sky";
  }

  const effectiveOpacity = Math.max(0.1, Math.min(1.0, opacityMultiplier));

  return (
    <div
      id="weather-dynamic-css-overlay-container"
      className="absolute inset-0 w-[1600px] h-[1100px] pointer-events-none z-20 overflow-hidden select-none transition-opacity duration-700"
      style={{ opacity: effectiveOpacity }}
    >
      {/* 1. RAIN & TORRENTIAL RAIN OVERLAY */}
      {(weatherType === "drizzle" || weatherType === "torrential_rain") && (
        <div
          id="css-weather-rain"
          className="absolute inset-0 w-full h-full weather-css-rain-layer"
          style={{
            opacity: weatherType === "torrential_rain" ? 0.9 : 0.55,
            filter: "drop-shadow(0 2px 4px rgba(30, 58, 138, 0.4))",
          }}
        >
          {/* Ambient wet darkness tint */}
          <div
            className="absolute inset-0 bg-blue-950/20 mix-blend-multiply"
            style={{ opacity: weatherType === "torrential_rain" ? 0.35 : 0.15 }}
          />
        </div>
      )}

      {/* 2. SNOW & BLIZZARD OVERLAY */}
      {(weatherType === "freezing_chill" || weatherType === "blizzard") && (
        <div
          id="css-weather-snow"
          className="absolute inset-0 w-full h-full weather-css-snow-layer"
          style={{
            opacity: weatherType === "blizzard" ? 0.95 : 0.65,
          }}
        >
          {/* Frost vignette on borders */}
          <div
            className="absolute inset-0"
            style={{
              boxShadow: "inset 0 0 100px rgba(186, 230, 253, 0.45), inset 0 0 40px rgba(255, 255, 255, 0.3)",
            }}
          />
        </div>
      )}

      {/* 3. SANDSTORM & PRAX DUST OVERLAY */}
      {weatherType === "dust_storm" && (
        <div
          id="css-weather-sandstorm"
          className="absolute inset-0 w-full h-full weather-css-sandstorm-layer"
          style={{
            opacity: 0.85,
          }}
        >
          {/* Warm Amber Desert Haze */}
          <div
            className="absolute inset-0 bg-amber-900/25 mix-blend-color-burn"
            style={{
              boxShadow: "inset 0 0 120px rgba(180, 83, 9, 0.5)",
            }}
          />
        </div>
      )}

      {/* 4. THUNDERSTORM & LIGHTNING OVERLAY */}
      {weatherType === "thunderstorm" && (
        <div id="css-weather-thunderstorm" className="absolute inset-0 w-full h-full">
          {/* Heavy rain layer */}
          <div className="absolute inset-0 weather-css-rain-layer opacity-85" />
          {/* Deep dark storm clouds atmosphere */}
          <div className="absolute inset-0 bg-slate-950/35 mix-blend-multiply" />
          {/* Intermittent Lightning Flash */}
          <div
            className="absolute inset-0 bg-cyan-100/40 mix-blend-screen anim-lightning-pulse"
            style={{ pointerEvents: "none" }}
          />
        </div>
      )}

      {/* 5. THICK FOG OVERLAY */}
      {weatherType === "thick_fog" && (
        <div
          id="css-weather-fog"
          className="absolute inset-0 w-full h-full weather-css-fog-layer"
          style={{ opacity: 0.75 }}
        >
          <div className="absolute inset-0 bg-slate-400/10 backdrop-blur-[1.5px]" />
        </div>
      )}

      {/* 6. HEATWAVE / ARDENT SUN OVERLAY */}
      {weatherType === "heatwave" && (
        <div id="css-weather-heatwave" className="absolute inset-0 w-full h-full anim-heat-shimmer">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 20%, rgba(251, 191, 36, 0.25) 0%, rgba(245, 158, 11, 0.1) 50%, transparent 80%)",
              boxShadow: "inset 0 0 80px rgba(245, 158, 11, 0.25)",
            }}
          />
        </div>
      )}

      {/* 7. MYSTIC AURORA OVERLAY */}
      {weatherType === "mystic_aurora" && (
        <div id="css-weather-aurora" className="absolute inset-0 w-full h-full anim-aurora-glow">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(52, 211, 153, 0.18) 0%, rgba(56, 189, 248, 0.18) 40%, rgba(168, 85, 247, 0.18) 80%, transparent 100%)",
              boxShadow: "inset 0 0 100px rgba(52, 211, 153, 0.25)",
            }}
          />
        </div>
      )}
    </div>
  );
};
