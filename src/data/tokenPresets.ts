export interface TokenPreset {
  id: string;
  name: string;
  theme: string;
  category: "city" | "town" | "village" | "temple" | "fortress" | "ruin" | "peril" | "nature" | "crossway" | "transparent";
  iconDataUrl: string;
  isTransparent?: boolean;
}

// Helper to convert inline SVG into high-resolution SVG data URI
function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

export const GLORANTHA_TOKEN_PRESETS: TokenPreset[] = [
  // =========================================================================
  // 0. ICÔNES 100% TRANSPARENTES SANS RIEN AU CENTRE (ÉVIDÉES & ÉPURÉES)
  // =========================================================================
  {
    id: "transparent-pure-hollow-gold",
    name: "Anneau d'Or Évidé (100% Vide au Centre)",
    theme: "Épuré & Transparent",
    category: "transparent",
    isTransparent: true,
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <!-- 100% transparent background & empty center circle -->
        <circle cx="50" cy="50" r="44" fill="none" stroke="#e2ba7d" stroke-width="4.5"/>
        <circle cx="50" cy="50" r="37" fill="none" stroke="#fef08a" stroke-width="1.5" stroke-dasharray="3,3"/>
      </svg>
    `),
  },
  {
    id: "transparent-pure-hollow-minimal",
    name: "Cercle Fin Doré / Ambre (Centre Vide)",
    theme: "Minimaliste & Vide",
    category: "transparent",
    isTransparent: true,
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <!-- Single clean ring with completely hollow center -->
        <circle cx="50" cy="50" r="43" fill="none" stroke="#f59e0b" stroke-width="4"/>
      </svg>
    `),
  },
  {
    id: "transparent-pure-hollow-white",
    name: "Cercle Fin Blanc / Argent (Centre Vide)",
    theme: "Argent & Blanc",
    category: "transparent",
    isTransparent: true,
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <!-- White hollow ring -->
        <circle cx="50" cy="50" r="44" fill="none" stroke="#ffffff" stroke-width="4"/>
        <circle cx="50" cy="50" r="38" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="3,3"/>
      </svg>
    `),
  },
  {
    id: "transparent-pure-hollow-cyan",
    name: "Cercle Céleste / Bleu (Centre Vide)",
    theme: "Air & Eau",
    category: "transparent",
    isTransparent: true,
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <!-- Cyan hollow ring -->
        <circle cx="50" cy="50" r="43" fill="none" stroke="#38bdf8" stroke-width="4.5"/>
        <circle cx="50" cy="50" r="36" fill="none" stroke="#bae6fd" stroke-width="1.5" stroke-dasharray="4,3"/>
      </svg>
    `),
  },
  {
    id: "transparent-pure-hollow-red",
    name: "Cercle Lunaire Rouge (Centre Vide)",
    theme: "Lune & Feu",
    category: "transparent",
    isTransparent: true,
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <!-- Red hollow ring -->
        <circle cx="50" cy="50" r="43" fill="none" stroke="#ef4444" stroke-width="4.5"/>
        <circle cx="50" cy="50" r="36" fill="none" stroke="#fca5a5" stroke-width="1.5" stroke-dasharray="4,3"/>
      </svg>
    `),
  },
  {
    id: "transparent-pure-hollow-diamond",
    name: "Losange Évidé Transparent (Centre Vide)",
    theme: "Géométrie & Terre",
    category: "transparent",
    isTransparent: true,
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <!-- Diamond hollow border with 0 fill inside -->
        <rect x="22" y="22" width="56" height="56" rx="6" transform="rotate(45 50 50)" fill="none" stroke="#e2ba7d" stroke-width="4.5"/>
        <rect x="28" y="28" width="44" height="44" rx="4" transform="rotate(45 50 50)" fill="none" stroke="#fef08a" stroke-width="1.5" stroke-dasharray="3,3"/>
      </svg>
    `),
  },
  {
    id: "transparent-pure-hollow-shield",
    name: "Bouclier Évidé Transparent (Centre Vide)",
    theme: "Forteresse & Écu",
    category: "transparent",
    isTransparent: true,
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <!-- Hollow Shield Contour with 100% transparent interior -->
        <path d="M22 22 L78 22 L78 52 C78 72 50 88 50 88 C50 88 22 72 22 52 Z" fill="none" stroke="#e2ba7d" stroke-width="5"/>
        <path d="M28 28 L72 28 L72 50 C72 67 50 80 50 80 C50 80 28 67 28 50 Z" fill="none" stroke="#fde047" stroke-width="1.5" stroke-dasharray="3,3"/>
      </svg>
    `),
  },
  {
    id: "transparent-pure-hollow-reticle",
    name: "Mire & Réticule Ouvert (Centre Vide)",
    theme: "Reconnaissance & Réticule",
    category: "transparent",
    isTransparent: true,
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <!-- Hollow reticle targeting with empty center -->
        <circle cx="50" cy="50" r="42" fill="none" stroke="#38bdf8" stroke-width="3.5"/>
        <line x1="50" y1="4" x2="50" y2="20" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
        <line x1="50" y1="80" x2="50" y2="96" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
        <line x1="4" y1="50" x2="20" y2="50" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
        <line x1="80" y1="50" x2="96" y2="50" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `),
  },
  {
    id: "transparent-pure-hollow-dashed",
    name: "Pointillé Circulaire Évidé (Centre Vide)",
    theme: "Mystique & Zone",
    category: "transparent",
    isTransparent: true,
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <!-- Dashed Ring with 100% empty interior -->
        <circle cx="50" cy="50" r="43" fill="none" stroke="#fbbf24" stroke-width="4.5" stroke-dasharray="7,5"/>
        <circle cx="50" cy="50" r="48" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
      </svg>
    `),
  },
  {
    id: "transparent-pure-hollow-hex",
    name: "Hexagone Évidé Transparent (Centre Vide)",
    theme: "Grille & Ruches",
    category: "transparent",
    isTransparent: true,
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <!-- Hollow Hexagon with 100% empty center -->
        <polygon points="50,8 88,29 88,71 50,92 12,71 12,29" fill="none" stroke="#a855f7" stroke-width="4.5"/>
        <polygon points="50,15 82,33 82,67 50,85 18,67 18,33" fill="none" stroke="#d8b4fe" stroke-width="1.5" stroke-dasharray="3,3"/>
      </svg>
    `),
  },
  {
    id: "transparent-ethereal-gold",
    name: "Anneau d'Or Halo (Luminescent)",
    theme: "Épuré & Transparent",
    category: "transparent",
    isTransparent: true,
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <!-- Transparent background with delicate gold rings -->
        <circle cx="50" cy="50" r="46" fill="rgba(226,186,125,0.08)" stroke="#e2ba7d" stroke-width="3.5"/>
        <circle cx="50" cy="50" r="38" fill="none" stroke="#fef08a" stroke-width="1.5" stroke-dasharray="4,4"/>
        <circle cx="50" cy="50" r="28" fill="rgba(245,158,11,0.12)" stroke="#eab308" stroke-width="1.5"/>
        <!-- Cardinal celestial dots -->
        <circle cx="50" cy="8" r="3" fill="#fef08a"/>
        <circle cx="50" cy="92" r="3" fill="#fef08a"/>
        <circle cx="8" cy="50" r="3" fill="#fef08a"/>
        <circle cx="92" cy="50" r="3" fill="#fef08a"/>
        <!-- Luminous Center Core -->
        <circle cx="50" cy="50" r="9" fill="#facc15" stroke="#ffffff" stroke-width="2"/>
        <circle cx="50" cy="50" r="3.5" fill="#ffffff"/>
      </svg>
    `),
  },
  {
    id: "transparent-rune-air-orlanth",
    name: "Rune d'Air Transparente (Orlanth)",
    theme: "Tempête & Sartar",
    category: "transparent",
    isTransparent: true,
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="46" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" stroke-width="3"/>
        <circle cx="50" cy="50" r="38" fill="none" stroke="#bae6fd" stroke-width="1" stroke-dasharray="2,3"/>
        <!-- Air / Movement Rune (Spiral of Orlanth) -->
        <path d="M50 22 C34 22 22 34 22 50 C22 66 34 78 50 78 C66 78 78 66 78 50 C78 38 68 30 58 30 C48 30 40 38 40 48 C40 56 46 62 52 62 C58 62 62 58 62 52" fill="none" stroke="#38bdf8" stroke-width="4.5" stroke-linecap="round"/>
        <circle cx="50" cy="50" r="4" fill="#ffffff"/>
      </svg>
    `),
  },
  {
    id: "transparent-rune-fire-sun",
    name: "Rune Solaire Transparente (Yelm / Dôme)",
    theme: "Solaire & Feu",
    category: "transparent",
    isTransparent: true,
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="46" fill="rgba(245,158,11,0.12)" stroke="#f59e0b" stroke-width="3"/>
        <!-- Sun rays -->
        <line x1="50" y1="8" x2="50" y2="20" stroke="#fde047" stroke-width="3" stroke-linecap="round"/>
        <line x1="50" y1="80" x2="50" y2="92" stroke="#fde047" stroke-width="3" stroke-linecap="round"/>
        <line x1="8" y1="50" x2="20" y2="50" stroke="#fde047" stroke-width="3" stroke-linecap="round"/>
        <line x1="80" y1="50" x2="92" y2="50" stroke="#fde047" stroke-width="3" stroke-linecap="round"/>
        <line x1="20" y1="20" x2="28" y2="28" stroke="#fde047" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="80" y1="80" x2="72" y2="72" stroke="#fde047" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="80" y1="20" x2="72" y2="28" stroke="#fde047" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="20" y1="80" x2="28" y2="72" stroke="#fde047" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Solar Center -->
        <circle cx="50" cy="50" r="18" fill="rgba(254,240,138,0.2)" stroke="#fde047" stroke-width="3"/>
        <circle cx="50" cy="50" r="7" fill="#ffffff"/>
      </svg>
    `),
  },
  {
    id: "transparent-rune-earth-ernalda",
    name: "Rune de Terre Transparente (Ernalda)",
    theme: "Terre & Fécondité",
    category: "transparent",
    isTransparent: true,
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="46" fill="rgba(16,185,129,0.12)" stroke="#10b981" stroke-width="3"/>
        <!-- Earth Square / Diamond Motif -->
        <rect x="26" y="26" width="48" height="48" rx="4" transform="rotate(45 50 50)" fill="rgba(5,150,105,0.15)" stroke="#34d399" stroke-width="3"/>
        <circle cx="50" cy="50" r="10" fill="none" stroke="#a7f3d0" stroke-width="2.5"/>
        <circle cx="50" cy="50" r="4" fill="#ffffff"/>
      </svg>
    `),
  },
  {
    id: "transparent-moon-crescent",
    name: "Croissant Lunaire Transparent (Empire)",
    theme: "Lune Rouge & Tarsh",
    category: "transparent",
    isTransparent: true,
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="46" fill="rgba(239,68,68,0.12)" stroke="#ef4444" stroke-width="3"/>
        <!-- Red Moon Crescent -->
        <path d="M50 20 C66 20 80 34 80 50 C80 66 66 80 50 80 C40 80 32 75 26 68 C42 66 54 52 52 34 C51 28 48 23 44 20 C46 20 48 20 50 20 Z" fill="rgba(220,38,38,0.3)" stroke="#fca5a5" stroke-width="3"/>
        <circle cx="34" cy="46" r="3.5" fill="#ffffff"/>
      </svg>
    `),
  },
  {
    id: "transparent-dragon-eye",
    name: "Œil de Dragon Transparent (EWF)",
    theme: "Mystères Draconiques",
    category: "transparent",
    isTransparent: true,
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="46" fill="rgba(234,179,8,0.1)" stroke="#eab308" stroke-width="3"/>
        <!-- Dragon Eye Outline -->
        <path d="M18 50 Q50 24 82 50 Q50 76 18 50 Z" fill="rgba(161,98,7,0.15)" stroke="#facc15" stroke-width="3.5"/>
        <!-- Vertical Dragon Slit Pupil -->
        <ellipse cx="50" cy="50" rx="6" ry="18" fill="#eab308" stroke="#ffffff" stroke-width="2"/>
        <circle cx="50" cy="50" r="2.5" fill="#ffffff"/>
      </svg>
    `),
  },
  {
    id: "transparent-temple-sanctuary",
    name: "Sanctuaire & Temple Épuré Transparent",
    theme: "Cultes & Divin",
    category: "transparent",
    isTransparent: true,
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="46" fill="rgba(226,186,125,0.08)" stroke="#e2ba7d" stroke-width="3"/>
        <!-- Classical Temple Pediment & Columns -->
        <polygon points="50,22 22,38 78,38" fill="rgba(226,186,125,0.2)" stroke="#e2ba7d" stroke-width="2.5"/>
        <line x1="30" y1="38" x2="30" y2="70" stroke="#fef08a" stroke-width="3" stroke-linecap="round"/>
        <line x1="43" y1="38" x2="43" y2="70" stroke="#fef08a" stroke-width="3" stroke-linecap="round"/>
        <line x1="57" y1="38" x2="57" y2="70" stroke="#fef08a" stroke-width="3" stroke-linecap="round"/>
        <line x1="70" y1="38" x2="70" y2="70" stroke="#fef08a" stroke-width="3" stroke-linecap="round"/>
        <rect x="18" y="70" width="64" height="8" rx="2" fill="rgba(226,186,125,0.3)" stroke="#e2ba7d" stroke-width="2"/>
        <!-- Holy Flame in center -->
        <circle cx="50" cy="54" r="4" fill="#ffffff"/>
      </svg>
    `),
  },
  {
    id: "transparent-fortress-gate",
    name: "Citadelle & Bastion Transparent",
    theme: "Guerre & Forteresse",
    category: "transparent",
    isTransparent: true,
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="46" fill="rgba(203,213,225,0.1)" stroke="#cbd5e1" stroke-width="3"/>
        <!-- Minimal Battlements & Shield -->
        <path d="M26 36 L34 36 L34 42 L42 42 L42 36 L58 36 L58 42 L66 42 L66 36 L74 36 L74 60 C74 72 50 82 50 82 C50 82 26 72 26 60 Z" fill="rgba(100,116,139,0.2)" stroke="#e2e8f0" stroke-width="3"/>
        <!-- Center Cross slit -->
        <line x1="50" y1="46" x2="50" y2="64" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <line x1="42" y1="52" x2="58" y2="52" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `),
  },
  {
    id: "transparent-hazard-peril",
    name: "Zone de Péril & Monstre Transparent",
    theme: "Danger & Menaces",
    category: "transparent",
    isTransparent: true,
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="46" fill="rgba(234,88,12,0.12)" stroke="#ea580c" stroke-width="3"/>
        <!-- Warning Triangle -->
        <polygon points="50,20 20,76 80,76" fill="rgba(234,88,12,0.2)" stroke="#fb923c" stroke-width="3"/>
        <!-- Exclamation mark / Rune -->
        <line x1="50" y1="36" x2="50" y2="56" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round"/>
        <circle cx="50" cy="66" r="3.5" fill="#ffffff"/>
      </svg>
    `),
  },
  {
    id: "transparent-compass-scout",
    name: "Boussole & Éclaireur Transparent",
    theme: "Exploration & Voies",
    category: "transparent",
    isTransparent: true,
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="46" fill="rgba(56,189,248,0.08)" stroke="#38bdf8" stroke-width="2.5"/>
        <circle cx="50" cy="50" r="36" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,3"/>
        <!-- 4 Cardinal Points Star -->
        <polygon points="50,14 55,45 86,50 55,55 50,86 45,55 14,50 45,45" fill="rgba(56,189,248,0.25)" stroke="#38bdf8" stroke-width="2"/>
        <circle cx="50" cy="50" r="6" fill="#ffffff" stroke="#0284c7" stroke-width="1.5"/>
      </svg>
    `),
  },
  // =========================================================================
  // 1. GRANDES CITÉS & CAPITALES
  // =========================================================================
  {
    id: "city-boldhome",
    name: "Boldhome (Capitale Royale de Sartar)",
    theme: "Sartar & Flamme Sacrée",
    category: "city",
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <radialGradient id="bold-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="70%" stop-color="#eab308"/>
            <stop offset="100%" stop-color="#854d0e"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="47" fill="#181512" stroke="#eab308" stroke-width="5"/>
        <!-- Mountain fortress peak -->
        <polygon points="50,18 22,68 78,68" fill="#44403c"/>
        <polygon points="50,18 36,68 64,68" fill="#78716c"/>
        <!-- Royal Crown & Flame -->
        <path d="M50 28 Q44 38 47 46 Q50 52 53 46 Q56 38 50 28 Z" fill="url(#bold-glow)"/>
        <!-- Battlement Castle Gate -->
        <rect x="34" y="60" width="32" height="24" rx="2" fill="#ca8a04" stroke="#fef08a" stroke-width="2"/>
        <rect x="44" y="68" width="12" height="16" rx="6" fill="#1c1917"/>
        <polygon points="34,60 38,54 44,54 46,60 54,60 56,54 62,54 66,60" fill="#ca8a04"/>
        <circle cx="50" cy="42" r="3" fill="#ffffff"/>
      </svg>
    `),
  },
  {
    id: "city-nochet",
    name: "Nochet (Mégalopole d'Esrolia)",
    theme: "Esrolia & Déesse Terre",
    category: "city",
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="47" fill="#042f2e" stroke="#2dd4bf" stroke-width="5"/>
        <!-- Matriarchal Domes & Harbor Columns -->
        <path d="M24 74 L76 74 L76 52 Q50 36 24 52 Z" fill="#0f766e"/>
        <!-- Main Central Golden Dome -->
        <ellipse cx="50" cy="42" rx="16" ry="14" fill="#fbbf24" stroke="#fef08a" stroke-width="2"/>
        <line x1="50" y1="22" x2="50" y2="28" stroke="#fef08a" stroke-width="3" stroke-linecap="round"/>
        <circle cx="50" cy="20" r="3" fill="#fef08a"/>
        <!-- Twin Flanking Domes -->
        <ellipse cx="32" cy="52" rx="9" ry="8" fill="#14b8a6"/>
        <ellipse cx="68" cy="52" rx="9" ry="8" fill="#14b8a6"/>
        <!-- Archway Gate -->
        <path d="M42 74 L42 58 Q50 52 58 58 L58 74 Z" fill="#042f2e"/>
        <!-- Water waves at base -->
        <path d="M20 80 Q35 76 50 80 T80 80" stroke="#38bdf8" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>
    `),
  },
  {
    id: "city-furthest",
    name: "Bout-du-monde (Furthest)",
    theme: "Empire Lunar & Tarsh",
    category: "city",
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="47" fill="#2a080c" stroke="#ef4444" stroke-width="5"/>
        <!-- Imperial Spire & Red Moon Crest -->
        <polygon points="50,14 62,56 38,56" fill="#fca5a5"/>
        <polygon points="50,14 56,56 44,56" fill="#ffffff"/>
        <!-- Red Moon Crescent surrounding spire -->
        <path d="M48 24 C68 28 76 48 70 66 C64 80 48 86 34 82 C50 78 58 62 54 46 C50 34 42 28 48 24 Z" fill="#dc2626"/>
        <!-- City Base Walls -->
        <rect x="26" y="58" width="48" height="22" rx="2" fill="#991b1b" stroke="#f87171" stroke-width="2"/>
        <rect x="45" y="66" width="10" height="14" rx="4" fill="#2a080c"/>
      </svg>
    `),
  },
  {
    id: "city-pavis",
    name: "Pavis & Grande Ruine",
    theme: "Prax & Désert",
    category: "city",
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="47" fill="#261a0e" stroke="#f59e0b" stroke-width="5"/>
        <!-- Giant Cyclopean Wall Facade -->
        <polygon points="20,76 26,42 74,42 80,76" fill="#78350f" stroke="#d97706" stroke-width="2"/>
        <!-- Desert Sunburst -->
        <circle cx="50" cy="32" r="10" fill="#fde047"/>
        <path d="M50 16 L50 20 M50 44 L50 48 M34 32 L38 32 M62 32 L66 32" stroke="#fde047" stroke-width="2" stroke-linecap="round"/>
        <!-- Monumental Arched Gate of Pavis -->
        <rect x="42" y="52" width="16" height="24" rx="7" fill="#1c1917" stroke="#f59e0b" stroke-width="2"/>
        <!-- Battlements -->
        <rect x="26" y="38" width="8" height="6" fill="#d97706"/>
        <rect x="46" y="38" width="8" height="6" fill="#d97706"/>
        <rect x="66" y="38" width="8" height="6" fill="#d97706"/>
      </svg>
    `),
  },

  // =========================================================================
  // 2. VILLES, BOURGS & MARCHÉS
  // =========================================================================
  {
    id: "town-jonstown",
    name: "Jonville (Jonstown)",
    theme: "Savoir & Bibliothèque",
    category: "town",
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="47" fill="#1e1b4b" stroke="#818cf8" stroke-width="5"/>
        <!-- Library Dome -->
        <path d="M30 62 Q50 32 70 62 Z" fill="#4338ca" stroke="#c7d2fe" stroke-width="2"/>
        <circle cx="50" cy="30" r="4" fill="#fbbf24"/>
        <!-- Open Scroll / Tome of Truth -->
        <path d="M26 62 Q50 56 74 62 L74 78 Q50 72 26 78 Z" fill="#e0e7ff"/>
        <line x1="50" y1="58" x2="50" y2="76" stroke="#4338ca" stroke-width="2"/>
        <!-- Script lines -->
        <line x1="32" y1="66" x2="44" y2="66" stroke="#6366f1" stroke-width="1.5"/>
        <line x1="32" y1="71" x2="44" y2="71" stroke="#6366f1" stroke-width="1.5"/>
        <line x1="56" y1="66" x2="68" y2="66" stroke="#6366f1" stroke-width="1.5"/>
        <line x1="56" y1="71" x2="68" y2="71" stroke="#6366f1" stroke-width="1.5"/>
      </svg>
    `),
  },
  {
    id: "town-market",
    name: "Cité Marchande & Caravansérail",
    theme: "Issaries & Marchands",
    category: "town",
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="47" fill="#142611" stroke="#84cc16" stroke-width="5"/>
        <!-- Market Tent canopy -->
        <polygon points="50,22 18,52 82,52" fill="#65a30d"/>
        <polygon points="50,22 34,52 66,52" fill="#a3e635"/>
        <!-- Merchant Gold Scales of Issaries -->
        <rect x="28" y="52" width="44" height="28" fill="#365314"/>
        <circle cx="50" cy="65" r="9" fill="#facc15" stroke="#fef08a" stroke-width="2"/>
        <text x="50" y="70" font-family="serif" font-size="14" font-weight="bold" fill="#713f12" text-anchor="middle">¤</text>
      </svg>
    `),
  },
  {
    id: "town-duck-port",
    name: "Bourg Fluvial / Duck Point",
    theme: "Durulz & Rivières",
    category: "town",
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="47" fill="#082f49" stroke="#38bdf8" stroke-width="5"/>
        <!-- River Stilt Hut -->
        <polygon points="50,26 28,46 72,46" fill="#b45309"/>
        <rect x="34" y="46" width="32" height="18" fill="#78350f"/>
        <!-- Stilts in water -->
        <line x1="38" y1="64" x2="38" y2="82" stroke="#451a03" stroke-width="3"/>
        <line x1="62" y1="64" x2="62" y2="82" stroke="#451a03" stroke-width="3"/>
        <!-- Durulz Boat / Canoe -->
        <path d="M22 76 Q50 86 78 76 L72 82 Q50 90 28 82 Z" fill="#d97706"/>
        <!-- Water ripples -->
        <path d="M16 80 Q32 76 48 80 T84 80" stroke="#7dd3fc" stroke-width="2" fill="none"/>
      </svg>
    `),
  },

  // =========================================================================
  // 3. VILLAGES, CLANS & HAMEAUX
  // =========================================================================
  {
    id: "village-clan-steading",
    name: "Ferme & Maison-Longue de Clan",
    theme: "Héortlings & Sartar",
    category: "village",
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="47" fill="#1c1917" stroke="#10b981" stroke-width="5"/>
        <!-- Thatched Longhouse Roof -->
        <polygon points="50,22 16,56 84,56" fill="#92400e" stroke="#d97706" stroke-width="2"/>
        <polygon points="50,22 30,56 70,56" fill="#b45309"/>
        <!-- Carved Orlanthi Roof Horns -->
        <path d="M46 22 Q40 12 36 14 M54 22 Q60 12 64 14" stroke="#fde68a" stroke-width="3" fill="none" stroke-linecap="round"/>
        <!-- Log Wall Base -->
        <rect x="24" y="56" width="52" height="24" fill="#451a03"/>
        <!-- Wooden Door with Triskele symbol -->
        <rect x="42" y="62" width="16" height="18" rx="2" fill="#78350f" stroke="#fbbf24" stroke-width="1.5"/>
        <circle cx="50" cy="69" r="3" fill="#fbbf24"/>
      </svg>
    `),
  },
  {
    id: "village-apple-lane",
    name: "Allée des Pommes (Apple Lane)",
    theme: "Vergers & Hameaux",
    category: "village",
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="47" fill="#142e1d" stroke="#22c55e" stroke-width="5"/>
        <!-- Orchard Apple Tree -->
        <circle cx="50" cy="40" r="22" fill="#15803d"/>
        <circle cx="36" cy="44" r="14" fill="#16a34a"/>
        <circle cx="64" cy="44" r="14" fill="#16a34a"/>
        <rect x="45" y="56" width="10" height="24" fill="#78350f"/>
        <!-- Red & Golden Apples -->
        <circle cx="42" cy="36" r="4.5" fill="#ef4444"/>
        <circle cx="58" cy="38" r="4.5" fill="#ef4444"/>
        <circle cx="50" cy="48" r="4.5" fill="#fbbf24"/>
        <!-- Tin Inn Signpost -->
        <polygon points="50,70 34,80 66,80" fill="#94a3b8"/>
      </svg>
    `),
  },
  {
    id: "village-prax-nomads",
    name: "Campement de Tentes de Prax",
    theme: "Prax & Nomades",
    category: "village",
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="47" fill="#2d1b0d" stroke="#f59e0b" stroke-width="5"/>
        <!-- Bison Hide Nomadic Yurt Tent -->
        <polygon points="50,22 18,72 82,72" fill="#b45309" stroke="#f59e0b" stroke-width="2"/>
        <polygon points="50,22 36,72 64,72" fill="#d97706"/>
        <!-- Tent Wooden Poles crossing at apex -->
        <line x1="44" y1="28" x2="40" y2="14" stroke="#fde68a" stroke-width="3" stroke-linecap="round"/>
        <line x1="56" y1="28" x2="60" y2="14" stroke="#fde68a" stroke-width="3" stroke-linecap="round"/>
        <!-- Entrance Flap -->
        <polygon points="50,50 42,72 58,72" fill="#451a03"/>
        <!-- Campfire -->
        <polygon points="50,74 46,84 54,84" fill="#ef4444"/>
        <polygon points="50,76 48,82 52,82" fill="#fbbf24"/>
      </svg>
    `),
  },

  // =========================================================================
  // 4. TEMPLES, SANCTUAIRES & HAUTS LIEUX
  // =========================================================================
  {
    id: "temple-orlanth",
    name: "Temple Majeur d'Orlanth",
    theme: "Tempête & Air",
    category: "temple",
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="47" fill="#0f172a" stroke="#38bdf8" stroke-width="5"/>
        <!-- Storm Triskele & Lightning Spiral -->
        <path d="M50 18 L58 36 L78 38 L62 50 L68 70 L50 58 L32 70 L38 50 L22 38 L42 36 Z" fill="#0284c7" stroke="#7dd3fc" stroke-width="2"/>
        <!-- Central Lightning Bolt -->
        <polygon points="50,24 44,48 52,48 46,76 60,46 51,46" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
        <circle cx="50" cy="50" r="6" fill="#ffffff" opacity="0.8"/>
      </svg>
    `),
  },
  {
    id: "temple-ernalda",
    name: "Temple de la Terre (Ernalda)",
    theme: "Terre & Fécondité",
    category: "temple",
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="47" fill="#062817" stroke="#10b981" stroke-width="5"/>
        <!-- Golden Wheat Sheaf & Earth Rune Disc -->
        <circle cx="50" cy="40" r="20" fill="#059669"/>
        <circle cx="50" cy="40" r="14" fill="#34d399"/>
        <path d="M50 20 L50 68" stroke="#fef08a" stroke-width="4" stroke-linecap="round"/>
        <!-- Golden Wheat ears -->
        <ellipse cx="44" cy="30" rx="5" ry="3" fill="#facc15" transform="rotate(-30 44 30)"/>
        <ellipse cx="56" cy="30" rx="5" ry="3" fill="#facc15" transform="rotate(30 56 30)"/>
        <ellipse cx="42" cy="42" rx="6" ry="3.5" fill="#facc15" transform="rotate(-30 42 42)"/>
        <ellipse cx="58" cy="42" rx="6" ry="3.5" fill="#facc15" transform="rotate(30 58 42)"/>
        <!-- Earth Altar Base -->
        <rect x="30" y="68" width="40" height="14" rx="3" fill="#78350f" stroke="#facc15" stroke-width="2"/>
      </svg>
    `),
  },
  {
    id: "temple-yelmalio",
    name: "Dôme du Soleil (Yelmalio)",
    theme: "Soleil & Ordre",
    category: "temple",
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="47" fill="#241b09" stroke="#f59e0b" stroke-width="5"/>
        <!-- Solar Dome Structure -->
        <path d="M26 66 Q50 28 74 66 Z" fill="#d97706" stroke="#fde047" stroke-width="2"/>
        <circle cx="50" cy="48" r="14" fill="#fbbf24"/>
        <circle cx="50" cy="48" r="8" fill="#ffffff"/>
        <!-- Colonnade Base -->
        <rect x="22" y="66" width="56" height="12" fill="#78350f"/>
        <line x1="28" y1="66" x2="28" y2="78" stroke="#fde047" stroke-width="3"/>
        <line x1="42" y1="66" x2="42" y2="78" stroke="#fde047" stroke-width="3"/>
        <line x1="58" y1="66" x2="58" y2="78" stroke="#fde047" stroke-width="3"/>
        <line x1="72" y1="66" x2="72" y2="78" stroke="#fde047" stroke-width="3"/>
        <!-- Sun Rays -->
        <path d="M50 14 L50 24 M28 26 L36 32 M72 26 L64 32" stroke="#fde047" stroke-width="3.5" stroke-linecap="round"/>
      </svg>
    `),
  },
  {
    id: "temple-humakt",
    name: "Sanctuaire d'Humakt (Épée)",
    theme: "Humakt & Guerre",
    category: "temple",
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="47" fill="#18181b" stroke="#94a3b8" stroke-width="5"/>
        <!-- Humakt Sword of Death & Truth -->
        <polygon points="50,14 56,22 54,66 50,70 46,66 44,22" fill="#e2e8f0"/>
        <line x1="50" y1="16" x2="50" y2="68" stroke="#64748b" stroke-width="1.5"/>
        <!-- Crossguard & Pommel -->
        <rect x="34" y="68" width="32" height="6" rx="2" fill="#b45309" stroke="#f59e0b" stroke-width="1"/>
        <rect x="47" y="74" width="6" height="10" rx="1" fill="#78350f"/>
        <circle cx="50" cy="86" r="4" fill="#b45309" stroke="#f59e0b" stroke-width="1"/>
        <!-- Death Rune Wings -->
        <path d="M30 46 L40 50 M70 46 L60 50" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `),
  },
  {
    id: "landmark-kero-fin",
    name: "Kero Fin (Montagne Mère)",
    theme: "Monts Sacrés & Mythologie",
    category: "temple",
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="47" fill="#0f172a" stroke="#cbd5e1" stroke-width="5"/>
        <!-- Towering Silver Needle Peak -->
        <polygon points="50,12 24,84 76,84" fill="#475569"/>
        <polygon points="50,12 50,84 76,84" fill="#334155"/>
        <!-- Snow Silver Summit -->
        <polygon points="50,12 36,46 50,40 64,46" fill="#f8fafc"/>
        <!-- Celestial Aura / Halo of the Mother Goddess -->
        <ellipse cx="50" cy="24" rx="26" ry="8" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="4,3"/>
        <circle cx="50" cy="12" r="3" fill="#ffffff"/>
      </svg>
    `),
  },

  // =========================================================================
  // 5. FORTERESSES & BASTIONS
  // =========================================================================
  {
    id: "fort-whitewall",
    name: "Fort-de-la-Victoire (Whitewall)",
    theme: "Héortland & Bastions",
    category: "fortress",
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="47" fill="#1c1917" stroke="#e2e8f0" stroke-width="5"/>
        <!-- Chalk White Fortress Walls -->
        <polygon points="50,22 20,78 80,78" fill="#cbd5e1"/>
        <polygon points="50,22 50,78 80,78" fill="#94a3b8"/>
        <!-- High Tower & Battlements -->
        <rect x="42" y="32" width="16" height="30" fill="#f8fafc" stroke="#64748b" stroke-width="1.5"/>
        <polygon points="40,32 44,24 56,24 60,32" fill="#e2e8f0"/>
        <line x1="50" y1="24" x2="50" y2="16" stroke="#eab308" stroke-width="2"/>
        <polygon points="50,16 58,19 50,22" fill="#eab308"/>
        <!-- Iron Gate -->
        <rect x="45" y="66" width="10" height="12" rx="4" fill="#0f172a"/>
      </svg>
    `),
  },
  {
    id: "fort-lead-castle",
    name: "Château de Plomb (Trolls Uz)",
    theme: "Dâgori Inkarth & Ténèbres",
    category: "fortress",
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="47" fill="#09090b" stroke="#a855f7" stroke-width="5"/>
        <!-- Lead Castle Bastion -->
        <rect x="24" y="40" width="52" height="38" fill="#3f3f46" stroke="#71717a" stroke-width="2"/>
        <!-- Massive Heavy Lead Battlements -->
        <rect x="24" y="32" width="10" height="10" fill="#27272a"/>
        <rect x="45" y="32" width="10" height="10" fill="#27272a"/>
        <rect x="66" y="32" width="10" height="10" fill="#27272a"/>
        <!-- Glowing Purple Trollish Eyes in Gate -->
        <rect x="40" y="58" width="20" height="20" rx="6" fill="#18181b"/>
        <circle cx="46" cy="66" r="3" fill="#c084fc"/>
        <circle cx="54" cy="66" r="3" fill="#c084fc"/>
      </svg>
    `),
  },

  // =========================================================================
  // 6. RUINES, PÉRILS & LIEUX DU CHAOS
  // =========================================================================
  {
    id: "peril-dragonrise",
    name: "Le Réveil du Dragon",
    theme: "Cataclysme & Draconique",
    category: "peril",
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="47" fill="#1c0f0a" stroke="#ea580c" stroke-width="5"/>
        <!-- Glowing Molten Crater -->
        <ellipse cx="50" cy="70" rx="32" ry="14" fill="#c2410c"/>
        <ellipse cx="50" cy="70" rx="22" ry="8" fill="#fbbf24"/>
        <!-- True Dragon Emergence -->
        <path d="M50 16 C34 26 26 44 32 64 Q50 68 68 64 C74 44 66 26 50 16 Z" fill="#b45309" stroke="#f59e0b" stroke-width="2"/>
        <!-- Dragon Golden Eyes & Horns -->
        <polygon points="36,24 24,14 38,32" fill="#facc15"/>
        <polygon points="64,24 76,14 62,32" fill="#facc15"/>
        <circle cx="43" cy="40" r="3.5" fill="#fef08a"/>
        <circle cx="57" cy="40" r="3.5" fill="#fef08a"/>
        <!-- Smoke plume -->
        <path d="M48 60 Q40 40 50 20" stroke="#f97316" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>
    `),
  },
  {
    id: "peril-snakepipe",
    name: "Flûte-serpent & Gouffre du Chaos",
    theme: "Snakepipe & Monstres",
    category: "peril",
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="47" fill="#2e050c" stroke="#dc2626" stroke-width="5"/>
        <!-- Chaos Horned Skull & Chasm -->
        <path d="M30 36 C30 20 70 20 70 36 C74 54 66 74 50 78 C34 74 26 54 30 36 Z" fill="#991b1b"/>
        <!-- Twisted Chaos Horns -->
        <path d="M26 34 Q14 20 20 12 Q28 16 32 26" fill="#ef4444"/>
        <path d="M74 34 Q86 20 80 12 Q72 16 68 26" fill="#ef4444"/>
        <!-- Dark Eye Sockets -->
        <circle cx="42" cy="44" r="5" fill="#18181b"/>
        <circle cx="58" cy="44" r="5" fill="#18181b"/>
        <polygon points="47,56 53,56 50,64" fill="#18181b"/>
        <!-- Sinuous Chaos serpents -->
        <path d="M36 68 Q50 78 64 68" stroke="#fca5a5" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>
    `),
  },
  {
    id: "peril-delecti-marsh",
    name: "Marais des Morts (Delecti)",
    theme: "Nécromancie & Mort",
    category: "peril",
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="47" fill="#042f2e" stroke="#2dd4bf" stroke-width="5"/>
        <!-- Spectral Floating Skull over murky reeds -->
        <circle cx="50" cy="42" r="18" fill="#ccfbf1"/>
        <circle cx="44" cy="40" r="4" fill="#115e59"/>
        <circle cx="56" cy="40" r="4" fill="#115e59"/>
        <polygon points="48,50 52,50 50,56" fill="#115e59"/>
        <!-- Reeds and stagnant swamp mist -->
        <line x1="22" y1="80" x2="26" y2="58" stroke="#14b8a6" stroke-width="3" stroke-linecap="round"/>
        <line x1="78" y1="80" x2="74" y2="58" stroke="#14b8a6" stroke-width="3" stroke-linecap="round"/>
        <path d="M20 76 Q35 70 50 76 T80 76" stroke="#2dd4bf" stroke-width="4" fill="none"/>
      </svg>
    `),
  },
  {
    id: "ruin-ancient-ewf",
    name: "Ruines Antiques Draconiques (EWF)",
    theme: "EWF & Second Âge",
    category: "ruin",
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="47" fill="#1c1917" stroke="#a8a29e" stroke-width="5"/>
        <!-- Broken Ancient Megalith / Dragon Column -->
        <polygon points="34,80 38,32 48,26 58,40 64,80" fill="#78716c"/>
        <polygon points="46,80 48,26 58,40 64,80" fill="#57534e"/>
        <!-- Glowing Carved Dragon Eye Glyph -->
        <ellipse cx="48" cy="54" rx="8" ry="12" fill="#1c1917" stroke="#eab308" stroke-width="2"/>
        <circle cx="48" cy="54" r="3" fill="#facc15"/>
        <!-- Broken stones around base -->
        <rect x="22" y="74" width="14" height="8" rx="2" fill="#a8a29e"/>
        <rect x="66" y="72" width="12" height="10" rx="2" fill="#a8a29e"/>
      </svg>
    `),
  },
  {
    id: "nature-beast-valley",
    name: "Vallée des Bêtes (Centaures)",
    theme: "Hommes-Bêtes & Sylves",
    category: "nature",
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="47" fill="#142c16" stroke="#4ade80" stroke-width="5"/>
        <!-- Centaur / Beast Totem Horns -->
        <path d="M22 34 Q32 16 42 36 Q34 38 22 34 Z" fill="#fbbf24"/>
        <path d="M78 34 Q68 16 58 36 Q66 38 78 34 Z" fill="#fbbf24"/>
        <!-- Mythic Forest Oak -->
        <circle cx="50" cy="46" r="22" fill="#16a34a"/>
        <circle cx="50" cy="46" r="14" fill="#22c55e"/>
        <rect x="46" y="60" width="8" height="22" fill="#78350f"/>
        <!-- Beast Valley Golden Hoof print -->
        <ellipse cx="50" cy="48" rx="6" ry="5" fill="#fef08a"/>
      </svg>
    `),
  },
  {
    id: "crossway-bridge",
    name: "Grand Gué & Col Stratégique",
    theme: "Fleuves & Traversées",
    category: "crossway",
    iconDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="47" fill="#082f49" stroke="#38bdf8" stroke-width="5"/>
        <!-- Stone Arch Bridge over Blue River -->
        <path d="M18 50 L82 50 L82 74 L18 74 Z" fill="#475569"/>
        <path d="M28 74 Q50 48 72 74 Z" fill="#0284c7"/>
        <!-- Road crossing path -->
        <line x1="18" y1="46" x2="82" y2="46" stroke="#fde047" stroke-width="4" stroke-linecap="round"/>
        <!-- Water waves under bridge -->
        <path d="M24 66 Q36 60 48 66 T72 66" stroke="#bae6fd" stroke-width="2" fill="none"/>
      </svg>
    `),
  },
];
