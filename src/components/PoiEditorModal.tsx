import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Save,
  Trash2,
  Copy,
  MapPin,
  Flame,
  Shield,
  Skull,
  Trees,
  Landmark,
  Sparkles,
  Castle,
  Anchor,
  Warehouse,
  GitCommit,
  Pickaxe,
  Coins,
  AlertTriangle,
  Plus,
  RotateCcw,
  Palette,
  Image as ImageIcon,
  Upload,
  Star,
  Link,
  Eye,
  Check,
  Disc,
  CircleDot,
  Sliders,
} from "lucide-react";
import { PointOfInterest, POICategory, RegionKey } from "../types";
import { POI_CATEGORIES, getCategoryMeta } from "../data/categories";
import { GLORANTHA_RUNES } from "../data/gloranthaLore";
import { DRAGON_PASS_LOCATIONS } from "../data/locations";
import { GLORANTHA_TOKEN_PRESETS } from "../data/tokenPresets";
import { processImageFile } from "../utils/imageUtils";

interface PoiEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  poiToEdit: PointOfInterest | null; // null for creating new
  initialCoords?: { x: number; y: number } | null;
  onSavePoi: (poi: PointOfInterest) => void;
  onDeletePoi?: (id: string) => void;
}

const REGIONS: { key: RegionKey; label: string }[] = [
  { key: "sartar", label: "Royaume de Sartar" },
  { key: "tarsh", label: "Royaume de Tarsh" },
  { key: "prax", label: "Plaines de Prax" },
  { key: "esrolia", label: "Royaume d'Esrolia" },
  { key: "paturages", label: "Pâturages (Grazelands)" },
  { key: "vallee_betes", label: "Vallée des Bêtes" },
  { key: "dagori_inkarth", label: "Dâgori Inkarth (Trolls)" },
  { key: "pays_heort", label: "Pays d'Héort" },
  { key: "comte_soleil", label: "Comté du Soleil" },
  { key: "comte_pavis", label: "Comté de Pavis" },
  { key: "autres", label: "Autres Régions" },
];

const PRESET_PIN_COLORS = [
  { label: "Par défaut (Catégorie)", value: "" },
  { label: "Ambre Solaire", value: "#eab308" },
  { label: "Pourpre Lunar", value: "#dc2626" },
  { label: "Azur Orlanthi", value: "#0284c7" },
  { label: "Émeraude Ernalda", value: "#059669" },
  { label: "Cyan Mystique", value: "#06b6d4" },
  { label: "Violet Ténèbres", value: "#9333ea" },
  { label: "Orange Tempête", value: "#ea580c" },
  { label: "Rose Lotus", value: "#e11d48" },
  { label: "Obsidienne Plomb", value: "#475569" },
];

const TOKEN_BORDER_COLORS = [
  { label: "Or Gloranthien", value: "#e2ba7d" },
  { label: "Jaune Solaire", value: "#f59e0b" },
  { label: "Écarlate Lunar", value: "#ef4444" },
  { label: "Azur Sartar", value: "#38bdf8" },
  { label: "Émeraude Terre", value: "#10b981" },
  { label: "Violet Trolls", value: "#a855f7" },
  { label: "Argent Humakt", value: "#cbd5e1" },
  { label: "Bronze Prax", value: "#d97706" },
  { label: "Noir Obsidienne", value: "#1c1917" },
];

export const PoiEditorModal: React.FC<PoiEditorModalProps> = ({
  isOpen,
  onClose,
  poiToEdit,
  initialCoords,
  onSavePoi,
  onDeletePoi,
}) => {
  const isCanonical = poiToEdit ? DRAGON_PASS_LOCATIONS.some((l) => l.id === poiToEdit.id) : false;

  const [formData, setFormData] = useState<PointOfInterest>({
    id: `poi-${Date.now()}`,
    nameFr: "",
    nameEn: "",
    region: "sartar",
    regionLabelFr: "Royaume de Sartar",
    category: "city",
    coords: initialCoords || { x: 50, y: 50 },
    runes: ["air"],
    summary: "",
    detailedLore: "",
    gmSecrets: "",
    adventureHooks: [""],
    factions: [],
    leader: "",
    population: "",
    dangerLevel: 1,
    tags: [],
    isCustom: true,
    color: "",
    images: [],
    coverImage: "",
    customIconImage: "",
    iconShape: "circle",
    iconSize: "md",
    iconBorderColor: "",
    isTransparentIcon: false,
    iconOpacity: 1.0,
    iconStyle: "standard",
  });

  const [factionInput, setFactionInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [activeTab, setActiveTab] = useState<"general" | "icon" | "lore" | "images" | "secrets" | "hooks">("general");
  const [presetCategoryFilter, setPresetCategoryFilter] = useState<string>("all");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [iconUrlInput, setIconUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const iconFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage(null);
    if (poiToEdit) {
      setFormData({
        ...poiToEdit,
        color: poiToEdit.color || "",
        images: poiToEdit.images || [],
        coverImage: poiToEdit.coverImage || (poiToEdit.images && poiToEdit.images.length > 0 ? poiToEdit.images[0] : ""),
        customIconImage: poiToEdit.customIconImage || "",
        iconShape: poiToEdit.iconShape || "circle",
        iconSize: poiToEdit.iconSize || "md",
        iconBorderColor: poiToEdit.iconBorderColor || "",
        isTransparentIcon: poiToEdit.isTransparentIcon ?? false,
        iconOpacity: poiToEdit.iconOpacity ?? 1.0,
        iconStyle: poiToEdit.iconStyle || "standard",
        adventureHooks:
          poiToEdit.adventureHooks && poiToEdit.adventureHooks.length > 0
            ? poiToEdit.adventureHooks
            : [""],
      });
    } else {
      setFormData({
        id: `poi-custom-${Date.now()}`,
        nameFr: "",
        nameEn: "",
        region: "sartar",
        regionLabelFr: "Royaume de Sartar",
        category: "settlement",
        coords: initialCoords || { x: 50, y: 50 },
        runes: ["air", "man"],
        summary: "",
        detailedLore: "",
        gmSecrets: "",
        adventureHooks: [""],
        factions: [],
        leader: "",
        population: "",
        dangerLevel: 2,
        tags: [],
        isCustom: true,
        color: "",
        images: [],
        coverImage: "",
        customIconImage: "",
        iconShape: "circle",
        iconSize: "md",
        iconBorderColor: "",
        isTransparentIcon: false,
        iconOpacity: 1.0,
        iconStyle: "standard",
      });
    }
  }, [poiToEdit, initialCoords?.x, initialCoords?.y, isOpen]);

  if (!isOpen) return null;

  const handleRegionChange = (regionKey: RegionKey) => {
    const found = REGIONS.find((r) => r.key === regionKey);
    setFormData((prev) => ({
      ...prev,
      region: regionKey,
      regionLabelFr: found ? found.label : "Région de Glorantha",
    }));
  };

  const handleToggleRune = (runeId: string) => {
    setFormData((prev) => {
      const exists = prev.runes.includes(runeId);
      const newRunes = exists
        ? prev.runes.filter((r) => r !== runeId)
        : [...prev.runes, runeId];
      return { ...prev, runes: newRunes };
    });
  };

  const handleAddFaction = () => {
    if (!factionInput.trim()) return;
    if (!formData.factions?.includes(factionInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        factions: [...(prev.factions || []), factionInput.trim()],
      }));
    }
    setFactionInput("");
  };

  const handleRemoveFaction = (faction: string) => {
    setFormData((prev) => ({
      ...prev,
      factions: prev.factions?.filter((f) => f !== faction) || [],
    }));
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
  };

  const handleHookChange = (index: number, val: string) => {
    const updated = [...(formData.adventureHooks || [""])];
    updated[index] = val;
    setFormData((prev) => ({ ...prev, adventureHooks: updated }));
  };

  const handleAddHook = () => {
    setFormData((prev) => ({
      ...prev,
      adventureHooks: [...(prev.adventureHooks || []), ""],
    }));
  };

  const handleRemoveHook = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      adventureHooks: prev.adventureHooks?.filter((_, i) => i !== index) || [],
    }));
  };

  // Image handling
  const handleFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
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
        setFormData((prev) => {
          const existing = prev.images || [];
          const updated = [...existing, ...newImages];
          return {
            ...prev,
            images: updated,
            coverImage: prev.coverImage || newImages[0],
          };
        });
      }
    } catch (err) {
      alert("Erreur lors du traitement de l'image. Veuillez réessayer.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    const url = imageUrlInput.trim();
    setFormData((prev) => {
      const existing = prev.images || [];
      const updated = [...existing, url];
      return {
        ...prev,
        images: updated,
        coverImage: prev.coverImage || url,
      };
    });
    setImageUrlInput("");
  };

  const handleIconFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingIcon(true);
    try {
      const file = files[0];
      const dataUrl = await processImageFile(file, 512, 512, 0.88);
      setFormData((prev) => ({
        ...prev,
        customIconImage: dataUrl,
      }));
    } catch (err) {
      console.error("Erreur lors de l'upload de l'icône:", err);
      alert("Erreur lors du traitement de l'image pour le marqueur.");
    } finally {
      setIsUploadingIcon(false);
      if (iconFileInputRef.current) iconFileInputRef.current.value = "";
    }
  };

  const handleAddIconUrl = () => {
    if (!iconUrlInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      customIconImage: iconUrlInput.trim(),
    }));
    setIconUrlInput("");
  };

  const handleRemoveCustomIcon = () => {
    setFormData((prev) => ({
      ...prev,
      customIconImage: "",
    }));
  };

  const handleUseImageAsIcon = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      customIconImage: url,
    }));
    setActiveTab("icon");
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => {
      const existing = prev.images || [];
      const imageToRemove = existing[indexToRemove];
      const updated = existing.filter((_, idx) => idx !== indexToRemove);
      let newCover = prev.coverImage;
      if (prev.coverImage === imageToRemove) {
        newCover = updated.length > 0 ? updated[0] : "";
      }
      return {
        ...prev,
        images: updated,
        coverImage: newCover,
      };
    });
  };

  const handleSetCoverImage = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      coverImage: url,
    }));
  };

  const handleDuplicateAsNew = () => {
    const newPoi: PointOfInterest = {
      ...formData,
      id: `poi-custom-${Date.now()}`,
      nameFr: `${formData.nameFr} (Copie)`,
      nameEn: formData.nameEn ? `${formData.nameEn} (Copy)` : `${formData.nameFr} (Copy)`,
      coords: {
        x: Math.min(95, formData.coords.x + 2),
        y: Math.min(95, formData.coords.y + 2),
      },
      isCustom: true,
      isModified: false,
    };
    onSavePoi(newPoi);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameFr.trim()) {
      setErrorMessage("Veuillez saisir un nom pour le lieu (Nom français requis).");
      setActiveTab("general");
      return;
    }

    const cleanedHooks = (formData.adventureHooks || []).filter((h) => h.trim().length > 0);

    onSavePoi({
      ...formData,
      nameFr: formData.nameFr.trim(),
      nameEn: formData.nameEn.trim() || formData.nameFr.trim(),
      adventureHooks: cleanedHooks,
      images: formData.images || [],
      coverImage: formData.coverImage || (formData.images && formData.images.length > 0 ? formData.images[0] : undefined),
      isModified: isCanonical ? true : formData.isModified,
      isCustom: !isCanonical ? true : formData.isCustom,
    });
    onClose();
  };

  return (
    <div
      id="poi-editor-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        id="poi-editor-dialog"
        className="bg-[#16161a] border border-[#2d2d35] rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col text-[#d1d1d6] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2d2d35] flex items-center justify-between bg-[#1f1f26]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#e2ba7d]/20 text-[#e2ba7d] flex items-center justify-center border border-[#e2ba7d]/40">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#e2ba7d]">
                  {poiToEdit ? `Personnaliser : ${poiToEdit.nameFr}` : "Créer un nouveau Point d'Intérêt"}
                </h2>
                {isCanonical && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40">
                    Lieu Canonique
                  </span>
                )}
                {formData.isCustom && !isCanonical && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                    Lieu Créé
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8e8e93]">
                {isCanonical
                  ? "Adaptez ce lieu officiel (histoire, images, runes, secrets de MJ, menaces) pour votre campagne"
                  : "Configurez librement les attributs, illustrations, le lore et la position cartographique"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#2d2d35] bg-[#121215] px-4 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap ${
              activeTab === "general"
                ? "border-[#e2ba7d] text-[#e2ba7d]"
                : "border-transparent text-[#8e8e93] hover:text-[#d1d1d6]"
            }`}
          >
            1. Informations & Position
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("icon")}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "icon"
                ? "border-amber-400 text-amber-300 font-bold"
                : "border-transparent text-[#8e8e93] hover:text-amber-200"
            }`}
          >
            <CircleDot className="w-3.5 h-3.5" />
            <span>2. Icône de Carte</span>
            {formData.customIconImage && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("lore")}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap ${
              activeTab === "lore"
                ? "border-[#e2ba7d] text-[#e2ba7d]"
                : "border-transparent text-[#8e8e93] hover:text-[#d1d1d6]"
            }`}
          >
            3. Lore & Runes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("images")}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "images"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-[#8e8e93] hover:text-amber-200"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>4. Illustrations & Images</span>
            {formData.images && formData.images.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                {formData.images.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("secrets")}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap ${
              activeTab === "secrets"
                ? "border-red-500 text-red-400"
                : "border-transparent text-[#8e8e93] hover:text-red-400"
            }`}
          >
            5. Secrets du MJ & Dangers
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("hooks")}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap ${
              activeTab === "hooks"
                ? "border-[#e2ba7d] text-[#e2ba7d]"
                : "border-transparent text-[#8e8e93] hover:text-[#d1d1d6]"
            }`}
          >
            6. Crochets de Quête & Factions
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-950/80 border border-red-500/80 text-red-200 rounded-xl text-xs flex items-center justify-between animate-fade-in shadow-lg">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                {errorMessage}
              </span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-red-300 hover:text-white px-2 py-0.5 rounded hover:bg-white/10 text-xs ml-2"
              >
                ✕
              </button>
            </div>
          )}
          {/* TAB 1: GENERAL & POSITION */}
          {activeTab === "general" && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#8e8e93] mb-1">
                    Nom du lieu (Français) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameFr}
                    onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                    placeholder="Ex: Boldhome, Fort-de-la-Victoire..."
                    className="w-full bg-[#25252b] border border-[#3a3a45] rounded-xl px-3 py-2 text-xs text-[#d1d1d6] focus:border-[#e2ba7d] outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#8e8e93] mb-1">
                    Nom d'origine / Anglais
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="Ex: Boldhome, Whitewall..."
                    className="w-full bg-[#25252b] border border-[#3a3a45] rounded-xl px-3 py-2 text-xs text-[#d1d1d6] focus:border-[#e2ba7d] outline-none"
                  />
                </div>
              </div>

              {/* Category Selector Grid */}
              <div>
                <label className="block text-[11px] font-semibold text-[#8e8e93] mb-1.5">
                  Catégorie du Point d'Intérêt ({POI_CATEGORIES.length} types disponibles)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {POI_CATEGORIES.map((cat) => {
                    const isSelected = formData.category === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setFormData({ ...formData, category: cat.id })}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                          isSelected
                            ? "bg-[#e2ba7d]/20 border-[#e2ba7d] text-[#e2ba7d] font-bold shadow-md"
                            : "bg-[#25252b]/80 border-[#3a3a45] text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-[#25252b]"
                        }`}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.accentColor }}
                        />
                        <span className="truncate text-[11px]">{cat.labelFr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Pin Color */}
              <div className="bg-[#1d1d24] p-3 rounded-xl border border-[#2d2d35] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#8e8e93] flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#e2ba7d]" /> Couleur personnalisée du repère sur la carte
                  </label>
                  {formData.color && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, color: "" })}
                      className="text-[10px] text-[#8e8e93] hover:text-[#e2ba7d] underline"
                    >
                      Réinitialiser à la couleur de catégorie
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  {PRESET_PIN_COLORS.map((preset) => {
                    const isSelected = (formData.color || "") === preset.value;
                    return (
                      <button
                        type="button"
                        key={preset.label}
                        onClick={() => setFormData({ ...formData, color: preset.value })}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] transition ${
                          isSelected
                            ? "border-amber-400 bg-amber-400/20 text-amber-200 font-bold"
                            : "border-[#3a3a45] bg-[#25252b] text-[#8e8e93] hover:text-[#d1d1d6]"
                        }`}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full border border-black/50"
                          style={{
                            backgroundColor:
                              preset.value || getCategoryMeta(formData.category).accentColor,
                          }}
                        />
                        <span>{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Region & Coordinates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#1d1d24] p-3 rounded-xl border border-[#2d2d35]">
                <div>
                  <label className="block text-[11px] font-semibold text-[#8e8e93] mb-1">
                    Région
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) => handleRegionChange(e.target.value as RegionKey)}
                    className="w-full bg-[#25252b] border border-[#3a3a45] rounded-xl px-2.5 py-2 text-xs text-[#e2ba7d] outline-none font-medium"
                  >
                    {REGIONS.map((r) => (
                      <option key={r.key} value={r.key}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#8e8e93] mb-1">
                    Position X (% largeur carte)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.coords.x}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        coords: { ...formData.coords, x: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full bg-[#25252b] border border-[#3a3a45] rounded-xl px-3 py-2 text-xs text-[#d1d1d6] outline-none focus:border-[#e2ba7d]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#8e8e93] mb-1">
                    Position Y (% hauteur carte)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.coords.y}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        coords: { ...formData.coords, y: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full bg-[#25252b] border border-[#3a3a45] rounded-xl px-3 py-2 text-xs text-[#d1d1d6] outline-none focus:border-[#e2ba7d]"
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-[11px] font-semibold text-[#8e8e93] mb-1">
                  Résumé public (Affiché dans l'info-bulle et aperçu rapide)
                </label>
                <textarea
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Brève description visible par les joueurs et le MJ..."
                  className="w-full bg-[#25252b] border border-[#3a3a45] rounded-xl p-3 text-xs text-[#d1d1d6] focus:border-[#e2ba7d] outline-none resize-none"
                />
              </div>

              {/* Leader & Population */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#8e8e93] mb-1">
                    Dirigeant / Thane / Chef de culte
                  </label>
                  <input
                    type="text"
                    value={formData.leader || ""}
                    onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
                    placeholder="Ex: Reine Leika, Maître d'Armes..."
                    className="w-full bg-[#25252b] border border-[#3a3a45] rounded-xl px-3 py-2 text-xs text-[#d1d1d6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#8e8e93] mb-1">
                    Population estimée
                  </label>
                  <input
                    type="text"
                    value={formData.population || ""}
                    onChange={(e) => setFormData({ ...formData, population: e.target.value })}
                    placeholder="Ex: 11 000 habitants..."
                    className="w-full bg-[#25252b] border border-[#3a3a45] rounded-xl px-3 py-2 text-xs text-[#d1d1d6] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM MAP ICON / TOKEN */}
          {activeTab === "icon" && (
            <div className="space-y-5 animate-fade-in">
              {/* Top Banner & Live Preview */}
              <div className="bg-[#18181f] border border-[#2d2d35] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5">
                {/* Live Marker Preview */}
                <div className="flex flex-col items-center justify-center p-4 bg-[#101014] rounded-xl border border-[#25252e] w-full sm:w-48 shrink-0">
                  <span className="text-[10px] uppercase tracking-wider text-[#8e8e93] font-bold mb-3">
                    Aperçu sur la carte
                  </span>
                  
                  <div className="relative flex items-center justify-center h-20 w-20 bg-[radial-gradient(#2d2d35_1px,transparent_1px)] [background-size:8px_8px] rounded-lg border border-white/5">
                    {formData.customIconImage ? (
                      <div
                        className={`relative flex items-center justify-center transition-all duration-200 ${
                          formData.iconShape === "circle"
                            ? "rounded-full"
                            : formData.iconShape === "shield"
                            ? "rounded-b-[45%] rounded-t-lg"
                            : formData.iconShape === "pin"
                            ? "rounded-t-full rounded-br-full -rotate-45"
                            : "rounded-xl"
                        } overflow-hidden ${formData.isTransparentIcon ? "shadow-none" : "shadow-2xl"} ${
                          formData.iconSize === "sm"
                            ? "w-8 h-8"
                            : formData.iconSize === "lg"
                            ? "w-14 h-14"
                            : "w-11 h-11"
                        }`}
                        style={{
                          borderWidth: formData.isTransparentIcon ? "1.5px" : "2.5px",
                          borderColor: formData.iconBorderColor || formData.color || getCategoryMeta(formData.category).accentColor,
                          backgroundColor: formData.isTransparentIcon ? "transparent" : "#16161a",
                          boxShadow: `0 0 16px ${formData.iconBorderColor || formData.color || getCategoryMeta(formData.category).accentColor}60`,
                        }}
                      >
                        <img
                          src={formData.customIconImage}
                          alt="Icone du point d'intérêt"
                          className={`w-full h-full object-contain ${formData.iconShape === "pin" ? "rotate-45 scale-110" : ""}`}
                        />
                      </div>
                    ) : formData.isTransparentIcon ? (
                      /* Hollow ring without anything in the center */
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all"
                        style={{
                          borderColor: formData.iconBorderColor || formData.color || getCategoryMeta(formData.category).accentColor,
                          backgroundColor: "transparent",
                          boxShadow: `0 0 12px ${formData.iconBorderColor || formData.color || getCategoryMeta(formData.category).accentColor}50`,
                        }}
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg"
                        style={{
                          backgroundColor: formData.color || getCategoryMeta(formData.category).accentColor,
                          boxShadow: `0 0 12px ${formData.color || getCategoryMeta(formData.category).accentColor}60`,
                        }}
                      >
                        <MapPin className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-[#8e8e93] mt-2 text-center">
                    {formData.customIconImage
                      ? `Jeton ${formData.iconShape || "cercle"} • ${formData.iconSize || "md"}`
                      : formData.isTransparentIcon
                      ? "Anneau évidé (Centre vide)"
                      : "Épingle standard de catégorie"}
                  </span>

                  {formData.customIconImage && (
                    <button
                      type="button"
                      onClick={handleRemoveCustomIcon}
                      className="mt-2 flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 transition underline decoration-red-500/40"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Retirer l'icône image</span>
                    </button>
                  )}
                </div>

                {/* Explanation / Actions */}
                <div className="flex-1 space-y-3 text-left w-full">
                  <div>
                    <h3 className="text-sm font-bold text-[#e2ba7d] flex items-center gap-2">
                      <Disc className="w-4 h-4 text-amber-400" />
                      Personnalisation du Marqueur Cartographique
                    </h3>
                    <p className="text-[11px] text-[#8e8e93] mt-0.5 leading-relaxed">
                      Remplacez le repère générique par une icône transparente (anneau évidé sans rien au centre) ou un blason thématique.
                    </p>
                  </div>

                  {/* Upload Image & Quick Transparent Actions */}
                  <div className="space-y-2 pt-1">
                    <div className="flex flex-wrap gap-2">
                      {/* One-click Hollow Transparent Ring */}
                      <button
                        type="button"
                        onClick={() => {
                          const hollowPreset = GLORANTHA_TOKEN_PRESETS.find(p => p.id === "transparent-pure-hollow-gold");
                          if (hollowPreset) {
                            setFormData({
                              ...formData,
                              customIconImage: hollowPreset.iconDataUrl,
                              isTransparentIcon: true,
                              iconStyle: "transparent",
                            });
                          } else {
                            setFormData({
                              ...formData,
                              isTransparentIcon: true,
                              iconStyle: "transparent",
                              customIconImage: "",
                            });
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/50 rounded-xl transition text-xs font-bold shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>✨ Anneau Transparent Évidé (Centre Vide)</span>
                      </button>

                      <input
                        type="file"
                        ref={iconFileInputRef}
                        accept="image/*"
                        onChange={handleIconFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => iconFileInputRef.current?.click()}
                        disabled={isUploadingIcon}
                        className="flex items-center gap-2 px-3 py-2 bg-[#25252e] hover:bg-[#30303b] text-white border border-[#3a3a45] rounded-xl transition shadow-md disabled:opacity-50 text-xs font-medium"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isUploadingIcon ? "Téléversement..." : "Téléverser image"}</span>
                      </button>

                      {formData.images && formData.images.length > 0 && !formData.customIconImage && (
                        <button
                          type="button"
                          onClick={() => handleUseImageAsIcon(formData.images[0])}
                          className="flex items-center gap-1.5 px-3 py-2 bg-[#25252e] hover:bg-[#30303b] text-amber-200 border border-amber-500/30 rounded-xl transition text-xs font-medium"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-400" />
                          <span>Illustration du lieu</span>
                        </button>
                      )}
                    </div>

                    {/* Direct Image URL input */}
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={iconUrlInput}
                        onChange={(e) => setIconUrlInput(e.target.value)}
                        placeholder="Ou coller l'URL d'une image en ligne (https://...)"
                        className="flex-1 bg-[#25252b] border border-[#3a3a45] rounded-xl px-3 py-1.5 text-xs text-[#d1d1d6] focus:border-[#e2ba7d] outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddIconUrl}
                        disabled={!iconUrlInput.trim()}
                        className="px-3 py-1.5 bg-[#2a2a35] hover:bg-[#353545] disabled:opacity-40 text-amber-300 rounded-xl text-xs font-semibold border border-amber-400/20 transition"
                      >
                        Appliquer
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Style controls (Shape, Size, Border Color, Transparency & Style) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* 1. Shape Selection */}
                <div className="bg-[#18181f] border border-[#2d2d35] p-3 rounded-xl space-y-2">
                  <label className="text-[11px] font-bold text-[#e2ba7d] flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" /> 1. Forme du Jeton
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "circle", label: "Cercle", desc: "Rond classique" },
                      { id: "shield", label: "Bouclier", desc: "Écu héraldique" },
                      { id: "square", label: "Carré doux", desc: "Tuile moderne" },
                      { id: "pin", label: "Pointeur", desc: "Épingle stylisée" },
                    ].map((shape) => {
                      const isSelected = (formData.iconShape || "circle") === shape.id;
                      return (
                        <button
                          type="button"
                          key={shape.id}
                          onClick={() => setFormData({ ...formData, iconShape: shape.id as any })}
                          className={`p-1.5 rounded-lg border text-left transition ${
                            isSelected
                              ? "border-amber-400 bg-amber-400/15 text-amber-200 font-bold"
                              : "border-[#2d2d35] bg-[#22222a] text-[#8e8e93] hover:text-[#d1d1d6]"
                          }`}
                        >
                          <div className="text-[11px] font-medium">{shape.label}</div>
                          <div className="text-[8px] text-[#8e8e93]">{shape.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Size Selection */}
                <div className="bg-[#18181f] border border-[#2d2d35] p-3 rounded-xl space-y-2">
                  <label className="text-[11px] font-bold text-[#e2ba7d] flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" /> 2. Taille Carte
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "sm", label: "Compact", px: "28px" },
                      { id: "md", label: "Normal", px: "36px" },
                      { id: "lg", label: "Majeur", px: "48px" },
                    ].map((size) => {
                      const isSelected = (formData.iconSize || "md") === size.id;
                      return (
                        <button
                          type="button"
                          key={size.id}
                          onClick={() => setFormData({ ...formData, iconSize: size.id as any })}
                          className={`p-1.5 rounded-lg border text-center transition ${
                            isSelected
                              ? "border-amber-400 bg-amber-400/15 text-amber-200 font-bold"
                              : "border-[#2d2d35] bg-[#22222a] text-[#8e8e93] hover:text-[#d1d1d6]"
                          }`}
                        >
                          <div className="text-[11px] font-medium">{size.label}</div>
                          <div className="text-[9px] text-[#8e8e93] font-mono">{size.px}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Border Color Selection */}
                <div className="bg-[#18181f] border border-[#2d2d35] p-3 rounded-xl space-y-2">
                  <label className="text-[11px] font-bold text-[#e2ba7d] flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" /> 3. Bordure & Anneau
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {TOKEN_BORDER_COLORS.map((c) => {
                      const isSelected = (formData.iconBorderColor || "#e2ba7d") === c.value;
                      return (
                        <button
                          type="button"
                          key={c.value}
                          onClick={() => setFormData({ ...formData, iconBorderColor: c.value })}
                          title={c.label}
                          className={`w-5 h-5 rounded-full border-2 transition ${
                            isSelected ? "ring-2 ring-amber-300 scale-110" : "border-black/50 hover:scale-105"
                          }`}
                          style={{ backgroundColor: c.value }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* 4. Transparence & Opacité */}
                <div className="bg-[#18181f] border border-[#2d2d35] p-3 rounded-xl space-y-2">
                  <label className="text-[11px] font-bold text-[#e2ba7d] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 4. Transparence
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          isTransparentIcon: !formData.isTransparentIcon,
                          iconStyle: !formData.isTransparentIcon ? "transparent" : "standard",
                        })
                      }
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition border ${
                        formData.isTransparentIcon
                          ? "bg-amber-400 text-black border-amber-300 shadow"
                          : "bg-[#25252e] text-[#8e8e93] border-[#3a3a45] hover:text-white"
                      }`}
                    >
                      {formData.isTransparentIcon ? "Fond Transparent ON" : "Activer"}
                    </button>
                  </label>

                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[9px] text-[#8e8e93] shrink-0">Opacité :</span>
                    <input
                      type="range"
                      min="0.2"
                      max="1.0"
                      step="0.05"
                      value={formData.iconOpacity ?? 1.0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          iconOpacity: parseFloat(e.target.value),
                        })
                      }
                      className="flex-1 accent-amber-400 h-1.5 bg-[#2a2a35] rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-amber-300 w-7 text-right">
                      {Math.round((formData.iconOpacity ?? 1.0) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Presets Library (Glorantha Tokens & Factions) */}
              <div className="bg-[#18181f] border border-[#2d2d35] p-4 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#e2ba7d] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Bibliothèque de Jetons & Icônes Transparentes
                    </h4>
                    <p className="text-[10px] text-[#8e8e93]">
                      Sélectionnez une icône transparente ou un blason thématique pour l'appliquer au marqueur
                    </p>
                  </div>
                  
                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: "all", label: "Tous" },
                      { id: "transparent", label: "✨ Transparents (" + GLORANTHA_TOKEN_PRESETS.filter(p => p.category === "transparent").length + ")" },
                      { id: "city", label: "Cités" },
                      { id: "temple", label: "Temples" },
                      { id: "fortress", label: "Forteresses" },
                      { id: "ruin", label: "Ruines" },
                      { id: "peril", label: "Périls" },
                    ].map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setPresetCategoryFilter(cat.id)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition font-medium ${
                          presetCategoryFilter === cat.id
                            ? "bg-amber-400 text-black border-amber-300 font-bold shadow-sm"
                            : "bg-[#25252e] text-[#8e8e93] border-[#3a3a45] hover:text-white"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {GLORANTHA_TOKEN_PRESETS.filter(
                    (p) => presetCategoryFilter === "all" || p.category === presetCategoryFilter
                  ).map((preset) => {
                    const isSelected = formData.customIconImage === preset.iconDataUrl;
                    return (
                      <button
                        type="button"
                        key={preset.id}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            customIconImage: preset.iconDataUrl,
                            isTransparentIcon: preset.category === "transparent" || formData.isTransparentIcon,
                            iconStyle: preset.category === "transparent" ? "transparent" : formData.iconStyle,
                          });
                        }}
                        className={`group p-2 rounded-xl border flex flex-col items-center text-center transition relative ${
                          isSelected
                            ? "border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400"
                            : "border-[#2d2d35] bg-[#22222a] hover:border-amber-400/40 hover:bg-[#282832]"
                        }`}
                      >
                        {preset.category === "transparent" && (
                          <span className="absolute top-1 right-1 text-[8px] px-1 rounded bg-amber-400/20 text-amber-300 font-mono">
                            Transp.
                          </span>
                        )}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center p-1 border mb-1.5 shadow-md group-hover:scale-105 transition bg-[radial-gradient(#2d2d35_1px,transparent_1px)] [background-size:6px_6px]"
                          style={{
                            backgroundColor: preset.category === "transparent" ? "transparent" : "#131317",
                            borderColor: "#e2ba7d",
                          }}
                        >
                          <img
                            src={preset.iconDataUrl}
                            alt={preset.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-[#d1d1d6] truncate w-full">
                          {preset.name}
                        </span>
                        <span className="text-[8px] text-[#8e8e93] truncate w-full">
                          {preset.theme}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Previously uploaded images gallery for fast reuse */}
              {formData.images && formData.images.length > 0 && (
                <div className="bg-[#18181f] border border-[#2d2d35] p-3.5 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-[#e2ba7d] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    Utiliser une illustration déjà enregistrée sur ce lieu
                  </h4>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {formData.images.map((img, i) => {
                      const isCurrentIcon = formData.customIconImage === img;
                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setFormData({ ...formData, customIconImage: img })}
                          className={`relative rounded-lg overflow-hidden aspect-square border transition ${
                            isCurrentIcon
                              ? "border-amber-400 ring-2 ring-amber-400 shadow-md"
                              : "border-[#3a3a45] opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img src={img} alt={`Lieu img ${i + 1}`} className="w-full h-full object-cover" />
                          {isCurrentIcon && (
                            <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white drop-shadow" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LORE & RUNES */}
          {activeTab === "lore" && (
            <div className="space-y-4 animate-fade-in">
              {/* Rune Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-[#8e8e93] mb-2">
                  Runes associées au lieu (Cliquez pour ajouter/retirer)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {GLORANTHA_RUNES.map((rune) => {
                    const isSelected = formData.runes.includes(rune.id);
                    return (
                      <button
                        type="button"
                        key={rune.id}
                        onClick={() => handleToggleRune(rune.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition ${
                          isSelected
                            ? "bg-[#e2ba7d]/20 border-[#e2ba7d] text-[#e2ba7d] font-bold shadow-sm"
                            : "bg-[#25252b] border-[#3a3a45] text-[#8e8e93] hover:text-[#d1d1d6]"
                        }`}
                      >
                        <span className="font-mono text-xs">{rune.symbol}</span>
                        <span>{rune.nameFr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Lore */}
              <div>
                <label className="block text-[11px] font-semibold text-[#8e8e93] mb-1">
                  Chroniques & Lore Détaillé (Glorantha 1625 ST)
                </label>
                <textarea
                  rows={7}
                  value={formData.detailedLore}
                  onChange={(e) => setFormData({ ...formData, detailedLore: e.target.value })}
                  placeholder="Histoire fondatrice, coutumes locales, légendes des héros, architecture, rôle dans les Guerres des Héros..."
                  className="w-full bg-[#25252b] border border-[#3a3a45] rounded-xl p-3 text-xs text-[#d1d1d6] focus:border-[#e2ba7d] outline-none leading-relaxed"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[11px] font-semibold text-[#8e8e93] mb-1">
                  Mots-clés / Tags de recherche
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Ajouter un tag..."
                    className="flex-1 bg-[#25252b] border border-[#3a3a45] rounded-xl px-3 py-1.5 text-xs text-[#d1d1d6] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 rounded-xl bg-[#25252b] hover:bg-white/5 border border-[#3a3a45] text-xs"
                  >
                    Ajouter
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1f1f26] border border-[#3a3a45] text-[11px] text-[#e2ba7d]"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-400 text-xs ml-0.5"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IMAGES & ILLUSTRATIONS */}
          {activeTab === "images" && (
            <div className="space-y-4 animate-fade-in">
              {/* Upload Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFilesUpload(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#3a3a45] hover:border-[#e2ba7d] bg-[#1a1a20] hover:bg-[#202028] p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFilesUpload(e.target.files)}
                />
                <div className="w-12 h-12 rounded-2xl bg-[#e2ba7d]/10 text-[#e2ba7d] flex items-center justify-center mb-3 group-hover:scale-110 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-[#e2ba7d] mb-1">
                  Glissez-déposez des illustrations ou cliquez pour importer
                </h4>
                <p className="text-[11px] text-[#8e8e93] max-w-sm">
                  Prend en charge JPG, PNG, WEBP, GIF. Les images sont compressées et intégrées directement à votre campagne locale.
                </p>
                {isUploading && (
                  <span className="mt-2 text-xs text-amber-300 animate-pulse">
                    Traitement des images en cours...
                  </span>
                )}
              </div>

              {/* Add by URL */}
              <div className="bg-[#1d1d24] p-3 rounded-xl border border-[#2d2d35]">
                <label className="block text-[11px] font-semibold text-[#8e8e93] mb-1.5 flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5 text-[#e2ba7d]" /> Ajouter une image par URL web
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                    placeholder="https://exemple.com/image-temple.jpg"
                    className="flex-1 bg-[#25252b] border border-[#3a3a45] rounded-xl px-3 py-2 text-xs text-[#d1d1d6] outline-none focus:border-[#e2ba7d]"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 bg-[#25252b] hover:bg-white/5 border border-[#3a3a45] text-xs text-[#e2ba7d] font-bold rounded-xl transition"
                  >
                    Ajouter l'URL
                  </button>
                </div>
              </div>

              {/* Uploaded Gallery Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-semibold text-[#8e8e93]">
                    Galerie d'illustrations ({formData.images?.length || 0})
                  </label>
                  {formData.images && formData.images.length > 0 && (
                    <span className="text-[10px] text-[#8e8e93] italic">
                      L'étoile dorée indique l'illustration principale (bannière)
                    </span>
                  )}
                </div>

                {(!formData.images || formData.images.length === 0) ? (
                  <div className="p-8 rounded-xl bg-[#16161a] border border-[#2d2d35] text-center text-[#8e8e93]">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#e2ba7d]" />
                    <p className="text-xs">Aucune image enregistrée pour ce lieu.</p>
                    <p className="text-[11px] text-[#8e8e93]/70 mt-1">
                      Téléversez des plans de ville, illustrations de PNJ ou panoramas pour enrichir l'immersion.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {formData.images.map((imgUrl, idx) => {
                      const isCover = formData.coverImage === imgUrl;
                      return (
                        <div
                          key={idx}
                          className={`group relative rounded-xl overflow-hidden border transition bg-[#121215] aspect-video flex items-center justify-center ${
                            isCover
                              ? "border-[#e2ba7d] shadow-[0_0_12px_rgba(226,186,125,0.3)] ring-1 ring-[#e2ba7d]"
                              : "border-[#2d2d35] hover:border-[#3a3a45]"
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Illustration ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />

                          {/* Cover Badge */}
                          {isCover && (
                            <div className="absolute top-1.5 left-1.5 bg-[#e2ba7d] text-black font-bold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                              <Star className="w-2.5 h-2.5 fill-black" />
                              <span>Principale</span>
                            </div>
                          )}

                          {/* Hover Actions Bar */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 p-2">
                            {/* Preview modal */}
                            <button
                              type="button"
                              onClick={() => setPreviewModalImage(imgUrl)}
                              className="p-1.5 rounded-lg bg-black/70 text-white hover:bg-white hover:text-black transition"
                              title="Agrandir l'image"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Set as map icon */}
                            <button
                              type="button"
                              onClick={() => handleUseImageAsIcon(imgUrl)}
                              className="p-1.5 rounded-lg bg-[#25252e] text-amber-300 hover:bg-amber-400 hover:text-black transition"
                              title="Définir comme icône / jeton de la carte"
                            >
                              <CircleDot className="w-4 h-4" />
                            </button>

                            {/* Set as cover */}
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => handleSetCoverImage(imgUrl)}
                                className="p-1.5 rounded-lg bg-amber-500/80 text-black hover:bg-amber-400 transition"
                                title="Définir comme bannière principale"
                              >
                                <Star className="w-4 h-4" />
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1.5 rounded-lg bg-red-600/80 text-white hover:bg-red-500 transition"
                              title="Supprimer cette image"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: GM SECRETS & DANGER */}
          {activeTab === "secrets" && (
            <div className="space-y-4 animate-fade-in">
              {/* Danger Level Selector */}
              <div className="bg-[#1f1618] border border-red-500/30 p-3.5 rounded-xl">
                <label className="block text-[11px] font-bold text-red-400 mb-2">
                  Niveau de Péril & Menace (1 à 5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setFormData({ ...formData, dangerLevel: lvl as any })}
                      className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1 border transition ${
                        formData.dangerLevel === lvl
                          ? "bg-red-600 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                          : "bg-[#25252b] border-[#3a3a45] text-[#8e8e93] hover:text-[#d1d1d6]"
                      }`}
                    >
                      <Skull className="w-3.5 h-3.5" />
                      <span>Niv. {lvl}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* GM Secrets */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Secrets Réservés au Maître de Jeu (Mode MJ)
                  </label>
                  <span className="text-[10px] text-[#8e8e93] italic">
                    Jamais révélés aux joueurs en mode joueur
                  </span>
                </div>
                <textarea
                  rows={7}
                  value={formData.gmSecrets || ""}
                  onChange={(e) => setFormData({ ...formData, gmSecrets: e.target.value })}
                  placeholder="Complots cachés, passages secrets, cultes interdits, reliques enterrées, allégeances secrètes..."
                  className="w-full bg-[#1f1618]/60 border border-red-500/40 rounded-xl p-3 text-xs text-[#d1d1d6] focus:border-red-500 outline-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 5: ADVENTURE HOOKS & FACTIONS */}
          {activeTab === "hooks" && (
            <div className="space-y-4 animate-fade-in">
              {/* Adventure Hooks */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-semibold text-[#8e8e93]">
                    Crochets d'Aventure & Scénarios Locaux
                  </label>
                  <button
                    type="button"
                    onClick={handleAddHook}
                    className="flex items-center gap-1 text-[11px] text-[#e2ba7d] hover:underline"
                  >
                    <Plus className="w-3 h-3" /> Ajouter un crochet
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.adventureHooks?.map((hook, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={hook}
                        onChange={(e) => handleHookChange(idx, e.target.value)}
                        placeholder={`Idée de quête #${idx + 1}...`}
                        className="flex-1 bg-[#25252b] border border-[#3a3a45] rounded-xl px-3 py-2 text-xs text-[#d1d1d6] outline-none focus:border-[#e2ba7d]"
                      />
                      {formData.adventureHooks && formData.adventureHooks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveHook(idx)}
                          className="p-2 text-[#8e8e93] hover:text-red-400 rounded-lg hover:bg-white/5"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Factions */}
              <div>
                <label className="block text-[11px] font-semibold text-[#8e8e93] mb-1">
                  Factions & Cultes influents
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={factionInput}
                    onChange={(e) => setFactionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFaction();
                      }
                    }}
                    placeholder="Ex: Culte d'Orlanth, Tribu Malani, Guildes d'Issaries..."
                    className="flex-1 bg-[#25252b] border border-[#3a3a45] rounded-xl px-3 py-1.5 text-xs text-[#d1d1d6] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddFaction}
                    className="px-3 py-1.5 rounded-xl bg-[#25252b] hover:bg-white/5 border border-[#3a3a45] text-xs"
                  >
                    Ajouter
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.factions?.map((fac) => (
                    <span
                      key={fac}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1f1f26] border border-[#3a3a45] text-[11px] text-[#e2ba7d]"
                    >
                      {fac}
                      <button
                        type="button"
                        onClick={() => handleRemoveFaction(fac)}
                        className="hover:text-red-400 text-xs ml-0.5"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#2d2d35] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {poiToEdit && onDeletePoi && (
                <button
                  type="button"
                  onClick={() => {
                    if (isCanonical) {
                      if (confirm(`Réinitialiser "${poiToEdit.nameFr}" aux valeurs canoniques officielles ?`)) {
                        onDeletePoi(poiToEdit.id);
                        onClose();
                      }
                    } else {
                      if (confirm(`Confirmez-vous la suppression du lieu "${poiToEdit.nameFr}" ?`)) {
                        onDeletePoi(poiToEdit.id);
                        onClose();
                      }
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 border border-red-500/30 transition"
                >
                  {isCanonical ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" /> Réinitialiser aux valeurs d'origine
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" /> Supprimer ce lieu
                    </>
                  )}
                </button>
              )}

              {poiToEdit && (
                <button
                  type="button"
                  onClick={handleDuplicateAsNew}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-[#8e8e93] hover:text-[#e2ba7d] hover:bg-white/5 border border-[#3a3a45] transition"
                  title="Créer une copie indépendante de ce lieu"
                >
                  <Copy className="w-3.5 h-3.5" /> Dupliquer
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#25252b] hover:bg-white/5 border border-[#3a3a45] text-xs text-[#8e8e93] transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#e2ba7d] text-black font-bold text-xs shadow-lg hover:bg-[#edd09e] transition"
              >
                <Save className="w-4 h-4" /> Enregistrer les personnalisations
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Fullscreen Preview Lightbox */}
      {previewModalImage && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setPreviewModalImage(null)}
        >
          <button
            onClick={() => setPreviewModalImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewModalImage}
            alt="Aperçu grand format"
            className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
