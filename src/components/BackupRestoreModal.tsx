import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Download,
  Upload,
  Archive,
  RotateCcw,
  Check,
  AlertTriangle,
  FileText,
  FileCheck,
  Map as MapIcon,
  Users,
  Compass,
  Shield,
  Layers,
  Sparkles,
  Copy,
  CheckCircle2,
  HardDrive,
  Info,
  Clock,
  Navigation,
  Radio,
} from "lucide-react";
import { Campaign } from "../types";
import {
  exportFullAppState,
  downloadFullAppBackup,
  validateBackupData,
  importFullAppState,
  resetFullAppState,
  buildBackupSummary,
  BackupSummary,
  loadPdfBufferFromStorage,
} from "../utils/storage";

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  onCampaignRestored: (newCampaign: Campaign) => void;
  isGmMode?: boolean;
  activeView?: "map" | "dashboard" | "codex" | "gm-tools";
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  campaign,
  onCampaignRestored,
  isGmMode = true,
  activeView = "map",
}) => {
  const [activeTab, setActiveTab] = useState<"export" | "import" | "reset">("export");

  // Export options and states
  const [includePdf, setIncludePdf] = useState(true);
  const [includeLayers, setIncludeLayers] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // Live app stats
  const [currentSummary, setCurrentSummary] = useState<BackupSummary>(() =>
    buildBackupSummary(campaign)
  );

  // Import states
  const [importText, setImportText] = useState("");
  const [showTextArea, setShowTextArea] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validatedData, setValidatedData] = useState<{
    isValid: boolean;
    isLegacyFormat: boolean;
    error?: string;
    summary?: BackupSummary;
    raw: any;
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [createSafetyBackupFirst, setCreateSafetyBackupFirst] = useState(true);
  const [importFeedback, setImportFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
    details?: string;
  } | null>(null);

  // Reset confirmation state
  const [resetConfirmation, setResetConfirmation] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update live app summary whenever modal opens or campaign changes
  useEffect(() => {
    if (isOpen) {
      loadPdfBufferFromStorage()
        .then((cachedPdf) => {
          const sum = buildBackupSummary(
            campaign,
            cachedPdf?.buffer
              ? { fileName: cachedPdf.fileName, sizeBytes: cachedPdf.buffer.byteLength }
              : undefined
          );
          setCurrentSummary(sum);
        })
        .catch(() => {
          setCurrentSummary(buildBackupSummary(campaign));
        });
      setExportSuccessMsg(null);
      setImportFeedback(null);
      setResetConfirmation(false);
    }
  }, [isOpen, campaign]);

  if (!isOpen) return null;

  // Handle file drop / selection
  const handleProcessFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".json") && !file.type.includes("json")) {
      setImportFeedback({
        type: "error",
        message: "Format invalide",
        details: "Veuillez sélectionner un fichier au format .json.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        const result = validateBackupData(parsed);

        if (result.isValid) {
          setValidatedData({
            isValid: true,
            isLegacyFormat: result.isLegacyFormat,
            summary: result.summary,
            raw: parsed,
          });
          setImportFeedback(null);
        } else {
          setValidatedData(null);
          setImportFeedback({
            type: "error",
            message: "Fichier de sauvegarde non reconnu",
            details: result.error || "Les données ne correspondent pas à une sauvegarde de l'application.",
          });
        }
      } catch (err: any) {
        setValidatedData(null);
        setImportFeedback({
          type: "error",
          message: "Erreur de syntaxe JSON",
          details: "Le contenu du fichier n'est pas un JSON valide.",
        });
      }
    };
    reader.onerror = () => {
      setImportFeedback({
        type: "error",
        message: "Erreur de lecture",
        details: "Impossible de lire le fichier sélectionné.",
      });
    };
    reader.readAsText(file);
  };

  // Handle manual JSON paste
  const handleProcessText = (text: string) => {
    setImportText(text);
    if (!text.trim()) {
      setValidatedData(null);
      return;
    }

    try {
      const parsed = JSON.parse(text.trim());
      const result = validateBackupData(parsed);

      if (result.isValid) {
        setValidatedData({
          isValid: true,
          isLegacyFormat: result.isLegacyFormat,
          summary: result.summary,
          raw: parsed,
        });
        setImportFeedback(null);
      } else {
        setValidatedData(null);
        setImportFeedback({
          type: "error",
          message: "Sauvegarde non reconnue",
          details: result.error || "Les données ne correspondent pas à une sauvegarde de l'application.",
        });
      }
    } catch (err: any) {
      setValidatedData(null);
      setImportFeedback({
        type: "error",
        message: "Erreur de syntaxe JSON",
        details: "Le texte collé n'est pas un JSON valide.",
      });
    }
  };

  // Perform full export
  const handleExportDownload = async () => {
    setIsExporting(true);
    setExportSuccessMsg(null);
    try {
      const backup = await exportFullAppState(campaign, {
        includePdfBuffer: includePdf,
        includeLayersConfig: includeLayers,
        uiPreferences: { isGmMode, activeView },
      });

      downloadFullAppBackup(backup);
      setExportSuccessMsg(
        `Sauvegarde complète exportée avec succès (${
          backup.pdfAsset ? "Carte PDF incluse" : "Format standard"
        }) !`
      );
    } catch (err: any) {
      setExportSuccessMsg("Erreur lors de la génération de la sauvegarde.");
    } finally {
      setIsExporting(false);
    }
  };

  // Copy export JSON to clipboard
  const handleCopyExportJson = async () => {
    setIsExporting(true);
    try {
      const backup = await exportFullAppState(campaign, {
        includePdfBuffer: false, // keep lightweight for clipboard
        includeLayersConfig: includeLayers,
        uiPreferences: { isGmMode, activeView },
      });
      await navigator.clipboard.writeText(JSON.stringify(backup, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2500);
    } catch (e) {
      console.warn("Clipboard copy failed", e);
    } finally {
      setIsExporting(false);
    }
  };

  // Perform full import
  const handleConfirmImport = async () => {
    if (!validatedData?.raw) return;

    setIsImporting(true);
    setImportFeedback(null);

    try {
      // 1. Optional safety backup before applying
      if (createSafetyBackupFirst) {
        try {
          const safetyBackup = await exportFullAppState(campaign, {
            includePdfBuffer: true,
            includeLayersConfig: true,
          });
          const safetyJson = JSON.stringify(safetyBackup);
          sessionStorage.setItem("glorantha_safety_backup_before_import", safetyJson);
        } catch (_) {
          // ignore safety backup failure
        }
      }

      // 2. Import full app state
      const result = await importFullAppState(validatedData.raw);

      // 3. Update React App state
      onCampaignRestored(result.campaign);

      setImportFeedback({
        type: "success",
        message: "Restauration effectuée avec succès !",
        details: `La campagne "${result.campaign.title}" a été entièrement restaurée (${
          result.restoredSummary.heroesCount
        } héros, ${result.restoredSummary.questsCount} quêtes, ${
          result.restoredSummary.customLocationsCount
        } lieux, ${result.restoredSummary.notesCount} notes${
          result.hasRestoredPdf ? ", carte PDF haute résolution restaurée" : ""
        }).`,
      });

      // Clear staged import
      setValidatedData(null);
      setImportText("");
    } catch (err: any) {
      setImportFeedback({
        type: "error",
        message: "Échec de la restauration",
        details: err?.message || "Une erreur est survenue lors de l'application de la sauvegarde.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Perform Factory Reset to 1625 ST Canonical State
  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      const defaultCamp = await resetFullAppState();
      onCampaignRestored(defaultCamp);
      setResetConfirmation(false);
      setImportFeedback({
        type: "info",
        message: "Réinitialisation terminée",
        details: "L'application a été réinitialisée avec succès aux données d'origine de 1625 ST.",
      });
      setActiveTab("import");
    } catch (e: any) {
      setImportFeedback({
        type: "error",
        message: "Échec de la réinitialisation",
        details: e.message,
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#16161a] border border-[#2d2d35] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-[#d1d1d6]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#2d2d35] flex items-center justify-between bg-[#1a1a20]/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25252b] border border-[#e2ba7d40] flex items-center justify-center text-[#e2ba7d] shadow-sm">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#e2ba7d] tracking-wide">
                  Centre de Sauvegarde & Restauration
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#e2ba7d15] text-[#e2ba7d] border border-[#e2ba7d30]">
                  Intégralité
                </span>
              </div>
              <p className="text-xs text-[#8e8e93]">
                Archivez, exportez ou restaurez 100% des données : héros, quêtes, lieux, tracés de guerre, calques et fond de carte.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8e8e93] hover:text-white hover:bg-white/5 transition"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#2d2d35] bg-[#121215] px-4 sm:px-6 shrink-0 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("export")}
            className={`py-3 px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === "export"
                ? "border-[#e2ba7d] text-[#e2ba7d]"
                : "border-transparent text-[#8e8e93] hover:text-[#d1d1d6]"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Exporter la Sauvegarde</span>
          </button>

          <button
            onClick={() => setActiveTab("import")}
            className={`py-3 px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === "import"
                ? "border-[#e2ba7d] text-[#e2ba7d]"
                : "border-transparent text-[#8e8e93] hover:text-[#d1d1d6]"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Restaurer une Sauvegarde</span>
          </button>

          <button
            onClick={() => setActiveTab("reset")}
            className={`py-3 px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === "reset"
                ? "border-red-500 text-red-400"
                : "border-transparent text-[#8e8e93] hover:text-red-400"
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Réinitialisation d'Origine</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: EXPORT */}
          {activeTab === "export" && (
            <div className="space-y-6 animate-fade-in">
              {/* Current App State Overview Card */}
              <div className="bg-[#1f1f26] rounded-xl border border-[#2d2d35] p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#2d2d35]">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-[#e2ba7d]" />
                    <h3 className="text-sm font-bold text-white">
                      État actuel de l'application à sauvegarder
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#8e8e93] font-mono">
                    {currentSummary.title}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-[#16161a] p-3 rounded-lg border border-[#2d2d35]/60">
                    <div className="text-[#8e8e93] flex items-center gap-1.5 mb-1">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span>Héros & Quêtes</span>
                    </div>
                    <div className="font-bold text-white text-sm">
                      {currentSummary.heroesCount} héros · {currentSummary.questsCount} quêtes
                    </div>
                  </div>

                  <div className="bg-[#16161a] p-3 rounded-lg border border-[#2d2d35]/60">
                    <div className="text-[#8e8e93] flex items-center gap-1.5 mb-1">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span>Lieux & Repères</span>
                    </div>
                    <div className="font-bold text-white text-sm">
                      {currentSummary.customLocationsCount} lieux · {currentSummary.customPinsCount} repères
                    </div>
                  </div>

                  <div className="bg-[#16161a] p-3 rounded-lg border border-[#2d2d35]/60">
                    <div className="text-[#8e8e93] flex items-center gap-1.5 mb-1">
                      <Navigation className="w-3.5 h-3.5 text-red-400" />
                      <span>Tracés & Auras</span>
                    </div>
                    <div className="font-bold text-white text-sm">
                      {currentSummary.drawingsCount} tracés · {currentSummary.radiusZonesCount} auras
                    </div>
                  </div>

                  <div className="bg-[#16161a] p-3 rounded-lg border border-[#2d2d35]/60">
                    <div className="text-[#8e8e93] flex items-center gap-1.5 mb-1">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Carnet MJ</span>
                    </div>
                    <div className="font-bold text-white text-sm">
                      {currentSummary.notesCount} notes de session
                    </div>
                  </div>
                </div>

                {/* Map background details */}
                <div className="mt-3 pt-3 border-t border-[#2d2d35]/50 flex flex-wrap items-center justify-between text-xs text-[#8e8e93] gap-2">
                  <div className="flex items-center gap-2">
                    <MapIcon className="w-3.5 h-3.5 text-[#e2ba7d]" />
                    <span>
                      Fond de carte :{" "}
                      <strong className="text-[#d1d1d6]">
                        {currentSummary.hasCustomPdfMap
                          ? `Carte PDF haute résolution (${currentSummary.pdfFileName || "PDF"} ${
                              currentSummary.pdfFileSizeApprox ? `· ${currentSummary.pdfFileSizeApprox}` : ""
                            })`
                          : "Carte vectorielle officielle de Sartar (SVG)"}
                      </strong>
                    </span>
                  </div>

                  <span className="font-mono text-[11px] text-[#8e8e93]">
                    1625 ST · Saison {campaign.calendar?.seasonIndex + 1 || 1}
                  </span>
                </div>
              </div>

              {/* Export Options */}
              <div className="bg-[#1f1f26]/60 rounded-xl border border-[#2d2d35] p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#e2ba7d]">
                  Options d'exportation
                </h4>

                <label className="flex items-start gap-3 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={includePdf}
                    onChange={(e) => setIncludePdf(e.target.checked)}
                    className="mt-0.5 rounded border-[#3a3a45] bg-[#25252b] text-[#e2ba7d] focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold text-[#d1d1d6]">
                      Inclure l'archive binaire du fond de carte PDF (recommandé)
                    </span>
                    <p className="text-[#8e8e93] text-[11px] mt-0.5">
                      Permet d'emporter l'intégralité du document PDF téléversé sans nécessiter de le re-fournir lors d'une restauration sur un autre appareil.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={includeLayers}
                    onChange={(e) => setIncludeLayers(e.target.checked)}
                    className="mt-0.5 rounded border-[#3a3a45] bg-[#25252b] text-[#e2ba7d] focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold text-[#d1d1d6]">
                      Inclure la configuration d'affichage des calques et zoom de la carte
                    </span>
                    <p className="text-[#8e8e93] text-[11px] mt-0.5">
                      Préserve vos calques cochés (villes, ruines, routes commerciales, météo dynamique, grille hexagonale).
                    </p>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleExportDownload}
                  disabled={isExporting}
                  className="flex-1 py-3.5 px-5 bg-[#e2ba7d] hover:bg-[#edd09e] text-black font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isExporting ? "Génération de l'archive..." : "Télécharger la Sauvegarde Complète (.json)"}
                  </span>
                </button>

                <button
                  onClick={handleCopyExportJson}
                  disabled={isExporting}
                  className="py-3 px-4 bg-[#25252b] border border-[#3a3a45] hover:bg-[#2d2d35] text-[#d1d1d6] font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                  title="Copier le contenu au format texte JSON dans le presse-papier"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#8e8e93]" />
                      <span>Copier JSON</span>
                    </>
                  )}
                </button>
              </div>

              {exportSuccessMsg && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{exportSuccessMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IMPORT / RESTORE */}
          {activeTab === "import" && (
            <div className="space-y-6 animate-fade-in">
              {/* Notification Banner */}
              {importFeedback && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-1 animate-fade-in ${
                    importFeedback.type === "success"
                      ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
                      : importFeedback.type === "error"
                      ? "bg-red-950/40 border-red-800/60 text-red-300"
                      : "bg-blue-950/40 border-blue-800/60 text-blue-300"
                  }`}
                >
                  <div className="font-bold flex items-center gap-2">
                    {importFeedback.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {importFeedback.type === "error" && <AlertTriangle className="w-4 h-4 text-red-400" />}
                    {importFeedback.type === "info" && <Info className="w-4 h-4 text-blue-400" />}
                    <span>{importFeedback.message}</span>
                  </div>
                  {importFeedback.details && (
                    <p className="text-[11px] opacity-90 pl-6 leading-relaxed">
                      {importFeedback.details}
                    </p>
                  )}
                </div>
              )}

              {/* Drag and Drop Box */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleProcessFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                  isDragOver
                    ? "border-[#e2ba7d] bg-[#e2ba7d10]"
                    : "border-[#3a3a45] hover:border-[#e2ba7d60] bg-[#1a1a20]/60 hover:bg-[#1a1a20]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleProcessFile(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-12 h-12 rounded-2xl bg-[#25252b] border border-[#3a3a45] flex items-center justify-center text-[#e2ba7d] shadow-md">
                  <Upload className="w-6 h-6" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    Glissez-déposez votre fichier de sauvegarde ici
                  </h4>
                  <p className="text-xs text-[#8e8e93]">
                    ou <span className="text-[#e2ba7d] underline underline-offset-2">cliquez pour parcourir vos fichiers</span> (.json)
                  </p>
                </div>

                <div className="text-[10px] text-[#8e8e93] font-mono mt-1">
                  Compatible avec les sauvegardes intégrales et les exports de campagne
                </div>
              </div>

              {/* Collapsible Manual JSON Paste */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowTextArea(!showTextArea)}
                  className="text-xs text-[#8e8e93] hover:text-[#e2ba7d] flex items-center gap-1.5 transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{showTextArea ? "Masquer la zone de texte" : "Ou coller manuellement le texte JSON"}</span>
                </button>

                {showTextArea && (
                  <div className="space-y-2 animate-fade-in">
                    <textarea
                      value={importText}
                      onChange={(e) => handleProcessText(e.target.value)}
                      rows={4}
                      placeholder="Collez ici le JSON complet de sauvegarde..."
                      className="w-full bg-[#1a1a20] border border-[#3a3a45] rounded-xl p-3 text-xs font-mono text-[#d1d1d6] placeholder-[#8e8e93] outline-none focus:border-[#e2ba7d] resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Validated Backup Preview Card */}
              {validatedData && validatedData.summary && (
                <div className="bg-[#1f1f26] border border-emerald-500/40 rounded-xl p-4 sm:p-5 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-[#2d2d35] pb-3">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          Sauvegarde Détectée & Validée
                        </h4>
                        <p className="text-[11px] text-[#8e8e93]">
                          {validatedData.isLegacyFormat
                            ? "Format de campagne simple"
                            : "Archive d'application complète v2"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      Prête à restaurer
                    </span>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-[#16161a] p-2.5 rounded-lg border border-[#2d2d35]">
                      <span className="text-[#8e8e93] text-[11px] block">Campagne</span>
                      <strong className="text-white truncate block">
                        {validatedData.summary.title}
                      </strong>
                    </div>

                    <div className="bg-[#16161a] p-2.5 rounded-lg border border-[#2d2d35]">
                      <span className="text-[#8e8e93] text-[11px] block">Héros / Quêtes</span>
                      <strong className="text-white">
                        {validatedData.summary.heroesCount} héros · {validatedData.summary.questsCount} quêtes
                      </strong>
                    </div>

                    <div className="bg-[#16161a] p-2.5 rounded-lg border border-[#2d2d35]">
                      <span className="text-[#8e8e93] text-[11px] block">Lieux & Repères</span>
                      <strong className="text-white">
                        {validatedData.summary.customLocationsCount} lieux · {validatedData.summary.customPinsCount} repères
                      </strong>
                    </div>

                    <div className="bg-[#16161a] p-2.5 rounded-lg border border-[#2d2d35]">
                      <span className="text-[#8e8e93] text-[11px] block">Fond de carte</span>
                      <strong className="text-white truncate block">
                        {validatedData.summary.hasCustomPdfMap
                          ? `PDF ${validatedData.summary.pdfFileName || ""}`
                          : "SVG officiel"}
                      </strong>
                    </div>
                  </div>

                  {/* Safety Checkbox */}
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs select-none text-[#8e8e93] pt-1">
                    <input
                      type="checkbox"
                      checked={createSafetyBackupFirst}
                      onChange={(e) => setCreateSafetyBackupFirst(e.target.checked)}
                      className="rounded border-[#3a3a45] bg-[#25252b] text-[#e2ba7d] focus:ring-0"
                    />
                    <span>
                      Créer une copie de secours temporaire en mémoire avant d'écraser l'état actuel
                    </span>
                  </label>

                  {/* Confirmation Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleConfirmImport}
                      disabled={isImporting}
                      className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        {isImporting
                          ? "Application de la restauration en cours..."
                          : "Confirmer et Restaurer l'Intégralité de l'Application"}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RESET TO CANONICAL */}
          {activeTab === "reset" && (
            <div className="space-y-6 max-w-xl mx-auto py-4 animate-fade-in text-center">
              <div className="w-16 h-16 rounded-3xl bg-red-950/40 border border-red-800/60 flex items-center justify-center text-red-400 mx-auto shadow-xl">
                <RotateCcw className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Réinitialisation d'Origine (Sartar 1625 ST)
                </h3>
                <p className="text-xs text-[#8e8e93] leading-relaxed">
                  Cette action réinitialise la campagne aux données officielles de début de jeu : les héros pré-tirés, les quêtes canonniques, les lieux officiels de Sartar et le fond de carte vectoriel d'origine.
                </p>
              </div>

              <div className="bg-[#1f1f26] border border-[#2d2d35] rounded-xl p-4 text-xs text-[#8e8e93] text-left space-y-2">
                <div className="font-bold text-[#d1d1d6] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Ce qui sera réinitialisé :</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pl-2 text-[11px]">
                  <li>Toutes les notes de session et indices personnalisés</li>
                  <li>Les lieux et repères créés manuellement</li>
                  <li>Les tracés tactiques et zones d'aura</li>
                  <li>Le fond de carte PDF importé (remplacé par le SVG de Sartar)</li>
                </ul>
              </div>

              {!resetConfirmation ? (
                <button
                  onClick={() => setResetConfirmation(true)}
                  className="py-3 px-6 bg-red-950/50 hover:bg-red-900 border border-red-700/60 text-red-300 font-bold text-xs rounded-xl transition"
                >
                  Je souhaite réinitialiser la campagne
                </button>
              ) : (
                <div className="space-y-3 p-4 bg-red-950/30 border border-red-800/80 rounded-xl animate-fade-in">
                  <p className="text-xs text-red-300 font-semibold">
                    Êtes-vous absolument sûr ? Cette action est irréversible sauf si vous possédez un fichier de sauvegarde.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setResetConfirmation(false)}
                      className="px-4 py-2 bg-[#25252b] border border-[#3a3a45] text-xs font-semibold rounded-lg text-[#d1d1d6] hover:bg-[#2d2d35]"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleConfirmReset}
                      disabled={isResetting}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg transition"
                    >
                      {isResetting ? "Réinitialisation..." : "Oui, Réinitialiser Tout"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Info */}
        <div className="p-3 sm:p-4 border-t border-[#2d2d35] bg-[#121215] flex flex-wrap items-center justify-between text-[11px] text-[#8e8e93] shrink-0 gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#e2ba7d]" />
            <span>Persistance locale chiffrée dans IndexedDB & LocalStorage</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#25252b] hover:bg-[#2d2d35] text-[#d1d1d6] rounded-lg transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
