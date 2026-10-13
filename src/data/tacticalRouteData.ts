import { TacticalWaypoint, TacticalTravelMode, TacticalRouteStyle, PointOfInterest } from "../types";

export interface TacticalRoutePreset {
  id: string;
  name: string;
  category: "sartar" | "lunar" | "issaries" | "chaos" | "prax";
  color: string;
  style: TacticalRouteStyle;
  travelMode: TacticalTravelMode;
  speed: "slow" | "normal" | "fast";
  description: string;
  sampleWaypoints?: { name: string; x: number; y: number }[];
}

export const TACTICAL_ROUTE_PRESETS: TacticalRoutePreset[] = [
  {
    id: "orlanthi_patrol",
    name: "Patrouille Guerrière Orlanthi",
    category: "sartar",
    color: "#38bdf8", // Sky blue
    style: "animated_dash",
    travelMode: "walking",
    speed: "normal",
    description: "Reconnaissance des guetteurs des collines et guerriers du clan.",
  },
  {
    id: "royal_sartar_caravan",
    name: "Convoi Sacré d'Issaries & Pèlerinage",
    category: "issaries",
    color: "#eab308", // Gold
    style: "caravan_tracks",
    travelMode: "caravan",
    speed: "slow",
    description: "Ligne de ravitaillement marchand, caravane de bêtes de bât et prêtres marchands.",
  },
  {
    id: "lunar_phalanx_march",
    name: "Marche de Colonne Impériale Lunare",
    category: "lunar",
    color: "#f43f5e", // Crimson / Rose
    style: "animated_dots",
    travelMode: "forced_march",
    speed: "fast",
    description: "Mouvement de phalange militaire de Tarsh et légionnaires à la cape pourpre.",
  },
  {
    id: "praxian_raiders",
    name: "Raid de Cavalerie Nomade des Hautes Terres",
    category: "prax",
    color: "#fb923c", // Amber-Orange
    style: "marching_arrows",
    travelMode: "mounted",
    speed: "fast",
    description: "Charge rapide de cavaliers sur bisons et zèbres à travers le bush de Prax.",
  },
  {
    id: "humakt_shadow_incursion",
    name: "Infiltration d'Élite & Traque d'Humakt",
    category: "sartar",
    color: "#a855f7", // Violet Shadow
    style: "glowing_pulse",
    travelMode: "walking",
    speed: "normal",
    description: "Progression furtive sous serment de mort dans les gorges et forêts.",
  },
  {
    id: "chaos_incursion_warning",
    name: "Alerte de Pénétration de Bande Chaotique",
    category: "chaos",
    color: "#ef4444", // Red Danger
    style: "animated_dash",
    travelMode: "forced_march",
    speed: "fast",
    description: "Trajectoire détectée d'une meute de broos ou d'horreurs issues du Trou de Serpent.",
  },
];

// Scale: 100% width = ~300 km, 100% height = ~220 km (Dragon Pass map aspect ratio 1600x1100)
export function calculateDistanceBetweenPoints(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  const dxKm = ((p2.x - p1.x) / 100) * 300;
  const dyKm = ((p2.y - p1.y) / 100) * 220;
  return Math.round(Math.hypot(dxKm, dyKm) * 10) / 10;
}

export function calculateTacticalRouteMetrics(
  waypoints: TacticalWaypoint[],
  travelMode: TacticalTravelMode = "walking"
): {
  totalKm: number;
  totalStades: number;
  legDistances: number[];
  estimatedDays: number;
  estimatedHours: number;
  travelModeLabel: string;
  travelModeSpeedDesc: string;
} {
  if (waypoints.length < 2) {
    return {
      totalKm: 0,
      totalStades: 0,
      legDistances: [],
      estimatedDays: 0,
      estimatedHours: 0,
      travelModeLabel: getTravelModeLabel(travelMode),
      travelModeSpeedDesc: getTravelModeSpeedDesc(travelMode),
    };
  }

  const legDistances: number[] = [];
  let totalKm = 0;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const dist = calculateDistanceBetweenPoints(waypoints[i], waypoints[i + 1]);
    legDistances.push(dist);
    totalKm += dist;
  }

  totalKm = Math.round(totalKm * 10) / 10;
  const totalStades = Math.round((totalKm * 1000) / 185); // 1 stade = 185 m

  // Speed per standard 8-hour travel day
  let kmPerDay = 24; // Default walking
  if (travelMode === "mounted") kmPerDay = 48;
  else if (travelMode === "caravan") kmPerDay = 18;
  else if (travelMode === "forced_march") kmPerDay = 36;
  else if (travelMode === "flight") kmPerDay = 80;

  const estimatedDays = Math.max(0.1, Math.round((totalKm / kmPerDay) * 10) / 10);
  const estimatedHours = Math.round((totalKm / (kmPerDay / 8)) * 10) / 10;

  return {
    totalKm,
    totalStades,
    legDistances,
    estimatedDays,
    estimatedHours,
    travelModeLabel: getTravelModeLabel(travelMode),
    travelModeSpeedDesc: getTravelModeSpeedDesc(travelMode),
  };
}

export function getTravelModeLabel(mode: TacticalTravelMode): string {
  switch (mode) {
    case "walking":
      return "Marche à pied standard (24 km/j)";
    case "mounted":
      return "Montures & Cavaliers (48 km/j)";
    case "caravan":
      return "Chariots & Caravane (18 km/j)";
    case "forced_march":
      return "Marche Forcée Militaire (36 km/j)";
    case "flight":
      return "Vol Magique / Sylphe (80 km/j)";
  }
}

export function getTravelModeSpeedDesc(mode: TacticalTravelMode): string {
  switch (mode) {
    case "walking":
      return "Progression normale d'un groupe aventurier à pied (8h de marche par jour).";
    case "mounted":
      return "Chevaux sartarites, bisons praxiens ou antilopes avec relais réguliers.";
    case "caravan":
      return "Lourd convoi de bœufs et chariots chargés suivant les pistes balisées.";
    case "forced_march":
      return "Rythme soutenu de légion militaire (jet de Constitution quotidien recommandé).";
    case "flight":
      return "Déplacement par esprits de l'Air d'Orlanth ou montures volantes (hippogriffes).";
  }
}

export function findClosestPoi(
  coords: { x: number; y: number },
  locations: PointOfInterest[],
  maxDistancePercent = 3.5
): PointOfInterest | null {
  let closest: PointOfInterest | null = null;
  let minDist = maxDistancePercent;

  for (const loc of locations) {
    const d = Math.hypot(loc.coords.x - coords.x, loc.coords.y - coords.y);
    if (d < minDist) {
      minDist = d;
      closest = loc;
    }
  }

  return closest;
}
