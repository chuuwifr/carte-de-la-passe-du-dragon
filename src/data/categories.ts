import React from "react";
import {
  Landmark,
  Flame,
  Castle,
  Skull,
  Trees,
  Shield,
  Sparkles,
  MapPin,
  Anchor,
  Pickaxe,
  Coins,
  Warehouse,
  GitCommit,
  Footprints,
} from "lucide-react";
import { POICategory } from "../types";

export interface CategoryMeta {
  id: POICategory;
  labelFr: string;
  labelEn: string;
  description: string;
  badgeClass: string;
  iconName: string;
  accentColor: string;
  markerColor: string;
}

export const POI_CATEGORIES: CategoryMeta[] = [
  {
    id: "city",
    labelFr: "Cité & Métropole",
    labelEn: "City & Metropolis",
    description: "Grandes villes fortifiées, capitales de royaumes et centres de pouvoir.",
    badgeClass: "bg-amber-900/90 text-amber-100 border-amber-500/70",
    iconName: "Landmark",
    accentColor: "#e2ba7d",
    markerColor: "bg-amber-600 border-amber-300 text-amber-100",
  },
  {
    id: "temple",
    labelFr: "Temple Majeur & Ziggourat",
    labelEn: "Major Temple & Ziggurat",
    description: "Hauts lieux sacrés des cultes divins (Orlanth, Ernalda, Yelmalio, Sept Mères).",
    badgeClass: "bg-yellow-800/90 text-yellow-100 border-yellow-400/80",
    iconName: "Flame",
    accentColor: "#facc15",
    markerColor: "bg-yellow-600 border-yellow-300 text-yellow-100",
  },
  {
    id: "shrine",
    labelFr: "Sanctuaire & Bosquet Sacré",
    labelEn: "Shrine & Sacred Grove",
    description: "Autels sauvages, ermitages de dieux mineurs et sources bénies.",
    badgeClass: "bg-violet-900/90 text-violet-100 border-violet-400/70",
    iconName: "Sparkles",
    accentColor: "#c084fc",
    markerColor: "bg-violet-700 border-violet-300 text-violet-100",
  },
  {
    id: "fortress",
    labelFr: "Forteresse & Bastion",
    labelEn: "Fortress & Bastion",
    description: "Citadelles imprenables, garnisons militaires et forts frontaliers.",
    badgeClass: "bg-sky-900/90 text-sky-100 border-sky-400/70",
    iconName: "Shield",
    accentColor: "#38bdf8",
    markerColor: "bg-sky-700 border-sky-300 text-sky-100",
  },
  {
    id: "ruin",
    labelFr: "Ruine Antique & EWF",
    labelEn: "Ancient Ruins & EWF",
    description: "Vestiges des civilisations du Premier et Second Âge, cryptes et palais engloutis.",
    badgeClass: "bg-stone-800/90 text-stone-200 border-stone-400/60",
    iconName: "Castle",
    accentColor: "#a8a29e",
    markerColor: "bg-stone-700 border-stone-300 text-stone-100",
  },
  {
    id: "tomb",
    labelFr: "Tumulus & Nécropole",
    labelEn: "Barrow & Necropolis",
    description: "Mégalithes funéraires, tombes de rois antiques et caveaux sacrés.",
    badgeClass: "bg-indigo-950/90 text-indigo-200 border-indigo-500/70",
    iconName: "Anchor",
    accentColor: "#818cf8",
    markerColor: "bg-indigo-900 border-indigo-400 text-indigo-100",
  },
  {
    id: "settlement",
    labelFr: "Village, Clan & Enclave",
    labelEn: "Village, Clan & Enclave",
    description: "Campements tribaux, bourgs lacustres des Canards, villages fermiers ou enclaves de bêtes.",
    badgeClass: "bg-teal-900/90 text-teal-100 border-teal-400/70",
    iconName: "Warehouse",
    accentColor: "#2dd4bf",
    markerColor: "bg-teal-700 border-teal-300 text-teal-100",
  },
  {
    id: "nature",
    labelFr: "Nature Sauvage & Esprits",
    labelEn: "Wild Nature & Spirits",
    description: "Forêts enchantées, vallées peuplées d'Hommes-Bêtes, monts sacrés et lacs d'ondines.",
    badgeClass: "bg-emerald-900/90 text-emerald-100 border-emerald-400/70",
    iconName: "Trees",
    accentColor: "#34d399",
    markerColor: "bg-emerald-700 border-emerald-300 text-emerald-100",
  },
  {
    id: "peril",
    labelFr: "Péril du Chaos & Nids de Monstres",
    labelEn: "Chaos Peril & Monster Lair",
    description: "Marais putrides de Broos, cratères démoniaques et résurgences du Chaos.",
    badgeClass: "bg-red-950/90 text-red-100 border-red-500/80 animate-pulse",
    iconName: "Skull",
    accentColor: "#f87171",
    markerColor: "bg-red-800 border-red-400 text-red-100",
  },
  {
    id: "landmark",
    labelFr: "Monument & Montagne Mythique",
    labelEn: "Monument & Mythic Peak",
    description: "Pics géants (Kero Fin), rochers légendaires et piliers géologiques.",
    badgeClass: "bg-amber-950/90 text-amber-200 border-amber-600/70",
    iconName: "Landmark",
    accentColor: "#fbbf24",
    markerColor: "bg-amber-800 border-amber-400 text-amber-100",
  },
  {
    id: "bridge",
    labelFr: "Gué, Pont & Col Stratégique",
    labelEn: "Ford, Bridge & Pass",
    description: "Passages critiques sur les fleuves (Oslir, Jouvence, Zola Fel) et cols de montagne.",
    badgeClass: "bg-cyan-950/90 text-cyan-200 border-cyan-500/70",
    iconName: "GitCommit",
    accentColor: "#22d3ee",
    markerColor: "bg-cyan-800 border-cyan-400 text-cyan-100",
  },
  {
    id: "mine",
    labelFr: "Mine Naine & Fonderie",
    labelEn: "Dwarf Mine & Foundry",
    description: "Gisements de fer pur, de cuivre divin et citadelles souterraines des Mostali.",
    badgeClass: "bg-orange-950/90 text-orange-200 border-orange-500/70",
    iconName: "Pickaxe",
    accentColor: "#fb923c",
    markerColor: "bg-orange-800 border-orange-400 text-orange-100",
  },
  {
    id: "market",
    labelFr: "Marché & Caravansérail",
    labelEn: "Market & Caravanserai",
    description: "Grandes foires nomades, comptoirs d'Issaries et marchés aux bêtes.",
    badgeClass: "bg-lime-950/90 text-lime-200 border-lime-500/70",
    iconName: "Coins",
    accentColor: "#a3e635",
    markerColor: "bg-lime-800 border-lime-400 text-lime-100",
  },
];

export function getCategoryMeta(category: POICategory): CategoryMeta {
  const found = POI_CATEGORIES.find((c) => c.id === category);
  if (found) return found;
  return POI_CATEGORIES[0];
}
