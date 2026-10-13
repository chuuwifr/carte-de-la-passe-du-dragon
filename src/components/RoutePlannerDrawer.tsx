import React, { useState } from "react";
import {
  RouteCalculationResult,
  TravelMode,
  TRAVEL_MODES,
  TravelCategory,
  TERRAIN_CONFIGS,
  DRAGON_PASS_ROUTE_NODES,
  RouteNode,
} from "../data/routeNetwork";
import {
  Navigation,
  Footprints,
  Compass,
  Package,
  Wind,
  Zap,
  Ship,
  Anchor,
  ArrowRightLeft,
  ShieldAlert,
  CloudSun,
  MapPin,
  CheckCircle2,
  X,
  PlusCircle,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  Layers,
  Activity,
  Info,
  Users,
  Tent,
  Droplet,
  Utensils,
  ChevronRight,
  Clock,
  Milestone,
} from "lucide-react";
import { Campaign, PointOfInterest, Quest } from "../types";

interface RoutePlannerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  startPoint: { x: number; y: number; name: string; id?: string } | null;
  targetPoint: { x: number; y: number; name: string; id?: string } | null;
  onSelectStart: (point: { x: number; y: number; name: string; id?: string } | null) => void;
  onSelectTarget: (point: { x: number; y: number; name: string; id?: string } | null) => void;
  travelMode: TravelMode;
  onChangeTravelMode: (mode: TravelMode) => void;
  avoidChaos: boolean;
  onToggleAvoidChaos: (avoid: boolean) => void;
  showObstaclesOnMap: boolean;
  onToggleShowObstacles: (show: boolean) => void;
  showRoadsOnMap: boolean;
  onToggleShowRoads: (show: boolean) => void;
  routeResult: RouteCalculationResult | null;
  locations: PointOfInterest[];
  campaign?: Campaign;
  onUpdateCampaign?: (updater: (prev: Campaign) => Campaign) => void;
  onCenterOnRoute?: () => void;
}

export const RoutePlannerDrawer: React.FC<RoutePlannerDrawerProps> = ({
  isOpen,
  onClose,
  startPoint,
  targetPoint,
  onSelectStart,
  onSelectTarget,
  travelMode,
  onChangeTravelMode,
  avoidChaos,
  onToggleAvoidChaos,
  showObstaclesOnMap,
  onToggleShowObstacles,
  showRoadsOnMap,
  onToggleShowRoads,
  routeResult,
  locations,
  campaign,
  onUpdateCampaign,
  onCenterOnRoute,
}) => {
  const [activeTab, setActiveTab] = useState<"calculator" | "terrain" | "compare" | "logistics">("calculator");
  const [selectedCategory, setSelectedCategory] = useState<TravelCategory | "all">("all");
  const [partySize, setPartySize] = useState<number>(4);
  const [logAddedToast, setLogAddedToast] = useState(false);

  if (!isOpen) return null;

  const handleSwap = () => {
    const temp = startPoint;
    onSelectStart(targetPoint);
    onSelectTarget(temp);
  };

  const handleClear = () => {
    onSelectStart(null);
    onSelectTarget(null);
  };

  const handleAddItineraryToCampaignLog = () => {
    if (!routeResult || !onUpdateCampaign || !campaign) return;

    const logEntryTitle = `Itinéraire : ${startPoint?.name || "Départ"} → ${targetPoint?.name || "Arrivée"}`;
    const terrainSummary = routeResult.terrainBreakdowns
      .map((t) => `${t.terrainNameFr}: ${t.distanceKm} km (${t.percentage}%)`)
      .join(", ");

    const logDetails = `Distance : ${routeResult.totalDistanceKm} km (${routeResult.totalStades} stades, ${routeResult.totalLeagues} lieues) • Durée estimée : ${routeResult.travelDays} jours (${routeResult.travelHours}h) en mode ${TRAVEL_MODES[travelMode].nameFr}.\nTerrains traversés : ${terrainSummary}\nDanger : ${routeResult.dangerSummaryFr}\nMétéo : ${routeResult.weatherSummaryFr}\nLogistique (${partySize} pers.) : ${routeResult.logistics.rationsNeededPerPerson * partySize} rations, ${routeResult.logistics.waterLitersPerPerson * partySize}L d'eau, ${routeResult.logistics.campNights} nuits de bivouac.\nÉtapes :\n${routeResult.stepDetails.map((s, i) => `${i + 1}. ${s.fromName} → ${s.toName} (${s.distanceKm} km, ${s.terrainNameFr}, ${s.stepHours}h)`).join("\n")}`;

    onUpdateCampaign((prev) => {
      const existingQuests = prev.quests || [];
      const newQuest: Quest = {
        id: `route-quest-${Date.now()}`,
        title: logEntryTitle,
        act: "Voyage & Expédition",
        region: "sartar",
        status: "active",
        description: logDetails,
        objectives: routeResult.stepDetails.map((s, idx) => ({
          id: `obj-${idx}`,
          text: `Étape ${idx + 1} : De ${s.fromName} à ${s.toName} (${s.distanceKm} km en ${s.terrainNameFr})`,
          done: false,
        })),
        rewards: "Découverte de route et cartographie de la région",
      };

      const existingChronicles = prev.chronicles || [];
      const newChronicle = {
        id: `route-chronicle-${Date.now()}`,
        date: new Date().toLocaleDateString("fr-FR"),
        gloranthaDate: `An ${prev.calendar?.year || 1625} ST`,
        title: logEntryTitle,
        text: logDetails,
      };

      return {
        ...prev,
        quests: [newQuest, ...existingQuests],
        chronicles: [newChronicle, ...existingChronicles],
        lastSaved: new Date().toISOString(),
      };
    });

    setLogAddedToast(true);
    setTimeout(() => setLogAddedToast(false), 3500);
  };

  const travelModeIcons: Record<TravelMode, React.ReactNode> = {
    foot_normal: <Footprints className="w-4 h-4 text-emerald-400" />,
    foot_scout: <Zap className="w-4 h-4 text-amber-400" />,
    horse: <Compass className="w-4 h-4 text-sky-400" />,
    prax_mount: <Compass className="w-4 h-4 text-orange-400" />,
    wagon: <Package className="w-4 h-4 text-amber-300" />,
    boat_river: <Ship className="w-4 h-4 text-cyan-400" />,
    boat_sea: <Anchor className="w-4 h-4 text-blue-400" />,
    flight: <Wind className="w-4 h-4 text-purple-400" />,
  };

  // Grouped location list for select
  const majorCities = DRAGON_PASS_ROUTE_NODES.filter((n) => n.isCityOrTown);
  const riverPorts = DRAGON_PASS_ROUTE_NODES.filter((n) => n.isPortOrFord);

  const availableModes = Object.values(TRAVEL_MODES).filter((m) =>
    selectedCategory === "all" ? true : m.category === selectedCategory
  );

  return (
    <div
      id="route-planner-drawer"
      className="absolute top-16 right-3 w-88 sm:w-105 max-h-[calc(100vh-5rem)] z-40 bg-[#16161a]/95 border border-amber-500/50 rounded-2xl shadow-2xl backdrop-blur-xl text-[#d1d1d6] flex flex-col overflow-hidden animate-fade-in font-sans"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d2d35] bg-[#121215]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-amber-200 text-sm flex items-center gap-1.5">
              Planificateur d'Itinéraire
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-normal">
                Passe du Dragon
              </span>
            </h3>
            <p className="text-[10px] text-[#8e8e93]">
              Distances en km, temps de trajet & impact des terrains
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {(startPoint || targetPoint) && (
            <button
              onClick={handleClear}
              className="p-1.5 text-[#8e8e93] hover:text-amber-300 hover:bg-[#25252b] rounded-lg transition text-xs"
              title="Effacer le départ et l'arrivée"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-[#8e8e93] hover:text-white hover:bg-[#25252b] rounded-lg transition"
            title="Fermer le planificateur"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center px-2 pt-2 bg-[#141418] border-b border-[#2d2d35] gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("calculator")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition border-t border-x ${
            activeTab === "calculator"
              ? "bg-[#1e1e24] text-amber-300 border-amber-500/50 border-b-transparent shadow"
              : "text-[#8e8e93] hover:text-[#d1d1d6] border-transparent"
          }`}
        >
          <Milestone className="w-3.5 h-3.5 text-amber-400" />
          <span>Trajet & Calculs</span>
        </button>

        <button
          onClick={() => setActiveTab("terrain")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition border-t border-x ${
            activeTab === "terrain"
              ? "bg-[#1e1e24] text-amber-300 border-amber-500/50 border-b-transparent shadow"
              : "text-[#8e8e93] hover:text-[#d1d1d6] border-transparent"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Terrains & Étapes</span>
          {routeResult && (
            <span className="text-[10px] px-1 rounded bg-[#2a2a35] text-amber-300 font-mono">
              {routeResult.stepDetails.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("compare")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition border-t border-x ${
            activeTab === "compare"
              ? "bg-[#1e1e24] text-amber-300 border-amber-500/50 border-b-transparent shadow"
              : "text-[#8e8e93] hover:text-[#d1d1d6] border-transparent"
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-purple-400" />
          <span>Comparatif</span>
        </button>

        <button
          onClick={() => setActiveTab("logistics")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition border-t border-x ${
            activeTab === "logistics"
              ? "bg-[#1e1e24] text-amber-300 border-amber-500/50 border-b-transparent shadow"
              : "text-[#8e8e93] hover:text-[#d1d1d6] border-transparent"
          }`}
        >
          <Utensils className="w-3.5 h-3.5 text-emerald-400" />
          <span>Logistique</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-3.5 overflow-y-auto space-y-3.5 text-xs">
        {/* ============================================================ */}
        {/* TAB 1: CALCULATOR & ROUTE OVERVIEW                           */}
        {/* ============================================================ */}
        {activeTab === "calculator" && (
          <div className="space-y-3.5">
            {/* Start & Destination Selection Box */}
            <div className="bg-[#1e1e24] p-3 rounded-xl border border-[#2d2d35] space-y-2.5 shadow-inner">
              {/* Start Point */}
              <div>
                <label className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Point de Départ (A)
                </label>
                <select
                  value={startPoint?.id || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      onSelectStart(null);
                      return;
                    }
                    const loc = locations.find((l) => l.id === val);
                    if (loc) {
                      onSelectStart({ x: loc.coords.x, y: loc.coords.y, name: loc.nameFr, id: loc.id });
                      return;
                    }
                    const node = DRAGON_PASS_ROUTE_NODES.find((n) => n.id === val);
                    if (node) {
                      onSelectStart({ x: node.coords.x, y: node.coords.y, name: node.nameFr, id: node.id });
                    }
                  }}
                  className="w-full bg-[#121215] border border-[#3a3a45] rounded-lg px-2.5 py-1.5 text-xs text-[#f1f1f5] outline-none focus:border-emerald-400 transition"
                >
                  <option value="">-- Cliquer sur la carte ou choisir un lieu --</option>
                  <optgroup label="Cités & Métropoles Majeures">
                    {majorCities.map((node) => (
                      <option key={`start-${node.id}`} value={node.id}>
                        {node.nameFr}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Ports Fluviaux, Maritimes & Gués">
                    {riverPorts.map((node) => (
                      <option key={`start-port-${node.id}`} value={node.id}>
                        ⛵ {node.nameFr}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Tous les Lieux & Sanctuaires">
                    {locations.map((loc) => (
                      <option key={`start-poi-${loc.id}`} value={loc.id}>
                        {loc.nameFr} ({loc.category})
                      </option>
                    ))}
                  </optgroup>
                </select>
                {startPoint && (
                  <div className="mt-1 text-[10px] text-emerald-300 font-mono flex items-center justify-between">
                    <span className="truncate">Départ : {startPoint.name}</span>
                    <span className="opacity-70">({startPoint.x.toFixed(1)}%, {startPoint.y.toFixed(1)}%)</span>
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <div className="flex justify-center -my-1">
                <button
                  onClick={handleSwap}
                  disabled={!startPoint || !targetPoint}
                  className="p-1.5 rounded-full bg-[#2a2a35] hover:bg-[#383847] border border-[#3f3f4e] text-amber-300 transition disabled:opacity-30 shadow-md active:scale-95"
                  title="Inverser départ et arrivée"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Target Point */}
              <div>
                <label className="text-[10px] uppercase font-bold text-rose-400 tracking-wider flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  Destination d'Arrivée (B)
                </label>
                <select
                  value={targetPoint?.id || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      onSelectTarget(null);
                      return;
                    }
                    const loc = locations.find((l) => l.id === val);
                    if (loc) {
                      onSelectTarget({ x: loc.coords.x, y: loc.coords.y, name: loc.nameFr, id: loc.id });
                      return;
                    }
                    const node = DRAGON_PASS_ROUTE_NODES.find((n) => n.id === val);
                    if (node) {
                      onSelectTarget({ x: node.coords.x, y: node.coords.y, name: node.nameFr, id: node.id });
                    }
                  }}
                  className="w-full bg-[#121215] border border-[#3a3a45] rounded-lg px-2.5 py-1.5 text-xs text-[#f1f1f5] outline-none focus:border-rose-400 transition"
                >
                  <option value="">-- Cliquer sur la carte ou choisir un lieu --</option>
                  <optgroup label="Cités & Métropoles Majeures">
                    {majorCities.map((node) => (
                      <option key={`target-${node.id}`} value={node.id}>
                        {node.nameFr}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Ports Fluviaux, Maritimes & Gués">
                    {riverPorts.map((node) => (
                      <option key={`target-port-${node.id}`} value={node.id}>
                        ⛵ {node.nameFr}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Tous les Lieux & Sanctuaires">
                    {locations.map((loc) => (
                      <option key={`target-poi-${loc.id}`} value={loc.id}>
                        {loc.nameFr} ({loc.category})
                      </option>
                    ))}
                  </optgroup>
                </select>
                {targetPoint && (
                  <div className="mt-1 text-[10px] text-rose-300 font-mono flex items-center justify-between">
                    <span className="truncate">Arrivée : {targetPoint.name}</span>
                    <span className="opacity-70">({targetPoint.x.toFixed(1)}%, {targetPoint.y.toFixed(1)}%)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Travel Mode Selector by Category (Marche, Cheval, Bateau, Vol) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                  Mode de Déplacement
                </label>
                {/* Category Pills */}
                <div className="flex items-center gap-1 bg-[#121215] p-0.5 rounded-lg border border-[#2d2d35]">
                  {(
                    [
                      { id: "all", label: "Tous" },
                      { id: "marche", label: "🚶 Marche" },
                      { id: "cheval", label: "🐎 Cheval" },
                      { id: "bateau", label: "⛵ Bateau" },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition ${
                        selectedCategory === cat.id
                          ? "bg-amber-500 text-black shadow-xs font-bold"
                          : "text-[#8e8e93] hover:text-white"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode Cards Grid */}
              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-0.5">
                {availableModes.map((mode) => {
                  const isSelected = travelMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => onChangeTravelMode(mode.id)}
                      className={`flex items-start gap-2 p-2 rounded-xl border text-left transition ${
                        isSelected
                          ? "bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)] font-semibold"
                          : "bg-[#1c1c22] border-[#2d2d35] text-[#8e8e93] hover:text-white hover:bg-[#25252d]"
                      }`}
                    >
                      <div className="p-1 rounded-lg bg-black/40 border border-white/5 mt-0.5 flex-shrink-0">
                        {travelModeIcons[mode.id]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold truncate leading-tight text-[#f1f1f5]">
                          {mode.nameFr}
                        </div>
                        <div className="text-[9px] text-amber-300/80 font-mono mt-0.5">
                          {mode.speedKmPerDay} km/jour
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-2 rounded-lg bg-[#141418] border border-[#2d2d35] text-[10px] text-[#a1a1aa] flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{TRAVEL_MODES[travelMode].descriptionFr}</span>
              </div>
            </div>

            {/* Tactical Options (Chaos, Roads, Obstacles) */}
            <div className="bg-[#1c1c22] p-2.5 rounded-xl border border-[#2d2d35] space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[11px] text-[#d1d1d6] flex items-center gap-1.5 font-medium">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  Contourner le Chaos & Marais Maudits
                </span>
                <input
                  type="checkbox"
                  checked={avoidChaos}
                  onChange={(e) => onToggleAvoidChaos(e.target.checked)}
                  className="accent-amber-500 rounded cursor-pointer w-4 h-4"
                />
              </label>

              <div className="flex items-center justify-between pt-2 border-t border-[#2d2d35]">
                <span className="text-[10px] text-[#8e8e93]">Affichage sur la carte :</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleShowRoads(!showRoadsOnMap)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                      showRoadsOnMap
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-[#141418] text-[#8e8e93] border-[#2d2d35]"
                    }`}
                  >
                    Routes {showRoadsOnMap ? "ON" : "OFF"}
                  </button>
                  <button
                    onClick={() => onToggleShowObstacles(!showObstaclesOnMap)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                      showObstaclesOnMap
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : "bg-[#141418] text-[#8e8e93] border-[#2d2d35]"
                    }`}
                  >
                    Obstacles {showObstaclesOnMap ? "ON" : "OFF"}
                  </button>
                </div>
              </div>
            </div>

            {/* Calculated Journey Summary Banner */}
            {routeResult && (
              <div className="bg-gradient-to-br from-[#1c1c24] via-[#231e17] to-[#16161a] p-3.5 rounded-xl border border-amber-500/50 shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#3a3a48]">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                      Bilan du Voyage
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      routeResult.dangerScore >= 4
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : routeResult.dangerScore === 3
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    }`}
                  >
                    Danger : {routeResult.dangerScore}/5
                  </span>
                </div>

                {/* Main KPIs: Distance in KM & Travel Time */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#121215]/80 p-2.5 rounded-xl border border-amber-500/30">
                    <div className="flex items-center gap-1 text-[10px] text-amber-300 font-semibold mb-0.5">
                      <Milestone className="w-3.5 h-3.5 text-amber-400" />
                      Distance Totale
                    </div>
                    <div className="text-xl font-black text-amber-200 font-mono tracking-tight">
                      {routeResult.totalDistanceKm} <span className="text-xs font-normal">km</span>
                    </div>
                    <div className="text-[9px] text-[#8e8e93] font-mono mt-0.5">
                      {routeResult.totalStades} stades • {routeResult.totalLeagues} lieues
                    </div>
                  </div>

                  <div className="bg-[#121215]/80 p-2.5 rounded-xl border border-emerald-500/30">
                    <div className="flex items-center gap-1 text-[10px] text-emerald-300 font-semibold mb-0.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      Temps de Voyage
                    </div>
                    <div className="text-xl font-black text-emerald-300 font-mono tracking-tight">
                      {routeResult.travelDays} <span className="text-xs font-normal">jours</span>
                    </div>
                    <div className="text-[9px] text-[#8e8e93] font-mono mt-0.5">
                      {routeResult.travelHours} heures de marche/trajet
                    </div>
                  </div>
                </div>

                {/* Weather & Terrain Quick Impacts */}
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#121215]/60 border border-[#2d2d35]">
                    <span className="text-[#a1a1aa] flex items-center gap-1.5">
                      <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                      Météo le long du trajet
                    </span>
                    <span className="font-semibold text-amber-300">
                      {Math.round(routeResult.weatherSpeedModifier * 100)}% vitesse
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#121215]/60 border border-[#2d2d35]">
                    <span className="text-[#a1a1aa] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      Terrains principaux
                    </span>
                    <span className="font-semibold text-cyan-300 truncate max-w-[160px]">
                      {routeResult.terrainBreakdowns[0]?.terrainNameFr || "Routes mixtes"}
                    </span>
                  </div>
                </div>

                {/* Action: Add to Log */}
                <button
                  onClick={handleAddItineraryToCampaignLog}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 rounded-xl font-bold transition shadow-md active:scale-98"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Enregistrer dans le Journal de Campagne</span>
                </button>

                {logAddedToast && (
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-center text-xs flex items-center justify-center gap-1.5 animate-fade-in font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Itinéraire enregistré avec succès dans les quêtes et chroniques !
                  </div>
                )}
              </div>
            )}

            {!routeResult && (!startPoint || !targetPoint) && (
              <div className="text-center py-8 text-[#8e8e93] space-y-2 bg-[#1c1c22]/50 p-4 rounded-xl border border-dashed border-[#2d2d35]">
                <Navigation className="w-8 h-8 mx-auto text-amber-400/60 animate-bounce" />
                <p className="font-semibold text-xs text-[#f1f1f5]">
                  Sélectionnez un départ (A) et une destination (B)
                </p>
                <p className="text-[10px] leading-relaxed max-w-xs mx-auto">
                  Cliquez sur deux points de la carte de la Passe du Dragon ou utilisez les menus déroulants ci-dessus pour calculer instantanément la distance en km et la durée selon le mode et le relief.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: TERRAIN BREAKDOWN & ROAD SEGMENT DETAILS              */}
        {/* ============================================================ */}
        {activeTab === "terrain" && (
          <div className="space-y-3.5">
            {routeResult ? (
              <>
                {/* Terrain Distribution Bar */}
                <div className="bg-[#1c1c22] p-3 rounded-xl border border-[#2d2d35] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                      Répartition du Relief & des Voies
                    </span>
                    <span className="text-[10px] text-[#8e8e93] font-mono">
                      {routeResult.totalDistanceKm} km au total
                    </span>
                  </div>

                  {/* Multi-color stacked progress bar */}
                  <div className="h-3.5 w-full bg-[#121215] rounded-full overflow-hidden flex border border-[#2d2d35]">
                    {routeResult.terrainBreakdowns.map((t, idx) => (
                      <div
                        key={`bar-${t.terrainType}-${idx}`}
                        style={{
                          width: `${t.percentage}%`,
                          backgroundColor: t.colorHex,
                        }}
                        className="h-full transition-all hover:opacity-80"
                        title={`${t.terrainNameFr}: ${t.distanceKm} km (${t.percentage}%)`}
                      />
                    ))}
                  </div>

                  {/* Breakdown Legend Cards */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {routeResult.terrainBreakdowns.map((t) => (
                      <div
                        key={`legend-${t.terrainType}`}
                        className={`p-2 rounded-lg border border-white/5 ${t.badgeBg} flex flex-col justify-between`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold ${t.badgeText} truncate`}>
                            {t.terrainNameFr}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-white">
                            {t.percentage}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] opacity-80 font-mono">
                          <span>{t.distanceKm} km</span>
                          <span>Vitesse: {Math.round(t.speedMultiplier * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step-by-Step Waypoint Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#e2ba7d] tracking-wider">
                      Feuille de Route Détaillée ({routeResult.stepDetails.length} tronçons)
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {routeResult.stepDetails.map((step, idx) => {
                      const terrainCfg = TERRAIN_CONFIGS[step.terrainType] || TERRAIN_CONFIGS.dirt_trail;
                      return (
                        <div
                          key={`step-${idx}`}
                          className="p-2.5 rounded-xl bg-[#1c1c22] border border-[#2d2d35] hover:border-amber-500/40 transition space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[9px] flex items-center justify-center border border-amber-500/40">
                                {idx + 1}
                              </span>
                              <div className="font-bold text-xs text-[#f1f1f5]">
                                {step.fromName} → {step.toName}
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-amber-300">
                              {step.distanceKm} km
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/5">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${terrainCfg.badgeBg} ${terrainCfg.badgeText}`}>
                              {step.terrainNameFr}
                            </span>
                            <div className="flex items-center gap-2 font-mono text-[9px] text-[#8e8e93]">
                              <span>⏱️ {step.stepHours}h ({step.stepDays}j)</span>
                              <span
                                className={`px-1 rounded font-bold ${
                                  step.dangerLevel >= 4
                                    ? "bg-rose-950/60 text-rose-300"
                                    : "bg-emerald-950/40 text-emerald-300"
                                }`}
                              >
                                D:{step.dangerLevel}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-[#8e8e93] space-y-2">
                <Layers className="w-8 h-8 mx-auto text-cyan-400/50" />
                <p className="font-semibold text-xs text-[#d1d1d6]">
                  Aucun itinéraire calculé
                </p>
                <p className="text-[10px]">
                  Sélectionnez un départ et une arrivée dans le premier onglet pour analyser les types de terrain traversés.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: TRAVEL MODES COMPARISON TABLE                         */}
        {/* ============================================================ */}
        {activeTab === "compare" && (
          <div className="space-y-3">
            <div className="bg-[#1c1c22] p-3 rounded-xl border border-[#2d2d35]">
              <h4 className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                Comparateur des Modes de Voyage
              </h4>
              <p className="text-[10px] text-[#8e8e93]">
                Temps estimé pour parcourir ce même trajet selon le moyen de locomotion choisi :
              </p>
            </div>

            {routeResult ? (
              <div className="space-y-2">
                {routeResult.modeComparisons.map((cmp) => {
                  const isCurrent = cmp.modeId === travelMode;
                  return (
                    <div
                      key={cmp.modeId}
                      className={`p-3 rounded-xl border transition flex items-center justify-between ${
                        isCurrent
                          ? "bg-amber-500/20 border-amber-400 shadow-md"
                          : "bg-[#1c1c22] border-[#2d2d35] hover:bg-[#25252d]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                          {travelModeIcons[cmp.modeId]}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#f1f1f5] flex items-center gap-1.5">
                            {cmp.modeNameFr}
                            {isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400 text-black font-bold">
                                Actif
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#8e8e93] mt-0.5">
                            {cmp.feasibleDescription}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-sm text-amber-200">
                          {cmp.travelDays} <span className="text-[10px] font-normal">jours</span>
                        </div>
                        <div className="text-[9px] text-[#8e8e93] font-mono">
                          {cmp.travelHours}h totales
                        </div>
                        {!isCurrent && (
                          <button
                            onClick={() => onChangeTravelMode(cmp.modeId)}
                            className="mt-1 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition"
                          >
                            Choisir
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-[#8e8e93] space-y-2">
                <Activity className="w-8 h-8 mx-auto text-purple-400/50" />
                <p className="font-semibold text-xs text-[#d1d1d6]">
                  Calculez d'abord un itinéraire
                </p>
                <p className="text-[10px]">
                  Le comparateur affichera la durée exacte pour la marche, le cheval, le bateau fluvial, le chariot et le vol.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: EXPEDITION LOGISTICS & SUPPLIES                       */}
        {/* ============================================================ */}
        {activeTab === "logistics" && (
          <div className="space-y-3.5">
            {routeResult ? (
              <>
                {/* Party Size Config */}
                <div className="bg-[#1c1c22] p-3 rounded-xl border border-[#2d2d35] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      Taille de la Compagnie
                    </span>
                    <span className="font-mono font-bold text-amber-200 text-sm">
                      {partySize} aventuriers
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={partySize}
                    onChange={(e) => setPartySize(parseInt(e.target.value))}
                    className="w-full accent-emerald-400 h-1.5 bg-[#121215] rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-[#8e8e93] font-mono">
                    <span>1 solo</span>
                    <span>4 groupe standard</span>
                    <span>8 caravane</span>
                    <span>12 expédition</span>
                  </div>
                </div>

                {/* Supplies Needed Breakdown */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Food Rations */}
                  <div className="p-2.5 rounded-xl bg-[#1c1c22] border border-[#2d2d35] text-center">
                    <Utensils className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                    <span className="text-[10px] text-[#8e8e93] block">Rations</span>
                    <span className="text-base font-black text-amber-200 font-mono">
                      {routeResult.logistics.rationsNeededPerPerson * partySize}
                    </span>
                    <span className="text-[8px] text-[#8e8e93] block mt-0.5">
                      ({routeResult.logistics.rationsNeededPerPerson}/pers)
                    </span>
                  </div>

                  {/* Water Needed */}
                  <div className="p-2.5 rounded-xl bg-[#1c1c22] border border-[#2d2d35] text-center">
                    <Droplet className="w-4 h-4 mx-auto text-cyan-400 mb-1" />
                    <span className="text-[10px] text-[#8e8e93] block">Eau potable</span>
                    <span className="text-base font-black text-cyan-200 font-mono">
                      {routeResult.logistics.waterLitersPerPerson * partySize} <span className="text-[9px]">L</span>
                    </span>
                    <span className="text-[8px] text-[#8e8e93] block mt-0.5">
                      ({routeResult.logistics.waterLitersPerPerson}L/pers)
                    </span>
                  </div>

                  {/* Bivouac Camps */}
                  <div className="p-2.5 rounded-xl bg-[#1c1c22] border border-[#2d2d35] text-center">
                    <Tent className="w-4 h-4 mx-auto text-purple-400 mb-1" />
                    <span className="text-[10px] text-[#8e8e93] block">Bivouacs</span>
                    <span className="text-base font-black text-purple-200 font-mono">
                      {routeResult.logistics.campNights}
                    </span>
                    <span className="text-[8px] text-[#8e8e93] block mt-0.5">nuits à camper</span>
                  </div>
                </div>

                {/* Advice Card */}
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-1">
                  <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-400" />
                    Conseil d'Intendance Gloranthien
                  </div>
                  <p className="text-[10px] text-[#d4b998] leading-relaxed">
                    {routeResult.logistics.recommendationFr}
                  </p>
                </div>

                {/* Action Save Button */}
                <button
                  onClick={handleAddItineraryToCampaignLog}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 rounded-xl font-bold transition shadow-md active:scale-98"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Enregistrer dans le Journal de Campagne</span>
                </button>
              </>
            ) : (
              <div className="text-center py-8 text-[#8e8e93] space-y-2">
                <Utensils className="w-8 h-8 mx-auto text-emerald-400/50" />
                <p className="font-semibold text-xs text-[#d1d1d6]">
                  Calculez d'abord un itinéraire
                </p>
                <p className="text-[10px]">
                  Les besoins en rations de voyage, litres d'eau et nuits de campement s'adapteront automatiquement à la durée et aux terrains traversés.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
