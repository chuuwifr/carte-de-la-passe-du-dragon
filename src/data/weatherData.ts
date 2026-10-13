import { RegionKey, WeatherType, WeatherEffect, RegionWeatherState } from "../types";

export interface WeatherMeta {
  type: WeatherType;
  nameFr: string;
  nameEn: string;
  iconName: string; // lucide icon identifier
  badgeColor: string;
  associatedRune: string; // air, water, fire, darkness, earth, etc.
  effect: WeatherEffect;
  loreDescriptionFr: string;
}

export const GLORANTHA_WEATHER_CATALOG: Record<WeatherType, WeatherMeta> = {
  clear_sky: {
    type: "clear_sky",
    nameFr: "Ciel Dégagé & Éclat Solaire",
    nameEn: "Clear & Bright Sky",
    iconName: "Sun",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    associatedRune: "fire",
    effect: {
      travelSpeedMultiplier: 1.0,
      travelSpeedLabelFr: "Vitesse normale (100%)",
      combatRangeModifier: 0,
      perceptionModifier: 0,
      magicRunesBonus: [{ rune: "fire", bonus: 5 }],
      fatigueRisk: false,
      descriptionFr: "Conditions idéales pour la marche et l'observation au loin.",
      mechanicalNotesFr: "Aucun malus. Visibilité maximale (jusqu'à 30 km depuis les hauteurs). Sorts solaires et de Feu légèrement exaltés (+5%).",
    },
    loreDescriptionFr:
      "Le regard de Yelm et de Yelmalio brille sans entrave sur les collines. Les dieux de la lumière bénissent les voyageurs et les veilleurs de crête.",
  },
  gentle_breeze: {
    type: "gentle_breeze",
    nameFr: "Brise Vivifiante d'Orlanth",
    nameEn: "Gentle Refreshing Breeze",
    iconName: "Wind",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    associatedRune: "air",
    effect: {
      travelSpeedMultiplier: 1.15,
      travelSpeedLabelFr: "Marche facilitée (+15%)",
      combatRangeModifier: 0,
      perceptionModifier: 0,
      magicRunesBonus: [{ rune: "air", bonus: 5 }],
      fatigueRisk: false,
      descriptionFr: "Un air vif qui repousse la fatigue des porteurs et des montures.",
      mechanicalNotesFr: "Bonus de +15% sur la distance parcourue par jour. Jets de fatigue espacés de 2h supplémentaires.",
    },
    loreDescriptionFr:
      "Le souffle amical du Vent des Voyageurs pousse les capes des Héortlings et apporte les nouvelles des clans voisins.",
  },
  heavy_clouds: {
    type: "heavy_clouds",
    nameFr: "Ciel Lourd & Nuées d'Orage",
    nameEn: "Overcast & Heavy Cloudbank",
    iconName: "Cloud",
    badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/40",
    associatedRune: "air",
    effect: {
      travelSpeedMultiplier: 0.9,
      travelSpeedLabelFr: "Légère baisse de cadence (-10%)",
      combatRangeModifier: 0,
      perceptionModifier: -5,
      magicRunesBonus: [{ rune: "air", bonus: 5 }],
      fatigueRisk: false,
      descriptionFr: "Ciel bas et ombragé, lumière diffuse masquant les reliefs lointains.",
      mechanicalNotesFr: "Perception à longue distance -5%. Les ombres trompeuses gênent l'orientation sans boussole astrale.",
    },
    loreDescriptionFr:
      "Des masses nuageuses bleu-sombre descendent des monts Quivin et de Kero Fin, annonçant les manœuvres des esprits de l'air.",
  },
  drizzle: {
    type: "drizzle",
    nameFr: "Bruine Féconde d'Heler",
    nameEn: "Fertile Rain & Drizzle",
    iconName: "CloudDrizzle",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    associatedRune: "water",
    effect: {
      travelSpeedMultiplier: 0.85,
      travelSpeedLabelFr: "Sentiers glissants (-15%)",
      combatRangeModifier: -5,
      perceptionModifier: -10,
      magicRunesBonus: [
        { rune: "water", bonus: 10 },
        { rune: "plant", bonus: 5 },
      ],
      fatigueRisk: false,
      descriptionFr: "Pluie fine continue nourrissant la terre et trempant les bagages.",
      mechanicalNotesFr: "Équitation et Athlétisme -10% sur pentes boueuses. Tirs d'archerie -5% (cordes humides).",
    },
    loreDescriptionFr:
      "Heler le dieu de la pluie répand ses gouttes nourricières sur les vergers et les pâturages sartariens.",
  },
  torrential_rain: {
    type: "torrential_rain",
    nameFr: "Déluge & Torrents en Crue",
    nameEn: "Torrential Downpour & Floods",
    iconName: "CloudRain",
    badgeColor: "bg-blue-600/25 text-blue-300 border-blue-500/50",
    associatedRune: "water",
    effect: {
      travelSpeedMultiplier: 0.6,
      travelSpeedLabelFr: "Progression lente et pénible (-40%)",
      combatRangeModifier: -20,
      perceptionModifier: -20,
      magicRunesBonus: [{ rune: "water", bonus: 15 }],
      fatigueRisk: true,
      fatigueIntervalHours: 4,
      descriptionFr: "Gués inondés, chemins transformés en bourbiers, feux de camp impossibles sans magie.",
      mechanicalNotesFr: "Combat à distance -20%. Jets de Vue/Écoute -20%. Traversée des gués exige un jet d'Athlétisme ou de Natation.",
    },
    loreDescriptionFr:
      "Les dieux fleuves gonflent avec fracas. Les ruisseaux ordinaires deviennent des torrents mugissants emportant bétail et pontons de fortune.",
  },
  thunderstorm: {
    type: "thunderstorm",
    nameFr: "Orage Sacré d'Orlanth & Foudre",
    nameEn: "Sacred Thunderstorm of Orlanth",
    iconName: "Zap",
    badgeColor: "bg-amber-400/20 text-amber-200 border-amber-400/50",
    associatedRune: "air",
    effect: {
      travelSpeedMultiplier: 0.5,
      travelSpeedLabelFr: "Déplacement très périlleux (-50%)",
      combatRangeModifier: -30,
      perceptionModifier: -25,
      magicRunesBonus: [
        { rune: "air", bonus: 20 },
        { rune: "movement", bonus: 10 },
      ],
      fatigueRisk: true,
      fatigueIntervalHours: 3,
      descriptionFr: "Éclairs déchirant le ciel, tonnerre assourdissant, vents violents brisant les branches.",
      mechanicalNotesFr: "Tirs d'archerie -30%. Sorts du Culte d'Orlanth à +20%. Risque de foudre sur les armures métalliques exposées (1d100 sous 05%).",
    },
    loreDescriptionFr:
      "Orlanth frappe les collines de ses marteaux célestes ! Les initiés des tempêtes hurlent leur allégresse tandis que les créatures des ténèbres se terrent.",
  },
  heatwave: {
    type: "heatwave",
    nameFr: "Canicule Torride & Mirages",
    nameEn: "Scorching Heatwave & Mirages",
    iconName: "Flame",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    associatedRune: "fire",
    effect: {
      travelSpeedMultiplier: 0.75,
      travelSpeedLabelFr: "Marche épuisante (-25%)",
      combatRangeModifier: -10,
      perceptionModifier: -15,
      magicRunesBonus: [{ rune: "fire", bonus: 15 }],
      fatigueRisk: true,
      fatigueIntervalHours: 2,
      descriptionFr: "Chaleur de plomb, mirages ondulants, consommation d'eau multipliée par trois.",
      mechanicalNotesFr: "Jets de Constitution toutes les 2h de marche forcée pour éviter la déshydratation (-1d4 Points de Fatigue). Perception à distance -15% (mirages).",
    },
    loreDescriptionFr:
      "La colère solaire de Yelm s'abat sur le sol craquelé. Dans les plaines de Prax, les pierres cuisent et la poussière étouffe les poumons.",
  },
  dust_storm: {
    type: "dust_storm",
    nameFr: "Tempête de Sable & Tourbillons de Prax",
    nameEn: "Dust Devil & Prax Sandstorm",
    iconName: "Tornado",
    badgeColor: "bg-amber-700/25 text-amber-200 border-amber-600/50",
    associatedRune: "disorder",
    effect: {
      travelSpeedMultiplier: 0.35,
      travelSpeedLabelFr: "Progression presque bloquée (-65%)",
      combatRangeModifier: -40,
      perceptionModifier: -35,
      magicRunesBonus: [{ rune: "disorder", bonus: 15 }],
      fatigueRisk: true,
      fatigueIntervalHours: 1,
      descriptionFr: "Murs de poussière ocre aveuglante, orientation impossible sans repères sacrés.",
      mechanicalNotesFr: "Tir à distance impossible au-delà de 10m. Vue réduite à 5m. Jet d'Orientation à -30% sous peine de s'égarer dans le désert.",
    },
    loreDescriptionFr:
      "Les esprits du Désert et les démons du vent hurlent dans la poussière abrasive, usant le cuir et aveuglant les chevaux de guerre.",
  },
  thick_fog: {
    type: "thick_fog",
    nameFr: "Brouillard Épais & Brumes Spectrales",
    nameEn: "Thick Mist & Spectral Fog",
    iconName: "CloudFog",
    badgeColor: "bg-indigo-900/30 text-indigo-200 border-indigo-500/40",
    associatedRune: "darkness",
    effect: {
      travelSpeedMultiplier: 0.7,
      travelSpeedLabelFr: "Marche prudente (-30%)",
      combatRangeModifier: -25,
      perceptionModifier: -30,
      magicRunesBonus: [
        { rune: "darkness", bonus: 10 },
        { rune: "illusion", bonus: 15 },
      ],
      fatigueRisk: false,
      descriptionFr: "Brumes rampantes venues des marais ou des rivières, étouffant les bruits.",
      mechanicalNotesFr: "Combat à distance -25% (portée max 20m). Jets de Discrétion / Furtivité favorisés (+15%). Magie d'Illusion +15%.",
    },
    loreDescriptionFr:
      "Les vapeurs fantomatiques du Marais des Hautes-Terres et des collines masquent les embuscades des broos et des éclaireurs uz.",
  },
  freezing_chill: {
    type: "freezing_chill",
    nameFr: "Gel Mordant & Givre de Valind",
    nameEn: "Biting Frost & Glacial Chill",
    iconName: "Snowflake",
    badgeColor: "bg-cyan-500/20 text-cyan-200 border-cyan-400/40",
    associatedRune: "darkness",
    effect: {
      travelSpeedMultiplier: 0.8,
      travelSpeedLabelFr: "Sol glacé et glissant (-20%)",
      combatRangeModifier: -10,
      perceptionModifier: 0,
      magicRunesBonus: [{ rune: "darkness", bonus: 10 }],
      fatigueRisk: true,
      fatigueIntervalHours: 4,
      descriptionFr: "Froid pénétrant gelant l'eau des outres et engourdissant les doigts.",
      mechanicalNotesFr: "Dextérité et crochetage -10% sans gants chauffés. Jet de Constitution chaque nuit en extérieur sans abri adéquat.",
    },
    loreDescriptionFr:
      "Le dieu du givre Valind étend ses doigts d'azur sur la Passe. Les ruisseaux se figent sous une carapace de glace cassante.",
  },
  blizzard: {
    type: "blizzard",
    nameFr: "Blizzard Furieux des Sommets",
    nameEn: "Raging Mountain Blizzard",
    iconName: "CloudSnow",
    badgeColor: "bg-sky-200/20 text-sky-100 border-sky-300/50",
    associatedRune: "air",
    effect: {
      travelSpeedMultiplier: 0.25,
      travelSpeedLabelFr: "Tempête bloquante (-75%)",
      combatRangeModifier: -40,
      perceptionModifier: -40,
      magicRunesBonus: [
        { rune: "air", bonus: 15 },
        { rune: "darkness", bonus: 10 },
      ],
      fatigueRisk: true,
      fatigueIntervalHours: 1,
      descriptionFr: "Neige aveuglante, vent glacial à -20°C, vol impossible, froid mortel.",
      mechanicalNotesFr: "Tout voyage à découvert inflige 1D6 dégâts de froid par heure sans feu ou rituel de protection. Tir à distance totalement impossible.",
    },
    loreDescriptionFr:
      "Les vents de Kero Fin hurlent comme des monstres affamés. Seuls les clans retranchés dans leurs maisons-longues peuvent espérer attendre la fin de la tourmente.",
  },
  mystic_aurora: {
    type: "mystic_aurora",
    nameFr: "Aurore Mystique & Distorsion Runique",
    nameEn: "Mystic Runic Aurora",
    iconName: "Sparkles",
    badgeColor: "bg-purple-500/25 text-purple-200 border-purple-400/50",
    associatedRune: "dragon",
    effect: {
      travelSpeedMultiplier: 1.0,
      travelSpeedLabelFr: "Vitesse normale (Magie active)",
      combatRangeModifier: 0,
      perceptionModifier: 0,
      magicRunesBonus: [
        { rune: "dragon", bonus: 20 },
        { rune: "moon", bonus: 15 },
        { rune: "truth", bonus: 10 },
      ],
      fatigueRisk: false,
      descriptionFr: "Des rubans de lumière chatoyante illuminent la voûte céleste. Les flux magiques sont surpuissants.",
      mechanicalNotesFr: "Régénération des Points de Magie doublée. Tous les sorts et Quêtes Héroïques bénéficient de +15% de chances de réussite.",
    },
    loreDescriptionFr:
      "Durant le Temps Sacré ou à proximité des veines de puissance draconiques, le voile du Grand Compromis tremble et laisse entrevoir l'Autre Côté.",
  },
  ash_and_smoke: {
    type: "ash_and_smoke",
    nameFr: "Fumerolles & Cendres Draconiques",
    nameEn: "Volcanic Ash & Draconic Fumes",
    iconName: "Flame",
    badgeColor: "bg-red-900/30 text-red-200 border-red-500/50",
    associatedRune: "dragon",
    effect: {
      travelSpeedMultiplier: 0.7,
      travelSpeedLabelFr: "Air étouffant (-30%)",
      combatRangeModifier: -20,
      perceptionModifier: -25,
      magicRunesBonus: [
        { rune: "dragon", bonus: 15 },
        { rune: "fire", bonus: 10 },
      ],
      fatigueRisk: true,
      fatigueIntervalHours: 3,
      descriptionFr: "Poussière de soufre et cendres chaudes recouvrant la végétation.",
      mechanicalNotesFr: "Tests d'Endurance respiratoire après chaque combat. Sorts draconiques amplifiés.",
    },
    loreDescriptionFr:
      "Dans le sillage du Réveil du Dragon ou près des cratères sacrés, la terre crache encore ses fumées brûlantes empreintes de conscience reptilienne.",
  },
};

export const REGION_NAMES_FR: Record<RegionKey, string> = {
  sartar: "Royaume de Sartar (Montagnes & Vallées)",
  tarsh: "Royaume de Tarsh (Vallée de l'Oslir)",
  prax: "Plaines & Désert de Prax",
  esrolia: "Royaume d'Esrolia & Côtes",
  paturages: "Pâturages (Grazelands)",
  vallee_betes: "Vallée des Bêtes (Beast Valley)",
  dagori_inkarth: "Dâgori Inkarth (Monts Indigo / Trolls)",
  pays_heort: "Pays d'Héort & Whitewall",
  comte_soleil: "Comté du Dôme du Soleil",
  comte_pavis: "Oasis & Territoire de Pavis",
  autres: "Autres Marches & Terres Sauvages",
};

// Weighted weather probabilities per Region & Season
// Season index: 0=Mer (Spring/Water), 1=Feu (Summer/Fire), 2=Terre (Autumn/Earth), 3=Obscurité (Early Winter/Darkness), 4=Tempêtes (Late Winter/Storm), 5=Temps Sacré (Sacred Time)
export function generateRandomWeather(region: RegionKey, seasonIndex: number): RegionWeatherState {
  let pool: { type: WeatherType; weight: number }[] = [];

  switch (seasonIndex) {
    case 0: // Mer (Sea Season - Rain, melting snow, cool winds)
      pool = [
        { type: "drizzle", weight: 35 },
        { type: "gentle_breeze", weight: 25 },
        { type: "torrential_rain", weight: 20 },
        { type: "heavy_clouds", weight: 15 },
        { type: "clear_sky", weight: 10 },
      ];
      break;
    case 1: // Feu (Fire Season - Heat, sunny, dry, occasional thunderstorm)
      pool = [
        { type: "clear_sky", weight: 45 },
        { type: "heatwave", weight: 25 },
        { type: "gentle_breeze", weight: 15 },
        { type: "thunderstorm", weight: 15 },
      ];
      break;
    case 2: // Terre (Earth Season - Gentle, stable harvest, mild)
      pool = [
        { type: "clear_sky", weight: 35 },
        { type: "gentle_breeze", weight: 30 },
        { type: "heavy_clouds", weight: 20 },
        { type: "drizzle", weight: 15 },
      ];
      break;
    case 3: // Obscurité (Darkness Season - Frost, cold, darkness, mist)
      pool = [
        { type: "freezing_chill", weight: 40 },
        { type: "thick_fog", weight: 25 },
        { type: "heavy_clouds", weight: 20 },
        { type: "blizzard", weight: 15 },
      ];
      break;
    case 4: // Tempêtes (Storm Season - Blizzards, violent gales, thunderstorms)
      pool = [
        { type: "thunderstorm", weight: 35 },
        { type: "blizzard", weight: 30 },
        { type: "heavy_clouds", weight: 20 },
        { type: "torrential_rain", weight: 15 },
      ];
      break;
    case 5: // Temps Sacré (Sacred Time - Mystical events)
      pool = [
        { type: "mystic_aurora", weight: 40 },
        { type: "clear_sky", weight: 25 },
        { type: "gentle_breeze", weight: 20 },
        { type: "thunderstorm", weight: 15 },
      ];
      break;
    default:
      pool = [{ type: "clear_sky", weight: 100 }];
  }

  // Regional adjustments
  if (region === "prax" || region === "comte_pavis") {
    if (seasonIndex === 1) {
      pool = [
        { type: "heatwave", weight: 45 },
        { type: "dust_storm", weight: 35 },
        { type: "clear_sky", weight: 20 },
      ];
    } else {
      pool.push({ type: "dust_storm", weight: 25 });
    }
  } else if (region === "dagori_inkarth") {
    pool = [
      { type: "thick_fog", weight: 35 },
      { type: "freezing_chill", weight: 30 },
      { type: "heavy_clouds", weight: 25 },
      { type: "blizzard", weight: 10 },
    ];
  } else if (region === "esrolia") {
    pool = [
      { type: "gentle_breeze", weight: 35 },
      { type: "drizzle", weight: 30 },
      { type: "clear_sky", weight: 25 },
      { type: "torrential_rain", weight: 10 },
    ];
  }

  // Weighted random picker
  const totalWeight = pool.reduce((acc, p) => acc + p.weight, 0);
  let randomVal = Math.random() * totalWeight;
  let chosenType: WeatherType = "clear_sky";

  for (const item of pool) {
    if (randomVal < item.weight) {
      chosenType = item.type;
      break;
    }
    randomVal -= item.weight;
  }

  // Derive temperature, wind & precipitation
  let temp: RegionWeatherState["temperature"] = "tempere";
  let wind: RegionWeatherState["wind"] = "brise";
  let precip: RegionWeatherState["precipitation"] = "aucune";

  switch (chosenType) {
    case "clear_sky":
      temp = seasonIndex === 1 ? "chaud" : seasonIndex >= 3 ? "frais" : "tempere";
      wind = "brise";
      precip = "aucune";
      break;
    case "gentle_breeze":
      temp = seasonIndex === 1 ? "tempere" : "frais";
      wind = "brise";
      precip = "aucune";
      break;
    case "heavy_clouds":
      temp = "frais";
      wind = "vent_fort";
      precip = "brume";
      break;
    case "drizzle":
      temp = "frais";
      wind = "brise";
      precip = "pluie_fine";
      break;
    case "torrential_rain":
      temp = "frais";
      wind = "bourrasque";
      precip = "averse";
      break;
    case "thunderstorm":
      temp = seasonIndex === 4 ? "froid" : "tempere";
      wind = "tempete_violente";
      precip = "orage";
      break;
    case "heatwave":
      temp = "torride";
      wind = "nul";
      precip = "aucune";
      break;
    case "dust_storm":
      temp = "chaud";
      wind = "tempete_violente";
      precip = "aucune";
      break;
    case "thick_fog":
      temp = "froid";
      wind = "nul";
      precip = "brume";
      break;
    case "freezing_chill":
      temp = "glacial";
      wind = "vent_fort";
      precip = "aucune";
      break;
    case "blizzard":
      temp = "glacial";
      wind = "tempete_violente";
      precip = "blizzard";
      break;
    case "mystic_aurora":
      temp = "frais";
      wind = "brise";
      precip = "aucune";
      break;
    case "ash_and_smoke":
      temp = "chaud";
      wind = "bourrasque";
      precip = "aucune";
      break;
  }

  return {
    region,
    weatherType: chosenType,
    temperature: temp,
    wind,
    precipitation: precip,
  };
}

export function calculateTravelEstimate(
  distanceKm: number,
  weatherState: RegionWeatherState,
  mode: "foot" | "horse" | "flying" = "foot"
): {
  adjustedKmPerDay: number;
  totalDays: number;
  speedRatioText: string;
  notes: string[];
} {
  const meta = GLORANTHA_WEATHER_CATALOG[weatherState.weatherType] || GLORANTHA_WEATHER_CATALOG.clear_sky;
  const baseSpeed = mode === "flying" ? 80 * 8 : mode === "horse" ? 50 : 25; // in km per day
  const multiplier = meta.effect.travelSpeedMultiplier;
  const adjustedSpeed = Math.max(5, Math.round(baseSpeed * multiplier));
  const totalDays = Math.max(0.25, Math.round((distanceKm / adjustedSpeed) * 10) / 10);

  const notes: string[] = [];
  if (multiplier < 1) {
    notes.push(`Ralentissement météo : ${meta.nameFr} (${Math.round((1 - multiplier) * 100)}% de retard)`);
  } else if (multiplier > 1) {
    notes.push(`Progression accélérée : ${meta.nameFr} (+${Math.round((multiplier - 1) * 100)}%)`);
  }

  if (meta.effect.fatigueRisk) {
    notes.push(`Risque d'épuisement : Test de CON requis toutes les ${meta.effect.fatigueIntervalHours || 3} heures.`);
  }

  return {
    adjustedKmPerDay: adjustedSpeed,
    totalDays,
    speedRatioText: meta.effect.travelSpeedLabelFr,
    notes,
  };
}
