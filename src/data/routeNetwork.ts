import { RegionKey, WeatherType } from "../types";

export type TerrainType =
  | "paved_road"
  | "dirt_trail"
  | "hills_rocky"
  | "mountain_pass"
  | "waterway_river"
  | "waterway_sea"
  | "swamp_marsh"
  | "arid_plains"
  | "forest_woodland"
  | "chaos_wastes";

export interface TerrainConfig {
  id: TerrainType;
  nameFr: string;
  category: "facile" | "moyen" | "difficile" | "hostile" | "aquatique";
  baseSpeedMultiplier: number; // 1.0 = normal, 1.2 = +20% fast, 0.5 = -50% slow
  descriptionFr: string;
  colorHex: string;
  badgeBg: string;
  badgeText: string;
}

export const TERRAIN_CONFIGS: Record<TerrainType, TerrainConfig> = {
  paved_road: {
    id: "paved_road",
    nameFr: "Chaussée Royale Pavée",
    category: "facile",
    baseSpeedMultiplier: 1.2,
    descriptionFr: "Route pavée entretenue, ponts solides et patrouilles. Vitesse de marche et de roulage optimale (+20%).",
    colorHex: "#f59e0b",
    badgeBg: "bg-amber-500/20",
    badgeText: "text-amber-300",
  },
  dirt_trail: {
    id: "dirt_trail",
    nameFr: "Piste Marchande de Terre",
    category: "moyen",
    baseSpeedMultiplier: 1.0,
    descriptionFr: "Sentier de terre battue tracé par les caravanes d'Issaries et les pèlerins. Vitesse normale.",
    colorHex: "#e2ba7d",
    badgeBg: "bg-amber-700/20",
    badgeText: "text-amber-200",
  },
  hills_rocky: {
    id: "hills_rocky",
    nameFr: "Collines Rocailleuses & Reliefs",
    category: "difficile",
    baseSpeedMultiplier: 0.75,
    descriptionFr: "Pentes abruptes, éboulis et sentiers sinueux dans les collines de Sartar (-25% de vitesse).",
    colorHex: "#a78bfa",
    badgeBg: "bg-purple-900/30",
    badgeText: "text-purple-300",
  },
  mountain_pass: {
    id: "mountain_pass",
    nameFr: "Col de Haute Montagne",
    category: "difficile",
    baseSpeedMultiplier: 0.55,
    descriptionFr: "Passages venteux et escarpés à travers les pics d'Orlanth. Ralentissement important (-45%), péril accru en hiver.",
    colorHex: "#60a5fa",
    badgeBg: "bg-blue-900/30",
    badgeText: "text-blue-300",
  },
  waterway_river: {
    id: "waterway_river",
    nameFr: "Voie Fluviale / Fleuve Navigable",
    category: "aquatique",
    baseSpeedMultiplier: 1.4,
    descriptionFr: "Descente ou remontée sur l'Oslir, le Jouvence ou le Zola Fel. Idéal et rapide en bateau / barque fluviale.",
    colorHex: "#06b6d4",
    badgeBg: "bg-cyan-900/30",
    badgeText: "text-cyan-300",
  },
  waterway_sea: {
    id: "waterway_sea",
    nameFr: "Mer Côtière / Baie de Choralinthor",
    category: "aquatique",
    baseSpeedMultiplier: 1.5,
    descriptionFr: "Eaux côtières de la Mer Miroir. Nécessite un voilier ou une galère marchande.",
    colorHex: "#0284c7",
    badgeBg: "bg-sky-900/30",
    badgeText: "text-sky-300",
  },
  swamp_marsh: {
    id: "swamp_marsh",
    nameFr: "Marais Fétides & Bourbiers",
    category: "hostile",
    baseSpeedMultiplier: 0.4,
    descriptionFr: "Eaux croupies, vases profondes et brouillards malsains (Marais de l'Élévation). Fort ralentissement (-60%).",
    colorHex: "#10b981",
    badgeBg: "bg-emerald-950/40",
    badgeText: "text-emerald-400",
  },
  arid_plains: {
    id: "arid_plains",
    nameFr: "Steppes & Plaines Arides de Prax",
    category: "moyen",
    baseSpeedMultiplier: 0.9,
    descriptionFr: "Vastes étendues sans ombre balayées par le vent. Chaleur, poussière et rareté de l'eau.",
    colorHex: "#d97706",
    badgeBg: "bg-orange-950/30",
    badgeText: "text-orange-300",
  },
  forest_woodland: {
    id: "forest_woodland",
    nameFr: "Forêt Dense des Bêtes",
    category: "moyen",
    baseSpeedMultiplier: 0.7,
    descriptionFr: "Bois séculaires sous l'autorité du Roi Centaure Ironhoof. Sentiers ombragés et sous-bois denses (-30%).",
    colorHex: "#22c55e",
    badgeBg: "bg-green-950/30",
    badgeText: "text-green-300",
  },
  chaos_wastes: {
    id: "chaos_wastes",
    nameFr: "Terres Maudites du Chaos",
    category: "hostile",
    baseSpeedMultiplier: 0.5,
    descriptionFr: "Terrain corrompu et instable autour du Trou de Snakepipe. Ralentissement (-50%) et risque mortel de corruption.",
    colorHex: "#ef4444",
    badgeBg: "bg-rose-950/40",
    badgeText: "text-rose-400",
  },
};

export interface RouteNode {
  id: string;
  nameFr: string;
  coords: { x: number; y: number }; // Percentage 0-100 on the 1600x1100 map
  region: RegionKey;
  isCityOrTown?: boolean;
  isPortOrFord?: boolean;
}

export type RoadType =
  | "royal_highway"
  | "trade_trail"
  | "mountain_pass"
  | "river_ferry"
  | "sea_route"
  | "wild_trail";

export interface RoadSegment {
  id: string;
  fromId: string;
  toId: string;
  roadType: RoadType;
  terrainType: TerrainType;
  nameFr: string;
  distanceKm: number;
  dangerLevel: 1 | 2 | 3 | 4 | 5; // 1 = Very safe, 5 = Extreme danger/chaos
  isWaterway?: boolean;
  waterCurrentDirection?: "downstream" | "upstream" | "neutral";
}

export interface MapObstacle {
  id: string;
  nameFr: string;
  type: "mountain_ridge" | "cursed_swamp" | "chaos_nest" | "deep_water" | "chasm";
  polygon: { x: number; y: number }[]; // Coordinates in percentage (0-100)
  descriptionFr: string;
  isImpassable: boolean;
  dangerPenalty: number;
}

// =============================================================================
// 1. NETWORK NODES (Cities, Major Towns, Fords, Mountain Passes & River Ports)
// =============================================================================
export const DRAGON_PASS_ROUTE_NODES: RouteNode[] = [
  // Sartar Cities & Junctions
  { id: "boldhome", nameFr: "Boldhome (Capitale de Sartar)", coords: { x: 48.5, y: 47.5 }, region: "sartar", isCityOrTown: true },
  { id: "jonville", nameFr: "Jonville (Jonstown)", coords: { x: 42.5, y: 41.5 }, region: "sartar", isCityOrTown: true, isPortOrFord: true },
  { id: "swenstown", nameFr: "Swenstown (Bourg Frontalier)", coords: { x: 61.5, y: 55.5 }, region: "sartar", isCityOrTown: true },
  { id: "wilmskirk", nameFr: "Wilmskirk (Cité Franche)", coords: { x: 38.5, y: 56.5 }, region: "sartar", isCityOrTown: true },
  { id: "clearwine", nameFr: "Vin-Clair (Clearwine - Fort Colymar)", coords: { x: 44.5, y: 49.5 }, region: "sartar", isCityOrTown: true },
  { id: "duckpoint", nameFr: "Pointe des Canards (Duck Point - Port Fluvial)", coords: { x: 35.5, y: 64.5 }, region: "sartar", isCityOrTown: true, isPortOrFord: true },
  { id: "dangerford", nameFr: "Gué du Danger (Dangerford)", coords: { x: 45.0, y: 35.5 }, region: "sartar", isCityOrTown: true, isPortOrFord: true },
  { id: "quivin_peak", nameFr: "Mont Quivin (Sanctuaire Haut)", coords: { x: 46.5, y: 45.5 }, region: "sartar" },
  { id: "apple_lane", nameFr: "L'Allée des Pommes (Apple Lane)", coords: { x: 45.8, y: 48.2 }, region: "sartar", isCityOrTown: true },

  // Tarsh & North
  { id: "furthest", nameFr: "Havrefroid (Furthest - Métropole de Tarsh)", coords: { x: 41.5, y: 19.5 }, region: "tarsh", isCityOrTown: true, isPortOrFord: true },
  { id: "tarsh_crossroads", nameFr: "Carrefour de Tarsh", coords: { x: 43.0, y: 27.5 }, region: "tarsh" },
  { id: "dunstop", nameFr: "Dunstop (Bastion de l'Oslir)", coords: { x: 36.0, y: 22.5 }, region: "tarsh", isCityOrTown: true, isPortOrFord: true },
  { id: "slave_corral", nameFr: "Enclos aux Esclaves", coords: { x: 48.0, y: 20.0 }, region: "tarsh" },

  // Passes & Borders
  { id: "dragon_eye_pass", nameFr: "Passage de l'Œil du Dragon", coords: { x: 53.0, y: 39.0 }, region: "sartar" },
  { id: "bull_pass", nameFr: "Col du Taureau Tempête", coords: { x: 56.5, y: 46.0 }, region: "sartar" },
  { id: "snakepipe_entry", nameFr: "Entrée du Trou de Serpent", coords: { x: 49.0, y: 26.5 }, region: "tarsh" },
  { id: "dagori_pass", nameFr: "Col Sombre de Dâgori Inkarth", coords: { x: 62.0, y: 28.0 }, region: "dagori_inkarth" },
  { id: "dagori_stronghold", nameFr: "Grande Forteresse Trolle", coords: { x: 68.0, y: 25.0 }, region: "dagori_inkarth", isCityOrTown: true },

  // Esrolia & Sea Coast
  { id: "nochet", nameFr: "Nochet (Grande Métropole Maritime)", coords: { x: 19.5, y: 77.5 }, region: "esrolia", isCityOrTown: true, isPortOrFord: true },
  { id: "karse", nameFr: "Karse (Grand Port d'Héort)", coords: { x: 31.0, y: 76.5 }, region: "pays_heort", isCityOrTown: true, isPortOrFord: true },
  { id: "esrolia_east_gate", nameFr: "Porte d'Esrolia", coords: { x: 26.0, y: 69.0 }, region: "esrolia" },
  { id: "whitewall", nameFr: "Murs-Blancs (Whitewall)", coords: { x: 38.0, y: 70.5 }, region: "pays_heort", isCityOrTown: true },

  // Grazelands / Pâturages
  { id: "queens_post", nameFr: "Poste de la Reine des Chevaux", coords: { x: 32.5, y: 44.5 }, region: "paturages", isCityOrTown: true },
  { id: "grazelands_junction", nameFr: "Croisée des Pâturages", coords: { x: 36.5, y: 37.0 }, region: "paturages" },

  // Prax & Wastes
  { id: "pavis_new", nameFr: "Nouvelle Pavis (Cité du Désert)", coords: { x: 84.5, y: 60.5 }, region: "comte_pavis", isCityOrTown: true, isPortOrFord: true },
  { id: "sun_dome_temple", nameFr: "Temple du Dôme du Soleil", coords: { x: 66.5, y: 69.5 }, region: "comte_soleil", isCityOrTown: true },
  { id: "prax_west_trail", nameFr: "Piste Occidentale de Prax", coords: { x: 72.0, y: 58.0 }, region: "prax" },
  { id: "moon_broo_oasis", nameFr: "Oasis de la Pierre Sacrée", coords: { x: 78.0, y: 51.0 }, region: "prax" },
  { id: "corflu", nameFr: "Corflu (Port Maritime du Zola Fel)", coords: { x: 89.0, y: 88.0 }, region: "prax", isCityOrTown: true, isPortOrFord: true },

  // Beast Valley
  { id: "beast_palace", nameFr: "Palais du Roi des Bêtes (Ironhoof)", coords: { x: 42.0, y: 62.0 }, region: "vallee_betes", isCityOrTown: true },
];

// =============================================================================
// 2. ROAD, TRAIL & WATERWAY SEGMENTS
// =============================================================================
export const DRAGON_PASS_ROAD_SEGMENTS: RoadSegment[] = [
  // Sartar Royal Road (Highway)
  { id: "r_nochet_karse", fromId: "nochet", toId: "karse", roadType: "royal_highway", terrainType: "paved_road", nameFr: "Voie Côtière d'Esrolia", distanceKm: 65, dangerLevel: 1 },
  { id: "r_karse_duckpoint", fromId: "karse", toId: "duckpoint", roadType: "trade_trail", terrainType: "swamp_marsh", nameFr: "Piste du Marais des Canards", distanceKm: 42, dangerLevel: 2 },
  { id: "r_duckpoint_wilmskirk", fromId: "duckpoint", toId: "wilmskirk", roadType: "royal_highway", terrainType: "paved_road", nameFr: "Grande Route du Sud de Sartar", distanceKm: 35, dangerLevel: 1 },
  { id: "r_wilmskirk_clearwine", fromId: "wilmskirk", toId: "clearwine", roadType: "royal_highway", terrainType: "hills_rocky", nameFr: "Voie Royale des Collines", distanceKm: 28, dangerLevel: 1 },
  { id: "r_clearwine_apple", fromId: "clearwine", toId: "apple_lane", roadType: "royal_highway", terrainType: "paved_road", nameFr: "Route des Vergers", distanceKm: 12, dangerLevel: 1 },
  { id: "r_apple_boldhome", fromId: "apple_lane", toId: "boldhome", roadType: "royal_highway", terrainType: "hills_rocky", nameFr: "Montée Sacrée de Boldhome", distanceKm: 15, dangerLevel: 1 },
  { id: "r_boldhome_jonville", fromId: "boldhome", toId: "jonville", roadType: "royal_highway", terrainType: "paved_road", nameFr: "Voie Royale Sartarite Nord", distanceKm: 38, dangerLevel: 1 },
  { id: "r_jonville_dangerford", fromId: "jonville", toId: "dangerford", roadType: "royal_highway", terrainType: "paved_road", nameFr: "Route du Fleuve Jouvence", distanceKm: 32, dangerLevel: 2 },
  { id: "r_dangerford_tarshcross", fromId: "dangerford", toId: "tarsh_crossroads", roadType: "royal_highway", terrainType: "paved_road", nameFr: "Chaussée Militaire de Tarsh", distanceKm: 40, dangerLevel: 2 },
  { id: "r_tarshcross_furthest", fromId: "tarsh_crossroads", toId: "furthest", roadType: "royal_highway", terrainType: "paved_road", nameFr: "Avenue Impériale Lunar", distanceKm: 45, dangerLevel: 1 },
  { id: "r_furthest_dunstop", fromId: "furthest", toId: "dunstop", roadType: "royal_highway", terrainType: "paved_road", nameFr: "Route de l'Oslir Ouest", distanceKm: 30, dangerLevel: 1 },

  // Waterways & River Navigation (Bateau)
  { id: "w_nochet_karse_sea", fromId: "nochet", toId: "karse", roadType: "sea_route", terrainType: "waterway_sea", nameFr: "Traversée Maritime de la Baie de Choralinthor", distanceKm: 55, dangerLevel: 1, isWaterway: true },
  { id: "w_karse_duckpoint_river", fromId: "karse", toId: "duckpoint", roadType: "river_ferry", terrainType: "waterway_river", nameFr: "Navigation du Fleuve Jouvence (Estuaire)", distanceKm: 40, dangerLevel: 2, isWaterway: true },
  { id: "w_duckpoint_jonville_river", fromId: "duckpoint", toId: "jonville", roadType: "river_ferry", terrainType: "waterway_river", nameFr: "Remontée Fluviale vers Jonville", distanceKm: 52, dangerLevel: 2, isWaterway: true },
  { id: "w_dangerford_furthest_river", fromId: "dangerford", toId: "furthest", roadType: "river_ferry", terrainType: "waterway_river", nameFr: "Descente Fluviale du Fleuve Oslir", distanceKm: 48, dangerLevel: 2, isWaterway: true },
  { id: "w_furthest_dunstop_river", fromId: "furthest", toId: "dunstop", roadType: "river_ferry", terrainType: "waterway_river", nameFr: "Navigation de l'Oslir Bas", distanceKm: 28, dangerLevel: 1, isWaterway: true },
  { id: "w_pavis_corflu_river", fromId: "pavis_new", toId: "corflu", roadType: "river_ferry", terrainType: "waterway_river", nameFr: "Descente du Berceau Fluvial (Fleuve Zola Fel)", distanceKm: 115, dangerLevel: 3, isWaterway: true },

  // Sartar East & Prax Trails
  { id: "r_boldhome_swenstown", fromId: "boldhome", toId: "swenstown", roadType: "trade_trail", terrainType: "dirt_trail", nameFr: "Piste Marchande d'Issaries", distanceKm: 55, dangerLevel: 2 },
  { id: "r_swenstown_praxtrail", fromId: "swenstown", toId: "prax_west_trail", roadType: "trade_trail", terrainType: "arid_plains", nameFr: "Piste des Caravanes Nomades", distanceKm: 48, dangerLevel: 3 },
  { id: "r_praxtrail_pavis", fromId: "prax_west_trail", toId: "pavis_new", roadType: "trade_trail", terrainType: "arid_plains", nameFr: "Grande Piste de Pavis", distanceKm: 58, dangerLevel: 3 },
  { id: "r_swenstown_sundome", fromId: "swenstown", toId: "sun_dome_temple", roadType: "trade_trail", terrainType: "dirt_trail", nameFr: "Piste des Cavaliers du Soleil", distanceKm: 50, dangerLevel: 2 },
  { id: "r_sundome_pavis", fromId: "sun_dome_temple", toId: "pavis_new", roadType: "trade_trail", terrainType: "arid_plains", nameFr: "Piste Fluviale du Zola Fel", distanceKm: 70, dangerLevel: 2 },

  // Mountain Passes & Cut-throughs
  { id: "r_boldhome_quivin", fromId: "boldhome", toId: "quivin_peak", roadType: "mountain_pass", terrainType: "mountain_pass", nameFr: "Sentier des Nuages d'Orlanth", distanceKm: 14, dangerLevel: 2 },
  { id: "r_boldhome_dragoneye", fromId: "boldhome", toId: "dragon_eye_pass", roadType: "mountain_pass", terrainType: "mountain_pass", nameFr: "Sentier de l'Éveil Draconique", distanceKm: 35, dangerLevel: 3 },
  { id: "r_dragoneye_swenstown", fromId: "dragon_eye_pass", toId: "swenstown", roadType: "trade_trail", terrainType: "hills_rocky", nameFr: "Piste de la Gorge de la Dent", distanceKm: 45, dangerLevel: 3 },
  { id: "r_boldhome_bullpass", fromId: "boldhome", toId: "bull_pass", roadType: "mountain_pass", terrainType: "mountain_pass", nameFr: "Passage du Taureau Tempête", distanceKm: 30, dangerLevel: 3 },
  { id: "r_bullpass_praxtrail", fromId: "bull_pass", toId: "prax_west_trail", roadType: "trade_trail", terrainType: "hills_rocky", nameFr: "Descente des Pics dans les Plaines", distanceKm: 52, dangerLevel: 4 },

  // Grazelands & Beast Valley
  { id: "r_jonville_grazelands", fromId: "jonville", toId: "grazelands_junction", roadType: "trade_trail", terrainType: "dirt_trail", nameFr: "Piste des Pâturages", distanceKm: 32, dangerLevel: 2 },
  { id: "r_grazelands_queens", fromId: "grazelands_junction", toId: "queens_post", roadType: "trade_trail", terrainType: "dirt_trail", nameFr: "Sentier des Poneys Pures-Races", distanceKm: 25, dangerLevel: 1 },
  { id: "r_queens_wilmskirk", fromId: "queens_post", toId: "wilmskirk", roadType: "trade_trail", terrainType: "hills_rocky", nameFr: "Piste des Centaures du Sud", distanceKm: 42, dangerLevel: 2 },
  { id: "r_wilmskirk_beast", fromId: "wilmskirk", toId: "beast_palace", roadType: "trade_trail", terrainType: "forest_woodland", nameFr: "Sentier de la Forêt des Bêtes", distanceKm: 22, dangerLevel: 2 },
  { id: "r_beast_duckpoint", fromId: "beast_palace", toId: "duckpoint", roadType: "trade_trail", terrainType: "swamp_marsh", nameFr: "Chemin des Roseaux", distanceKm: 20, dangerLevel: 2 },
  { id: "r_beast_whitewall", fromId: "beast_palace", toId: "whitewall", roadType: "trade_trail", terrainType: "hills_rocky", nameFr: "Piste Montagneuse des Kestrovings", distanceKm: 38, dangerLevel: 2 },
  { id: "r_whitewall_karse", fromId: "whitewall", toId: "karse", roadType: "trade_trail", terrainType: "dirt_trail", nameFr: "Descente de la Forteresse à la Mer", distanceKm: 34, dangerLevel: 1 },

  // North Trolls & Dark Trails
  { id: "r_tarshcross_snakepipe", fromId: "tarsh_crossroads", toId: "snakepipe_entry", roadType: "mountain_pass", terrainType: "chaos_wastes", nameFr: "Route Maudite du Trou de Serpent", distanceKm: 35, dangerLevel: 5 },
  { id: "r_snakepipe_dagori", fromId: "snakepipe_entry", toId: "dagori_pass", roadType: "mountain_pass", terrainType: "mountain_pass", nameFr: "Sentier des Ténèbres Trolleresses", distanceKm: 46, dangerLevel: 4 },
  { id: "r_dagori_stronghold", fromId: "dagori_pass", toId: "dagori_stronghold", roadType: "mountain_pass", terrainType: "hills_rocky", nameFr: "Accès aux Cavernes de Kyger Litor", distanceKm: 24, dangerLevel: 4 },
  { id: "r_praxtrail_moonoasis", fromId: "prax_west_trail", toId: "moon_broo_oasis", roadType: "trade_trail", terrainType: "arid_plains", nameFr: "Piste Sauvage du Nord de Prax", distanceKm: 40, dangerLevel: 4 },
];

// =============================================================================
// 3. MAP OBSTACLES & RESTRICTED ZONES (Mountains, Chaos, Cursed Swamps, Water)
// =============================================================================
export const DRAGON_PASS_MAP_OBSTACLES: MapObstacle[] = [
  {
    id: "obs_dragonspine",
    nameFr: "Crête de la Dent du Dragon (Impassable)",
    type: "mountain_ridge",
    polygon: [
      { x: 50.0, y: 32.0 },
      { x: 58.0, y: 36.0 },
      { x: 64.0, y: 44.0 },
      { x: 61.0, y: 49.0 },
      { x: 55.0, y: 43.0 },
      { x: 48.0, y: 36.0 },
    ],
    descriptionFr: "Gigantesque échine de montagne de roche calcaire acérée, infranchissable en ligne droite hors des cols gardés.",
    isImpassable: true,
    dangerPenalty: 50,
  },
  {
    id: "obs_snakepipe",
    nameFr: "Le Trou du Tuyau de Serpent (Nid du Chaos)",
    type: "chaos_nest",
    polygon: [
      { x: 50.5, y: 22.0 },
      { x: 56.5, y: 23.0 },
      { x: 55.0, y: 28.5 },
      { x: 49.0, y: 27.5 },
    ],
    descriptionFr: "Gouffre maudit grouillant de monstres du Chaos, de Broos venimeux et d'abominations indicibles.",
    isImpassable: false,
    dangerPenalty: 80,
  },
  {
    id: "obs_upland_marsh",
    nameFr: "Marais de l'Élévation (Delecti le Nécromancien)",
    type: "cursed_swamp",
    polygon: [
      { x: 34.0, y: 50.0 },
      { x: 39.5, y: 48.0 },
      { x: 41.0, y: 54.0 },
      { x: 35.5, y: 56.0 },
    ],
    descriptionFr: "Brumes fétides, zombies et goules sous le contrôle direct du sorcier immortel Delecti. Infranchissable pour les attelages.",
    isImpassable: false,
    dangerPenalty: 60,
  },
  {
    id: "obs_mirror_sea",
    nameFr: "Baie de la Mer Miroir (Eaux Profondes)",
    type: "deep_water",
    polygon: [
      { x: 0.0, y: 78.0 },
      { x: 26.0, y: 79.0 },
      { x: 28.0, y: 92.0 },
      { x: 32.0, y: 100.0 },
      { x: 0.0, y: 100.0 },
    ],
    descriptionFr: "Eaux marines profondes contrôlées par les Tritons et les cultes de la Mer. Nécessite un navire ou une traversée portuaire.",
    isImpassable: true,
    dangerPenalty: 100,
  },
  {
    id: "obs_rockwood",
    nameFr: "Monts Bois de Pierre (Rockwood)",
    type: "mountain_ridge",
    polygon: [
      { x: 60.0, y: 8.0 },
      { x: 92.0, y: 10.0 },
      { x: 90.0, y: 18.0 },
      { x: 58.0, y: 16.0 },
    ],
    descriptionFr: "Chaîne montagneuse glaciale séparant la Passe de Peloria.",
    isImpassable: true,
    dangerPenalty: 70,
  },
];

// =============================================================================
// 4. TRAVEL MODES & TERRAIN SENSITIVITY
// =============================================================================

export type TravelCategory = "marche" | "cheval" | "bateau" | "vol";

export type TravelMode =
  | "foot_normal"
  | "foot_scout"
  | "horse"
  | "prax_mount"
  | "wagon"
  | "boat_river"
  | "boat_sea"
  | "flight";

export interface TravelModeConfig {
  id: TravelMode;
  category: TravelCategory;
  nameFr: string;
  speedKmPerDay: number; // Base speed on standard dirt road in 1 day (8 hours)
  iconName: "Footprints" | "Zap" | "Compass" | "Package" | "Ship" | "Anchor" | "Wind";
  descriptionFr: string;
  isWaterMode?: boolean;
  terrainMultipliers: Record<TerrainType, number>;
}

export const TRAVEL_MODES: Record<TravelMode, TravelModeConfig> = {
  foot_normal: {
    id: "foot_normal",
    category: "marche",
    nameFr: "Marche à pied standard",
    speedKmPerDay: 25,
    iconName: "Footprints",
    descriptionFr: "Rythme de voyage ordinaire avec armure et barda (25 km/jour - 8h de marche).",
    terrainMultipliers: {
      paved_road: 1.2,
      dirt_trail: 1.0,
      hills_rocky: 0.8,
      mountain_pass: 0.6,
      waterway_river: 0.25, // Portage / traversée de gué lente
      waterway_sea: 0.05, // Impossible sans bateau
      swamp_marsh: 0.45,
      arid_plains: 0.9,
      forest_woodland: 0.75,
      chaos_wastes: 0.55,
    },
  },
  foot_scout: {
    id: "foot_scout",
    category: "marche",
    nameFr: "Marche rapide / Éclaireur",
    speedKmPerDay: 36,
    iconName: "Zap",
    descriptionFr: "Troupe légère, messagers ou éclaireurs aguerris (36 km/jour - 9h d'effort soutenu).",
    terrainMultipliers: {
      paved_road: 1.25,
      dirt_trail: 1.05,
      hills_rocky: 0.88,
      mountain_pass: 0.7,
      waterway_river: 0.3,
      waterway_sea: 0.05,
      swamp_marsh: 0.5,
      arid_plains: 0.95,
      forest_woodland: 0.85,
      chaos_wastes: 0.6,
    },
  },
  horse: {
    id: "horse",
    category: "cheval",
    nameFr: "À cheval (Cavalier)",
    speedKmPerDay: 50,
    iconName: "Compass",
    descriptionFr: "Cavalier monté sartarite ou tarshite sur monture de guerre ou de selle (50 km/jour).",
    terrainMultipliers: {
      paved_road: 1.3,
      dirt_trail: 1.0,
      hills_rocky: 0.7,
      mountain_pass: 0.45,
      waterway_river: 0.15,
      waterway_sea: 0.02,
      swamp_marsh: 0.25,
      arid_plains: 1.0,
      forest_woodland: 0.65,
      chaos_wastes: 0.5,
    },
  },
  prax_mount: {
    id: "prax_mount",
    category: "cheval",
    nameFr: "Monture Praxienne (Bison/Lama)",
    speedKmPerDay: 45,
    iconName: "Compass",
    descriptionFr: "Bête de selle des tribus nomades de Prax, taillée pour les steppes arides (45 km/jour).",
    terrainMultipliers: {
      paved_road: 1.1,
      dirt_trail: 1.0,
      hills_rocky: 0.75,
      mountain_pass: 0.5,
      waterway_river: 0.2,
      waterway_sea: 0.02,
      swamp_marsh: 0.3,
      arid_plains: 1.25, // Bonus fort en plaine aride
      forest_woodland: 0.6,
      chaos_wastes: 0.5,
    },
  },
  wagon: {
    id: "wagon",
    category: "cheval",
    nameFr: "Convoi / Chariot marchand",
    speedKmPerDay: 18,
    iconName: "Package",
    descriptionFr: "Attelage lourd d'Issaries chargé de marchandises (18 km/jour, très sensible aux routes).",
    terrainMultipliers: {
      paved_road: 1.25,
      dirt_trail: 0.85,
      hills_rocky: 0.45,
      mountain_pass: 0.15, // Presque infranchissable
      waterway_river: 0.1,
      waterway_sea: 0.01,
      swamp_marsh: 0.15,
      arid_plains: 0.7,
      forest_woodland: 0.4,
      chaos_wastes: 0.2,
    },
  },
  boat_river: {
    id: "boat_river",
    category: "bateau",
    nameFr: "Bateau fluvial / Barque de rivière",
    speedKmPerDay: 42,
    iconName: "Ship",
    descriptionFr: "Embarcation fluviale, chaland ou canot descendant le Jouvence, l'Oslir ou le Zola Fel (42 km/jour).",
    isWaterMode: true,
    terrainMultipliers: {
      paved_road: 0.1, // Doit être porté ou halé
      dirt_trail: 0.1,
      hills_rocky: 0.05,
      mountain_pass: 0.02,
      waterway_river: 1.45, // Grande vitesse sur les fleuves
      waterway_sea: 0.8, // Risqué en haute mer mais praticable
      swamp_marsh: 0.6, // Traversable par les canaux
      arid_plains: 0.05,
      forest_woodland: 0.05,
      chaos_wastes: 0.02,
    },
  },
  boat_sea: {
    id: "boat_sea",
    category: "bateau",
    nameFr: "Navire côtier / Galère en Mer Miroir",
    speedKmPerDay: 60,
    iconName: "Anchor",
    descriptionFr: "Navire marchand ou galère d'Esrolia naviguant entre Nochet, Karse et Choralinthor (60 km/jour).",
    isWaterMode: true,
    terrainMultipliers: {
      paved_road: 0.05,
      dirt_trail: 0.05,
      hills_rocky: 0.01,
      mountain_pass: 0.01,
      waterway_river: 0.9,
      waterway_sea: 1.5, // Idéal en mer
      swamp_marsh: 0.2,
      arid_plains: 0.01,
      forest_woodland: 0.01,
      chaos_wastes: 0.01,
    },
  },
  flight: {
    id: "flight",
    category: "vol",
    nameFr: "Vol magique / Sylphe d'Orlanth",
    speedKmPerDay: 600, // 80 km/h
    iconName: "Wind",
    descriptionFr: "Magie du culte d'Orlanth Vingthor ou créature ailée (80 km/h, survole tous les reliefs).",
    terrainMultipliers: {
      paved_road: 1.0,
      dirt_trail: 1.0,
      hills_rocky: 1.0,
      mountain_pass: 1.0,
      waterway_river: 1.0,
      waterway_sea: 1.0,
      swamp_marsh: 1.0,
      arid_plains: 1.0,
      forest_woodland: 1.0,
      chaos_wastes: 1.0,
    },
  },
};

export interface RouteTerrainBreakdown {
  terrainType: TerrainType;
  terrainNameFr: string;
  category: string;
  distanceKm: number;
  percentage: number;
  colorHex: string;
  badgeBg: string;
  badgeText: string;
  speedMultiplier: number;
}

export interface TravelModeComparison {
  modeId: TravelMode;
  modeNameFr: string;
  category: TravelCategory;
  travelDays: number;
  travelHours: number;
  feasibleDescription: string;
  isOptimal: boolean;
}

export interface RouteCalculationResult {
  nodes: RouteNode[];
  segments: RoadSegment[];
  totalDistanceKm: number;
  totalStades: number; // 1 km = 5.4 stades gloranthis
  totalLeagues: number; // 1 lieue = 4 km
  travelDays: number;
  travelHours: number; // calculated at 8 hours per standard travel day
  dangerScore: number; // 1 to 5
  dangerSummaryFr: string;
  weatherSpeedModifier: number; // e.g. 0.85 = -15% speed due to weather
  weatherSummaryFr: string;
  terrainBreakdowns: RouteTerrainBreakdown[];
  modeComparisons: TravelModeComparison[];
  logistics: {
    rationsNeededPerPerson: number;
    waterLitersPerPerson: number;
    campNights: number;
    recommendationFr: string;
  };
  stepDetails: {
    fromName: string;
    toName: string;
    distanceKm: number;
    roadTypeFr: string;
    terrainType: TerrainType;
    terrainNameFr: string;
    terrainSpeedFactor: number;
    stepDays: number;
    stepHours: number;
    regionNameFr: string;
    weatherType?: WeatherType;
    dangerLevel: number;
  }[];
}

// Helper: Calculate distance in KM between 2 percentage points on map
export const calculateCoordDistanceKm = (
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number => {
  const dx = ((p2.x - p1.x) / 100) * 320; // 320 km wide
  const dy = ((p2.y - p1.y) / 100) * 220; // 220 km high
  return Math.max(1, Math.round(Math.sqrt(dx * dx + dy * dy)));
};

// Helper: Find closest node to a custom coordinate
export const findClosestNode = (coord: { x: number; y: number }): RouteNode => {
  let closest = DRAGON_PASS_ROUTE_NODES[0];
  let minDistance = Infinity;

  for (const node of DRAGON_PASS_ROUTE_NODES) {
    const dist = calculateCoordDistanceKm(coord, node.coords);
    if (dist < minDistance) {
      minDistance = dist;
      closest = node;
    }
  }
  return closest;
};

// A* Graph Search between StartNode and TargetNode with comprehensive Terrain and Travel Mode calculations
export const computeOptimalRoute = (
  startCoord: { x: number; y: number; name?: string; id?: string },
  targetCoord: { x: number; y: number; name?: string; id?: string },
  options: {
    travelMode: TravelMode;
    avoidChaosAndSwamps?: boolean;
    regionWeathers?: Partial<Record<RegionKey, { weatherType: WeatherType }>>;
    partySize?: number;
  }
): RouteCalculationResult => {
  const { travelMode, avoidChaosAndSwamps = false, regionWeathers = {}, partySize = 4 } = options;

  const currentModeConfig = TRAVEL_MODES[travelMode];

  // Direct Flight calculation (Flight ignores obstacles and terrain)
  if (travelMode === "flight") {
    const distKm = calculateCoordDistanceKm(startCoord, targetCoord);
    const hours = Math.round((distKm / 80) * 10) / 10;
    const days = Math.round((hours / 8) * 10) / 10;

    const startNode: RouteNode = {
      id: startCoord.id || "start",
      nameFr: startCoord.name || "Point de Départ",
      coords: { x: startCoord.x, y: startCoord.y },
      region: "sartar",
    };
    const targetNode: RouteNode = {
      id: targetCoord.id || "target",
      nameFr: targetCoord.name || "Destination",
      coords: { x: targetCoord.x, y: targetCoord.y },
      region: "sartar",
    };

    const flightSegment: RoadSegment = {
      id: "flight_direct",
      fromId: startNode.id,
      toId: targetNode.id,
      roadType: "wild_trail",
      terrainType: "mountain_pass",
      nameFr: "Vol Magique Aérien Direct",
      distanceKm: distKm,
      dangerLevel: 2,
    };

    const comparisons: TravelModeComparison[] = (Object.keys(TRAVEL_MODES) as TravelMode[]).map((mKey) => {
      const mCfg = TRAVEL_MODES[mKey];
      const mDays = Math.round((distKm / mCfg.speedKmPerDay) * 10) / 10;
      return {
        modeId: mKey,
        modeNameFr: mCfg.nameFr,
        category: mCfg.category,
        travelDays: mDays,
        travelHours: Math.round(mDays * 8 * 10) / 10,
        feasibleDescription: mKey === "flight" ? "Trajet direct par les airs" : "Estimation vol d'oiseau",
        isOptimal: mKey === "flight",
      };
    });

    return {
      nodes: [startNode, targetNode],
      segments: [flightSegment],
      totalDistanceKm: distKm,
      totalStades: Math.round(distKm * 5.4),
      totalLeagues: Math.round((distKm / 4) * 10) / 10,
      travelDays: Math.max(0.1, days),
      travelHours: Math.max(0.5, hours),
      dangerScore: 2,
      dangerSummaryFr: "Vol aérien - Évite le relief mais s'expose aux esprits des vents et prédateurs d'Orlanth.",
      weatherSpeedModifier: 1.0,
      weatherSummaryFr: "Conditions atmosphériques favorables en haute altitude.",
      terrainBreakdowns: [
        {
          terrainType: "mountain_pass",
          terrainNameFr: "Ciel & Hautes Altitudes",
          category: "facile",
          distanceKm: distKm,
          percentage: 100,
          colorHex: "#38bdf8",
          badgeBg: "bg-sky-500/20",
          badgeText: "text-sky-300",
          speedMultiplier: 1.0,
        },
      ],
      modeComparisons: comparisons,
      logistics: {
        rationsNeededPerPerson: Math.ceil(days * 2),
        waterLitersPerPerson: Math.ceil(days * 2.5),
        campNights: Math.floor(days),
        recommendationFr: "Vol magique direct : très peu de vivres nécessaires, veillez aux tempêtes en altitude.",
      },
      stepDetails: [
        {
          fromName: startNode.nameFr,
          toName: targetNode.nameFr,
          distanceKm: distKm,
          roadTypeFr: "Vol Aérien Direct",
          terrainType: "mountain_pass",
          terrainNameFr: "Haute Altitude",
          terrainSpeedFactor: 1.0,
          stepDays: days,
          stepHours: hours,
          regionNameFr: "Passe du Dragon",
          dangerLevel: 2,
        },
      ],
    };
  }

  // 1. Identify start and end nodes on graph
  let startNode = DRAGON_PASS_ROUTE_NODES.find((n) => n.id === startCoord.id);
  if (!startNode) {
    startNode = findClosestNode(startCoord);
  }

  let targetNode = DRAGON_PASS_ROUTE_NODES.find((n) => n.id === targetCoord.id);
  if (!targetNode) {
    targetNode = findClosestNode(targetCoord);
  }

  // 2. Build adjacency graph with terrain weights
  const adj = new Map<string, { segment: RoadSegment; neighborId: string; weight: number }[]>();
  for (const node of DRAGON_PASS_ROUTE_NODES) {
    adj.set(node.id, []);
  }

  for (const seg of DRAGON_PASS_ROAD_SEGMENTS) {
    let weight = seg.distanceKm;

    const terrainMultiplier = currentModeConfig.terrainMultipliers[seg.terrainType] || 1.0;

    // Weight is inversely proportional to terrain speed
    // If terrainMultiplier is 1.4 (fast), weight is divided by 1.4 (lower cost)
    // If terrainMultiplier is 0.2 (very slow/impassable), weight is divided by 0.2 (huge cost 5x)
    weight = weight / Math.max(0.05, terrainMultiplier);

    // Water mode preferences
    if (currentModeConfig.isWaterMode) {
      if (seg.isWaterway) {
        weight *= 0.6; // Heavy preference for rivers/sea
      } else {
        weight *= 4.0; // High penalty for hauling boat on land
      }
    } else {
      if (seg.isWaterway && seg.roadType === "sea_route") {
        weight *= 10.0; // Terrestrial modes cannot walk on deep sea
      }
    }

    // Danger penalty if avoiding chaos/swamps
    if (avoidChaosAndSwamps) {
      if (seg.dangerLevel >= 4) {
        weight *= 4.0;
      }
      if (seg.terrainType === "chaos_wastes" || seg.terrainType === "swamp_marsh") {
        weight *= 3.0;
      }
    }

    // Weather penalty along segment
    const fromNode = DRAGON_PASS_ROUTE_NODES.find((n) => n.id === seg.fromId);
    if (fromNode) {
      const regWeather = regionWeathers[fromNode.region]?.weatherType;
      if (regWeather === "blizzard" || regWeather === "torrential_rain") {
        weight *= 1.6;
      } else if (regWeather === "dust_storm" || regWeather === "thunderstorm") {
        weight *= 1.35;
      }
    }

    adj.get(seg.fromId)?.push({ segment: seg, neighborId: seg.toId, weight });
    adj.get(seg.toId)?.push({ segment: seg, neighborId: seg.fromId, weight });
  }

  // 3. Dijkstra's Algorithm
  const distances = new Map<string, number>();
  const previousNode = new Map<string, string | null>();
  const previousSegment = new Map<string, RoadSegment | null>();
  const unvisited = new Set<string>();

  for (const node of DRAGON_PASS_ROUTE_NODES) {
    distances.set(node.id, Infinity);
    previousNode.set(node.id, null);
    previousSegment.set(node.id, null);
    unvisited.add(node.id);
  }

  distances.set(startNode.id, 0);

  while (unvisited.size > 0) {
    let currentId: string | null = null;
    let shortestDist = Infinity;

    for (const nodeId of unvisited) {
      const d = distances.get(nodeId)!;
      if (d < shortestDist) {
        shortestDist = d;
        currentId = nodeId;
      }
    }

    if (currentId === null || shortestDist === Infinity) break;
    if (currentId === targetNode.id) break;

    unvisited.delete(currentId);

    const neighbors = adj.get(currentId) || [];
    for (const edge of neighbors) {
      if (!unvisited.has(edge.neighborId)) continue;
      const newDist = shortestDist + edge.weight;
      if (newDist < distances.get(edge.neighborId)!) {
        distances.set(edge.neighborId, newDist);
        previousNode.set(edge.neighborId, currentId);
        previousSegment.set(edge.neighborId, edge.segment);
      }
    }
  }

  // 4. Reconstruct path
  const pathNodes: RouteNode[] = [];
  const pathSegments: RoadSegment[] = [];
  let curr: string | null = targetNode.id;

  while (curr !== null) {
    const nodeObj = DRAGON_PASS_ROUTE_NODES.find((n) => n.id === curr);
    if (nodeObj) pathNodes.unshift(nodeObj);

    const seg = previousSegment.get(curr);
    if (seg) pathSegments.unshift(seg);

    curr = previousNode.get(curr) || null;
  }

  // If start node isn't in path, fallback to direct connection
  if (pathNodes.length === 0 || pathNodes[0].id !== startNode.id) {
    pathNodes.splice(0, pathNodes.length, startNode, targetNode);
  }

  // Calculate real total distance from segments
  let totalDistanceKm = 0;
  if (pathSegments.length > 0) {
    totalDistanceKm = pathSegments.reduce((acc, s) => acc + s.distanceKm, 0);
  } else {
    totalDistanceKm = calculateCoordDistanceKm(startNode.coords, targetNode.coords);
  }

  // Weather modifier calculation along path
  let totalWeatherSpeedModifier = 1.0;
  const weatherIssues: string[] = [];

  pathNodes.forEach((node) => {
    const wType = regionWeathers[node.region]?.weatherType;
    if (wType === "blizzard") {
      totalWeatherSpeedModifier = Math.min(totalWeatherSpeedModifier, 0.5);
      weatherIssues.push(`Blizzard glacial en ${node.region}`);
    } else if (wType === "torrential_rain") {
      totalWeatherSpeedModifier = Math.min(totalWeatherSpeedModifier, 0.65);
      weatherIssues.push(`Pluie torrentielle en ${node.region}`);
    } else if (wType === "dust_storm") {
      totalWeatherSpeedModifier = Math.min(totalWeatherSpeedModifier, 0.7);
      weatherIssues.push(`Tempête de poussière en ${node.region}`);
    } else if (wType === "thunderstorm") {
      totalWeatherSpeedModifier = Math.min(totalWeatherSpeedModifier, 0.75);
      weatherIssues.push(`Orage violent en ${node.region}`);
    }
  });

  // Calculate detailed step travel times based on each segment's terrain
  let calculatedTotalDays = 0;
  const terrainKmMap = new Map<TerrainType, number>();

  const roadTypeNames: Record<RoadType, string> = {
    royal_highway: "Voie Royale Pavée",
    trade_trail: "Piste Marchande",
    mountain_pass: "Col de Montagne",
    river_ferry: "Voie Fluviale / Bac",
    sea_route: "Traversée Maritime",
    wild_trail: "Sentier Sauvage",
  };

  const stepDetails = pathSegments.map((seg) => {
    const fromNode = DRAGON_PASS_ROUTE_NODES.find((n) => n.id === seg.fromId);
    const toNode = DRAGON_PASS_ROUTE_NODES.find((n) => n.id === seg.toId);
    const terrainCfg = TERRAIN_CONFIGS[seg.terrainType] || TERRAIN_CONFIGS.dirt_trail;
    const terrainSpeedMultiplier = currentModeConfig.terrainMultipliers[seg.terrainType] || 1.0;

    // Daily speed for this segment = baseSpeed * terrainMultiplier * weather
    const segmentSpeedPerDay = currentModeConfig.speedKmPerDay * terrainSpeedMultiplier * totalWeatherSpeedModifier;
    const stepDays = Math.max(0.05, Math.round((seg.distanceKm / segmentSpeedPerDay) * 100) / 100);
    const stepHours = Math.round(stepDays * 8 * 10) / 10;

    calculatedTotalDays += stepDays;
    terrainKmMap.set(seg.terrainType, (terrainKmMap.get(seg.terrainType) || 0) + seg.distanceKm);

    return {
      fromName: fromNode?.nameFr || seg.fromId,
      toName: toNode?.nameFr || seg.toId,
      distanceKm: seg.distanceKm,
      roadTypeFr: roadTypeNames[seg.roadType] || seg.roadType,
      terrainType: seg.terrainType,
      terrainNameFr: terrainCfg.nameFr,
      terrainSpeedFactor: terrainSpeedMultiplier,
      stepDays: Math.round(stepDays * 10) / 10,
      stepHours,
      regionNameFr: fromNode?.region || "Passe du Dragon",
      weatherType: fromNode ? regionWeathers[fromNode.region]?.weatherType : undefined,
      dangerLevel: seg.dangerLevel,
    };
  });

  const finalTravelDays = Math.max(0.1, Math.round(calculatedTotalDays * 10) / 10);
  const finalTravelHours = Math.round(finalTravelDays * 8 * 10) / 10;

  // Build terrain breakdown statistics
  const terrainBreakdowns: RouteTerrainBreakdown[] = [];
  terrainKmMap.forEach((km, tType) => {
    const cfg = TERRAIN_CONFIGS[tType] || TERRAIN_CONFIGS.dirt_trail;
    const pct = Math.round((km / Math.max(1, totalDistanceKm)) * 100);
    terrainBreakdowns.push({
      terrainType: tType,
      terrainNameFr: cfg.nameFr,
      category: cfg.category,
      distanceKm: km,
      percentage: pct,
      colorHex: cfg.colorHex,
      badgeBg: cfg.badgeBg,
      badgeText: cfg.badgeText,
      speedMultiplier: currentModeConfig.terrainMultipliers[tType] || 1.0,
    });
  });

  // Sort breakdowns by distance descending
  terrainBreakdowns.sort((a, b) => b.distanceKm - a.distanceKm);

  // Danger rating
  let maxDanger: number = 1;
  pathSegments.forEach((s) => {
    if (s.dangerLevel > maxDanger) maxDanger = s.dangerLevel;
  });

  let dangerSummaryFr = "Itinéraire très sûr empruntant les voies royales patrouillées.";
  if (maxDanger === 2) dangerSummaryFr = "Route marchande standard, attention aux péages et bandits occasionnels.";
  if (maxDanger === 3) dangerSummaryFr = "Sentiers de terre et passages isolés, gardes et éclaireurs recommandés.";
  if (maxDanger === 4) dangerSummaryFr = "Zone périlleuse traversant des repaires hostiles (Trolls, nomades pillards).";
  if (maxDanger === 5) dangerSummaryFr = "Péril extrême ! Traversée à proximité du Chaos de Snakepipe ou des Marais Maudits.";

  // Mode comparisons for all transport types across this path
  const modeComparisons: TravelModeComparison[] = (Object.keys(TRAVEL_MODES) as TravelMode[]).map((mKey) => {
    const mCfg = TRAVEL_MODES[mKey];
    let mTotalDays = 0;

    pathSegments.forEach((seg) => {
      const segMultiplier = mCfg.terrainMultipliers[seg.terrainType] || 1.0;
      const segSpeed = mCfg.speedKmPerDay * segMultiplier * totalWeatherSpeedModifier;
      mTotalDays += seg.distanceKm / Math.max(1, segSpeed);
    });

    if (pathSegments.length === 0) {
      mTotalDays = totalDistanceKm / (mCfg.speedKmPerDay * totalWeatherSpeedModifier);
    }

    const roundedDays = Math.max(0.1, Math.round(mTotalDays * 10) / 10);
    const roundedHours = Math.round(roundedDays * 8 * 10) / 10;

    let feasible = "Praticable sur ce tracé";
    if (mKey === "wagon" && terrainKmMap.has("mountain_pass")) {
      feasible = "Très difficile pour chariots lourds (cols montagneux)";
    } else if (mCfg.isWaterMode && !pathSegments.some((s) => s.isWaterway)) {
      feasible = "Nécessite halage terrestre ou cours d'eau";
    } else if (mKey === "horse" && terrainKmMap.has("swamp_marsh")) {
      feasible = "Ralentissement important dans les marais";
    }

    return {
      modeId: mKey,
      modeNameFr: mCfg.nameFr,
      category: mCfg.category,
      travelDays: roundedDays,
      travelHours: roundedHours,
      feasibleDescription: feasible,
      isOptimal: mKey === travelMode,
    };
  });

  // Logistics computation
  const campNights = Math.max(0, Math.ceil(finalTravelDays) - 1);
  const isDesertTraversed = terrainKmMap.has("arid_plains");
  const waterLitersPerPerson = isDesertTraversed
    ? Math.ceil(finalTravelDays * 4.0) // 4L/day in arid Prax
    : Math.ceil(finalTravelDays * 2.0); // 2L/day elsewhere

  const rationsNeededPerPerson = Math.ceil(finalTravelDays * 2); // 2 rations per day

  let logisticsAdvice = "Itinéraire classique avec auberges d'Issaries et points d'eau réguliers.";
  if (isDesertTraversed) {
    logisticsAdvice = "Traversée des steppes de Prax : prévoyez le double d'outres d'eau et des tentes contre le soleil.";
  } else if (terrainKmMap.has("mountain_pass")) {
    logisticsAdvice = "Traversée de cols d'altitude : emportez manteaux chauds, cordes et graisse contre les engelures.";
  } else if (terrainKmMap.has("swamp_marsh")) {
    logisticsAdvice = "Traversée de marais fétides : onguents contre la pourriture des marais et torches recommandés.";
  }

  return {
    nodes: pathNodes,
    segments: pathSegments,
    totalDistanceKm,
    totalStades: Math.round(totalDistanceKm * 5.4),
    totalLeagues: Math.round((totalDistanceKm / 4) * 10) / 10,
    travelDays: finalTravelDays,
    travelHours: finalTravelHours,
    dangerScore: maxDanger,
    dangerSummaryFr,
    weatherSpeedModifier: totalWeatherSpeedModifier,
    weatherSummaryFr:
      weatherIssues.length > 0
        ? `Ralentissement météo : ${weatherIssues.join(", ")}`
        : "Conditions météo favorables le long du trajet",
    terrainBreakdowns,
    modeComparisons,
    logistics: {
      rationsNeededPerPerson,
      waterLitersPerPerson,
      campNights,
      recommendationFr: logisticsAdvice,
    },
    stepDetails,
  };
};
