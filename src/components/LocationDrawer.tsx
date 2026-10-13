import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Star,
  ExternalLink,
  BookOpen,
  Eye,
  Shield,
  MapPin,
  Sparkles,
  Users,
  Compass,
  AlertTriangle,
  FileText,
  Loader2,
  Bookmark,
  Share2,
  Edit3,
  Image as ImageIcon,
  Upload,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Plus,
  Trash2,
} from "lucide-react";
import { PointOfInterest, GMNote } from "../types";
import { GLORANTHA_RUNES } from "../data/gloranthaLore";
import { getCategoryMeta } from "../data/categories";
import { processImageFile } from "../utils/imageUtils";
import { fetchWikiPageSafe, searchWikiSafe, getProceduralGloranthaLore } from "../utils/loreGenerator";

interface LocationDrawerProps {
  location: PointOfInterest | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isGmMode: boolean;
  onAddNote: (note: Omit<GMNote, "id" | "updatedAt">) => void;
  onGenerateNPCForLocation?: (loc: PointOfInterest) => void;
  onEditLocation?: (loc: PointOfInterest) => void;
  onUpdateLocation?: (loc: PointOfInterest) => void;
}

export const LocationDrawer: React.FC<LocationDrawerProps> = ({
  location,
  onClose,
  isFavorite,
  onToggleFavorite,
  isGmMode,
  onAddNote,
  onGenerateNPCForLocation,
  onEditLocation,
  onUpdateLocation,
}) => {
  const [activeTab, setActiveTab] = useState<"lore" | "gallery" | "secrets" | "wiki" | "notes">("lore");
  
  // Wiki fetching state
  const [wikiLoading, setWikiLoading] = useState(false);
  const [wikiData, setWikiData] = useState<{
    title: string;
    html: string;
    categories: string[];
    url: string;
  } | null>(null);
  const [wikiError, setWikiError] = useState<string | null>(null);

  // AI Translation/Summary State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  // Quick note state
  const [quickNoteTitle, setQuickNoteTitle] = useState("");
  const [quickNoteContent, setQuickNoteContent] = useState("");
  const [noteAddedToast, setNoteAddedToast] = useState(false);

  // Lightbox Image Preview State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const drawerFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!location) {
      setWikiData(null);
      setAiSummary(null);
      setWikiError(null);
      setLightboxIndex(null);
      return;
    }

    // Reset tab if switching to location and not in GM mode
    if (!isGmMode && activeTab === "secrets") {
      setActiveTab("lore");
    }

    // Auto load wiki if tab is wiki or title exists
    if (location.wikiTitle) {
      fetchWikiArticle(location.wikiTitle);
    } else {
      fetchWikiArticle(location.nameEn || location.nameFr);
    }
  }, [location?.id]);

  const fetchWikiArticle = async (queryTitle: string) => {
    setWikiLoading(true);
    setWikiError(null);
    setAiSummary(null);

    try {
      // First try direct page title fetch (supports both server proxy and direct CORS fallback)
      let pageData = await fetchWikiPageSafe(queryTitle);
      if (pageData) {
        setWikiData(pageData);
      } else {
        // Fallback to wiki search
        const hits = await searchWikiSafe(queryTitle);
        if (hits && hits.length > 0) {
          const firstHit = hits[0];
          const pageRes = await fetchWikiPageSafe(firstHit.title);
          if (pageRes) {
            setWikiData(pageRes);
          } else {
            setWikiError("Article introuvable sur le wiki.");
          }
        } else {
          setWikiError("Aucun résultat correspondant sur Glorantha Fandom Wiki.");
        }
      }
    } catch (err: any) {
      setWikiError("Erreur de connexion au wiki Glorantha.");
    } finally {
      setWikiLoading(false);
    }
  };

  const handleAiTranslate = async () => {
    if (!location) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/gemini/generate-lore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "wiki-summary",
          context: `Lieu: ${location.nameFr} (${location.nameEn}), Région: ${location.regionLabelFr}.`,
          prompt: `Génère un résumé complet en français des chroniques et du lore de ${location.nameFr} (${location.nameEn}) pour RuneQuest Glorantha en 1625 ST. Décris les légendes fondatrices, les cultes locaux, les coutumes des habitants et les dangers actuels.`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          setAiSummary(data.text);
          return;
        }
      }
      // If server route not available (e.g. static GitHub Pages), use client procedural lore
      const fallback = getProceduralGloranthaLore("wiki-summary", `${location.nameFr} (${location.nameEn})`);
      setAiSummary(fallback);
    } catch (err: any) {
      // Offline / static hosting fallback
      const fallback = getProceduralGloranthaLore("wiki-summary", `${location.nameFr} (${location.nameEn})`);
      setAiSummary(fallback);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !quickNoteTitle.trim()) return;

    onAddNote({
      title: quickNoteTitle.trim(),
      category: "lore",
      content: quickNoteContent.trim(),
      linkedPoiId: location.id,
      tags: [location.regionLabelFr, location.nameFr],
    });

    setQuickNoteTitle("");
    setQuickNoteContent("");
    setNoteAddedToast(true);
    setTimeout(() => setNoteAddedToast(false), 3000);
  };

  // Direct image upload from drawer
  const handleDrawerFileUpload = async (files: FileList | null) => {
    if (!location || !files || files.length === 0) return;
    setIsUploadingImage(true);
    try {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
          const dataUrl = await processImageFile(file);
          newImages.push(dataUrl);
        }
      }

      if (newImages.length > 0) {
        const currentImages = location.images || [];
        const updatedImages = [...currentImages, ...newImages];
        const updatedPoi: PointOfInterest = {
          ...location,
          images: updatedImages,
          coverImage: location.coverImage || newImages[0],
          isModified: true,
        };
        if (onUpdateLocation) {
          onUpdateLocation(updatedPoi);
        }
      }
    } catch (e) {
      alert("Impossible de charger l'image.");
    } finally {
      setIsUploadingImage(false);
      if (drawerFileInputRef.current) drawerFileInputRef.current.value = "";
    }
  };

  const handleSetCover = (imgUrl: string) => {
    if (!location || !onUpdateLocation) return;
    onUpdateLocation({
      ...location,
      coverImage: imgUrl,
      isModified: true,
    });
  };

  const handleDeleteImage = (imgIdx: number) => {
    if (!location || !onUpdateLocation) return;
    const currentImages = location.images || [];
    const target = currentImages[imgIdx];
    const updatedImages = currentImages.filter((_, idx) => idx !== imgIdx);
    let newCover = location.coverImage;
    if (location.coverImage === target) {
      newCover = updatedImages.length > 0 ? updatedImages[0] : undefined;
    }
    onUpdateLocation({
      ...location,
      images: updatedImages,
      coverImage: newCover,
      isModified: true,
    });
  };

  if (!location) return null;

  const images = location.images || [];
  const activeCover = location.coverImage || (images.length > 0 ? images[0] : null);

  return (
    <div
      id="location-detail-drawer"
      className="fixed inset-y-0 right-0 w-full sm:w-[480px] lg:w-[540px] bg-[#16161a]/95 text-[#d1d1d6] border-l border-[#2d2d35] shadow-2xl z-50 flex flex-col backdrop-blur-xl animate-slide-left font-sans"
    >
      {/* Hidden file picker input */}
      <input
        ref={drawerFileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        multiple
        className="hidden"
        onChange={(e) => handleDrawerFileUpload(e.target.files)}
      />

      {/* Hero Banner (if image uploaded) */}
      {activeCover ? (
        <div className="relative w-full h-44 sm:h-52 bg-black shrink-0 overflow-hidden group border-b border-[#2d2d35]">
          <img
            src={activeCover}
            alt={location.nameFr}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#16161a] via-[#16161a]/30 to-transparent" />

          {/* Quick Header Overlay Buttons */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            <button
              onClick={() => {
                const idx = images.indexOf(activeCover);
                setLightboxIndex(idx >= 0 ? idx : 0);
              }}
              className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition shadow-md"
              title="Agrandir en plein écran"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              id="btn-close-drawer-hero"
              onClick={onClose}
              className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition shadow-md"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Image Count & Add button badge */}
          <div className="absolute bottom-2.5 right-3 flex items-center gap-2">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[#e2ba7d] border border-[#e2ba7d]/30 font-medium flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              <span>{images.length} {images.length > 1 ? "illustrations" : "illustration"}</span>
            </span>
            <button
              onClick={() => drawerFileInputRef.current?.click()}
              className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#e2ba7d]/90 hover:bg-[#e2ba7d] text-black font-bold flex items-center gap-1 transition shadow-md"
              title="Ajouter une autre illustration"
            >
              <Plus className="w-3 h-3" /> Ajouter
            </button>
          </div>
        </div>
      ) : null}

      {/* Header Info */}
      <div className="p-4 sm:p-5 border-b border-[#2d2d35] bg-[#16161a] flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#e2ba7d10] text-[#e2ba7d] border border-[#e2ba7d50]">
                {location.regionLabelFr}
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${
                  getCategoryMeta(location.category).badgeClass
                }`}
              >
                {getCategoryMeta(location.category).labelFr}
              </span>
              {(location.isCustom || location.isModified) && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/60 font-mono">
                  {location.isCustom ? "Lieu Créé" : "Personnalisé"}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-wide text-[#e2ba7d]">
              {location.nameFr}
            </h2>
            {location.nameEn && location.nameEn !== location.nameFr && (
              <p className="text-xs text-[#8e8e93] italic">
                (Nom original : {location.nameEn})
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Upload Button if no hero exists */}
            {!activeCover && (
              <button
                onClick={() => drawerFileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#25252b] hover:bg-[#e2ba7d20] text-amber-300 border border-amber-500/40 hover:border-amber-400 transition text-xs font-semibold shadow-sm"
                title="Téléverser une illustration pour ce lieu"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Image</span>
              </button>
            )}

            {/* Edit POI button */}
            {onEditLocation && (
              <button
                id="btn-edit-location-drawer"
                onClick={() => onEditLocation(location)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25252b] hover:bg-[#e2ba7d20] text-[#e2ba7d] border border-[#e2ba7d50] hover:border-[#e2ba7d] transition text-xs font-semibold shadow-sm"
                title="Modifier / Personnaliser ce lieu"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Personnaliser</span>
              </button>
            )}

            {/* Favorite button */}
            <button
              id="btn-toggle-favorite-drawer"
              onClick={() => onToggleFavorite(location.id)}
              className={`p-2 rounded-full border transition ${
                isFavorite
                  ? "bg-[#e2ba7d] text-black border-[#e2ba7d] shadow-md"
                  : "bg-[#25252b] text-[#8e8e93] border-[#3a3a45] hover:text-[#e2ba7d]"
              }`}
              title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Star className="w-4 h-4 fill-current" />
            </button>

            {/* Close button if not in hero */}
            {!activeCover && (
              <button
                id="btn-close-drawer"
                onClick={onClose}
                className="p-2 rounded-full bg-[#25252b] hover:bg-white/5 text-[#8e8e93] hover:text-white border border-[#3a3a45] transition"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Runes Affinities Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-[#8e8e93]">Runes :</span>
          {location.runes.map((runeId) => {
            const runeInfo = GLORANTHA_RUNES.find((r) => r.id === runeId);
            return (
              <span
                key={runeId}
                className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#25252b] text-[#e2ba7d] border border-[#3a3a45] flex items-center gap-1 shadow-sm"
                title={runeInfo ? `${runeInfo.nameFr}: ${runeInfo.description}` : runeId}
              >
                <span>{runeInfo?.symbol || "ᛟ"}</span>
                <span>{runeInfo?.nameFr.split("/")[0] || runeId}</span>
              </span>
            );
          })}

          {location.dangerLevel && (
            <span
              className={`ml-auto text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                location.dangerLevel >= 4
                  ? "bg-red-500/10 text-red-400 border border-red-500/40"
                  : location.dangerLevel >= 3
                  ? "bg-[#e2ba7d10] text-[#e2ba7d] border border-[#e2ba7d50]"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/40"
              }`}
            >
              Danger : {location.dangerLevel}/5
            </span>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-[#2d2d35] -mb-5 pt-2 overflow-x-auto text-xs font-semibold">
          <button
            id="tab-lore"
            onClick={() => setActiveTab("lore")}
            className={`py-2 px-3 border-b-2 flex items-center justify-center gap-1.5 transition whitespace-nowrap ${
              activeTab === "lore"
                ? "border-[#e2ba7d] text-[#e2ba7d]"
                : "border-transparent text-[#8e8e93] hover:text-[#d1d1d6]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Lore & Cadre
          </button>

          <button
            id="tab-gallery"
            onClick={() => setActiveTab("gallery")}
            className={`py-2 px-3 border-b-2 flex items-center justify-center gap-1.5 transition whitespace-nowrap ${
              activeTab === "gallery"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-[#8e8e93] hover:text-amber-200"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Galerie ({images.length})
          </button>

          {isGmMode && (
            <button
              id="tab-secrets"
              onClick={() => setActiveTab("secrets")}
              className={`py-2 px-3 border-b-2 flex items-center justify-center gap-1.5 transition whitespace-nowrap ${
                activeTab === "secrets"
                  ? "border-red-400 text-red-400 bg-red-500/5"
                  : "border-transparent text-red-400/70 hover:text-red-300"
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-red-400" /> Secrets MJ
            </button>
          )}

          <button
            id="tab-wiki"
            onClick={() => setActiveTab("wiki")}
            className={`py-2 px-3 border-b-2 flex items-center justify-center gap-1.5 transition whitespace-nowrap ${
              activeTab === "wiki"
                ? "border-[#e2ba7d] text-[#e2ba7d]"
                : "border-transparent text-[#8e8e93] hover:text-[#d1d1d6]"
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" /> Wiki Fandom
          </button>

          <button
            id="tab-notes"
            onClick={() => setActiveTab("notes")}
            className={`py-2 px-3 border-b-2 flex items-center justify-center gap-1.5 transition whitespace-nowrap ${
              activeTab === "notes"
                ? "border-[#e2ba7d] text-[#e2ba7d]"
                : "border-transparent text-[#8e8e93] hover:text-[#d1d1d6]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Notes
          </button>
        </div>
      </div>

      {/* Drawer Body Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {/* TAB 1: Lore & Environment */}
        {activeTab === "lore" && (
          <div className="space-y-4 text-xs sm:text-sm text-[#d1d1d6] leading-relaxed animate-fade-in">
            {/* Summary Box */}
            <div className="p-3.5 rounded-xl bg-[#1a1a20] border border-[#2d2d35] text-[#d1d1d6] italic leading-relaxed">
              "{location.summary}"
            </div>

            {/* Detailed Description */}
            <div className="bg-[#16161a]/95 border border-[#2d2d35] p-4 rounded-xl shadow-lg">
              <h4 className="text-xs font-bold text-[#e2ba7d] uppercase tracking-widest mb-2 flex items-center gap-1 pb-1.5 border-b border-[#2d2d35]">
                <Compass className="w-3.5 h-3.5" /> Description & Atmosphère
              </h4>
              <p className="whitespace-pre-line text-[#d1d1d6] leading-relaxed">{location.detailedLore}</p>
            </div>

            {/* Strategic Stats & Societal Information */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {location.leader && (
                <div className="p-3 rounded-xl bg-[#1a1a20] border border-[#2d2d35]">
                  <span className="text-[10px] text-[#8e8e93] block font-semibold uppercase tracking-wider">Dirigeant</span>
                  <span className="text-[#e2ba7d] font-bold">{location.leader}</span>
                </div>
              )}

              {location.population && (
                <div className="p-3 rounded-xl bg-[#1a1a20] border border-[#2d2d35]">
                  <span className="text-[10px] text-[#8e8e93] block font-semibold uppercase tracking-wider">Population</span>
                  <span className="text-[#d1d1d6] font-medium">{location.population}</span>
                </div>
              )}
            </div>

            {/* Factions in place */}
            {location.factions && location.factions.length > 0 && (
              <div className="bg-[#16161a]/95 border border-[#2d2d35] p-4 rounded-xl shadow-lg">
                <h4 className="text-xs font-bold text-[#e2ba7d] uppercase tracking-widest mb-2 flex items-center gap-1 pb-1.5 border-b border-[#2d2d35]">
                  <Users className="w-3.5 h-3.5" /> Factions & Cultes Présents
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {location.factions.map((fac, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-[#25252b] border border-[#3a3a45] text-[#d1d1d6] text-xs rounded-full"
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {location.tags && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {location.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] text-[#8e8e93] bg-[#25252b] px-2.5 py-0.5 rounded-full border border-[#3a3a45]"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GALLERY & PLANS */}
        {activeTab === "gallery" && (
          <div className="space-y-4 animate-fade-in">
            {/* Quick Upload Drop Box */}
            <div
              onClick={() => drawerFileInputRef.current?.click()}
              className="border-2 border-dashed border-[#3a3a45] hover:border-[#e2ba7d] bg-[#1a1a20] hover:bg-[#202028] p-4 rounded-2xl flex items-center justify-center gap-3 cursor-pointer transition text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-[#e2ba7d]/10 text-[#e2ba7d] flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-[#e2ba7d]">Ajouter une illustration ou un plan</h4>
                <p className="text-[10px] text-[#8e8e93]">Cliquez pour importer depuis votre ordinateur</p>
              </div>
            </div>

            {images.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#16161a] border border-[#2d2d35] text-center text-[#8e8e93] space-y-2">
                <ImageIcon className="w-10 h-10 mx-auto opacity-30 text-[#e2ba7d]" />
                <p className="text-xs">Aucune image enregistrée pour ce lieu.</p>
                <p className="text-[11px] text-[#8e8e93]/70">
                  Ajoutez des plans de ville, portraits de PNJ ou paysages pour enrichir vos sessions.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {images.map((imgUrl, idx) => {
                  const isCover = location.coverImage === imgUrl;
                  return (
                    <div
                      key={idx}
                      className={`group relative rounded-xl overflow-hidden border bg-[#121215] aspect-video flex items-center justify-center transition shadow-md ${
                        isCover
                          ? "border-[#e2ba7d] ring-1 ring-[#e2ba7d]"
                          : "border-[#2d2d35] hover:border-[#3a3a45]"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Illustration ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300 cursor-pointer"
                        onClick={() => setLightboxIndex(idx)}
                      />

                      {/* Cover Star Badge */}
                      {isCover && (
                        <div className="absolute top-2 left-2 bg-[#e2ba7d] text-black font-bold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md pointer-events-none">
                          <Star className="w-2.5 h-2.5 fill-black" />
                          <span>Principale</span>
                        </div>
                      )}

                      {/* Action overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 p-2">
                        <button
                          onClick={() => setLightboxIndex(idx)}
                          className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white hover:text-black transition"
                          title="Agrandir"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        {!isCover && onUpdateLocation && (
                          <button
                            onClick={() => handleSetCover(imgUrl)}
                            className="p-1.5 rounded-lg bg-amber-500/80 text-black hover:bg-amber-400 transition"
                            title="Définir comme couverture principale"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onUpdateLocation && (
                          <button
                            onClick={() => {
                              if (confirm("Supprimer cette illustration du lieu ?")) {
                                handleDeleteImage(idx);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-red-600/80 text-white hover:bg-red-500 transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GM Secrets & Scenario Hooks */}
        {activeTab === "secrets" && isGmMode && (
          <div className="space-y-4 text-xs sm:text-sm leading-relaxed animate-fade-in">
            {/* Warning banner */}
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Section confidentielle réservée au Maître de Jeu.</span>
            </div>

            {/* GM Secrets */}
            {location.gmSecrets && (
              <div className="bg-[#16161a]/95 border border-red-500/30 p-4 rounded-xl shadow-xl">
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1 pb-1.5 border-b border-red-500/20">
                  <Eye className="w-3.5 h-3.5" /> Vérité Cachée & Secrets de Jeu
                </h4>
                <div className="text-[#d1d1d6] whitespace-pre-line leading-relaxed">
                  {location.gmSecrets}
                </div>
              </div>
            )}

            {/* Adventure Hooks */}
            {location.adventureHooks && location.adventureHooks.length > 0 && (
              <div className="bg-[#16161a]/95 border border-[#2d2d35] p-4 rounded-xl shadow-xl">
                <h4 className="text-xs font-bold text-[#e2ba7d] uppercase tracking-widest mb-3 flex items-center gap-1 pb-1.5 border-b border-[#2d2d35]">
                  <Sparkles className="w-3.5 h-3.5 text-[#e2ba7d]" /> Pistes d'Aventures Immédiates
                </h4>
                <div className="space-y-2">
                  {location.adventureHooks.map((hook, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#25252b] border border-[#3a3a45] rounded-xl text-[#d1d1d6] flex gap-2.5 items-start"
                    >
                      <span className="text-[#e2ba7d] font-bold font-mono text-xs">0{idx + 1}.</span>
                      <span className="leading-relaxed">{hook}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick GM Generator Button */}
            {onGenerateNPCForLocation && (
              <div className="pt-2">
                <button
                  id="btn-gen-npc-drawer"
                  onClick={() => onGenerateNPCForLocation(location)}
                  className="w-full py-2.5 px-4 bg-[#e2ba7d] hover:bg-[#edd09e] text-black font-bold rounded-full shadow-lg flex items-center justify-center gap-2 transition text-xs"
                >
                  <Sparkles className="w-4 h-4" /> Générer un PNJ local avec l'IA Érudit
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Wiki Fandom Live Integration */}
        {activeTab === "wiki" && (
          <div className="space-y-4 text-xs sm:text-sm animate-fade-in">
            {/* Controls Bar */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1a1a20] border border-[#2d2d35]">
              <span className="text-xs text-[#8e8e93] font-medium">
                Archives Fandom : {wikiData?.title || location.nameEn}
              </span>
              <div className="flex items-center gap-2">
                <button
                  id="btn-ai-translate-wiki"
                  onClick={handleAiTranslate}
                  disabled={aiLoading}
                  className="px-3 py-1 bg-[#e2ba7d] hover:bg-[#edd09e] disabled:opacity-50 text-black font-bold text-xs rounded-full flex items-center gap-1 shadow transition"
                >
                  {aiLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  <span>Résumer en Français (IA)</span>
                </button>
                {wikiData?.url && (
                  <a
                    href={wikiData.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-full bg-[#25252b] border border-[#3a3a45] text-[#8e8e93] hover:text-white"
                    title="Ouvrir sur le wiki officiel"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* AI Summary in French if requested */}
            {aiSummary && (
              <div className="p-4 bg-[#16161a] border border-[#e2ba7d50] rounded-xl text-[#d1d1d6] space-y-2 shadow-xl">
                <div className="flex items-center gap-1.5 font-bold text-[#e2ba7d] text-xs uppercase tracking-widest pb-1 border-b border-[#2d2d35]">
                  <Sparkles className="w-3.5 h-3.5" /> Synthèse de l'Érudit de Lhankor Mhy :
                </div>
                <div className="whitespace-pre-line text-xs leading-relaxed text-[#d1d1d6]">
                  {aiSummary}
                </div>
              </div>
            )}

            {/* Wiki Live Content */}
            {wikiLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-[#8e8e93] space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#e2ba7d]" />
                <span className="text-xs">Consultation des archives du Wiki Fandom...</span>
              </div>
            ) : wikiError ? (
              <div className="p-4 bg-[#1a1a20] rounded-xl border border-[#2d2d35] text-center text-[#8e8e93] space-y-2">
                <p>{wikiError}</p>
                <button
                  onClick={() => fetchWikiArticle(location.nameEn || location.nameFr)}
                  className="text-xs text-[#e2ba7d] hover:underline"
                >
                  Réessayer la recherche
                </button>
              </div>
            ) : wikiData ? (
              <div className="space-y-3 bg-[#16161a]/95 border border-[#2d2d35] p-4 rounded-xl shadow-xl">
                <div className="flex items-center justify-between text-xs text-[#8e8e93] pb-2 border-b border-[#2d2d35]">
                  <span className="font-bold text-[#e2ba7d]">Article : {wikiData.title}</span>
                </div>

                {/* Safe preview container for wiki text */}
                <div
                  className="text-[#d1d1d6] text-xs leading-relaxed max-w-none space-y-2 wiki-content-block"
                  dangerouslySetInnerHTML={{
                    __html: wikiData.html
                      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
                      .replace(/href="\/wiki\//g, 'target="_blank" href="https://glorantha.fandom.com/wiki/'),
                  }}
                />

                {wikiData.categories.length > 0 && (
                  <div className="pt-3 border-t border-[#2d2d35]">
                    <span className="text-[11px] text-[#8e8e93] block mb-1">Catégories Wiki :</span>
                    <div className="flex flex-wrap gap-1">
                      {wikiData.categories.slice(0, 6).map((cat, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-[#25252b] text-[#8e8e93] text-[10px] rounded-full border border-[#3a3a45]"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* TAB 5: Quick Notes */}
        {activeTab === "notes" && (
          <div className="space-y-4 animate-fade-in">
            {noteAddedToast && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <span>✓ Note enregistrée dans le carnet de campagne !</span>
              </div>
            )}

            <form onSubmit={handleSaveQuickNote} className="space-y-3 bg-[#16161a]/95 border border-[#2d2d35] p-4 rounded-xl shadow-xl">
              <div>
                <label className="text-xs font-bold text-[#e2ba7d] uppercase tracking-widest block mb-1.5">
                  Titre de la note
                </label>
                <input
                  type="text"
                  value={quickNoteTitle}
                  onChange={(e) => setQuickNoteTitle(e.target.value)}
                  placeholder={`Ex: Rencontre avec le Thane à ${location.nameFr}`}
                  className="w-full bg-[#25252b] border border-[#3a3a45] rounded-lg px-3 py-2 text-xs text-[#d1d1d6] focus:border-[#e2ba7d] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#e2ba7d] uppercase tracking-widest block mb-1.5">
                  Contenu de la note de session
                </label>
                <textarea
                  value={quickNoteContent}
                  onChange={(e) => setQuickNoteContent(e.target.value)}
                  rows={5}
                  placeholder="Notes de jeu, indices trouvés, trésors cachés, accords tribaux..."
                  className="w-full bg-[#25252b] border border-[#3a3a45] rounded-lg p-3 text-xs text-[#d1d1d6] focus:border-[#e2ba7d] outline-none resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#e2ba7d] hover:bg-[#edd09e] text-black font-bold text-xs rounded-full shadow-lg flex items-center justify-center gap-1.5 transition"
              >
                <FileText className="w-4 h-4" /> Enregistrer la Note
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Top bar */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between text-white z-10">
            <span className="text-xs text-[#8e8e93] font-mono">
              {location.nameFr} — {lightboxIndex + 1} / {images.length}
            </span>
            <button
              onClick={() => setLightboxIndex(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Prev / Next controls */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : 0));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev !== null ? (prev + 1) % images.length : 0));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image */}
          <img
            src={images[lightboxIndex]}
            alt={location.nameFr}
            className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
