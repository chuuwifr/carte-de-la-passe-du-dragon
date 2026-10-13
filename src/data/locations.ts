import { PointOfInterest } from "../types";
import { GLORANTHA_TOKEN_PRESETS } from "./tokenPresets";

const getPresetIcon = (id: string): string | undefined => {
  const found = GLORANTHA_TOKEN_PRESETS.find((p) => p.id === id);
  return found?.iconDataUrl;
};

export const DRAGON_PASS_LOCATIONS: PointOfInterest[] = [
  // =========================================================================
  // 1. SARTAR (Cœur de la Passe du Dragon & Foyer de la Rébellion Héortling)
  // =========================================================================
  {
    id: "boldhome",
    nameFr: "Boldhome",
    nameEn: "Boldhome",
    region: "sartar",
    regionLabelFr: "Royaume de Sartar",
    category: "city",
    coords: { x: 48.5, y: 47.5 },
    runes: ["air", "man", "dragon"],
    customIconImage: getPresetIcon("city-boldhome"),
    iconShape: "circle",
    iconSize: "lg",
    iconBorderColor: "#eab308",
    summary:
      "Capitale montagneuse légendaire de Sartar, taillée dans la roche vive par le Roi Fondateur Sartar avec l'aide des Nains. Libérée en 1625 ST.",
    detailedLore:
      "Boldhome est une merveille d'architecture mystique nichée dans un cratère fortifié inaccessible entouré de pics escarpés. Protégée par la Flamme Éternelle de Sartar (rallumée lors du sacrilège Lunar vaincu), elle est le point de ralliement des tribus Héortlings libres et des princes de la Maison de Sartar (Kallyr Étoile-Front, puis Argrath). Les temples majeurs d'Orlanth le Victorieux et d'Ernalda y accueillent les pèlerins de toute la Passe.",
    gmSecrets:
      "Des passages secrets nains relient les fondations de la Flamme Sacrée aux cavernes profondes de la Terre des Dragons. Des espions déguisés en marchands d'Issaries y surveillent les mouvements de troupes.",
    adventureHooks: [
      "Retrouver un fragment de la couronne du Roi Sartar volé lors de l'occupation Lunar.",
      "Protéger la prêtresse de la Flamme Sacrée contre une tentative d'assassinat fomentée par Tarsh.",
    ],
    factions: ["Maison de Sartar", "Culte d'Orlanth", "Compagnons d'Argrath", "Guilde d'Issaries"],
    leader: "Kallyr Étoile-Front / Prince de Sartar",
    population: "11 000 habitants (en pleine expansion post-libération)",
    wikiTitle: "Boldhome",
    dangerLevel: 1,
    tags: ["Capitale", "Forteresse", "Flamme Sacrée", "Orlanth"],
  },
  {
    id: "jonville",
    nameFr: "Jonville (Jonstown)",
    nameEn: "Jonstown",
    region: "sartar",
    regionLabelFr: "Royaume de Sartar",
    category: "city",
    coords: { x: 42.5, y: 41.5 },
    runes: ["truth", "air", "harmony"],
    customIconImage: getPresetIcon("town-jonstown"),
    iconShape: "circle",
    iconSize: "md",
    iconBorderColor: "#818cf8",
    summary:
      "Cité du savoir, célèbre pour sa Grande Bibliothèque de Lhankor Mhy et son immense marché d'échanges tribaux.",
    detailedLore:
      "Deuxième plus grande ville de Sartar, Jonville est bâtie sur les rives de la rivière Jouvence. Elle abrite la plus prestigieuse bibliothèque de la Passe du Dragon, où des centaines de parchemins millénaires décrivent l'histoire du Premier Âge et les secrets des Héros. C'est également un centre médical réputé dirigé par les prêtresses de Chalana Arroy.",
    gmSecrets:
      "Un grimoire interdit de l'Empire de la Conscience des Amis des Wyrms (EWF) est dissimulé dans les cryptes scellées sous le dôme central de la bibliothèque.",
    adventureHooks: [
      "Déchiffrer une tablette cunéiforme révélant l'emplacement d'une relique d'Humakt perdue.",
      "Soigner une étrange contagion onirique qui frappe les scribes après la lecture d'un manuscrit praxien.",
    ],
    factions: ["Érudits de Lhankor Mhy", "Guilde des Marchands", "Tribu Malani"],
    leader: "Garrath Sharpsword & Conseil des Sages",
    population: "3 500 habitants",
    wikiTitle: "Jonstown",
    dangerLevel: 1,
    tags: ["Bibliothèque", "Savoir", "Commerce", "Sartar"],
  },
  {
    id: "swenstown",
    nameFr: "Swenstown",
    nameEn: "Swenstown",
    region: "sartar",
    regionLabelFr: "Royaume de Sartar",
    category: "market",
    coords: { x: 55.0, y: 52.0 },
    runes: ["harmony", "air", "earth"],
    customIconImage: getPresetIcon("town-market"),
    iconShape: "circle",
    iconSize: "md",
    iconBorderColor: "#a3e635",
    summary:
      "Cité marchande dynamique et caravansérail stratégique entre Sartar, Prax et les Terres Basses.",
    detailedLore:
      "Fondée par Swen le Chanceux, cette ville franche prospère grâce aux caravanes d'Issaries reliant les nomades de Prax aux clans de Sartar. On y trouve des enclos à bêtes de monte, des comptoirs de troc et le grand marché aux métaux.",
    gmSecrets:
      "Des bandes de pilleurs praxiens déguisés infiltrent les caravanes pour voler les stocks de bronze sartarien.",
    adventureHooks: [
      "Assurer la protection d'une caravane d'ivoire de mammouth en partance pour Nochet.",
      "Démasquer un receleur de parchemins volés au temple de Lhankor Mhy.",
    ],
    factions: ["Guilde d'Issaries", "Ligue des Caravaniers", "Garnison Locale"],
    leader: "Maire Brandgarth le Juste",
    population: "2 800 habitants",
    wikiTitle: "Swenstown",
    dangerLevel: 1,
    tags: ["Marché", "Commerce", "Caravanes", "Sartar"],
  },
  {
    id: "vinclair",
    nameFr: "Vinclair (Clearwine)",
    nameEn: "Clearwine / Clearwine Fort",
    region: "sartar",
    regionLabelFr: "Royaume de Sartar",
    category: "settlement",
    coords: { x: 41.0, y: 49.0 },
    runes: ["earth", "plant", "fertility"],
    customIconImage: getPresetIcon("village-clan-steading"),
    iconShape: "circle",
    iconSize: "sm",
    iconBorderColor: "#10b981",
    summary:
      "Place forte tribale et centre religieux de la grande Tribu Colymar, entourée de vignobles réputés et du Temple de la Terre Noire.",
    detailedLore:
      "Perché sur une crête rocheuse escarpée, Clearwine domine la vallée d'Ernaldela. Ses caves taillées dans le grès produisent le fameux vin clair sartarien, consommé lors de tous les rituels sacrés d'Ernalda et d'Orlanth.",
    gmSecrets:
      "Sous le Grand Temple de la Terre Noire se trouve la crypte des Reines Colymar, où pousse une vigne éternelle dont la sève redonne la jeunesse.",
    adventureHooks: [
      "Protéger les vendanges sacrées contre des incendiaires à la solde de collaborateurs lunars.",
      "Escorter la Grande Prêtresse d'Ernalda jusqu'à Boldhome pour le sacre d'un nouveau prince.",
    ],
    factions: ["Tribu Colymar", "Prêtresses d'Ernalda"],
    leader: "Reine Leika Noirespear / Reine des Colymar",
    population: "2 200 habitants",
    wikiTitle: "Clearwine",
    dangerLevel: 1,
    tags: ["Tribu Colymar", "Vignobles", "Temple d'Ernalda", "Sartar"],
  },
  {
    id: "allee_des_pommes",
    nameFr: "Allée des Pommes (Apple Lane)",
    nameEn: "Apple Lane",
    region: "sartar",
    regionLabelFr: "Royaume de Sartar",
    category: "settlement",
    coords: { x: 45.5, y: 45.5 },
    runes: ["plant", "harmony", "earth"],
    customIconImage: getPresetIcon("village-apple-lane"),
    iconShape: "circle",
    iconSize: "sm",
    iconBorderColor: "#22c55e",
    summary:
      "Célèbre hameau fruitier entre Jonville et Boldhome, abritant l'Auberge de l'Étain (Tin Inn) et le mont-de-piété de Gringle.",
    detailedLore:
      "Allée des Pommes est un carrefour incontournable pour les pèlerins et aventuriers. Entouré de vergers de pommes douces réputées dans tout Sartar, le village offre une étape paisible sous la protection du Thane local et du temple de la Terre.",
    gmSecrets:
      "Gringle le prêteur sur gages dissimule dans sa chambre forte un globe de verre contenant l'esprit lié d'un wyrmling du Second Âge.",
    adventureHooks: [
      "Défendre l'Auberge de l'Étain contre un raid nocturne de pillards babouins.",
      "Résoudre le vol d'un artefact divin déposé en gage par un prêtre d'Ernalda.",
    ],
    factions: ["Tribu Kheldon", "Guildes de commerçants"],
    leader: "Thane d'Apple Lane",
    population: "250 habitants",
    wikiTitle: "Apple_Lane",
    dangerLevel: 1,
    tags: ["Auberge", "Vergers", "Aventure Classique", "Sartar"],
  },
  {
    id: "duck_point",
    nameFr: "Port des Canards (Duck Point)",
    nameEn: "Duck Point",
    region: "sartar",
    regionLabelFr: "Royaume de Sartar",
    category: "settlement",
    coords: { x: 38.0, y: 45.0 },
    runes: ["water", "beast", "disorder"],
    customIconImage: getPresetIcon("town-duck-port"),
    iconShape: "circle",
    iconSize: "sm",
    iconBorderColor: "#38bdf8",
    summary:
      "Bourg lacustre et port fluvial des Durulz (Canards), bâti sur pilotis au bord du Marais des Hautes-Terres.",
    detailedLore:
      "Duck Point est le principal refuge des Durulz dans la Passe du Dragon. Célèbres pour leur maîtrise du canotage à fond plat et leur haine féroce des morts-vivants de Delecti, les Canards y commercent poissons fumés et roseaux magiques.",
    gmSecrets:
      "Une armurerie secrète submergée conserve des épées forgées par Humakt lui-même durant le Premier Âge.",
    adventureHooks: [
      "Louer les services d'un guide Durulz pour naviguer à travers les brumes toxiques du marais.",
      "Repousser une incursion de goules aquatiques attaquant les pontons de nuit.",
    ],
    factions: ["Communauté Durulz", "Régiment des Épéistes Canards"],
    leader: "Capitaine Quacktor le Borgne",
    population: "1 200 Durulz",
    wikiTitle: "Duck_Point",
    dangerLevel: 2,
    tags: ["Durulz", "Canards", "Port Fluvial", "Marais"],
  },
  {
    id: "sundome_sartar",
    nameFr: "Comté du Dôme du Soleil",
    nameEn: "Sun Dome Temple / Sun County",
    region: "sartar",
    regionLabelFr: "Royaume de Sartar",
    category: "temple",
    coords: { x: 37.0, y: 52.5 },
    runes: ["fire", "truth", "stasis"],
    customIconImage: getPresetIcon("temple-yelmalio"),
    iconShape: "circle",
    iconSize: "md",
    iconBorderColor: "#f59e0b",
    summary:
      "Enclave théocratique martiale consacrée au dieu solaire Yelmalio et à ses célèbres phalanges de piquiers dorés.",
    detailedLore:
      "Le Temple du Dôme du Soleil s'élève au cœur d'un domaine indépendant strictement ordonné. Ses guerriers s'entraînent sans relâche à la phalange de piques et respectent les stricts tabous solaires d'abstinence et de pureté rituelle.",
    gmSecrets:
      "Le Grand Prêtre dissimule un cristal de lumière solaire capable de dissiper la nuit magique envoyée par les Trolls de Dagori Inkarth.",
    adventureHooks: [
      "Engager une maniple de piquiers pour escorter un prince de Sartar en territoire hostile.",
      "Purifier un bosquet d'orangers frappé par une malédiction de l'Ombre.",
    ],
    factions: ["Ordre de Yelmalio", "Phalange Solaire"],
    leader: "Comte Vega Goldbreath",
    population: "3 200 citoyens et piquiers",
    wikiTitle: "Sun_County",
    dangerLevel: 1,
    tags: ["Yelmalio", "Dôme du Soleil", "Piquiers", "Solaire"],
  },
  {
    id: "kero_fin",
    nameFr: "Kero Fin",
    nameEn: "Kero Fin",
    region: "sartar",
    regionLabelFr: "Royaume de Sartar",
    category: "landmark",
    coords: { x: 29.0, y: 37.5 },
    runes: ["earth", "air", "fertility"],
    customIconImage: getPresetIcon("landmark-kero-fin"),
    iconShape: "circle",
    iconSize: "lg",
    iconBorderColor: "#cbd5e1",
    summary:
      "La montagne sainte primordiale, Mère d'Orlanth, s'élevant comme un pic d'argent au-dessus des nuages.",
    detailedLore:
      "Kero Fin est le plus haut sommet de la Passe du Dragon. C'est ici qu'Ernalda et le Ciel donnèrent naissance au Roi des Tempêtes. Ses pentes sont peuplées de dryades, d'esprits des vents et d'ermites saints d'Orlanth. Nul mortel non purifié ne peut escalader son sommet sacré sans être foudroyé.",
    gmSecrets:
      "Un sanctuaire secret abrite l'une des larmes de pierre versées par Kero Fin lors de la mort d'Yelm durant le Grand Hiver.",
    adventureHooks: [
      "Accomplir la Quête Héroïque de l'Ascension pour obtenir la bénédiction du Culte d'Orlanth le Haut.",
      "Secourir un groupe d'initiés piégé par une tempête envoyée par un esprit vengeur.",
    ],
    factions: ["Ermites d'Orlanth", "Nymphes des neiges", "Aigles géants"],
    leader: "La Déesse Kero Fin",
    population: "Esprits et ermites uniquement",
    wikiTitle: "Kero_Fin",
    dangerLevel: 4,
    tags: ["Montagne Sacrée", "Mère d'Orlanth", "Quête Héroïque", "Haut Lieu"],
  },
  {
    id: "reveil_du_dragon",
    nameFr: "Le Réveil du Dragon",
    nameEn: "Dragonrise / True Dragon Awakening",
    region: "sartar",
    regionLabelFr: "Royaume de Sartar",
    category: "peril",
    coords: { x: 49.5, y: 54.0 },
    runes: ["dragon", "disorder", "death"],
    customIconImage: getPresetIcon("peril-dragonrise"),
    iconShape: "circle",
    iconSize: "lg",
    iconBorderColor: "#ea580c",
    summary:
      "Le cratère titanesque formé en 1625 ST où le Véritable Dragon s'est réveillé pour dévorer l'armée d'invasion Lunar et leur nouveau temple.",
    detailedLore:
      "En 1625 ST, lors de la consécration du Temple de la Lune Réconciliatrice par l'armée d'occupation Lunar, un rituel draconique ancestral provoqua l'émergence d'une tête de Dragon long de plusieurs lieues. Le Dragon dévora 20 000 soldats Lunars, prêtres et généraux en quelques battements de cils avant de s'envoler dans le ciel, laissant un gouffre incandescent imprégné d'une magie draconique brute.",
    gmSecrets:
      "Des fragments de coquille d'œuf draconique et d'armures enchantées Lunars jonchent les parois du gouffre. Respirer les fumerolles confère temporairement la Rune du Dragon mais risque de consumer l'esprit de l'imprudent.",
    adventureHooks: [
      "Explorer les failles au fond du cratère pour récupérer le sceptre de commandement de Fazzur Wideread.",
      "Empêcher une secte d'Umathela d'accomplir un sacrifice pour réveiller une seconde queue draconique.",
    ],
    factions: ["Rêveurs Draconiques", "Pilleurs de reliques", "Cultes des Tempêtes"],
    leader: "Aucun (Zone de catastrophe mystique)",
    population: "0 (Monstres draconiques et esprits errants)",
    wikiTitle: "Dragonrise",
    dangerLevel: 5,
    tags: ["Cataclysme", "Magie Draconique", "Ruines Lunars", "Lieu Mythique"],
  },
  {
    id: "marais_hautes_terres",
    nameFr: "Marais des Hautes-Terres",
    nameEn: "Upland Marsh / Delecti's Marsh",
    region: "sartar",
    regionLabelFr: "Royaume de Sartar",
    category: "peril",
    coords: { x: 36.5, y: 42.5 },
    runes: ["death", "water", "chaos"],
    customIconImage: getPresetIcon("peril-delecti-marsh"),
    iconShape: "circle",
    iconSize: "md",
    iconBorderColor: "#2dd4bf",
    summary:
      "Étendue fangeuse maudite dominée par Delecti le Nécromancien et son armée de morts-vivants.",
    detailedLore:
      "Créé au Second Âge par les transgressions magiques du sorcier Delecti, ce marais est enveloppé de brumes fétides et infesté de squelettes, zombies et lémures. Seuls les bateaux à fond plat des Durulz osent naviguer sur ses canaux périphériques.",
    gmSecrets:
      "Delecti cherche à capturer les âmes des guerriers tués lors du Réveil du Dragon pour bâtir un colosse de chair capable de marcher sur Boldhome.",
    adventureHooks: [
      "Récupérer le corps d'un Thane sartarien avant qu'il ne soit relevé comme cavalier squelette.",
      "Détruire un autel de nécromancie profanant une source sacrée de la Déesse Rivière.",
    ],
    factions: ["Légion des Morts de Delecti", "Patrouilles Durulz", "Chasseurs de zombies"],
    leader: "Delecti le Nécromancien",
    population: "Des milliers de morts-vivants",
    wikiTitle: "Delecti",
    dangerLevel: 5,
    tags: ["Morts-vivants", "Nécromancie", "Danger Mortel", "Marais"],
  },

  // =========================================================================
  // 2. TARSH (Nord & Présence Impériale Lunar)
  // =========================================================================
  {
    id: "bout_du_monde",
    nameFr: "Bout-du-monde (Furthest)",
    nameEn: "Furthest",
    region: "tarsh",
    regionLabelFr: "Royaume de Tarsh",
    category: "city",
    coords: { x: 18.0, y: 14.5 },
    runes: ["moon", "harmony", "fire"],
    customIconImage: getPresetIcon("city-furthest"),
    iconShape: "circle",
    iconSize: "lg",
    iconBorderColor: "#ef4444",
    summary:
      "Splendide métropole impériale de Tarsh, joyau de marbre blanc et de briques rouges bâti selon les canons de l'Empire Lunar.",
    detailedLore:
      "Bout-du-monde est le siège du Roi Pharandros de Tarsh. Ses boulevards majestueux, ses dômes rouges et ses jardins suspendus sur l'Oslir reflètent la sophistication de Glamour. Même après la défaite Lunar à Sartar, Furthest reste le cœur politique et militaire du pouvoir impérial dans le sud.",
    gmSecrets:
      "Une faction d'aristocrates tarshites prépare un coup d'État pour renverser Pharandros et s'allier aux Sartariens d'Argrath afin d'éviter une invasion punitive.",
    adventureHooks: [
      "Infiltrer le Palais de Cristal pour intercepter les ordres militaires envoyés par l'Empereur Rouge.",
      "Exfiltrer un diplomate esrolien retenu en otage sous couvert de banquets officiels.",
    ],
    factions: ["Cour Royale de Tarsh", "Collège des Sept Mères", "Légions d'argent"],
    leader: "Roi Pharandros de Tarsh",
    population: "18 000 habitants",
    wikiTitle: "Furthest",
    dangerLevel: 3,
    tags: ["Capitale Lunar", "Empire", "Intrigues", "Tarsh"],
  },
  {
    id: "coeur_flute_serpent",
    nameFr: "Cœur de la Flûte-serpent (Snakepipe)",
    nameEn: "Heart of Snakepipe Hollow",
    region: "tarsh",
    regionLabelFr: "Royaume de Tarsh",
    category: "peril",
    coords: { x: 43.5, y: 19.0 },
    runes: ["chaos", "dragon", "death"],
    customIconImage: getPresetIcon("peril-snakepipe"),
    iconShape: "circle",
    iconSize: "lg",
    iconBorderColor: "#dc2626",
    summary:
      "Le gouffre légendaire le plus dangereux de Glorantha, faille insondable abritant hydres, chimères et rejetons du Chaos.",
    detailedLore:
      "Formé lors de la Guerre des Dieux, le gouffre résonne d'un sifflement continu pareil à une flûte maléfique lorsque les vents du nord s'y engouffrent. C'est un terrain d'épreuve pour héros légendaires.",
    gmSecrets:
      "Au plus profond du gouffre, une fontaine d'ichor primordiale permet de forger des armes capables d'abattre les dieux.",
    adventureHooks: [
      "Secourir une expédition d'érudits piégée dans la première galerie des nids d'hydres.",
      "Récupérer l'armure d'un champion d'Humakt tombé dans la fosse aux chimères.",
    ],
    factions: ["Monstres du Chaos", "Hommes-lézards", "Chasseurs de trésors"],
    leader: "Aucun",
    population: "Créatures chaotiques innombrables",
    wikiTitle: "Snakepipe_Hollow",
    dangerLevel: 5,
    tags: ["Snakepipe", "Chaos", "Donjon Mythique", "Extrême Danger"],
  },

  // =========================================================================
  // 3. DÂGORI INKARTH (Royaume des Trolls & Monts Indigo)
  // =========================================================================
  {
    id: "chateau_plomb",
    nameFr: "Château de Plomb (Lead Castle)",
    nameEn: "Lead Castle / Dagori Inkarth",
    region: "dagori_inkarth",
    regionLabelFr: "Dâgori Inkarth",
    category: "fortress",
    coords: { x: 63.5, y: 16.5 },
    runes: ["darkness", "stasis", "death"],
    customIconImage: getPresetIcon("fort-lead-castle"),
    iconShape: "circle",
    iconSize: "lg",
    iconBorderColor: "#a855f7",
    summary:
      "La gigantesque forteresse des Trolls Noirs d'Uz, bâtie en blocs de plomb massif résistants aux sorts solaires.",
    detailedLore:
      "Dâgori Inkarth est le royaume rocheux des Trolls. Le Château de Plomb est une forteresse troglodyte impénétrable où les Grands Trolls gardent les chaudrons d'obscurité primordiale. Les humains n'y sont tolérés que comme ambassadeurs ou bétail.",
    gmSecrets:
      "Les Trolls dissimulent sous le château un fragment du Ciel Noir tombé lors de la défaite d'Yelm durant le Temps des Dieux.",
    adventureHooks: [
      "Négocier la libération de guerriers orlanthi capturés lors d'un raid nocturne.",
      "Fournir des métaux précieux en échange d'une alliance militaire contre Tarsh.",
    ],
    factions: ["Maison Uz de Dâgori", "Cultes de Kyger Litor et Zorak Zoran"],
    leader: "Seigneur Roi-Troll Argan Argar",
    population: "15 000 Trolls",
    wikiTitle: "Trolls",
    dangerLevel: 4,
    tags: ["Trolls", "Plomb", "Forteresse Souterraine", "Ténèbres"],
  },

  // =========================================================================
  // 4. PÂTURAGES (Grazelands) & VALLÉE DES BÊTES
  // =========================================================================
  {
    id: "paturages_centre",
    nameFr: "Pâturages (Grazelands)",
    nameEn: "Grazelands / Queen's Post",
    region: "paturages",
    regionLabelFr: "Pâturages (Grazelands)",
    category: "settlement",
    coords: { x: 17.5, y: 47.0 },
    runes: ["beast", "fire", "fertility"],
    customIconImage: getPresetIcon("village-prax-nomads"),
    iconShape: "circle",
    iconSize: "md",
    iconBorderColor: "#f59e0b",
    summary:
      "Terre sacrée du Peuple du Poney Pur et palais de tentes de la Reine des Chevaux, gardienne des pur-sang solaires.",
    detailedLore:
      "Les Pâturages sont le domaine exclusif du Peuple du Poney Pur. Leurs guerriers méprisent ceux qui marchent à pied et maîtrisent le tir à l'arc monté avec une virtuosité légendaire. La Reine du Cheval d'Or incarne la Déesse Souveraine.",
    gmSecrets:
      "La Reine possède l'un des rares étalons ailés descendant directement du dieu Soleil Hippoi.",
    adventureHooks: [
      "Obtenir l'autorisation de traverser les terres de pâture sans être pris pour cible par les éclaireurs.",
      "Aider la Reine à repousser un raid de centaures renégats venus de la Vallée des Bêtes.",
    ],
    factions: ["Peuple du Poney Pur", "Culte de la Reine Cheval"],
    leader: "La Reine des Plumes Inanna",
    population: "5 000 cavaliers nomades",
    wikiTitle: "Grazelands",
    dangerLevel: 2,
    tags: ["Chevaux", "Archers Montés", "Pâturages", "Solaire"],
  },
  {
    id: "vallee_des_betes",
    nameFr: "Vallée des Bêtes (Beast Valley)",
    nameEn: "Beast Valley",
    region: "vallee_betes",
    regionLabelFr: "Vallée des Bêtes",
    category: "nature",
    coords: { x: 30.5, y: 59.0 },
    runes: ["beast", "plant", "fertility"],
    customIconImage: getPresetIcon("nature-beast-valley"),
    iconShape: "circle",
    iconSize: "lg",
    iconBorderColor: "#4ade80",
    summary:
      "Terre magique sanctuaire des Hommes-Bêtes : Centaures, Minotaures, Satyrs et Canards, gouvernée par Ironhoof le Centaure.",
    detailedLore:
      "Créée après les Guerres des Dieux pour protéger les races animales intelligentes, la Vallée des Bêtes est une forêt luxuriante et sauvage interdite aux armées humaines. Les lois de la nature et de la métamorphose y prévalent.",
    gmSecrets:
      "Au centre de la vallée repose le Bosquet d'Arak, où les animaux peuvent converser dans toutes les langues humaines sans magie.",
    adventureHooks: [
      "Trouver un herboriste Satyre pour obtenir le remède à un poison magique.",
      "Participer à la Grande Chasse sans verser de sang innocent.",
    ],
    factions: ["Peuples Hommes-Bêtes", "Conseil d'Ironhoof"],
    leader: "Ironhoof le Centaure Immortel",
    population: "12 000 Hommes-Bêtes",
    wikiTitle: "Beast_Valley",
    dangerLevel: 3,
    tags: ["Centaures", "Minotaures", "Nature Sauvage", "Sanctuaire"],
  },

  // =========================================================================
  // 5. PRAX & LE COMTÉ DE PAVIS
  // =========================================================================
  {
    id: "pavis_grande_ruine",
    nameFr: "Pavis et la Grande Ruine",
    nameEn: "New Pavis & The Big Rubble",
    region: "prax",
    regionLabelFr: "Plaines de Prax",
    category: "city",
    coords: { x: 82.5, y: 40.0 },
    runes: ["earth", "man", "dragon"],
    customIconImage: getPresetIcon("city-pavis"),
    iconShape: "circle",
    iconSize: "lg",
    iconBorderColor: "#f59e0b",
    summary:
      "La légendaire Cité de Pavis, divisée entre la Nouvelle Ville fortifiée et les ruines colossales du Second Âge occupées par monstres et trésors.",
    detailedLore:
      "Fondée par le demi-dieu Pavis, cette métropole du désert de Prax est entourée de murailles cyclopéennes. La Grande Ruine (Big Rubble) s'étend sur des kilomètres carrés et contient des temples engloutis, des quartiers géants abandonnés, des nids de Trolls, et les trésors des civilisations disparues.",
    gmSecrets:
      "Le Berceau Géant qui flotta jadis sur la Rivière Zola Fel a laissé des dépôts magiques inexplorés sous le temple de Pavis le Bâtisseur.",
    adventureHooks: [
      "Monter une expédition dans la Grande Ruine pour explorer les tunnels du Palais englouti de Manside.",
      "Servir de médiateur entre la garnison citadine et une tribu de monteurs de Bisons en quête d'eau sainte.",
    ],
    factions: ["Culte de Pavis", "Tribus Nomades de Prax", "Guildes d'aventuriers", "Maniples de Zabra"],
    leader: "Gouverneur Sor-Eel / Chef tribal",
    population: "8 000 (Nouvelle Ville) + innombrables squatters dans la Ruine",
    wikiTitle: "Pavis",
    dangerLevel: 3,
    tags: ["Cité Mythique", "Grande Ruine", "Donjons", "Prax"],
  },
  {
    id: "autel_taureau_bloc",
    nameFr: "Autel du Taureau / Le Bloc",
    nameEn: "The Block / Storm Bull Altar",
    region: "prax",
    regionLabelFr: "Plaines de Prax",
    category: "temple",
    coords: { x: 68.0, y: 62.5 },
    runes: ["air", "disorder", "death"],
    customIconImage: getPresetIcon("temple-orlanth"),
    iconShape: "circle",
    iconSize: "md",
    iconBorderColor: "#38bdf8",
    summary:
      "Le rocher colossal précipité par Taureau Tempête pour écraser Wakboth le Diable et sauver Glorantha du Chaos total.",
    detailedLore:
      "Le Bloc est une montagne carrée de pierre dure tombée du ciel divin. Les berserkers de Storm Bull y maintiennent une veille éternelle, célébrant des rituels frénétiques rythmés par le fracas des haches contre la roche.",
    gmSecrets:
      "Sous le roc géant, le sang du Diable suinte encore goutte à goutte, formant le Marais du Diable en contrebas.",
    adventureHooks: [
      "Accomplir le rite d'initiation de Taureau Tempête en gravissant la face sud du Bloc à mains nues.",
      "Purifier un groupe de guerriers frappés par la souillure chaotique après une patrouille.",
    ],
    factions: ["Guerriers de Storm Bull (Urox)", "Prêtres des Tempêtes"],
    leader: "Grand Cornu Torvald le Furieux",
    population: "800 guerriers dévoués",
    wikiTitle: "Storm_Bull",
    dangerLevel: 4,
    tags: ["Le Bloc", "Storm Bull", "Wakboth", "Lieu Sacré"],
  },

  // =========================================================================
  // 6. ESROLIA & PLATEAU DES OMBRES
  // =========================================================================
  {
    id: "nochet",
    nameFr: "Nochet",
    nameEn: "Nochet",
    region: "esrolia",
    regionLabelFr: "Royaume d'Esrolia",
    category: "city",
    coords: { x: 16.5, y: 84.0 },
    runes: ["earth", "harmony", "water"],
    customIconImage: getPresetIcon("city-nochet"),
    iconShape: "circle",
    iconSize: "lg",
    iconBorderColor: "#2dd4bf",
    summary:
      "La plus grande mégalopole de Glorantha (100 000 hab.), cité portuaire fabuleuse gouvernée par la Reine et les Matriarches d'Ernalda.",
    detailedLore:
      "Nochet est une ville géante aux palais de stuc blanc et d'albâtre, aux toits de tuiles vernissées et aux marchés regorgeant de soies, de vins et d'épices venus des mers du Sud. C'est le centre économique suprême de la région, où les femmes possèdent toutes les terres et dirigent les lignées familiales.",
    gmSecrets:
      "Dans les cryptes du Grand Temple d'Ernalda se trouve le Sommeil de la Déesse, où les Reines communient directement avec les déesses de la Terre.",
    adventureHooks: [
      "Négocier l'envoi d'une flotte de navires de grains esroliens pour nourrir les clans affamés de Sartar.",
      "Déjouer une tentative de coup d'État fomentée par des maisons marchandes corrompues.",
    ],
    factions: ["Maisons Matriarcales d'Esrolia", "Culte d'Ernalda", "Compagnie des Marchands de la Mer"],
    leader: "Reine Hendira d'Esrolia",
    population: "100 000 habitants",
    wikiTitle: "Nochet",
    dangerLevel: 1,
    tags: ["Mégalopole", "Ernalda", "Matriarcat", "Port Géant"],
  },
  {
    id: "plateau_des_ombres",
    nameFr: "Plateau des Ombres (Shadow Plateau)",
    nameEn: "Shadow Plateau",
    region: "esrolia",
    regionLabelFr: "Royaume d'Esrolia",
    category: "ruin",
    coords: { x: 28.0, y: 72.0 },
    runes: ["darkness", "death", "earth"],
    customIconImage: getPresetIcon("ruin-ancient-ewf"),
    iconShape: "circle",
    iconSize: "md",
    iconBorderColor: "#a8a29e",
    summary:
      "Plateau volcanique plongé dans une pénombre magique perpétuelle, vestige du Palais Noir de Kyger Litor.",
    detailedLore:
      "Le Plateau des Ombres fut le cœur du royaume de la Nuit avant d'être ravagé par le Dieu Arkat. Aujourd'hui, les Trolls Uz y maintiennent des bastions troglodytes et des fermes de champignons géants.",
    gmSecrets:
      "Les racines du plateau s'enfoncent jusqu'aux Enfers (Wonderhome). Une faille permet de voyager physiquement dans le Monde Souterrain lors de la Nuit Sacrée.",
    adventureHooks: [
      "Négocier un passage sécurisé avec une matriarche Trollesse pour traverser le plateau.",
      "Trouver un morceau d'Obsidienne Noire enchantée pour forger une armure d'ombre.",
    ],
    factions: ["Uz Trolls Noirs", "Cultistes de Zorak Zoran"],
    leader: "Prêtresse Uzma Karrg",
    population: "6 000 Trolls et esclaves",
    wikiTitle: "Trolls",
    dangerLevel: 4,
    tags: ["Trolls", "Obscurité", "Plateau", "Enfers"],
  },

  // =========================================================================
  // 7. PAYS D'HÉORT & HAUTS PASSAGES
  // =========================================================================
  {
    id: "fort_de_la_victoire",
    nameFr: "Fort-de-la-Victoire (Whitewall)",
    nameEn: "Whitewall",
    region: "pays_heort",
    regionLabelFr: "Pays d'Héort",
    category: "fortress",
    coords: { x: 47.0, y: 71.0 },
    runes: ["air", "stasis", "truth"],
    customIconImage: getPresetIcon("fort-whitewall"),
    iconShape: "circle",
    iconSize: "lg",
    iconBorderColor: "#e2e8f0",
    summary:
      "La citadelle sacrée de craie blanche perchée sur un pic vertigineux, symbole éternel de la résistance contre l'Empire Lunar.",
    detailedLore:
      "Whitewall fut le théâtre du siège le plus héroïque de l'histoire moderne de Glorantha. Ses murs blancs comme la neige sont imprégnés de la bénédiction inébranlable d'Orlanth. Bien que temporairement tombée au prix de rituels démoniaques lunars, elle a été reprise et purifiée par les héros sartariens.",
    gmSecrets:
      "Le Puits des Souffles sous Whitewall souffle de l'air pur même lorsque le monde extérieur est asphyxié par les miasmes du Chaos.",
    adventureHooks: [
      "Purifier un autel sanctifié profané durant le grand siège.",
      "Rebâtir les fortifications en intégrant des runes de foudre forgées dans le temple.",
    ],
    factions: ["Défenseurs d'Orlanth", "Maison Royale d'Héort"],
    leader: "Roi Broyan d'Héortland",
    population: "4 000 défenseurs",
    wikiTitle: "Whitewall",
    dangerLevel: 2,
    tags: ["Whitewall", "Citadelle Sacrée", "Résistance", "Orlanth"],
  },
  {
    id: "heroes_ford",
    nameFr: "Le Gué des Héros (Heroes' Ford)",
    nameEn: "Heroes' Ford",
    region: "sartar",
    regionLabelFr: "Royaume de Sartar",
    category: "bridge",
    coords: { x: 46.0, y: 38.0 },
    runes: ["water", "death", "harmony"],
    customIconImage: getPresetIcon("crossway-bridge"),
    iconShape: "circle",
    iconSize: "sm",
    iconBorderColor: "#38bdf8",
    summary:
      "Passage guéable légendaire sur la rivière Jouvence, théâtre de batailles décisives entre Orlanthi et envahisseurs.",
    detailedLore:
      "Ce gué naturel pavé de gros galets bleus est le principal point de traversée entre Jonville et les tribus du Nord. Plusieurs héros de la Guerre des Héros y ont prononcé des serments inviolables gravés dans les pierres du rivage.",
    gmSecrets:
      "Sous les eaux calmes du gué dort un esprit ondine capable de faire monter le fleuve en crue pour noyer une armée entière.",
    adventureHooks: [
      "Défendre le gué contre l'avant-garde d'un ost de guerriers tarshites.",
      "Plonger dans les remous pour retrouver l'épée d'argent perdue d'un champion sartarien.",
    ],
    factions: ["Gardes du Gué de Jonville", "Pêcheurs d'or fluvial"],
    leader: "Thane Orlgard Bras-de-Fer",
    population: "150 gardes et passeurs",
    wikiTitle: "Heroes_Ford",
    dangerLevel: 2,
    tags: ["Gué", "Batailles", "Rivière", "Stratégique"],
  },
];
