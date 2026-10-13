import React, { useState, useEffect, useRef } from "react";
import {
  Layers,
  Mountain,
  Sparkles,
  Skull,
  Globe2,
  ChevronDown,
  Info,
  Check,
} from "lucide-react";
import { MapFloorLevel } from "../types";

export interface FloorMeta {
  level: MapFloorLevel;
  labelFr: string;
  shortLabel: string;
  subtitle: string;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
}

export const GLORANTHA_FLOORS: FloorMeta[] = [
  {
    level: 0,
    labelFr: "Surface & Relief",
    shortLabel: "Surface",
    subtitle: "Topographie, cités, cols et routes canoniques",
    accentColor: "#e2ba7d",
    bgColor: "bg-amber-500/15",
    borderColor: "border-amber-400/40",
    textColor: "text-amber-300",
    icon: <Mountain className="w-3.5 h-3.5" />,
    description:
      "Niveau 0 : Carte maîtresse de la Passe du Dragon. Affiche le relief des montagnes, vallées sacrées, routes pavées, cols et implantations urbaines.",
    features: ["Topographie & Cols", "Réseau routier", "75+ Cités & Sanctuaires"],
  },
  {
    level: 1,
    labelFr: "Lignes de Runes & Voies Sacrées",
    shortLabel: "Runes & Tellurique",
    subtitle: "Courants telluriques, flux draconiques et carrefours de puissance",
    accentColor: "#38bdf8",
    bgColor: "bg-sky-500/15",
    borderColor: "border-sky-400/40",
    textColor: "text-sky-300",
    icon: <Sparkles className="w-3.5 h-3.5" />,
    description:
      "Niveau 1 : Trames magiques et résonances runiques reliant les sommets sacrés (Kero Fin, Montagne du Vent) aux temples majeurs et nœuds draconiques.",
    features: ["Lignes Telluriques Draconiques", "Sanctuaires Runiques", "Nœuds Magiques"],
  },
  {
    level: 2,
    labelFr: "Souterrains & Ruines Mostali",
    shortLabel: "Souterrains",
    subtitle: "Snakepipe Hollow, citadelles naines et boyaux des ténèbres",
    accentColor: "#c084fc",
    bgColor: "bg-purple-500/15",
    borderColor: "border-purple-400/40",
    textColor: "text-purple-300",
    icon: <Skull className="w-3.5 h-3.5" />,
    description:
      "Niveau 2 : Monde souterrain gloranthis, boyaux de grottes des Trolls de Dagori Inkarth, ateliers nains mostali sous les collines de fer et nécropoles antiques.",
    features: ["Boyaux de Snakepipe Hollow", "Mines & Ateliers Nains", "Ruines Anciennes"],
  },
  {
    level: 3,
    labelFr: "Frontières Politiques 1625 ST",
    shortLabel: "Factions & Clans",
    subtitle: "Confédérations de Sartar, Tarsh Lunaire, Nomades de Prax et Esrolia",
    accentColor: "#fbbf24",
    bgColor: "bg-amber-500/15",
    borderColor: "border-amber-400/40",
    textColor: "text-amber-300",
    icon: <Globe2 className="w-3.5 h-3.5" />,
    description:
      "Niveau 3 : Délimitations géopolitiques des tribus sartarites, zones sous occupation du gouverneur impérial lunaire, territoires des nomades de Prax et royaume d'Esrolia.",
    features: ["Tribus de Sartar", "Zone d'Occupation Lunaire", "Territoires Nomades"],
  },
];

interface MapFloorSwitcherProps {
  currentFloor: MapFloorLevel;
  onChangeFloor: (floor: MapFloorLevel) => void;
  compact?: boolean;
}

export const MapFloorSwitcher: React.FC<MapFloorSwitcherProps> = ({
  currentFloor,
  onChangeFloor,
  compact = false,
}) => {
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeFloor = GLORANTHA_FLOORS.find((f) => f.level === currentFloor) || GLORANTHA_FLOORS[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpenDropdown(false);
      }
    };
    if (isOpenDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpenDropdown]);

  // Keyboard shortcut listener (0, 1, 2, 3)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "0") onChangeFloor(0);
      else if (e.key === "1") onChangeFloor(1);
      else if (e.key === "2") onChangeFloor(2);
      else if (e.key === "3") onChangeFloor(3);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onChangeFloor]);

  return (
    <div
      id="map-floor-level-switcher"
      ref={dropdownRef}
      className="relative flex items-center select-none"
    >
      {/* Segmented Floor Bar */}
      <div className="flex items-center bg-[#181820] border border-[#353542] hover:border-amber-500/40 rounded-full p-0.5 shadow-lg transition">
        <div className="flex items-center gap-0.5">
          {GLORANTHA_FLOORS.map((f) => {
            const isActive = currentFloor === f.level;
            return (
              <button
                key={f.level}
                id={`btn-floor-level-${f.level}`}
                onClick={() => onChangeFloor(f.level)}
                className={`relative flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#e2ba7d] text-black shadow-[0_0_12px_rgba(226,186,125,0.4)] scale-100 font-bold"
                    : "text-[#a1a1aa] hover:text-[#e2ba7d] hover:bg-white/5"
                }`}
                title={`${f.labelFr} (Touche ${f.level}) : ${f.subtitle}`}
              >
                <span
                  className={`transition-transform duration-200 ${
                    isActive ? "text-black" : f.textColor
                  }`}
                >
                  {f.icon}
                </span>
                <span className="font-mono text-[11px]">{f.level}</span>
                <span className="hidden md:inline text-[11px] tracking-tight">
                  {f.shortLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dropdown details trigger button */}
        <button
          id="btn-floor-details-dropdown"
          onClick={() => setIsOpenDropdown(!isOpenDropdown)}
          className={`px-1.5 py-1 rounded-full text-[#8e8e93] hover:text-white hover:bg-white/10 transition border-l border-[#2d2d35] ml-0.5 ${
            isOpenDropdown ? "text-[#e2ba7d] bg-white/10" : ""
          }`}
          title="Afficher les détails des niveaux cartographiques"
        >
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isOpenDropdown ? "rotate-180 text-amber-400" : ""
            }`}
          />
        </button>
      </div>

      {/* Extended Floor Levels Popover Menu */}
      {isOpenDropdown && (
        <div
          id="floor-levels-dropdown-popover"
          className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 w-80 sm:w-96 bg-[#16161a]/95 backdrop-blur-xl border border-amber-500/50 rounded-2xl p-3 shadow-2xl z-50 text-xs text-[#d1d1d6] animate-fade-in space-y-2.5"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#2d2d35]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-[#e2ba7d] uppercase tracking-wider text-[11px]">
                Niveaux & Plans d'Étage
              </span>
            </div>
            <span className="text-[10px] text-[#8e8e93] font-mono">Raccourcis: 0, 1, 2, 3</span>
          </div>

          <div className="space-y-1.5">
            {GLORANTHA_FLOORS.map((f) => {
              const isSelected = currentFloor === f.level;
              return (
                <div
                  key={f.level}
                  onClick={() => {
                    onChangeFloor(f.level);
                    setIsOpenDropdown(false);
                  }}
                  className={`p-2.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? `bg-[#242430] ${f.borderColor} shadow-[0_0_15px_rgba(0,0,0,0.4)]`
                      : "bg-[#1b1b22] border-[#2d2d35] hover:border-amber-400/40 hover:bg-[#202029]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                          isSelected
                            ? "bg-[#e2ba7d] text-black border-[#e2ba7d]"
                            : "bg-[#25252f] text-white border-[#3a3a48]"
                        }`}
                      >
                        <span className="font-mono font-bold text-xs">{f.level}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={f.textColor}>{f.icon}</span>
                          <span
                            className={`font-bold text-xs ${
                              isSelected ? "text-white" : "text-[#e2ba7d]"
                            }`}
                          >
                            {f.labelFr}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#8e8e93] leading-tight">
                          {f.subtitle}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {f.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-[#a1a1aa] border border-white/5"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#2d2d35] flex items-center justify-between text-[10px] text-[#8e8e93]">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-amber-400" />
              Changez d'étage à tout moment sans réinitialiser la vue
            </span>
            <button
              onClick={() => setIsOpenDropdown(false)}
              className="text-amber-400 hover:underline font-semibold"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

