import React, { useState, useRef, useEffect } from "react";
import {
  X,
  FileUp,
  FileText,
  ChevronLeft,
  ChevronRight,
  Layers,
  Check,
  RefreshCw,
  Eye,
  Sliders,
  Sparkles,
  Trash2,
  Maximize2,
  Image as ImageIcon,
  Map as MapIcon,
  Download,
} from "lucide-react";
import { MapBackgroundConfig } from "../types";
import { loadPdfDocument, renderPdfPageToDataUrl } from "../utils/pdfMapRenderer";
import {
  savePdfBufferToStorage,
  loadPdfBufferFromStorage,
  clearPdfBufferFromStorage,
} from "../utils/storage";
import type * as pdfjsLib from "pdfjs-dist";

interface PdfMapSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  backgroundConfig: MapBackgroundConfig;
  onUpdateBackgroundConfig: (config: MapBackgroundConfig) => void;
}

export const PdfMapSettingsModal: React.FC<PdfMapSettingsModalProps> = ({
  isOpen,
  onClose,
  backgroundConfig,
  onUpdateBackgroundConfig,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"source" | "adjustments">("source");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Cached active PDF doc in memory for page switching
  const [loadedPdfDoc, setLoadedPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState<number>(backgroundConfig.pdfTotalPages || 1);
  const [currentPage, setCurrentPage] = useState<number>(backgroundConfig.pdfPageIndex || 1);
  const [scale, setScale] = useState<number>(backgroundConfig.pdfScale || 3.0);

  // When modal opens, try to restore loadedPdfDoc from IndexedDB buffer if not in memory
  useEffect(() => {
    if (isOpen && !loadedPdfDoc && backgroundConfig.type === "pdf" && backgroundConfig.pdfFileName) {
      loadPdfBufferFromStorage().then((cached) => {
        if (cached?.buffer) {
          loadPdfDocument(cached.buffer, cached.fileName)
            .then(({ pdfDoc, info }) => {
              setLoadedPdfDoc(pdfDoc);
              setTotalPages(info.numPages);
            })
            .catch((e) => {
              console.warn("Could not reload cached PDF doc", e);
            });
        }
      });
    }
  }, [isOpen, loadedPdfDoc, backgroundConfig.type, backgroundConfig.pdfFileName]);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      setLoading(true);
      setLoadingStep("Lecture du fichier PDF...");
      setError(null);
      try {
        const buffer = await file.arrayBuffer();
        setLoadingStep("Analyse et rendu haute résolution...");
        
        // Save arrayBuffer in IndexedDB for session persistence
        await savePdfBufferToStorage(buffer, file.name);

        const { pdfDoc, info } = await loadPdfDocument(buffer, file.name);
        setLoadedPdfDoc(pdfDoc);
        setTotalPages(info.numPages);
        setCurrentPage(1);

        setLoadingStep("Génération du fond cartographique...");
        const { dataUrl } = await renderPdfPageToDataUrl(pdfDoc, 1, scale);

        onUpdateBackgroundConfig({
          ...backgroundConfig,
          type: "pdf",
          pdfDataUrl: dataUrl,
          pdfFileName: file.name,
          pdfPageIndex: 1,
          pdfTotalPages: info.numPages,
          pdfScale: scale,
          pdfFitMode: backgroundConfig.pdfFitMode || "contain",
          opacity: backgroundConfig.opacity ?? 1,
          brightness: backgroundConfig.brightness ?? 1,
          contrast: backgroundConfig.contrast ?? 1,
        });
      } catch (err: any) {
        console.error("PDF load error:", err);
        setError(`Impossible de charger ce fichier PDF (${err?.message || "format non supporté"}). Vérifiez qu'il n'est pas protégé par mot de passe.`);
      } finally {
        setLoading(false);
        setLoadingStep("");
      }
    } else if (file.type.startsWith("image/")) {
      // Handle direct image upload
      setLoading(true);
      setLoadingStep("Chargement de l'image...");
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onUpdateBackgroundConfig({
          ...backgroundConfig,
          type: "image",
          pdfDataUrl: result,
          pdfFileName: file.name,
          pdfFitMode: backgroundConfig.pdfFitMode || "contain",
          opacity: backgroundConfig.opacity ?? 1,
          brightness: backgroundConfig.brightness ?? 1,
          contrast: backgroundConfig.contrast ?? 1,
        });
        setLoading(false);
        setLoadingStep("");
      };
      reader.onerror = () => {
        setError("Erreur lors de la lecture de l'image.");
        setLoading(false);
        setLoadingStep("");
      };
      reader.readAsDataURL(file);
    } else {
      setError("Veuillez sélectionner un document PDF (.pdf) ou une image cartographique (.png, .jpg).");
    }
  };

  const handlePageChange = async (newPage: number) => {
    let activeDoc = loadedPdfDoc;
    if (!activeDoc) {
      // Try fetching from storage
      const cached = await loadPdfBufferFromStorage();
      if (cached?.buffer) {
        const res = await loadPdfDocument(cached.buffer, cached.fileName);
        activeDoc = res.pdfDoc;
        setLoadedPdfDoc(activeDoc);
      }
    }

    if (!activeDoc || newPage < 1 || newPage > totalPages) return;
    setLoading(true);
    setLoadingStep(`Rendu de la page ${newPage}...`);
    setError(null);
    try {
      setCurrentPage(newPage);
      const { dataUrl } = await renderPdfPageToDataUrl(activeDoc, newPage, scale);
      onUpdateBackgroundConfig({
        ...backgroundConfig,
        pdfDataUrl: dataUrl,
        pdfPageIndex: newPage,
      });
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors du rendu de la page PDF.");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const handleScaleChange = async (newScale: number) => {
    setScale(newScale);
    let activeDoc = loadedPdfDoc;
    if (!activeDoc) {
      const cached = await loadPdfBufferFromStorage();
      if (cached?.buffer) {
        const res = await loadPdfDocument(cached.buffer, cached.fileName);
        activeDoc = res.pdfDoc;
        setLoadedPdfDoc(activeDoc);
      }
    }

    if (!activeDoc) return;
    setLoading(true);
    setLoadingStep("Recalcul haute définition...");
    try {
      const { dataUrl } = await renderPdfPageToDataUrl(activeDoc, currentPage, newScale);
      onUpdateBackgroundConfig({
        ...backgroundConfig,
        pdfDataUrl: dataUrl,
        pdfScale: newScale,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveCustomMap = async () => {
    await clearPdfBufferFromStorage();
    setLoadedPdfDoc(null);
    onUpdateBackgroundConfig({
      type: "default_svg",
      pdfDataUrl: undefined,
      pdfFileName: undefined,
      pdfPageIndex: 1,
      pdfTotalPages: 1,
      opacity: 1,
      brightness: 1,
      contrast: 1,
      pdfFitMode: "fill",
    });
  };

  return (
    <div
      id="pdf-settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        id="pdf-settings-dialog"
        className="bg-[#16161a] border border-[#2d2d35] rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col text-[#d1d1d6] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2d2d35] flex items-center justify-between bg-[#1f1f26]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#e2ba7d]/20 text-[#e2ba7d] flex items-center justify-center border border-[#e2ba7d]/40">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#e2ba7d]">Fond de Carte & Support PDF</h2>
              <p className="text-[11px] text-[#8e8e93]">
                Importez vos cartes officielles RuneQuest en PDF ou images personnalisées
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

        {/* Tab Selection */}
        <div className="flex border-b border-[#2d2d35] bg-[#121215] px-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("source")}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === "source"
                ? "border-[#e2ba7d] text-[#e2ba7d]"
                : "border-transparent text-[#8e8e93] hover:text-[#d1d1d6]"
            }`}
          >
            1. Source du Fond de Carte
          </button>
          <button
            onClick={() => setActiveTab("adjustments")}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === "adjustments"
                ? "border-[#e2ba7d] text-[#e2ba7d]"
                : "border-transparent text-[#8e8e93] hover:text-[#d1d1d6]"
            }`}
          >
            2. Ajustements & Opacité
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 text-xs">
              {error}
            </div>
          )}

          {activeTab === "source" && (
            <div className="space-y-4 animate-fade-in">
              {/* Type Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Default Vector Parchment */}
                <div
                  onClick={() =>
                    onUpdateBackgroundConfig({
                      ...backgroundConfig,
                      type: "default_svg",
                    })
                  }
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between gap-3 ${
                    backgroundConfig.type === "default_svg"
                      ? "bg-[#e2ba7d]/15 border-[#e2ba7d] text-[#e2ba7d] shadow-lg"
                      : "bg-[#1f1f26] border-[#2d2d35] hover:border-[#3a3a45] text-[#8e8e93]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-xs text-[#d1d1d6] block">
                        Carte Officielle Illustrée (Défaut)
                      </span>
                      <span className="text-[11px] text-[#8e8e93]">
                        Topographie vectorielle avec relief, fleuves Oslir & Zola Fel
                      </span>
                    </div>
                    {backgroundConfig.type === "default_svg" && (
                      <div className="w-5 h-5 rounded-full bg-[#e2ba7d] text-black flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/30 w-fit">
                    Parchemin 1625 ST
                  </span>
                </div>

                {/* PDF or Custom Image */}
                <div
                  onClick={() => {
                    if (backgroundConfig.pdfDataUrl) {
                      onUpdateBackgroundConfig({
                        ...backgroundConfig,
                        type: backgroundConfig.pdfFileName?.toLowerCase().endsWith(".pdf") ? "pdf" : "image",
                      });
                    } else {
                      fileInputRef.current?.click();
                    }
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between gap-3 ${
                    backgroundConfig.type === "pdf" || backgroundConfig.type === "image"
                      ? "bg-[#e2ba7d]/15 border-[#e2ba7d] text-[#e2ba7d] shadow-lg"
                      : "bg-[#1f1f26] border-[#2d2d35] hover:border-[#3a3a45] text-[#8e8e93]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-xs text-[#d1d1d6] block">
                        Carte PDF / Image Importée
                      </span>
                      <span className="text-[11px] text-[#8e8e93]">
                        {backgroundConfig.pdfFileName
                          ? `Fichier : ${backgroundConfig.pdfFileName}`
                          : "Glissez ou chargez votre document PDF de campagne"}
                      </span>
                    </div>
                    {(backgroundConfig.type === "pdf" || backgroundConfig.type === "image") && (
                      <div className="w-5 h-5 rounded-full bg-[#e2ba7d] text-black flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/30 w-fit">
                    PDF / PNG / JPG
                  </span>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => !loading && fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#3a3a45] hover:border-[#e2ba7d] rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition bg-[#1a1a20]/60 hover:bg-[#1a1a20] space-y-3 relative overflow-hidden"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-2xl bg-[#25252b] text-[#e2ba7d] flex items-center justify-center mx-auto border border-[#3a3a45]">
                  {loading ? (
                    <RefreshCw className="w-6 h-6 animate-spin text-[#e2ba7d]" />
                  ) : (
                    <FileUp className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <p className="font-bold text-xs text-[#d1d1d6]">
                    {loading ? loadingStep : "Glissez votre fichier PDF ici, ou cliquez pour parcourir"}
                  </p>
                  <p className="text-[11px] text-[#8e8e93] mt-1">
                    Supporte les atlas PDF Glorantha officiels, aides de jeu et scans haute définition
                  </p>
                </div>
              </div>

              {/* PDF Document Controls when Loaded */}
              {backgroundConfig.pdfFileName && (
                <div className="bg-[#1f1f26] border border-[#2d2d35] p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#e2ba7d] flex items-center gap-1.5 truncate max-w-[280px]">
                      <FileText className="w-4 h-4 shrink-0" /> {backgroundConfig.pdfFileName}
                    </span>
                    <button
                      onClick={handleRemoveCustomMap}
                      className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Retirer le fichier
                    </button>
                  </div>

                  {/* Multi-page Navigation */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between bg-[#121215] p-2.5 rounded-lg border border-[#2d2d35]">
                      <span className="text-[11px] text-[#8e8e93]">
                        Page du document PDF :
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={currentPage <= 1 || loading}
                          onClick={() => handlePageChange(currentPage - 1)}
                          className="p-1 rounded-md bg-[#25252b] hover:bg-white/5 disabled:opacity-30 text-[#d1d1d6]"
                          title="Page précédente"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="font-mono font-bold text-xs text-[#e2ba7d]">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          disabled={currentPage >= totalPages || loading}
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="p-1 rounded-md bg-[#25252b] hover:bg-white/5 disabled:opacity-30 text-[#d1d1d6]"
                          title="Page suivante"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Resolution / Quality */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#8e8e93] gap-2 bg-[#121215] p-2.5 rounded-lg border border-[#2d2d35]">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#d1d1d6]">Netteté & Résolution PDF :</span>
                      <span className="text-[10px] text-[#8e8e93]">Rendu vectoriel sans perte de qualité au zoom</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { label: "Standard (2x)", val: 2.0 },
                        { label: "Haute Déf (3x)", val: 3.0 },
                        { label: "Ultra Net 4K (4x)", val: 4.0 },
                        { label: "Maximal (5x)", val: 5.0 },
                      ].map((item) => (
                        <button
                          key={item.val}
                          disabled={loading}
                          onClick={() => handleScaleChange(item.val)}
                          className={`px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition ${
                            scale === item.val
                              ? "bg-[#e2ba7d] text-black border-[#e2ba7d] shadow-md"
                              : "bg-[#25252b] border-[#3a3a45] text-[#8e8e93] hover:text-[#d1d1d6]"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Rendered Preview Thumbnail */}
                  {backgroundConfig.pdfDataUrl && (
                    <div className="mt-3 pt-3 border-t border-[#2d2d35]">
                      <div className="flex items-center justify-between mb-1.5 text-[11px] text-[#8e8e93]">
                        <span className="flex items-center gap-1 font-semibold text-[#d1d1d6]">
                          <Eye className="w-3.5 h-3.5 text-[#e2ba7d]" /> Aperçu du rendu généré :
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                          <Check className="w-3 h-3" /> Prêt pour l'affichage
                        </span>
                      </div>
                      <div className="relative rounded-lg border border-[#3a3a45] overflow-hidden bg-black/60 aspect-[16/10] flex items-center justify-center group shadow-inner">
                        <img
                          src={backgroundConfig.pdfDataUrl}
                          alt="Aperçu carte"
                          className="w-full h-full object-contain pointer-events-none"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] text-[#e2ba7d] font-mono border border-white/10">
                          {backgroundConfig.pdfFitMode || "fill"} • {Math.round((backgroundConfig.opacity ?? 1) * 100)}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADJUSTMENTS & OPACITY */}
          {activeTab === "adjustments" && (
            <div className="space-y-4 animate-fade-in">
              {/* Fit Mode */}
              <div className="bg-[#1f1f26] border border-[#2d2d35] p-3.5 rounded-xl space-y-2">
                <label className="block text-[11px] font-semibold text-[#8e8e93]">
                  Mode d'ajustement de la carte (Fit Mode)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "contain", label: "Proportionnel (Contain)" },
                    { id: "cover", label: "Plein Écran (Cover)" },
                    { id: "fill", label: "Étiré (Fill 100%)" },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() =>
                        onUpdateBackgroundConfig({
                          ...backgroundConfig,
                          pdfFitMode: mode.id as any,
                        })
                      }
                      className={`p-2 rounded-lg border text-center transition font-semibold text-[11px] ${
                        (backgroundConfig.pdfFitMode || "contain") === mode.id
                          ? "bg-[#e2ba7d]/20 border-[#e2ba7d] text-[#e2ba7d]"
                          : "bg-[#25252b] border-[#3a3a45] text-[#8e8e93] hover:text-[#d1d1d6]"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opacity Slider */}
              <div className="bg-[#1f1f26] border border-[#2d2d35] p-3.5 rounded-xl space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="font-semibold text-[#8e8e93]">Opacité du fond</span>
                  <span className="font-mono text-[#e2ba7d]">
                    {Math.round((backgroundConfig.opacity ?? 1) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={backgroundConfig.opacity ?? 1}
                  onChange={(e) =>
                    onUpdateBackgroundConfig({
                      ...backgroundConfig,
                      opacity: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-[#e2ba7d] cursor-pointer"
                />
              </div>

              {/* Brightness Slider */}
              <div className="bg-[#1f1f26] border border-[#2d2d35] p-3.5 rounded-xl space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="font-semibold text-[#8e8e93]">Luminosité</span>
                  <span className="font-mono text-[#e2ba7d]">
                    {Math.round((backgroundConfig.brightness ?? 1) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={backgroundConfig.brightness ?? 1}
                  onChange={(e) =>
                    onUpdateBackgroundConfig({
                      ...backgroundConfig,
                      brightness: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-[#e2ba7d] cursor-pointer"
                />
              </div>

              {/* Contrast Slider */}
              <div className="bg-[#1f1f26] border border-[#2d2d35] p-3.5 rounded-xl space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="font-semibold text-[#8e8e93]">Contraste</span>
                  <span className="font-mono text-[#e2ba7d]">
                    {Math.round((backgroundConfig.contrast ?? 1) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={backgroundConfig.contrast ?? 1}
                  onChange={(e) =>
                    onUpdateBackgroundConfig({
                      ...backgroundConfig,
                      contrast: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-[#e2ba7d] cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2d2d35] flex items-center justify-between bg-[#1f1f26]">
          <span className="text-[11px] text-[#8e8e93]">
            {backgroundConfig.type === "pdf"
              ? "Fond PDF actif"
              : backgroundConfig.type === "image"
              ? "Fond Image actif"
              : "Carte vectorielle par défaut"}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#e2ba7d] text-black font-bold text-xs shadow-lg hover:bg-[#edd09e] transition"
          >
            Fermer & Appliquer
          </button>
        </div>
      </div>
    </div>
  );
};
