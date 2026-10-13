import React, { useState, useMemo } from "react";
import {
  Search,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
  MapPin,
  ChevronRight,
  Filter,
  Layers,
  Sparkles,
  Shield,
  Building2,
  Skull,
  Flame,
  X,
  Crosshair,
  Plus,
} from "lucide-react";
import { PointOfInterest, POICategory, RegionKey } from "../types";
import { POI_CATEGORIES, getCategoryMeta } from "../data/categories";

interface MapPoiDirectoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  locations: PointOfInterest[];
  selectedLocation: PointOfInterest | null;
  onSelectLocation: (loc: PointOfInterest) => void;
  activeCategoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
  activeRegionFilter: string;
  onRegionFilterChange: (reg: string) => void;
  hiddenCategories: Set<string>;
  onToggleCategoryVisibility: (cat: string) => void;
  onShowAllCategories: () => void;
  onHideAllCategories: () => void;
  onOpenPoiEditor?: () => void;
}

export const MapPoiDirectoryDrawer: React.FC<MapPoiDirectoryDrawerProps> = ({
  isOpen,
  onClose,
  locations,
  selectedLocation,
  onSelectLocation,
  activeCategoryFilter,
  onCategoryFilterChange,
  activeRegionFilter,
  onRegionFilterChange,
  hiddenCategories,
  onToggleCategoryVisibility,
  onShowAllCategories,
  onHideAllCategories,
  onOpenPoiEditor,
}) => {
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState<"categories" | "list">("list");

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    locations.forEach((loc) => {
      counts[loc.category] = (counts[loc.category] || 0) + 1;
    });
    return counts;
  }, [locations]);

  // Filtered locations
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      if (hiddenCategories.has(loc.category)) return false;
      if (activeCategoryFilter !== "all" && loc.category !== activeCategoryFilter) return false;
      if (activeRegionFilter !== "all" && loc.region !== activeRegionFilter) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        loc.nameFr.toLowerCase().includes(q) ||
        loc.nameEn.toLowerCase().includes(q) ||
        loc.regionLabelFr.toLowerCase().includes(q) ||
        loc.summary.toLowerCase().includes(q) ||
        loc.tags?.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [locations, hiddenCategories, activeCategoryFilter, activeRegionFilter, search]);

  if (!isOpen) return null;

  return (
    <div
      id="map-poi-directory-drawer"
      className="absolute left-0 top-0 bottom-0 w-80 sm:w-96 bg-[#141419]/98 backdrop-blur-xl border-r border-[#2d2d35] shadow-2xl z-40 flex flex-col animate-fade-in text-[#d1d1d6]"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-[#2d2d35] bg-[#1a1a22] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#e2ba7d]/10 text-[#e2ba7d]">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#e2ba7d] uppercase tracking-wider">
              Répertoire des Lieux
            </h3>
            <p className="text-[10px] text-[#8e8e93]">
              {filteredLocations.length} / {locations.length} lieux visibles
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {onOpenPoiEditor && (
            <button
              onClick={() => {
                onOpenPoiEditor();
                onClose();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#e2ba7d] text-black text-xs font-bold hover:bg-[#edd09e] transition shadow"
              title="Créer un nouveau lieu personnalisé"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-[#8e8e93] hover:text-white rounded-lg hover:bg-[#25252b] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 p-2 gap-1.5 border-b border-[#2d2d35] bg-[#121216]">
        <button
          onClick={() => setSelectedTab("list")}
          className={`py-1.5 rounded-lg text-xs font-semibold transition ${
            selectedTab === "list"
              ? "bg-[#e2ba7d] text-black shadow-md"
              : "bg-[#1c1c24] text-[#8e8e93] hover:text-white"
          }`}
        >
          Tous les Lieux ({filteredLocations.length})
        </button>
        <button
          onClick={() => setSelectedTab("categories")}
          className={`py-1.5 rounded-lg text-xs font-semibold transition ${
            selectedTab === "categories"
              ? "bg-[#e2ba7d] text-black shadow-md"
              : "bg-[#1c1c24] text-[#8e8e93] hover:text-white"
          }`}
        >
          Filtres & Catégories ({POI_CATEGORIES.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-2.5 border-b border-[#2d2d35] bg-[#16161c]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8e8e93]" />
          <input
            type="text"
            placeholder="Rechercher par nom, faction, mot-clé..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#1f1f27] border border-[#3a3a45] rounded-lg text-xs text-white placeholder-[#8e8e93] focus:outline-none focus:border-[#e2ba7d]"
          />
        </div>
      </div>

      {/* Tab 1: Categories & Filters (Project Zomboid Checkbox Style) */}
      {selectedTab === "categories" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8e8e93] uppercase tracking-wider">
              Types de Lieux
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onShowAllCategories}
                className="text-[10px] text-[#e2ba7d] hover:underline"
              >
                Tout cocher
              </button>
              <span className="text-[#3a3a45]">|</span>
              <button
                onClick={onHideAllCategories}
                className="text-[10px] text-[#8e8e93] hover:text-white"
              >
                Tout masquer
              </button>
            </div>
          </div>

          <div className="space-y-1">
            {POI_CATEGORIES.map((cat) => {
              const isHidden = hiddenCategories.has(cat.id);
              const count = categoryCounts[cat.id] || 0;
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#1a1a22] hover:bg-[#22222d] border border-[#2d2d35] transition"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={!isHidden}
                      onChange={() => onToggleCategoryVisibility(cat.id)}
                      className="rounded accent-[#e2ba7d] w-4 h-4 cursor-pointer"
                    />
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.accentColor}33`, border: `1px solid ${cat.accentColor}` }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.accentColor }} />
                    </div>
                    <div className="min-w-0 truncate">
                      <span className="text-xs font-semibold text-white truncate block">
                        {cat.labelFr}
                      </span>
                    </div>
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2a2a35] text-[#8e8e93] font-mono">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Location List */}
      {selectedTab === "list" && (
        <div className="flex-1 overflow-y-auto divide-y divide-[#22222b] p-1">
          {filteredLocations.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8e8e93]">
              Aucun lieu ne correspond aux critères actifs.
            </div>
          ) : (
            filteredLocations.map((loc) => {
              const isSelected = selectedLocation?.id === loc.id;
              const meta = getCategoryMeta(loc.category);
              return (
                <button
                  key={loc.id}
                  onClick={() => onSelectLocation(loc)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition text-left group ${
                    isSelected
                      ? "bg-[#e2ba7d]/15 border border-[#e2ba7d]/40"
                      : "hover:bg-[#1e1e28]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg border flex items-center justify-center text-xs shrink-0 group-hover:border-[#e2ba7d]"
                      style={{
                        backgroundColor: `${meta.accentColor}22`,
                        borderColor: `${meta.accentColor}55`,
                      }}
                    >
                      <MapPin className="w-3.5 h-3.5" style={{ color: meta.accentColor }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-white group-hover:text-[#e2ba7d] truncate">
                          {loc.nameFr}
                        </span>
                        {loc.dangerLevel && loc.dangerLevel >= 4 && (
                          <span className="px-1.5 py-0.2 text-[9px] rounded bg-rose-500/20 text-rose-400 font-bold">
                            ⚠️ Péril {loc.dangerLevel}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#8e8e93] truncate">
                        {loc.regionLabelFr} • {loc.summary}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8e8e93] group-hover:text-[#e2ba7d] shrink-0 ml-2" />
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
