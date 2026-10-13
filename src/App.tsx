import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Compass,
  Map as MapIcon,
  LayoutDashboard,
  BookOpen,
  Wrench,
  Eye,
  EyeOff,
  Star,
  Search,
  Filter,
  Save,
  Check,
  Shield,
  Flame,
  ChevronDown,
  Sparkles,
  Plus,
  FileText,
} from "lucide-react";
import { MapViewer } from "./components/MapViewer";
import { LocationDrawer } from "./components/LocationDrawer";
import { CampaignDashboard } from "./components/CampaignDashboard";
import { LoreArchive } from "./components/LoreArchive";
import { GmPlanningTools } from "./components/GmPlanningTools";
import { PoiEditorModal } from "./components/PoiEditorModal";
import { PdfMapSettingsModal } from "./components/PdfMapSettingsModal";
import { DRAGON_PASS_LOCATIONS } from "./data/locations";
import { DEFAULT_CAMPAIGN } from "./data/sampleCampaign";
import { POI_CATEGORIES } from "./data/categories";
import { PointOfInterest, CustomPin, Campaign, GMNote, MapBackgroundConfig } from "./types";
import {
  getInitialCampaignFromLocalStorage,
  loadFullCampaignFromStorage,
  saveCampaignToStorage,
  loadPdfBufferFromStorage,
} from "./utils/storage";
import { loadPdfDocument, renderPdfPageToDataUrl } from "./utils/pdfMapRenderer";

export default function App() {
  // Navigation tabs
  const [activeView, setActiveView] = useState<"map" | "dashboard" | "codex" | "gm-tools">("map");

  // GM Mode toggle
  const [isGmMode, setIsGmMode] = useState<boolean>(true);

  // Campaign State (with instant LocalStorage init & IndexedDB full restore)
  const [campaign, setCampaign] = useState<Campaign>(() => getInitialCampaignFromLocalStorage());

  // Save indicator
  const [justSaved, setJustSaved] = useState(false);

  // Ref to prevent initial un-hydrated state from overwriting IndexedDB
  const isHydratedRef = useRef<boolean>(false);

  // Restore full campaign with large background from IndexedDB on startup
  useEffect(() => {
    let isMounted = true;
    loadFullCampaignFromStorage().then(async (fullCampaign) => {
      if (!isMounted) return;

      if (fullCampaign) {
        let restoredCampaign = { ...fullCampaign };

        // If background is PDF and dataUrl is missing, attempt auto-regeneration from stored PDF buffer
        if (
          restoredCampaign.mapBackground?.type === "pdf" &&
          !restoredCampaign.mapBackground.pdfDataUrl
        ) {
          try {
            const cachedPdf = await loadPdfBufferFromStorage();
            if (cachedPdf?.buffer) {
              const { pdfDoc } = await loadPdfDocument(cachedPdf.buffer, cachedPdf.fileName);
              const pageIdx = restoredCampaign.mapBackground.pdfPageIndex || 1;
              const scale = restoredCampaign.mapBackground.pdfScale || 3.0;
              const { dataUrl } = await renderPdfPageToDataUrl(pdfDoc, pageIdx, scale);

              restoredCampaign.mapBackground = {
                ...restoredCampaign.mapBackground,
                pdfDataUrl: dataUrl,
              };
            }
          } catch (err) {
            console.warn("Could not auto-regenerate PDF page dataUrl:", err);
          }
        }

        setCampaign(restoredCampaign);
      }
      isHydratedRef.current = true;
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Persist campaign changes (IndexedDB for heavy assets + safe localStorage)
  useEffect(() => {
    // Crucial: Only save AFTER initial hydration to avoid overwriting IndexedDB with stripped state!
    if (!isHydratedRef.current) return;

    let timeout: NodeJS.Timeout;
    saveCampaignToStorage(campaign)
      .then(() => {
        setJustSaved(true);
        timeout = setTimeout(() => setJustSaved(false), 2000);
      })
      .catch((e) => {
        console.warn("Storage write error", e);
      });

    return () => clearTimeout(timeout);
  }, [campaign]);


  // Selected Location Drawer
  const [selectedLocation, setSelectedLocation] = useState<PointOfInterest | null>(null);

  // POI Editor Modal State
  const [isPoiEditorOpen, setIsPoiEditorOpen] = useState(false);
  const [poiToEdit, setPoiToEdit] = useState<PointOfInterest | null>(null);
  const [poiEditorInitialCoords, setPoiEditorInitialCoords] = useState<{ x: number; y: number } | null>(null);

  // PDF Map Settings Modal State
  const [isPdfSettingsOpen, setIsPdfSettingsOpen] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilterCategory, setActiveFilterCategory] = useState<string>("all");
  const [activeFilterRegion, setActiveFilterRegion] = useState<string>("all");
  const [activeFilterRune, setActiveFilterRune] = useState<string>("all");
  const [showFilterBar, setShowFilterBar] = useState(false);

  // Combine default locations with customized / added locations
  const mergedLocations = useMemo(() => {
    const customList = campaign.customLocations || [];
    const customMap = new Map<string, PointOfInterest>();
    customList.forEach((c) => customMap.set(c.id, c));

    // Map base locations with any custom overrides
    const baseMerged = DRAGON_PASS_LOCATIONS.map((base) => {
      if (customMap.has(base.id)) {
        const custom = customMap.get(base.id)!;
        customMap.delete(base.id);
        return custom;
      }
      return base;
    });

    // Add any completely new custom locations
    const brandNew = Array.from(customMap.values());
    return [...baseMerged, ...brandNew];
  }, [campaign.customLocations]);

  // Favorites toggle
  const handleToggleFavorite = (locId: string) => {
    setCampaign((prev) => {
      const isFav = prev.favorites.includes(locId);
      const updatedFavorites = isFav
        ? prev.favorites.filter((id) => id !== locId)
        : [...prev.favorites, locId];
      return {
        ...prev,
        favorites: updatedFavorites,
        lastSaved: new Date().toISOString(),
      };
    });
  };

  // Add Custom Pin
  const handleAddCustomPin = (pinData: Omit<CustomPin, "id" | "createdAt">) => {
    const newPin: CustomPin = {
      ...pinData,
      id: `pin-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setCampaign((prev) => ({
      ...prev,
      customPins: [...prev.customPins, newPin],
      lastSaved: new Date().toISOString(),
    }));
  };

  // Delete Custom Pin
  const handleDeleteCustomPin = (pinId: string) => {
    setCampaign((prev) => ({
      ...prev,
      customPins: prev.customPins.filter((p) => p.id !== pinId),
      lastSaved: new Date().toISOString(),
    }));
  };

  // Update Location Coordinates (drag and drop repositioning)
  const handleUpdateLocationCoords = (locId: string, coords: { x: number; y: number }) => {
    setCampaign((prev) => {
      const existingCustomList = prev.customLocations || [];
      const existingIdx = existingCustomList.findIndex((l) => l.id === locId);

      let updatedList: PointOfInterest[];
      if (existingIdx >= 0) {
        updatedList = [...existingCustomList];
        updatedList[existingIdx] = {
          ...updatedList[existingIdx],
          coords,
          isModified: true,
        };
      } else {
        const basePoi = DRAGON_PASS_LOCATIONS.find((l) => l.id === locId);
        if (basePoi) {
          updatedList = [
            ...existingCustomList,
            {
              ...basePoi,
              coords,
              isModified: true,
            },
          ];
        } else {
          updatedList = existingCustomList;
        }
      }

      return {
        ...prev,
        customLocations: updatedList,
        lastSaved: new Date().toISOString(),
      };
    });

    // Update selected location if currently open
    if (selectedLocation && selectedLocation.id === locId) {
      setSelectedLocation((prev) => (prev ? { ...prev, coords, isModified: true } : null));
    }
  };

  // Save / Update POI from Modal
  const handleSavePoi = (poi: PointOfInterest) => {
    setCampaign((prev) => {
      const existingCustomList = prev.customLocations || [];
      const existingIdx = existingCustomList.findIndex((l) => l.id === poi.id);

      let updatedList: PointOfInterest[];
      if (existingIdx >= 0) {
        updatedList = [...existingCustomList];
        updatedList[existingIdx] = poi;
      } else {
        updatedList = [...existingCustomList, poi];
      }

      return {
        ...prev,
        customLocations: updatedList,
        lastSaved: new Date().toISOString(),
      };
    });

    // Always select the new or updated location so the drawer opens and user sees it
    setSelectedLocation(poi);

    // Reset filters that would hide the newly saved POI
    if (activeFilterCategory !== "all" && activeFilterCategory !== poi.category) {
      setActiveFilterCategory("all");
    }
    if (activeFilterRegion !== "all" && activeFilterRegion !== poi.region) {
      setActiveFilterRegion("all");
    }
    if (searchQuery.trim().length > 0) {
      setSearchQuery("");
    }
    // Switch to map view if in another view
    setActiveView("map");
  };

  // Delete / Revert POI
  const handleDeletePoi = (poiId: string) => {
    setCampaign((prev) => ({
      ...prev,
      customLocations: (prev.customLocations || []).filter((l) => l.id !== poiId),
      lastSaved: new Date().toISOString(),
    }));

    if (selectedLocation?.id === poiId) {
      setSelectedLocation(null);
    }
  };

  // Reset all canonical locations to official coordinates
  const handleResetPoiCoords = () => {
    const canonicalIds = new Set(DRAGON_PASS_LOCATIONS.map((l) => l.id));
    setCampaign((prev) => ({
      ...prev,
      // Retain only user-created custom locations, reset all canonical overrides
      customLocations: (prev.customLocations || []).filter((l) => !canonicalIds.has(l.id)),
      lastSaved: new Date().toISOString(),
    }));
  };

  // Update Background Config (PDF / image / default)
  const handleUpdateBackgroundConfig = (config: MapBackgroundConfig) => {
    setCampaign((prev) => ({
      ...prev,
      mapBackground: config,
      lastSaved: new Date().toISOString(),
    }));
  };

  // Open POI Editor
  const handleOpenPoiEditor = (poi?: PointOfInterest | null, coords?: { x: number; y: number } | null) => {
    setPoiToEdit(poi || null);
    setPoiEditorInitialCoords(coords || null);
    setIsPoiEditorOpen(true);
  };

  // Add GM Note
  const handleAddGMNote = (noteData: Omit<GMNote, "id" | "updatedAt">) => {
    const newNote: GMNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      updatedAt: `1625 ST - Saison ${campaign.calendar.seasonIndex + 1}`,
    };
    setCampaign((prev) => ({
      ...prev,
      notes: [newNote, ...prev.notes],
      lastSaved: new Date().toISOString(),
    }));
  };

  // Select POI by ID (e.g. from quest or note click)
  const handleSelectLocationById = (poiId: string) => {
    const found = mergedLocations.find((l) => l.id === poiId);
    if (found) {
      setSelectedLocation(found);
      setActiveView("map");
    }
  };

  // Import Campaign JSON
  const handleImportCampaign = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.title && Array.isArray(parsed.heroes)) {
        setCampaign(parsed);
        alert("Campagne importée avec succès !");
      } else {
        alert("Format de fichier de campagne invalide.");
      }
    } catch (e) {
      alert("Erreur lors de la lecture du JSON : format invalide.");
    }
  };

  // Reset Campaign
  const handleResetCampaign = () => {
    if (confirm("Voulez-vous réinitialiser toutes les données de campagne aux valeurs par défaut ?")) {
      setCampaign(DEFAULT_CAMPAIGN);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-[#d1d1d6] flex flex-col font-sans selection:bg-[#e2ba7d] selection:text-black">
      {/* Top Main Navigation Bar */}
      <header
        id="app-header"
        className="h-16 bg-[#16161a]/95 backdrop-blur-md border-b border-[#2d2d35] px-3 sm:px-6 flex items-center justify-between z-40 shrink-0 shadow-2xl"
      >
        {/* Brand & App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#25252b] border border-[#e2ba7d50] flex items-center justify-center text-[#e2ba7d] shadow-[0_0_15px_rgba(226,186,125,0.15)]">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-widest text-[#e2ba7d] uppercase">
                Passe du Dragon 1625
              </h1>
              <span className="hidden sm:inline text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#e2ba7d10] text-[#e2ba7d] border border-[#e2ba7d50]">
                RuneQuest
              </span>
            </div>
            <p className="text-[10px] text-[#8e8e93] tracking-tighter uppercase italic hidden sm:block">
              Atlas & Gestionnaire de Campagnes Glorantha
            </p>
          </div>
        </div>

        {/* Center Main Views Switcher */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-[#25252b]/80 p-1 rounded-full border border-[#3a3a45]">
          <button
            id="nav-map-tab"
            onClick={() => setActiveView("map")}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeView === "map"
                ? "bg-[#e2ba7d] text-black font-bold shadow-lg"
                : "text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-white/5"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Atlas de Sartar</span>
          </button>

          <button
            id="nav-dashboard-tab"
            onClick={() => setActiveView("dashboard")}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeView === "dashboard"
                ? "bg-[#e2ba7d] text-black font-bold shadow-lg"
                : "text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-white/5"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Campagne</span>
          </button>

          <button
            id="nav-codex-tab"
            onClick={() => setActiveView("codex")}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeView === "codex"
                ? "bg-[#e2ba7d] text-black font-bold shadow-lg"
                : "text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-white/5"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Archives du Lore</span>
          </button>

          <button
            id="nav-tools-tab"
            onClick={() => setActiveView("gm-tools")}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeView === "gm-tools"
                ? "bg-[#e2ba7d] text-black font-bold shadow-lg"
                : "text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-white/5"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Outils MJ</span>
          </button>
        </nav>

        {/* Right Settings: GM Mode & AutoSave */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* GM Mode Toggle Button */}
          <button
            id="btn-toggle-gm-mode"
            onClick={() => setIsGmMode(!isGmMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
              isGmMode
                ? "bg-red-500/10 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.25)]"
                : "bg-[#25252b] text-[#8e8e93] border-[#3a3a45] hover:text-[#d1d1d6]"
            }`}
            title="Basculer entre vue Joueur et vue Maître de Jeu (révèle les secrets et stats)"
          >
            {isGmMode ? <Eye className="w-3.5 h-3.5 text-red-400" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isGmMode ? "Mode MJ" : "Mode Joueur"}</span>
          </button>

          {/* Quick Filter toggle in Map view */}
          {activeView === "map" && (
            <button
              onClick={() => setShowFilterBar(!showFilterBar)}
              className={`p-2 rounded-full border text-xs font-semibold transition ${
                showFilterBar || activeFilterCategory !== "all" || activeFilterRegion !== "all"
                  ? "bg-[#e2ba7d] text-black border-[#e2ba7d] shadow-md"
                  : "bg-[#25252b] text-[#8e8e93] border-[#3a3a45] hover:text-[#d1d1d6]"
              }`}
              title="Filtres par Catégorie, Région et Runes"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
          )}

          {/* AutoSave Indicator */}
          <div
            className="hidden lg:flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-full bg-[#1a1a20] border border-[#2d2d35]"
            title="Sauvegarde locale automatique active"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                justSaved
                  ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                  : "bg-emerald-600/70"
              }`}
            ></span>
            <span className="text-[#8e8e93] text-[10px] tracking-tight uppercase">
              {justSaved ? "Synchro OK" : "Local Sync"}
            </span>
          </div>
        </div>
      </header>

      {/* Secondary Filter Bar for Map */}
      {activeView === "map" && showFilterBar && (
        <div
          id="map-filter-subbar"
          className="bg-[#16161a] border-b border-[#2d2d35] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs z-30 shadow-2xl animate-fade-in"
        >
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#8e8e93] font-semibold text-[11px] uppercase tracking-wider">
                Catégorie :
              </span>
              <select
                value={activeFilterCategory}
                onChange={(e) => setActiveFilterCategory(e.target.value)}
                className="bg-[#25252b] border border-[#3a3a45] rounded-lg px-2.5 py-1 text-xs text-[#e2ba7d] outline-none focus:border-[#e2ba7d]"
              >
                <option value="all">Toutes les catégories ({POI_CATEGORIES.length})</option>
                {POI_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.labelFr}
                  </option>
                ))}
              </select>
            </div>

            {/* Region Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#8e8e93] font-semibold text-[11px] uppercase tracking-wider">
                Région :
              </span>
              <select
                value={activeFilterRegion}
                onChange={(e) => setActiveFilterRegion(e.target.value)}
                className="bg-[#25252b] border border-[#3a3a45] rounded-lg px-2.5 py-1 text-xs text-[#e2ba7d] outline-none focus:border-[#e2ba7d]"
              >
                <option value="all">Toutes les régions</option>
                <option value="sartar">Sartar (Royaume)</option>
                <option value="prax">Prax (Plaines)</option>
                <option value="tarsh">Tarsh (Province)</option>
                <option value="esrolia">Esrolia (Baie)</option>
                <option value="paturages">Pâturages (Grazelands)</option>
                <option value="vallee_betes">Vallée des Bêtes</option>
                <option value="dagori_inkarth">Dâgori Inkarth (Trolls)</option>
                <option value="pays_heort">Pays d'Héort</option>
                <option value="comte_soleil">Comté du Soleil</option>
                <option value="comte_pavis">Comté de Pavis</option>
              </select>
            </div>

            {/* Rune Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#8e8e93] font-semibold text-[11px] uppercase tracking-wider">
                Rune :
              </span>
              <select
                value={activeFilterRune}
                onChange={(e) => setActiveFilterRune(e.target.value)}
                className="bg-[#25252b] border border-[#3a3a45] rounded-lg px-2.5 py-1 text-xs text-[#e2ba7d] outline-none focus:border-[#e2ba7d]"
              >
                <option value="all">Toutes les runes</option>
                <option value="air">Air (Orlanth)</option>
                <option value="earth">Terre (Ernalda)</option>
                <option value="fire_sky">Feu / Ciel (Yelm)</option>
                <option value="darkness">Ténèbres (Uz)</option>
                <option value="dragon">Dragon (EWF)</option>
                <option value="death">Mort (Humakt)</option>
                <option value="fertility">Fertilité</option>
                <option value="moon">Lune (Empire Lunar)</option>
                <option value="water">Eau (Magasta / Engizi)</option>
                <option value="beast">Bête / Hommes-Bêtes</option>
                <option value="man">Homme / Humanité</option>
                <option value="truth">Vérité (Lhankor Mhy)</option>
                <option value="harmony">Harmonie (Chalana Arroy)</option>
                <option value="chaos">Chaos (Thed / Krarsht)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(activeFilterCategory !== "all" ||
              activeFilterRegion !== "all" ||
              activeFilterRune !== "all") && (
              <button
                onClick={() => {
                  setActiveFilterCategory("all");
                  setActiveFilterRegion("all");
                  setActiveFilterRune("all");
                }}
                className="text-[#e2ba7d] hover:underline text-xs"
              >
                Réinitialiser les filtres
              </button>
            )}
            <button
              onClick={() => setShowFilterBar(false)}
              className="text-[#8e8e93] hover:text-[#d1d1d6] p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 relative flex flex-col overflow-hidden">
        {/* VIEW 1: Interactive Map */}
        {activeView === "map" && (
          <div className="relative w-full h-full flex-1">
            <MapViewer
              locations={mergedLocations}
              customPins={campaign.customPins}
              favorites={campaign.favorites}
              selectedLocation={selectedLocation}
              onSelectLocation={(loc) => setSelectedLocation(loc)}
              onToggleFavorite={handleToggleFavorite}
              onAddCustomPin={handleAddCustomPin}
              onDeleteCustomPin={handleDeleteCustomPin}
              isGmMode={isGmMode}
              activeFilterCategory={activeFilterCategory}
              activeFilterRegion={activeFilterRegion}
              activeFilterRune={activeFilterRune}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              backgroundConfig={
                campaign.mapBackground || {
                  type: "default_svg",
                  opacity: 1,
                  brightness: 1,
                  contrast: 1,
                }
              }
              onUpdateBackgroundConfig={handleUpdateBackgroundConfig}
              onOpenPdfSettings={() => setIsPdfSettingsOpen(true)}
              onOpenPoiEditor={handleOpenPoiEditor}
              onUpdateLocationCoords={handleUpdateLocationCoords}
              onResetPoiCoords={handleResetPoiCoords}
              campaign={campaign}
              onUpdateCampaign={setCampaign}
            />

            {/* Location Detail Drawer */}
            <LocationDrawer
              location={selectedLocation}
              onClose={() => setSelectedLocation(null)}
              isFavorite={
                selectedLocation ? campaign.favorites.includes(selectedLocation.id) : false
              }
              onToggleFavorite={handleToggleFavorite}
              isGmMode={isGmMode}
              onAddNote={handleAddGMNote}
              onEditLocation={(loc) => handleOpenPoiEditor(loc)}
              onUpdateLocation={handleSavePoi}
            />
          </div>
        )}

        {/* VIEW 2: Campaign Dashboard */}
        {activeView === "dashboard" && (
          <div className="flex-1 overflow-y-auto">
            <CampaignDashboard
              campaign={campaign}
              onUpdateCampaign={(updater) => setCampaign(updater)}
              locations={mergedLocations}
              onSelectLocationById={handleSelectLocationById}
              isGmMode={isGmMode}
            />
          </div>
        )}

        {/* VIEW 3: Lore Archive & Wiki */}
        {activeView === "codex" && (
          <div className="flex-1 overflow-y-auto">
            <LoreArchive />
          </div>
        )}

        {/* VIEW 4: GM Planning & Backups */}
        {activeView === "gm-tools" && (
          <div className="flex-1 overflow-y-auto">
            <GmPlanningTools
              campaign={campaign}
              onUpdateCampaign={(updater) => setCampaign(updater)}
              locations={mergedLocations}
              onSelectLocationById={handleSelectLocationById}
              onImportCampaign={handleImportCampaign}
              onResetCampaign={handleResetCampaign}
            />
          </div>
        )}
      </main>

      {/* POI Editor Modal */}
      <PoiEditorModal
        isOpen={isPoiEditorOpen}
        onClose={() => setIsPoiEditorOpen(false)}
        poiToEdit={poiToEdit}
        initialCoords={poiEditorInitialCoords}
        onSavePoi={handleSavePoi}
        onDeletePoi={handleDeletePoi}
      />

      {/* PDF Map Background Settings Modal */}
      <PdfMapSettingsModal
        isOpen={isPdfSettingsOpen}
        onClose={() => setIsPdfSettingsOpen(false)}
        backgroundConfig={
          campaign.mapBackground || {
            type: "default_svg",
            opacity: 1,
            brightness: 1,
            contrast: 1,
          }
        }
        onUpdateBackgroundConfig={handleUpdateBackgroundConfig}
      />
    </div>
  );
}
