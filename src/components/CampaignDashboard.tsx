import React, { useState } from "react";
import {
  Users,
  Swords,
  Clock,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Shield,
  Heart,
  Zap,
  Star,
  Award,
  FileText,
  MapPin,
  ChevronRight,
  Flame,
  Loader2,
  CloudSun,
  Footprints,
} from "lucide-react";
import { Campaign, HeroCharacter, Quest, ThreatClock, PointOfInterest } from "../types";
import { getProceduralGloranthaLore } from "../utils/loreGenerator";
import { GLORANTHA_SEASONS, GLORANTHA_DAYS, GLORANTHA_RUNES } from "../data/gloranthaLore";
import { WeatherTracker } from "./WeatherTracker";
import { GLORANTHA_WEATHER_CATALOG, generateRandomWeather } from "../data/weatherData";

interface CampaignDashboardProps {
  campaign: Campaign;
  onUpdateCampaign: (updater: (prev: Campaign) => Campaign) => void;
  locations: PointOfInterest[];
  onSelectLocationById: (poiId: string) => void;
  isGmMode: boolean;
}

export const CampaignDashboard: React.FC<CampaignDashboardProps> = ({
  campaign,
  onUpdateCampaign,
  locations,
  onSelectLocationById,
  isGmMode,
}) => {
  const [activeTab, setActiveTab] = useState<"quests" | "party" | "weather" | "chronicles">("quests");

  // New Hero Modal
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [newHeroName, setNewHeroName] = useState("");
  const [newHeroPlayer, setNewHeroPlayer] = useState("");
  const [newHeroTribu, setNewHeroTribu] = useState("Tribu Colymar");
  const [newHeroCult, setNewHeroCult] = useState("Orlanth l'Aventurier");
  const [newHeroRune1, setNewHeroRune1] = useState("air");
  const [newHeroRune1Val, setNewHeroRune1Val] = useState(80);
  const [newHeroPassion, setNewHeroPassion] = useState("Loyauté (Clan)");
  const [newHeroPassionVal, setNewHeroPassionVal] = useState(75);

  // New Quest Modal
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState("");
  const [newQuestAct, setNewQuestAct] = useState("Acte I : Les Vents Nouveaux");
  const [newQuestRegion, setNewQuestRegion] = useState("sartar");
  const [newQuestDesc, setNewQuestDesc] = useState("");
  const [newQuestObj1, setNewQuestObj1] = useState("");
  const [newQuestObj2, setNewQuestObj2] = useState("");
  const [newQuestReward, setNewQuestReward] = useState("");

  // AI Quest Generator
  const [aiQuestLoading, setAiQuestLoading] = useState(false);
  const [aiQuestPrompt, setAiQuestPrompt] = useState("");
  const [aiQuestError, setAiQuestError] = useState<string | null>(null);

  // New Chronicle
  const [showChronicleModal, setShowChronicleModal] = useState(false);
  const [chronicleTitle, setChronicleTitle] = useState("");
  const [chronicleText, setChronicleText] = useState("");

  const currentSeason = GLORANTHA_SEASONS[campaign.calendar.seasonIndex] || GLORANTHA_SEASONS[0];
  const currentDay = GLORANTHA_DAYS[campaign.calendar.dayIndex] || GLORANTHA_DAYS[0];

  // Calendar step forward
  const handleNextDay = () => {
    onUpdateCampaign((prev) => {
      let nextDay = prev.calendar.dayIndex + 1;
      let nextWeek = prev.calendar.weekNumber;
      let nextSeason = prev.calendar.seasonIndex;
      let nextYear = prev.calendar.year;

      if (nextDay >= 7) {
        nextDay = 0;
        nextWeek += 1;
      }

      const maxWeeks = nextSeason === 5 ? 2 : 8; // Sacred time is 2 weeks
      if (nextWeek > maxWeeks) {
        nextWeek = 1;
        nextSeason += 1;
      }

      if (nextSeason >= 6) {
        nextSeason = 0;
        nextYear += 1;
      }

      return {
        ...prev,
        calendar: {
          year: nextYear,
          seasonIndex: nextSeason,
          weekNumber: nextWeek,
          dayIndex: nextDay,
        },
      };
    });
  };

  // Toggle Quest objective
  const handleToggleObjective = (questId: string, objId: string) => {
    onUpdateCampaign((prev) => ({
      ...prev,
      quests: prev.quests.map((q) => {
        if (q.id !== questId) return q;
        const updatedObjs = q.objectives.map((o) =>
          o.id === objId ? { ...o, done: !o.done } : o
        );
        const allDone = updatedObjs.every((o) => o.done);
        return {
          ...q,
          objectives: updatedObjs,
          status: allDone ? "completed" : "active",
        };
      }),
    }));
  };

  // Advance Threat Clock
  const handleClockStep = (clockId: string, delta: number) => {
    onUpdateCampaign((prev) => ({
      ...prev,
      threatClocks: prev.threatClocks.map((c) => {
        if (c.id !== clockId) return c;
        const newVal = Math.max(0, Math.min(c.max, c.current + delta));
        return { ...c, current: newVal };
      }),
    }));
  };

  // Generate AI Quest Hook
  const handleGenerateAiQuest = async () => {
    setAiQuestLoading(true);
    setAiQuestError(null);
    let questText = "";
    try {
      const res = await fetch("/api/gemini/generate-lore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "scenario-hook",
          context: `Campagne: ${campaign.title}. Année: ${campaign.calendar.year} ST, Saison: ${currentSeason.nameFr}. Groupe: ${campaign.heroes
            .map((h) => `${h.name} (${h.cult})`)
            .join(", ")}.`,
          prompt:
            aiQuestPrompt ||
            "Conçois un scénario d'investigation et d'aventure pour le groupe dans la région de Sartar impliquant un conflit de clan ou une relique perdue.",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          questText = data.text;
        }
      }
    } catch (err: any) {
      // Fallback silently if offline or on static host
    }

    if (!questText) {
      questText = getProceduralGloranthaLore(
        "scenario-hook",
        campaign.title,
        aiQuestPrompt || "Conflit de clan ou relique perdue"
      );
    }

    // Create quest from generated text
    const newQ: Quest = {
      id: `q-ai-${Date.now()}`,
      title: `Mission : ${aiQuestPrompt ? aiQuestPrompt.slice(0, 30) : "Les Échos du Réveil"}`,
      act: "Acte En Cours",
      region: "sartar",
      status: "active",
      description: questText,
      objectives: [
        { id: "o-1", text: "Recueillir des indices auprès des témoins", done: false },
        { id: "o-2", text: "Neutraliser la menace sur le site sacré", done: false },
        { id: "o-3", text: "Rapporter le trophée au conseil tribal", done: false },
      ],
      rewards: "Réputation +15, Faveur divine d'Orlanth",
    };

    onUpdateCampaign((prev) => ({
      ...prev,
      quests: [newQ, ...prev.quests],
    }));

    setShowQuestModal(false);
    setAiQuestPrompt("");
    setAiQuestError(null);
    setAiQuestLoading(false);
  };

  return (
    <div id="campaign-dashboard-view" className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-[#d1d1d6] font-sans animate-fade-in">
      {/* Campaign Header & Time Hub */}
      <div className="bg-[#16161a]/95 rounded-2xl p-5 sm:p-6 border border-[#2d2d35] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#e2ba7d10] text-[#e2ba7d] border border-[#e2ba7d50]">
              Campagne Active
            </span>
            <span className="text-xs text-[#8e8e93]">
              {campaign.heroes.length} Héros • {campaign.quests.filter((q) => q.status === "active").length} Quêtes en cours
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#e2ba7d] tracking-wide">
            {campaign.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#8e8e93] max-w-2xl mt-1 leading-relaxed">
            {campaign.description}
          </p>
        </div>

        {/* Gloranthan Date & Controls */}
        <div className="bg-[#1a1a20] p-4 rounded-xl border border-[#2d2d35] flex flex-col gap-2 min-w-[260px]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8e8e93] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#e2ba7d]" /> Calendrier Sacré
            </span>
            <span className="text-xs font-mono font-bold text-[#e2ba7d]">
              {campaign.calendar.year} ST
            </span>
          </div>

          <div className="text-sm font-semibold text-[#d1d1d6] flex items-center gap-1.5">
            <span className="text-[#e2ba7d]">{currentSeason.rune}</span>
            <span>{currentSeason.nameFr}</span>
            <span className="text-xs text-[#8e8e93]">
              (Semaine {campaign.calendar.weekNumber})
            </span>
          </div>

          <div className="text-xs text-[#8e8e93] flex items-center justify-between pt-1 border-t border-[#2d2d35]">
            <span>{currentDay}</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab("weather")}
                className="px-2 py-0.5 bg-[#25252b] hover:bg-[#32323a] text-amber-300 text-[10px] rounded-full border border-amber-500/30 transition flex items-center gap-1"
                title="Consulter la météo active"
              >
                <CloudSun className="w-3 h-3" />
                <span>Météo</span>
              </button>
              <button
                onClick={handleNextDay}
                className="px-3 py-1 bg-[#e2ba7d] hover:bg-[#edd09e] text-black font-bold text-[11px] rounded-full transition shadow-md"
                title="Avancer le calendrier d'un jour"
              >
                +1 Jour ➔
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Threat Clocks Section (Horloges de Menace) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaign.threatClocks.map((clock) => (
          <div
            key={clock.id}
            className="bg-[#16161a]/95 rounded-xl p-5 border border-[#2d2d35] shadow-xl flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-bold text-[#e2ba7d]">{clock.title}</h3>
              </div>
              <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/30">
                {clock.current} / {clock.max}
              </span>
            </div>
            <p className="text-xs text-[#8e8e93] mb-3 leading-relaxed">{clock.description}</p>

            {/* Segmented Clock Bar */}
            <div className="space-y-2">
              <div className="grid grid-cols-6 gap-1.5 h-3">
                {Array.from({ length: clock.max }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-colors ${
                      i < clock.current
                        ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                        : "bg-[#25252b] border border-[#3a3a45]"
                    }`}
                  />
                ))}
              </div>

              {isGmMode && (
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    onClick={() => handleClockStep(clock.id, -1)}
                    className="px-2.5 py-1 bg-[#25252b] hover:bg-white/5 border border-[#3a3a45] text-[#8e8e93] text-xs rounded-full"
                  >
                    -1 Cran
                  </button>
                  <button
                    onClick={() => handleClockStep(clock.id, +1)}
                    className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold text-xs rounded-full"
                  >
                    +1 Tension
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-[#2d2d35] gap-3 sm:gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("quests")}
          className={`pb-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "quests"
              ? "border-[#e2ba7d] text-[#e2ba7d]"
              : "border-transparent text-[#8e8e93] hover:text-[#d1d1d6]"
          }`}
        >
          <Swords className="w-4 h-4" /> Quêtes & Scénarios ({campaign.quests.length})
        </button>

        <button
          onClick={() => setActiveTab("party")}
          className={`pb-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "party"
              ? "border-[#e2ba7d] text-[#e2ba7d]"
              : "border-transparent text-[#8e8e93] hover:text-[#d1d1d6]"
          }`}
        >
          <Users className="w-4 h-4" /> Les Héros du Groupe ({campaign.heroes.length})
        </button>

        <button
          onClick={() => setActiveTab("weather")}
          className={`pb-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "weather"
              ? "border-[#e2ba7d] text-[#e2ba7d]"
              : "border-transparent text-[#8e8e93] hover:text-[#d1d1d6]"
          }`}
        >
          <CloudSun className="w-4 h-4" /> Météo & Climat de la Passe
        </button>

        <button
          onClick={() => setActiveTab("chronicles")}
          className={`pb-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "chronicles"
              ? "border-[#e2ba7d] text-[#e2ba7d]"
              : "border-transparent text-[#8e8e93] hover:text-[#d1d1d6]"
          }`}
        >
          <FileText className="w-4 h-4" /> Récits des Scaldes ({campaign.chronicles.length})
        </button>
      </div>

      {/* TAB: Weather & Climate */}
      {activeTab === "weather" && (
        <div className="animate-fade-in">
          <WeatherTracker
            campaign={campaign}
            onUpdateCampaign={onUpdateCampaign}
            isGmMode={isGmMode}
          />
        </div>
      )}

      {/* TAB: Quests & Scenarios */}
      {activeTab === "quests" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-[#e2ba7d] uppercase tracking-widest">
              Journal des Quêtes et Périls de Sartar
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQuestModal(true)}
                className="px-3.5 py-1.5 bg-[#25252b] hover:bg-white/5 border border-[#3a3a45] text-[#d1d1d6] text-xs font-semibold rounded-full flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5 text-[#e2ba7d]" /> Nouvelle Quête
              </button>
              {isGmMode && (
                <button
                  onClick={() => {
                    setShowQuestModal(true);
                    setAiQuestPrompt("Générer une quête de ruines draconiques avec un culte ennemi");
                  }}
                  className="px-3.5 py-1.5 bg-[#e2ba7d] hover:bg-[#edd09e] text-black text-xs font-bold rounded-full flex items-center gap-1.5 shadow-md transition"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Générer Quête IA
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaign.quests.map((quest) => (
              <div
                key={quest.id}
                className={`p-5 rounded-xl border transition shadow-xl ${
                  quest.status === "completed"
                    ? "bg-[#16161a]/60 border-[#2d2d35] opacity-75"
                    : "bg-[#16161a]/95 border-[#2d2d35] hover:border-[#e2ba7d50]"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#e2ba7d10] text-[#e2ba7d] border border-[#e2ba7d40]">
                      {quest.act}
                    </span>
                    <h3 className="text-base font-bold text-[#d1d1d6] mt-1.5">
                      {quest.title}
                    </h3>
                  </div>
                  {quest.linkedPoiId && (
                    <button
                      onClick={() => onSelectLocationById(quest.linkedPoiId!)}
                      className="text-xs text-[#e2ba7d] hover:text-[#edd09e] flex items-center gap-1 bg-[#25252b] px-2.5 py-1 rounded-full border border-[#3a3a45] transition"
                      title="Voir sur la carte"
                    >
                      <MapPin className="w-3.5 h-3.5" /> Carte
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#8e8e93] mb-3 leading-relaxed">
                  {quest.description}
                </p>

                {/* Objectives list */}
                <div className="space-y-1.5 mb-3 bg-[#1a1a20] p-3 rounded-xl border border-[#2d2d35]">
                  <span className="text-[11px] font-bold text-[#e2ba7d] uppercase tracking-wider block mb-1">
                    Objectifs :
                  </span>
                  {quest.objectives.map((obj) => (
                    <div
                      key={obj.id}
                      onClick={() => handleToggleObjective(quest.id, obj.id)}
                      className="flex items-center gap-2 text-xs cursor-pointer text-[#d1d1d6] hover:text-white transition select-none"
                    >
                      {obj.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#8e8e93] shrink-0" />
                      )}
                      <span className={obj.done ? "line-through text-[#8e8e93]" : ""}>
                        {obj.text}
                      </span>
                    </div>
                  ))}
                </div>

                {quest.rewards && (
                  <div className="text-xs text-[#e2ba7d] flex items-center gap-1.5 pt-1">
                    <Award className="w-3.5 h-3.5 text-[#e2ba7d]" />
                    <span>Récompenses : {quest.rewards}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Party / Heroes Tracker */}
      {activeTab === "party" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#e2ba7d] uppercase tracking-widest">
              Compagnons de la Passe du Dragon
            </h2>
            <button
              onClick={() => setShowHeroModal(true)}
              className="px-3.5 py-1.5 bg-[#e2ba7d] hover:bg-[#edd09e] text-black text-xs font-bold rounded-full flex items-center gap-1.5 transition shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> Créer un Aventurier
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {campaign.heroes.map((hero) => (
              <div
                key={hero.id}
                className="bg-[#16161a]/95 rounded-xl p-4 border border-[#2d2d35] shadow-xl flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#e2ba7d]">
                        {hero.name}
                      </h3>
                      <p className="text-[11px] text-[#8e8e93]">
                        Joué par {hero.playerName} • {hero.tribu}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#e2ba7d10] text-[#e2ba7d] border border-[#e2ba7d40]">
                      Rép. {hero.reputation}
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-semibold text-[#d1d1d6] flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-[#e2ba7d]" /> Culte : {hero.cult}
                  </div>

                  {/* Vitals: HP, MP, RP */}
                  <div className="grid grid-cols-3 gap-1.5 my-3 text-center">
                    <div className="bg-[#1a1a20] p-2 rounded-lg border border-red-500/20">
                      <span className="text-[10px] text-[#8e8e93] block">PV</span>
                      <span className="font-bold text-red-400 text-xs">
                        {hero.hpCurrent} / {hero.hpMax}
                      </span>
                    </div>
                    <div className="bg-[#1a1a20] p-2 rounded-lg border border-sky-500/20">
                      <span className="text-[10px] text-[#8e8e93] block">PM</span>
                      <span className="font-bold text-sky-400 text-xs">{hero.magicPoints}</span>
                    </div>
                    <div className="bg-[#1a1a20] p-2 rounded-lg border border-[#e2ba7d30]">
                      <span className="text-[10px] text-[#8e8e93] block">PR</span>
                      <span className="font-bold text-[#e2ba7d] text-xs">{hero.runePoints}</span>
                    </div>
                  </div>

                  {/* Runes */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#8e8e93] uppercase font-bold tracking-wider">
                      Affinités Runiques :
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {hero.runes.map((r, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-[#25252b] text-[#e2ba7d] border border-[#3a3a45] rounded-full text-[10px] font-mono"
                        >
                          {r.rune.toUpperCase()} {r.value}%
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Passions */}
                  <div className="space-y-1 mt-2">
                    <span className="text-[10px] text-[#8e8e93] uppercase font-bold tracking-wider">
                      Passions & Serments :
                    </span>
                    <div className="space-y-1">
                      {hero.passions.map((p, i) => (
                        <div key={i} className="text-[11px] text-[#d1d1d6] flex justify-between bg-[#1a1a20] px-2 py-1 rounded">
                          <span>{p.name}</span>
                          <span className="font-mono text-[#e2ba7d]">{p.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {hero.notes && (
                  <p className="text-[11px] text-[#8e8e93] italic pt-2 border-t border-[#2d2d35]">
                    "{hero.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Chronicles (Récit des Scaldes) */}
      {activeTab === "chronicles" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#e2ba7d] uppercase tracking-widest">
              Les Chroniques & Chants de Bataille
            </h2>
            <button
              onClick={() => setShowChronicleModal(true)}
              className="px-3.5 py-1.5 bg-[#e2ba7d] hover:bg-[#edd09e] text-black font-bold text-xs rounded-full flex items-center gap-1.5 transition shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> Écrire un Nouveau Récit
            </button>
          </div>

          <div className="space-y-3">
            {campaign.chronicles.map((ch) => (
              <div
                key={ch.id}
                className="bg-[#16161a]/95 rounded-xl p-5 border border-[#2d2d35] shadow-xl space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs border-b border-[#2d2d35] pb-2">
                  <span className="font-bold text-[#e2ba7d] text-base">
                    {ch.title}
                  </span>
                  <span className="text-[#8e8e93] font-mono">{ch.gloranthaDate}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#d1d1d6] whitespace-pre-line leading-relaxed italic">
                  "{ch.text}"
                </p>
                {ch.heroesInvolved && (
                  <div className="flex items-center gap-2 text-[11px] text-[#8e8e93] pt-1">
                    <span>Héros mentionnés :</span>
                    <span className="text-[#e2ba7d] font-semibold">{ch.heroesInvolved.join(", ")}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Hero Creation Modal */}
      {showHeroModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#16161a] border border-[#2d2d35] rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#e2ba7d]">
              Créer un Héros de RuneQuest
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#8e8e93] block mb-1">Nom du Héros</label>
                <input
                  type="text"
                  value={newHeroName}
                  onChange={(e) => setNewHeroName(e.target.value)}
                  placeholder="Ex: Vostor Cœur-de-Foudre"
                  className="w-full bg-[#25252b] border border-[#3a3a45] rounded-lg px-3 py-2 text-xs text-[#d1d1d6] focus:border-[#e2ba7d] outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[#8e8e93] block mb-1">Joueur</label>
                <input
                  type="text"
                  value={newHeroPlayer}
                  onChange={(e) => setNewHeroPlayer(e.target.value)}
                  placeholder="Ex: Camille"
                  className="w-full bg-[#25252b] border border-[#3a3a45] rounded-lg px-3 py-2 text-xs text-[#d1d1d6] focus:border-[#e2ba7d] outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[#8e8e93] block mb-1">Tribu / Clan</label>
                <input
                  type="text"
                  value={newHeroTribu}
                  onChange={(e) => setNewHeroTribu(e.target.value)}
                  className="w-full bg-[#25252b] border border-[#3a3a45] rounded-lg px-3 py-2 text-xs text-[#d1d1d6] focus:border-[#e2ba7d] outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[#8e8e93] block mb-1">Culte Divin</label>
                <input
                  type="text"
                  value={newHeroCult}
                  onChange={(e) => setNewHeroCult(e.target.value)}
                  className="w-full bg-[#25252b] border border-[#3a3a45] rounded-lg px-3 py-2 text-xs text-[#d1d1d6] focus:border-[#e2ba7d] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#2d2d35]">
              <button
                onClick={() => setShowHeroModal(false)}
                className="px-4 py-1.5 rounded-full bg-[#25252b] hover:bg-white/5 border border-[#3a3a45] text-[#8e8e93] text-xs"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (!newHeroName.trim()) return;
                  const newH: HeroCharacter = {
                    id: `hero-${Date.now()}`,
                    name: newHeroName.trim(),
                    playerName: newHeroPlayer || "Joueur",
                    tribu: newHeroTribu,
                    cult: newHeroCult,
                    runes: [{ rune: newHeroRune1, value: newHeroRune1Val }],
                    passions: [{ name: newHeroPassion, value: newHeroPassionVal }],
                    hpCurrent: 14,
                    hpMax: 14,
                    magicPoints: 12,
                    runePoints: 3,
                    reputation: 10,
                    notes: "Nouveau héros initié aux mystères de la Passe.",
                  };
                  onUpdateCampaign((prev) => ({
                    ...prev,
                    heroes: [...prev.heroes, newH],
                  }));
                  setShowHeroModal(false);
                }}
                className="px-5 py-1.5 bg-[#e2ba7d] hover:bg-[#edd09e] text-black font-bold text-xs rounded-full shadow-lg"
              >
                Créer l'Aventurier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Quest / AI Quest Modal */}
      {showQuestModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#16161a] border border-[#2d2d35] rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2d2d35] pb-3">
              <h3 className="text-lg font-bold text-[#e2ba7d] flex items-center gap-2">
                <Swords className="w-4 h-4 text-[#e2ba7d]" /> Nouvelle Quête de Campagne
              </h3>
              <button onClick={() => setShowQuestModal(false)} className="text-[#8e8e93] hover:text-white">
                ✕
              </button>
            </div>

            {/* AI Generator prompt */}
            <div className="p-4 bg-[#1a1a20] rounded-xl border border-[#2d2d35] space-y-3">
              <span className="text-xs font-bold text-[#e2ba7d] flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Générateur de Scénario (Gemini AI) :
              </span>
              <input
                type="text"
                value={aiQuestPrompt}
                onChange={(e) => setAiQuestPrompt(e.target.value)}
                placeholder="Ex: Vol de troupeau sacré par des Broos, expédition aux ruines..."
                className="w-full bg-[#25252b] border border-[#3a3a45] rounded-lg px-3 py-2 text-xs text-[#d1d1d6] focus:border-[#e2ba7d] outline-none"
              />
              {aiQuestError && (
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{aiQuestError}</span>
                </div>
              )}
              <button
                onClick={handleGenerateAiQuest}
                disabled={aiQuestLoading}
                className="w-full py-2.5 bg-[#e2ba7d] hover:bg-[#edd09e] text-black font-bold text-xs rounded-full flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-md transition"
              >
                {aiQuestLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Générer et Ajouter la Quête</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
