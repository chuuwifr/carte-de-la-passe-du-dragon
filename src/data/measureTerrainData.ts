export type MeasureTerrainType = "plaine" | "montagne" | "foret" | "marais" | "route";

export interface MeasureTerrainConfig {
  id: MeasureTerrainType;
  nameFr: string;
  shortNameFr: string;
  detourFactor: number; // Multiplier applied to straight-line distance for elevation/curves
  walkingSpeedKmDay: number; // km per standard 8-hour travel day on foot
  ridingSpeedKmDay: number; // km per standard 8-hour travel day on horse/bison
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  descriptionFr: string;
  terrainAdviceFr: string;
}

export const MEASURE_TERRAIN_CONFIGS: Record<MeasureTerrainType, MeasureTerrainConfig> = {
  plaine: {
    id: "plaine",
    nameFr: "Plaine & Steppe Ouverte",
    shortNameFr: "Plaine",
    detourFactor: 1.05,
    walkingSpeedKmDay: 24,
    ridingSpeedKmDay: 48,
    color: "#f59e0b",
    textColor: "text-amber-300",
    bgColor: "bg-amber-950/40",
    borderColor: "border-amber-500/50",
    descriptionFr: "Terrain plat ou vallonné sans obstacle majeur. Marche dégagée dans les steppes de Prax ou plaines sartarites.",
    terrainAdviceFr: "Voyage régulier et rapide (+5% pour légers contours). Attention au manque d'eau en été.",
  },
  montagne: {
    id: "montagne",
    nameFr: "Montagne & Reliefs Escarpés",
    shortNameFr: "Montagne",
    detourFactor: 1.4,
    walkingSpeedKmDay: 14,
    ridingSpeedKmDay: 20,
    color: "#60a5fa",
    textColor: "text-blue-300",
    bgColor: "bg-blue-950/40",
    borderColor: "border-blue-500/50",
    descriptionFr: "Pics d'Orlanth, cols venteux, éboulis et pentes abruptes des monts de Sartar et Tarsh.",
    terrainAdviceFr: "Dénivelé important : distance réelle de marche majorée de +40% (lacets et montées). Risque de fatigue accru.",
  },
  foret: {
    id: "foret",
    nameFr: "Forêt Dense & Sous-bois",
    shortNameFr: "Forêt",
    detourFactor: 1.2,
    walkingSpeedKmDay: 18,
    ridingSpeedKmDay: 28,
    color: "#22c55e",
    textColor: "text-emerald-300",
    bgColor: "bg-emerald-950/40",
    borderColor: "border-emerald-500/50",
    descriptionFr: "Forêt des Bêtes, taillis denses, racines et végétation luxuriante sous la protection d'Ironhoof.",
    terrainAdviceFr: "Visibilité réduite et progression ralentie (+20% pour détours autour des troncs et fourrés).",
  },
  marais: {
    id: "marais",
    nameFr: "Marais & Terres Humides",
    shortNameFr: "Marais",
    detourFactor: 1.35,
    walkingSpeedKmDay: 12,
    ridingSpeedKmDay: 10,
    color: "#14b8a6",
    textColor: "text-teal-300",
    bgColor: "bg-teal-950/40",
    borderColor: "border-teal-500/50",
    descriptionFr: "Marais de l'Élévation, tourbières, vases profondes et cours d'eau croupis.",
    terrainAdviceFr: "Progression difficile (+35% pour éviter les fondrières). Montures très fortement ralenties.",
  },
  route: {
    id: "route",
    nameFr: "Chaussée Royale Pavée",
    shortNameFr: "Route",
    detourFactor: 1.0,
    walkingSpeedKmDay: 30,
    ridingSpeedKmDay: 60,
    color: "#c084fc",
    textColor: "text-purple-300",
    bgColor: "bg-purple-950/40",
    borderColor: "border-purple-500/50",
    descriptionFr: "Voie royale sartarite ou chaussée de Tarsh bien nivelée et pourvue de bornes et ponts.",
    terrainAdviceFr: "Tracé direct sans détour supplémentaire. Vitesse de marche et de convoi optimale.",
  },
};

export interface MeasurePoint {
  x: number; // 0 to 100 percentage of map width
  y: number; // 0 to 100 percentage of map height
  name?: string;
  poiId?: string;
}

export interface MeasureCalculationResult {
  pointA: MeasurePoint;
  pointB: MeasurePoint;
  directDistanceKm: number; // Straight-line distance
  effectiveDistanceKm: number; // Distance taking terrain detour factor into account
  stadesGloranthis: number; // 1 km = 5.4 stades
  lieuesGloranthis: number; // 1 lieue = 4 km
  terrain: MeasureTerrainConfig;
  travelTime: {
    walkingDays: number;
    walkingHours: number;
    ridingDays: number;
    ridingHours: number;
    flightHours: number;
  };
  dxKm: number;
  dyKm: number;
}

// Calculate straight distance & terrain adjustments
export function calculateMeasureDetails(
  p1: MeasurePoint,
  p2: MeasurePoint,
  terrainType: MeasureTerrainType = "plaine"
): MeasureCalculationResult {
  // Map dimensions: width ~320 km, height ~220 km (1600x1100 px standard canvas)
  const dxKm = (Math.abs(p2.x - p1.x) / 100) * 320;
  const dyKm = (Math.abs(p2.y - p1.y) / 100) * 220;
  const directDistanceKm = Math.max(1, Math.round(Math.sqrt(dxKm * dxKm + dyKm * dyKm)));

  const terrain = MEASURE_TERRAIN_CONFIGS[terrainType] || MEASURE_TERRAIN_CONFIGS.plaine;
  const effectiveDistanceKm = Math.round(directDistanceKm * terrain.detourFactor);

  const stadesGloranthis = Math.round(effectiveDistanceKm * 5.4);
  const lieuesGloranthis = Math.round((effectiveDistanceKm / 4) * 10) / 10;

  // Travel time calculations (8 hours travel per standard day)
  const walkingDays = Math.round((effectiveDistanceKm / terrain.walkingSpeedKmDay) * 10) / 10;
  const walkingHours = Math.round(walkingDays * 8 * 10) / 10;

  const ridingDays = Math.round((effectiveDistanceKm / terrain.ridingSpeedKmDay) * 10) / 10;
  const ridingHours = Math.round(ridingDays * 8 * 10) / 10;

  const flightHours = Math.round((directDistanceKm / 80) * 10) / 10;

  return {
    pointA: p1,
    pointB: p2,
    directDistanceKm,
    effectiveDistanceKm,
    stadesGloranthis,
    lieuesGloranthis,
    terrain,
    travelTime: {
      walkingDays: Math.max(0.1, walkingDays),
      walkingHours: Math.max(0.5, walkingHours),
      ridingDays: Math.max(0.1, ridingDays),
      ridingHours: Math.max(0.5, ridingHours),
      flightHours: Math.max(0.1, flightHours),
    },
    dxKm: Math.round(dxKm * 10) / 10,
    dyKm: Math.round(dyKm * 10) / 10,
  };
}
