export type POICategory =
  | "city"
  | "temple"
  | "ruin"
  | "peril"
  | "nature"
  | "landmark"
  | "fortress"
  | "shrine"
  | "tomb"
  | "bridge"
  | "settlement"
  | "mine"
  | "market";

export type RegionKey =
  | "sartar"
  | "tarsh"
  | "prax"
  | "esrolia"
  | "paturages"
  | "vallee_betes"
  | "dagori_inkarth"
  | "pays_heort"
  | "comte_soleil"
  | "comte_pavis"
  | "autres";

export interface RuneInfo {
  id: string;
  nameFr: string;
  nameEn: string;
  symbol: string;
  category: "element" | "power" | "condition" | "form";
  description: string;
  associatedGods: string[];
  personalityTraits?: string;
  color: string;
}

export interface PointOfInterest {
  id: string;
  nameFr: string;
  nameEn: string;
  region: RegionKey;
  regionLabelFr: string;
  category: POICategory;
  coords: { x: number; y: number }; // Relative percentage (0-100)
  runes: string[]; // Rune IDs
  summary: string;
  detailedLore: string;
  gmSecrets?: string;
  adventureHooks?: string[];
  factions?: string[];
  leader?: string;
  population?: string;
  wikiTitle?: string;
  dangerLevel?: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
  isCustom?: boolean;
  isModified?: boolean;
  color?: string;
  images?: string[]; // Array of base64 data URLs or image URLs
  coverImage?: string; // Main banner / featured image URL
  customIconImage?: string; // Custom image for the map marker icon (data URL or external URL)
  iconShape?: "circle" | "shield" | "square" | "pin"; // Shape of the map marker
  iconSize?: "sm" | "md" | "lg" | "xl"; // Size of the map marker (sm=18px, md=26px, lg=36px, xl=48px)
  iconBorderColor?: string; // Custom border / ring color for the marker
  isTransparentIcon?: boolean; // When true, renders with translucent / transparent background
  iconOpacity?: number; // Custom opacity (0.2 to 1)
  iconStyle?: "standard" | "transparent" | "minimal_ring" | "glow_rune"; // Marker appearance style
}

export interface MapBackgroundConfig {
  type: "default_svg" | "pdf" | "image";
  pdfDataUrl?: string; // base64 / blob image of rendered PDF page
  pdfFileName?: string;
  pdfPageIndex?: number; // 1-based page number
  pdfTotalPages?: number;
  pdfScale?: number; // render quality (1.5, 2, 2.5)
  pdfFitMode?: "contain" | "cover" | "fill";
  opacity?: number; // 0 to 1
  brightness?: number; // 0.5 to 1.5
  contrast?: number; // 0.5 to 1.5
}

export type TacticalRouteStyle =
  | "animated_dots"
  | "animated_dash"
  | "marching_arrows"
  | "glowing_pulse"
  | "caravan_tracks";

export type TacticalTravelMode =
  | "walking"
  | "mounted"
  | "caravan"
  | "forced_march"
  | "flight";

export interface TacticalWaypoint {
  x: number;
  y: number;
  poiId?: string;
  name: string;
}

export interface MapDrawingElement {
  id: string;
  type: "freehand" | "line" | "arrow" | "rect" | "circle" | "label" | "stamp" | "tactical_route";
  points?: { x: number; y: number }[]; // In map coords (0-100%)
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
  fillColor?: string;
  strokeWidth: number;
  text?: string;
  fontSize?: number;
  stampSymbol?: string; // Rune / icon ID (e.g. 'air', 'death', 'chaos', 'camp', 'skull')
  createdAt: string;
  label?: string;

  // Tactical Route Attributes
  routeWaypoints?: TacticalWaypoint[];
  routeSpeed?: "slow" | "normal" | "fast";
  routeStyle?: TacticalRouteStyle;
  travelMode?: TacticalTravelMode;
  totalDistanceKm?: number;
  totalDistanceStades?: number;
  isAnimated?: boolean;
  reverseDirection?: boolean;
}

export interface MapRadiusZone {
  id: string;
  name: string;
  type: "magic_aura" | "chaos_terror" | "watch_tower" | "war_drum" | "custom_zone";
  center: { x: number; y: number }; // In percentage coords (0-100%)
  radiusKm: number;
  radiusStades: number;
  color: string;
  strokeColor: string;
  fillOpacity: number;
  label?: string;
  description?: string;
  visible: boolean;
  pulseAnimation?: boolean;
}

export type MapFloorLevel = 0 | 1 | 2 | 3; // 0: Surface/Topo, 1: Spiritual/Rune Lines, 2: Underground/Dungeons, 3: Political/Factions

export interface CustomPin {
  id: string;
  name: string;
  category: POICategory;
  x: number;
  y: number;
  note: string;
  status: "visited" | "pending" | "danger" | "quest";
  color?: string;
  createdAt: string;
}

export interface HeroCharacter {
  id: string;
  name: string;
  playerName: string;
  tribu: string;
  cult: string;
  runes: { rune: string; value: number }[];
  passions: { name: string; value: number }[];
  hpCurrent: number;
  hpMax: number;
  magicPoints: number;
  runePoints: number;
  reputation: number;
  notes: string;
}

export interface QuestObjective {
  id: string;
  text: string;
  done: boolean;
}

export interface Quest {
  id: string;
  title: string;
  act: string;
  region: RegionKey;
  status: "active" | "completed" | "failed" | "paused";
  description: string;
  objectives: QuestObjective[];
  rewards?: string;
  npcsInvolved?: string[];
  threats?: string;
  linkedPoiId?: string;
}

export interface ThreatClock {
  id: string;
  title: string;
  current: number;
  max: number;
  faction: string;
  description: string;
}

export interface GMNote {
  id: string;
  title: string;
  category: "session" | "lore" | "npc" | "clue" | "secret" | "rule";
  content: string;
  linkedPoiId?: string;
  linkedQuestId?: string;
  updatedAt: string;
  tags: string[];
}

export interface ChronicleEntry {
  id: string;
  date: string;
  gloranthaDate: string;
  title: string;
  text: string;
  heroesInvolved?: string[];
}

export interface GloranthaCalendar {
  year: number; // e.g. 1625
  seasonIndex: number; // 0 to 5 (Mer, Feu, Terre, Obscurité, Tempêtes, Temps Sacré)
  weekNumber: number; // 1 to 8 (or 1 to 2 for Sacred Time)
  dayIndex: number; // 0 to 6
}

export type WeatherType =
  | "clear_sky"
  | "gentle_breeze"
  | "heavy_clouds"
  | "drizzle"
  | "torrential_rain"
  | "thunderstorm"
  | "heatwave"
  | "dust_storm"
  | "thick_fog"
  | "freezing_chill"
  | "blizzard"
  | "mystic_aurora"
  | "ash_and_smoke";

export interface WeatherEffect {
  travelSpeedMultiplier: number; // e.g. 1.0 (normal), 0.75 (-25%), 0.5 (-50%), 0.25 (-75%), 1.2 (+20%)
  travelSpeedLabelFr: string;
  combatRangeModifier: number; // e.g. -20 (-20% to missile / archery)
  perceptionModifier: number; // e.g. -30 (-30% to scan/listen)
  magicRunesBonus?: { rune: string; bonus: number }[]; // e.g. +10% air magic
  fatigueRisk: boolean; // requires CON check against extreme cold/heat
  fatigueIntervalHours?: number;
  descriptionFr: string;
  mechanicalNotesFr: string;
}

export interface RegionWeatherState {
  region: RegionKey;
  weatherType: WeatherType;
  temperature: "glacial" | "froid" | "frais" | "tempere" | "chaud" | "torride";
  wind: "nul" | "brise" | "vent_fort" | "bourrasque" | "tempete_violente";
  precipitation: "aucune" | "brume" | "pluie_fine" | "averse" | "orage" | "neige" | "blizzard";
  customNote?: string;
}

export interface WeatherSystemState {
  selectedRegion: RegionKey;
  regionWeathers: Partial<Record<RegionKey, RegionWeatherState>>;
  isAutoSeasonSync: boolean;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  calendar: GloranthaCalendar;
  heroes: HeroCharacter[];
  quests: Quest[];
  notes: GMNote[];
  favorites: string[]; // List of POI IDs
  customPins: CustomPin[];
  customLocations?: PointOfInterest[];
  drawings?: MapDrawingElement[];
  radiusZones?: MapRadiusZone[];
  mapBackground?: MapBackgroundConfig;
  threatClocks: ThreatClock[];
  chronicles: ChronicleEntry[];
  weather?: WeatherSystemState;
  lastSaved: string;
}

export interface GloranthaCult {
  id: string;
  name: string;
  pantheon: string;
  runes: string[];
  summary: string;
  skillsTaught: string[];
  magicSpells: string[];
  holyDays: string;
  allies: string[];
  enemies: string[];
}
