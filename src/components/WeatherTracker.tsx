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
  Dices,
  RefreshCw,
  Compass,
  Eye,
  Crosshair,
  Footprints,
  ShieldAlert,
  Calendar,
  Layers,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  Heart,
  ChevronDown,
} from "lucide-react";
import {
  Campaign,
  RegionKey,
  WeatherType,
  RegionWeatherState,
  HeroCharacter,
} from "../types";
import {
  GLORANTHA_WEATHER_CATALOG,
  REGION_NAMES_FR,
  generateRandomWeather,
  calculateTravelEstimate,
} from "../data/weatherData";
import { GLORANTHA_SEASONS, GLORANTHA_DAYS, GLORANTHA_RUNES } from "../data/gloranthaLore";

interface WeatherTrackerProps {
  campaign: Campaign;
  onUpdateCampaign: (updater: (prev: Campaign) => Campaign) => void;
  isGmMode?: boolean;
}

export const WeatherTracker: React.FC<WeatherTrackerProps> = ({
  campaign,
  onUpdateCampaign,
  isGmMode = true,
}) => {
  const currentSeason = GLORANTHA_SEASONS[campaign.calendar.seasonIndex] || GLORANTHA_SEASONS[0];
  const currentDay = GLORANTHA_DAYS[campaign.calendar.dayIndex] || GLORANTHA_DAYS[0];

  // Current selected region for detailed view
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>(
    campaign.weather?.selectedRegion || "sartar"
  );

  // Weather state for all regions
  const regionWeathers = campaign.weather?.regionWeathers || {};
  const activeWeatherState: RegionWeatherState =
    regionWeathers[selectedRegion] || {
      region: selectedRegion,
      weatherType: campaign.calendar.seasonIndex === 4 ? "thunderstorm" : campaign.calendar.seasonIndex === 3 ? "freezing_chill" : campaign.calendar.seasonIndex === 1 ? "heatwave" : "clear_sky",
      temperature: "tempere",
      wind: "brise",
      precipitation: "aucune",
    };

  const activeWeatherMeta =
    GLORANTHA_WEATHER_CATALOG[activeWeatherState.weatherType] ||
    GLORANTHA_WEATHER_CATALOG.clear_sky;

  // Dice roll simulator state
  const [testType, setTestType] = useState<"archery" | "perception" | "travel" | "magic" | "endurance">("perception");
  const [selectedHeroId, setSelectedHeroId] = useState<string>(
    campaign.heroes[0]?.id || ""
  );
  const [customSkillPercent, setCustomSkillPercent] = useState<number>(65);
  const [diceResult, setDiceResult] = useState<{
    roll: number;
    modifier: number;
    effectiveScore: number;
    outcome: "critical" | "special" | "success" | "failure" | "fumble";
    labelFr: string;
  } | null>(null);

  // Quick travel calculator
  const [travelKm, setTravelKm] = useState<number>(30);
  const [travelMode, setTravelMode] = useState<"foot" | "horse" | "flying">("foot");

  // Helper to render weather icon
  const renderWeatherIcon = (type: WeatherType, sizeClass = "w-6 h-6") => {
    switch (type) {
      case "clear_sky":
        return <Sun className={`${sizeClass} text-amber-400`} />;
      case "gentle_breeze":
        return <Wind className={`${sizeClass} text-sky-400`} />;
      case "heavy_clouds":
        return <Cloud className={`${sizeClass} text-stone-400`} />;
      case "drizzle":
        return <CloudDrizzle className={`${sizeClass} text-teal-400`} />;
      case "torrential_rain":
        return <CloudRain className={`${sizeClass} text-blue-400`} />;
      case "thunderstorm":
        return <Zap className={`${sizeClass} text-amber-300 animate-pulse`} />;
      case "heatwave":
        return <Flame className={`${sizeClass} text-orange-400 animate-pulse`} />;
      case "dust_storm":
        return <Wind className={`${sizeClass} text-amber-500`} />;
      case "thick_fog":
        return <CloudFog className={`${sizeClass} text-indigo-300`} />;
      case "freezing_chill":
        return <Snowflake className={`${sizeClass} text-cyan-300`} />;
      case "blizzard":
        return <CloudSnow className={`${sizeClass} text-sky-200 animate-pulse`} />;
      case "mystic_aurora":
        return <Sparkles className={`${sizeClass} text-purple-400 animate-spin`} />;
      case "ash_and_smoke":
        return <Flame className={`${sizeClass} text-red-500`} />;
      default:
        return <Sun className={`${sizeClass} text-amber-400`} />;
    }
  };

  // Roll weather for current region
  const handleRollRegionWeather = (region: RegionKey) => {
    const rolled = generateRandomWeather(region, campaign.calendar.seasonIndex);
    onUpdateCampaign((prev) => ({
      ...prev,
      weather: {
        selectedRegion,
        isAutoSeasonSync: true,
        regionWeathers: {
          ...(prev.weather?.regionWeathers || {}),
          [region]: rolled,
        },
      },
    }));
  };

  // Roll weather for all regions
  const handleRollAllRegionsWeather = () => {
    const newWeathers: Partial<Record<RegionKey, RegionWeatherState>> = {};
    const regionKeys: RegionKey[] = [
      "sartar",
      "tarsh",
      "prax",
      "esrolia",
      "paturages",
      "vallee_betes",
      "dagori_inkarth",
      "pays_heort",
      "comte_soleil",
      "comte_pavis",
    ];

    for (const rk of regionKeys) {
      newWeathers[rk] = generateRandomWeather(rk, campaign.calendar.seasonIndex);
    }

    onUpdateCampaign((prev) => ({
      ...prev,
      weather: {
        selectedRegion,
        isAutoSeasonSync: true,
        regionWeathers: newWeathers,
      },
    }));
  };

  // Set explicit weather
  const handleSetWeatherType = (region: RegionKey, wType: WeatherType) => {
    onUpdateCampaign((prev) => ({
      ...prev,
      weather: {
        selectedRegion,
        isAutoSeasonSync: prev.weather?.isAutoSeasonSync ?? true,
        regionWeathers: {
          ...(prev.weather?.regionWeathers || {}),
          [region]: {
            ...(prev.weather?.regionWeathers?.[region] || activeWeatherState),
            weatherType: wType,
          },
        },
      },
    }));
  };

  // Perform dice test simulation
  const handleSimulateRoll = () => {
    const roll = Math.floor(Math.random() * 100) + 1; // 1-100
    let mod = 0;
    let base = customSkillPercent;

    const hero = campaign.heroes.find((h) => h.id === selectedHeroId);

    if (testType === "archery") {
      mod = activeWeatherMeta.effect.combatRangeModifier;
    } else if (testType === "perception") {
      mod = activeWeatherMeta.effect.perceptionModifier;
    } else if (testType === "magic") {
      // Check air or fire rune bonuses
      const bestBonus = activeWeatherMeta.effect.magicRunesBonus?.[0]?.bonus || 0;
      mod = bestBonus;
    } else if (testType === "endurance" || testType === "travel") {
      mod = activeWeatherMeta.effect.fatigueRisk ? -15 : 0;
    }

    const effectiveScore = Math.max(5, Math.min(95, base + mod));

    let outcome: "critical" | "special" | "success" | "failure" | "fumble" = "failure";
    let labelFr = "Échec";

    const specialThreshold = Math.round(effectiveScore / 5);
    const criticalThreshold = Math.max(1, Math.round(effectiveScore / 20));

    if (roll <= criticalThreshold || roll === 1) {
      outcome = "critical";
      labelFr = "Succès Critique Divin (01-05%) !";
    } else if (roll <= specialThreshold) {
      outcome = "special";
      labelFr = "Réussite Majeure / Spéciale";
    } else if (roll <= effectiveScore) {
      outcome = "success";
      labelFr = "Succès Normal";
    } else if (roll >= 96 || (roll === 100 && effectiveScore < 100)) {
      outcome = "fumble";
      labelFr = "Maladresse / Malédiction Chaotique (96-100) !";
    } else {
      outcome = "failure";
      labelFr = "Échec du Jet";
    }

    setDiceResult({
      roll,
      modifier: mod,
      effectiveScore,
      outcome,
      labelFr,
    });
  };

  const travelEstimate = calculateTravelEstimate(travelKm, activeWeatherState, travelMode);

  return (
    <div className="space-y-6" id="weather-tracker-root">
      {/* Header Banner: Current Season & Region Overview */}
      <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-stone-900/90 via-stone-950 to-stone-900 p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400/90 mb-1">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>
                {currentSeason.nameFr} ({currentSeason.nameEn}) • {currentDay} • An {campaign.calendar.year} ST
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-amber-100 flex items-center gap-3">
              <span>Météo de Glorantha :</span>
              <span className="text-amber-300 underline decoration-amber-500/40">
                {REGION_NAMES_FR[selectedRegion]}
              </span>
            </h2>
            <p className="text-xs md:text-sm text-stone-300 mt-1 max-w-2xl">
              {currentSeason.description}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleRollRegionWeather(selectedRegion)}
              className="px-3.5 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-medium flex items-center gap-2 transition-all shadow hover:shadow-amber-500/20"
              title="Lancer les dés météorologiques pour cette région"
            >
              <Dices className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span>🎲 Déterminer Météo</span>
            </button>

            <button
              onClick={handleRollAllRegionsWeather}
              className="px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-300 text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Générer la météo pour toutes les régions de la Passe"
            >
              <RefreshCw className="w-3.5 h-3.5 text-stone-400" />
              <span>Toute la Passe</span>
            </button>
          </div>
        </div>

        {/* Region Selector Pills */}
        <div className="mt-4 pt-3 border-t border-stone-800 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {(
            [
              "sartar",
              "prax",
              "tarsh",
              "esrolia",
              "paturages",
              "vallee_betes",
              "dagori_inkarth",
              "pays_heort",
              "comte_soleil",
              "comte_pavis",
            ] as RegionKey[]
          ).map((rk) => {
            const isSel = selectedRegion === rk;
            const rWeather = regionWeathers[rk];
            const rMeta = rWeather ? GLORANTHA_WEATHER_CATALOG[rWeather.weatherType] : null;

            return (
              <button
                key={rk}
                onClick={() => {
                  setSelectedRegion(rk);
                  if (!regionWeathers[rk]) {
                    handleRollRegionWeather(rk);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all flex items-center gap-1.5 font-medium ${
                  isSel
                    ? "bg-amber-500 text-stone-950 font-semibold shadow-md shadow-amber-500/30 scale-105"
                    : "bg-stone-800/80 hover:bg-stone-700/80 text-stone-300 border border-stone-700/50"
                }`}
              >
                {rMeta && renderWeatherIcon(rMeta.type, "w-3.5 h-3.5")}
                <span>{rk === "sartar" ? "Sartar" : rk === "prax" ? "Prax" : rk === "tarsh" ? "Tarsh" : rk === "esrolia" ? "Esrolia" : rk === "dagori_inkarth" ? "Dâgori Inkarth" : rk === "paturages" ? "Pâturages" : rk === "vallee_betes" ? "Vallée Bêtes" : rk === "pays_heort" ? "Héortland" : rk === "comte_soleil" ? "Dôme Soleil" : "Pavis"}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Weather Details & Mechanical Effects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Active Weather Card */}
        <div className="lg:col-span-1 rounded-xl border border-stone-800 bg-stone-900/90 p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-700/60 shadow-inner">
                  {renderWeatherIcon(activeWeatherState.weatherType, "w-8 h-8")}
                </div>
                <div>
                  <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full border font-medium mb-1 ${activeWeatherMeta.badgeColor}`}>
                    Rune de l'{activeWeatherMeta.associatedRune}
                  </span>
                  <h3 className="text-base font-serif font-bold text-amber-100">
                    {activeWeatherMeta.nameFr}
                  </h3>
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-300 italic mt-3 bg-stone-950/50 p-3 rounded-lg border border-stone-800/80 leading-relaxed">
              « {activeWeatherMeta.loreDescriptionFr} »
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="p-2 rounded bg-stone-950 border border-stone-800">
                <div className="text-[10px] uppercase tracking-wider text-stone-400">Température</div>
                <div className="text-xs font-bold text-amber-300 capitalize mt-0.5">
                  {activeWeatherState.temperature}
                </div>
              </div>
              <div className="p-2 rounded bg-stone-950 border border-stone-800">
                <div className="text-[10px] uppercase tracking-wider text-stone-400">Vents</div>
                <div className="text-xs font-bold text-sky-300 capitalize mt-0.5">
                  {activeWeatherState.wind.replace("_", " ")}
                </div>
              </div>
              <div className="p-2 rounded bg-stone-950 border border-stone-800">
                <div className="text-[10px] uppercase tracking-wider text-stone-400">Précipitations</div>
                <div className="text-xs font-bold text-teal-300 capitalize mt-0.5">
                  {activeWeatherState.precipitation.replace("_", " ")}
                </div>
              </div>
            </div>
          </div>

          {/* Manual Change Dropdown */}
          <div className="pt-3 border-t border-stone-800">
            <label className="text-[11px] uppercase tracking-wider text-stone-400 block mb-1.5">
              Modifier manuellement la météo :
            </label>
            <select
              value={activeWeatherState.weatherType}
              onChange={(e) => handleSetWeatherType(selectedRegion, e.target.value as WeatherType)}
              className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
            >
              {Object.values(GLORANTHA_WEATHER_CATALOG).map((wm) => (
                <option key={wm.type} value={wm.type}>
                  {wm.nameFr} ({wm.associatedRune})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Column 2: Concrete In-Game Effects (RPG Mechanics) */}
        <div className="lg:col-span-2 rounded-xl border border-stone-800 bg-stone-900/90 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-base font-serif font-bold text-amber-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Effets sur les Déplacements & Jets de Dés des Joueurs</span>
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Règles RuneQuest
            </span>
          </div>

          {/* Table of Mechanical Modifiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Travel speed modifier */}
            <div className="p-3.5 rounded-lg bg-stone-950/70 border border-stone-800 hover:border-amber-500/30 transition-all flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                <Footprints className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-stone-200 flex items-center justify-between">
                  <span>Vitesse de Déplacement</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    activeWeatherMeta.effect.travelSpeedMultiplier < 1
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : activeWeatherMeta.effect.travelSpeedMultiplier > 1
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-stone-800 text-stone-300"
                  }`}>
                    {activeWeatherMeta.effect.travelSpeedLabelFr}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  À pied : {Math.round(25 * activeWeatherMeta.effect.travelSpeedMultiplier)} km/jour • À cheval : {Math.round(50 * activeWeatherMeta.effect.travelSpeedMultiplier)} km/jour
                </p>
              </div>
            </div>

            {/* Missile & Archery */}
            <div className="p-3.5 rounded-lg bg-stone-950/70 border border-stone-800 hover:border-amber-500/30 transition-all flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 mt-0.5">
                <Crosshair className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-stone-200 flex items-center justify-between">
                  <span>Combat à Distance (Arcs / Javelots)</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    activeWeatherMeta.effect.combatRangeModifier < 0
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {activeWeatherMeta.effect.combatRangeModifier === 0
                      ? "Normal (±0%)"
                      : `${activeWeatherMeta.effect.combatRangeModifier}%`}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  Vents et précipitations impactent la trajectoire des traits et la tension des cordes d'arc.
                </p>
              </div>
            </div>

            {/* Perception (Listen & Scan) */}
            <div className="p-3.5 rounded-lg bg-stone-950/70 border border-stone-800 hover:border-amber-500/30 transition-all flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
                <Eye className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-stone-200 flex items-center justify-between">
                  <span>Perception & Vigie (Vue / Écoute)</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    activeWeatherMeta.effect.perceptionModifier < 0
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {activeWeatherMeta.effect.perceptionModifier === 0
                      ? "Normal (±0%)"
                      : `${activeWeatherMeta.effect.perceptionModifier}%`}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  Visibilité réduite par les brumes, la poussière ou les trombes d'eau.
                </p>
              </div>
            </div>

            {/* Magic & Runes Exaltation */}
            <div className="p-3.5 rounded-lg bg-stone-950/70 border border-stone-800 hover:border-amber-500/30 transition-all flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-stone-200 flex items-center justify-between">
                  <span>Résonance Runique & Magie</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {activeWeatherMeta.effect.magicRunesBonus && activeWeatherMeta.effect.magicRunesBonus.length > 0
                      ? activeWeatherMeta.effect.magicRunesBonus
                          .map((b) => `+${b.bonus}% ${b.rune}`)
                          .join(", ")
                      : "Standard"}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  Les éléments déchaînés amplifient les affinités runiques des lanceurs de sorts.
                </p>
              </div>
            </div>
          </div>

          {/* GM Mechanics Detail Callout */}
          <div className="p-3 bg-stone-950/90 rounded-lg border border-amber-500/20 text-xs text-stone-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-200">Notes pour le Maître de Jeu :</strong>{" "}
              {activeWeatherMeta.effect.mechanicalNotesFr}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tools: Travel Calculator & Dice Roller */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive RPG Dice Roller with Weather Modifier */}
        <div className="rounded-xl border border-stone-800 bg-stone-900/90 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-base font-serif font-bold text-amber-200 flex items-center gap-2">
              <Dices className="w-4 h-4 text-amber-400" />
              <span>Simulateur de Jet de Dés avec Météo</span>
            </h3>
            <span className="text-xs text-stone-400">D100 RuneQuest</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-stone-400 block mb-1">
                Aventurier / PJ
              </label>
              <select
                value={selectedHeroId}
                onChange={(e) => setSelectedHeroId(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-200"
              >
                {campaign.heroes.length > 0 ? (
                  campaign.heroes.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.cult})
                    </option>
                  ))
                ) : (
                  <option value="">Aventurier par défaut</option>
                )}
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-stone-400 block mb-1">
                Type de Test
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as any)}
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-200"
              >
                <option value="perception">Perception (Vue / Écoute)</option>
                <option value="archery">Combat à Distance (Arc / Javelot)</option>
                <option value="travel">Survie / Marche / Équitation</option>
                <option value="magic">Incantation Runique</option>
                <option value="endurance">Constitution vs Froid/Chaleur</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 bg-stone-950 p-3 rounded-lg border border-stone-800">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-stone-300">Score de base PJ :</span>
                <span className="font-bold text-amber-300">{customSkillPercent}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={customSkillPercent}
                onChange={(e) => setCustomSkillPercent(Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
              />
            </div>

            <button
              onClick={handleSimulateRoll}
              className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md hover:scale-105"
            >
              <Dices className="w-4 h-4" />
              <span>Lancer 1D100</span>
            </button>
          </div>

          {/* Dice Result Display */}
          {diceResult && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                diceResult.outcome === "critical"
                  ? "bg-amber-500/20 border-amber-400 text-amber-200"
                  : diceResult.outcome === "special" || diceResult.outcome === "success"
                  ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-200"
                  : diceResult.outcome === "fumble"
                  ? "bg-red-950/80 border-red-500 text-red-200 animate-pulse"
                  : "bg-stone-950 border-stone-700 text-stone-300"
              }`}
            >
              <div>
                <div className="text-xs uppercase font-bold tracking-wider opacity-80">
                  Résultat du Dé
                </div>
                <div className="text-2xl font-serif font-black">
                  {diceResult.roll} <span className="text-sm font-normal opacity-70">/ {diceResult.effectiveScore}% effectif</span>
                </div>
                <div className="text-xs font-semibold mt-0.5">{diceResult.labelFr}</div>
              </div>

              <div className="text-right text-xs opacity-90">
                <div>Score de base : {customSkillPercent}%</div>
                <div>Modificateur Météo : {diceResult.modifier > 0 ? `+${diceResult.modifier}%` : `${diceResult.modifier}%`}</div>
              </div>
            </div>
          )}
        </div>

        {/* Travel Time & Fatigue Calculator */}
        <div className="rounded-xl border border-stone-800 bg-stone-900/90 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-base font-serif font-bold text-amber-200 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Calculateur de Voyage & Itinéraire</span>
            </h3>
            <span className="text-xs text-stone-400">Temps ajusté</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-stone-400 block mb-1">
                Distance du trajet (km)
              </label>
              <input
                type="number"
                min="5"
                max="500"
                step="5"
                value={travelKm}
                onChange={(e) => setTravelKm(Math.max(1, Number(e.target.value)))}
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-200"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-stone-400 block mb-1">
                Mode de déplacement
              </label>
              <select
                value={travelMode}
                onChange={(e) => setTravelMode(e.target.value as any)}
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-200"
              >
                <option value="foot">À pied (25 km/j base)</option>
                <option value="horse">À cheval / monture (50 km/j)</option>
                <option value="flying">En vol magique (sort/hippogriffe)</option>
              </select>
            </div>
          </div>

          {/* Travel Result Summary Box */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-300">Durée estimée :</span>
              <span className="text-sm font-serif font-bold text-amber-300">
                {travelEstimate.totalDays} jour(s) de voyage
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>Cadence effective :</span>
              <span className="text-stone-200 font-semibold">{travelEstimate.adjustedKmPerDay} km / jour</span>
            </div>

            {travelEstimate.notes.length > 0 && (
              <div className="pt-2 border-t border-stone-800/80 space-y-1">
                {travelEstimate.notes.map((note, idx) => (
                  <div key={idx} className="text-[11px] text-amber-400/90 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
