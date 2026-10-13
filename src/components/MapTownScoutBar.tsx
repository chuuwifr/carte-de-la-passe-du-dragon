import React, { useState, useRef, useEffect } from "react";
import {
  Compass,
  MapPin,
  ChevronDown,
  Sparkles,
  Search,
  Crosshair,
  Building2,
  Shield,
  Skull,
  Flame,
} from "lucide-react";
import { PointOfInterest } from "../types";

interface MapTownScoutBarProps {
  locations: PointOfInterest[];
  onSelectTown: (coords: { x: number; y: number }, zoomLevel?: number, poiId?: string) => void;
}

export const MapTownScoutBar: React.FC<MapTownScoutBarProps> = ({
  locations,
  onSelectTown,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter towns & notable POIs
  const notableLocations = locations.filter((loc) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      loc.nameFr.toLowerCase().includes(q) ||
      loc.nameEn.toLowerCase().includes(q) ||
      loc.regionLabelFr.toLowerCase().includes(q) ||
      loc.summary.toLowerCase().includes(q)
    );
  });

  // Group by primary type/region
  const quickJumpPresets = [
    { name: "Boldhome (Capitale)", coords: { x: 48.5, y: 47.5 }, id: "boldhome", region: "Sartar", icon: "🏛️" },
    { name: "Jonville (Jonstown)", coords: { x: 42.5, y: 41.5 }, id: "jonville", region: "Sartar", icon: "📜" },
    { name: "Vin-Clair (Clearwine)", coords: { x: 38.0, y: 48.5 }, id: "clearwine", region: "Sartar", icon: "🌾" },
    { name: "Swenstown", coords: { x: 58.0, y: 53.0 }, id: "swenstown", region: "Sartar", icon: "⛺" },
    { name: "Porte des Runes (Runegate)", coords: { x: 39.5, y: 44.0 }, id: "porte_des_runes", region: "Sartar", icon: "🛡️" },
    { name: "Plus-Loin (Furthest)", coords: { x: 43.0, y: 24.5 }, id: "furthest", region: "Tarsh", icon: "🌙" },
    { name: "Nochet (Mégapole)", coords: { x: 26.5, y: 68.0 }, id: "nochet", region: "Esrolia", icon: "⚓" },
    { name: "Nouvelle Pavis", coords: { x: 74.0, y: 62.0 }, id: "nouvelle_pavis", region: "Prax", icon: "🏰" },
    { name: "Grande Ruine de Pavis", coords: { x: 73.0, y: 60.5 }, id: "pavis_grande_ruine", region: "Prax", icon: "💀" },
    { name: "Château de Plomb", coords: { x: 53.5, y: 31.0 }, id: "chateau_de_plomb", region: "Dagori Inkarth", icon: "🪨" },
    { name: "Snakepipe Hollow", coords: { x: 38.0, y: 22.0 }, id: "snakepipe_hollow", region: "Tarsh", icon: "🐍" },
    { name: "Pic du Dragon / Kero Fin", coords: { x: 44.0, y: 35.0 }, id: "kero_fin", region: "Sartar", icon: "🏔️" },
    { name: "Gué des Canards (Duck Point)", coords: { x: 34.5, y: 46.5 }, id: "gue_des_canards", region: "Sartar", icon: "🦆" },
  ];

  const handleSelect = (coords: { x: number; y: number }, id?: string) => {
    onSelectTown(coords, 2.5, id);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        id="btn-town-scout-bar"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-lg backdrop-blur-md transition-all ${
          isOpen
            ? "bg-[#e2ba7d] text-black border-[#e2ba7d] shadow-[#e2ba7d]/20"
            : "bg-[#18181e]/90 hover:bg-[#25252b] text-[#e2ba7d] border-[#3a3a45]"
        }`}
        title="Explorateur rapide de cités et lieux de la Passe du Dragon"
      >
        <Compass className="w-4 h-4 text-current animate-pulse" />
        <span className="hidden sm:inline">Cités & Lieux Majeurs</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          id="town-scout-dropdown"
          className="absolute left-0 mt-2 w-80 sm:w-96 bg-[#16161a]/98 backdrop-blur-xl border border-[#3a3a45] rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in text-[#d1d1d6]"
        >
          {/* Header */}
          <div className="p-3 border-b border-[#2d2d35] bg-[#1a1a22]/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#e2ba7d] uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Saut Rapide aux Cités de Glorantha</span>
            </div>
            <span className="text-[10px] text-[#8e8e93] font-mono">Zoom auto 2.5x</span>
          </div>

          {/* Search box */}
          <div className="p-2.5 border-b border-[#2d2d35] bg-[#121216]/90">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8e8e93]" />
              <input
                type="text"
                placeholder="Rechercher une ville, ruine, sanctuaire..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full pl-8 pr-3 py-1.5 bg-[#1e1e24] border border-[#3a3a45] rounded-lg text-xs text-white placeholder-[#8e8e93] focus:outline-none focus:border-[#e2ba7d]"
              />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          {!search && (
            <div className="p-2.5 border-b border-[#2d2d35] bg-[#141419]">
              <div className="text-[10px] font-semibold text-[#8e8e93] uppercase tracking-wider mb-1.5 px-1">
                Destinations Légendaires
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {quickJumpPresets.slice(0, 6).map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleSelect(preset.coords, preset.id)}
                    className="flex items-center gap-2 px-2.5 py-1.5 bg-[#1f1f27] hover:bg-[#2a2a35] hover:text-[#e2ba7d] border border-[#2d2d35] hover:border-[#e2ba7d]/50 rounded-lg text-left text-xs transition group"
                  >
                    <span className="text-sm">{preset.icon}</span>
                    <div className="truncate">
                      <div className="font-semibold truncate text-[11px] group-hover:text-[#e2ba7d]">{preset.name}</div>
                      <div className="text-[9px] text-[#8e8e93]">{preset.region}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Locations list */}
          <div className="max-h-72 overflow-y-auto divide-y divide-[#24242d] p-1">
            {notableLocations.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#8e8e93]">
                Aucun lieu ne correspond à votre recherche.
              </div>
            ) : (
              notableLocations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleSelect(loc.coords, loc.id)}
                  className="w-full flex items-center justify-between p-2 hover:bg-[#25252f] rounded-lg transition text-left group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#252530] border border-[#3a3a45] flex items-center justify-center text-xs shrink-0 group-hover:border-[#e2ba7d] group-hover:bg-[#e2ba7d]/10">
                      {loc.category === "city" ? "🏛️" : loc.category === "temple" ? "⚡" : loc.category === "ruin" ? "💀" : loc.category === "peril" ? "⚠️" : "📍"}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-[#f1f1f3] group-hover:text-[#e2ba7d] truncate">
                        {loc.nameFr}
                      </div>
                      <div className="text-[10px] text-[#8e8e93] truncate">
                        {loc.regionLabelFr} • {loc.summary}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-[#8e8e93] shrink-0 pl-2 opacity-60 group-hover:opacity-100">
                    {loc.coords.x.toFixed(1)}%, {loc.coords.y.toFixed(1)}%
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
