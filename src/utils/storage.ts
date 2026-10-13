import { Campaign, MapBackgroundConfig } from "../types";
import { DEFAULT_CAMPAIGN } from "../data/sampleCampaign";

const DB_NAME = "RuneQuestGloranthaAtlasDB";
const DB_VERSION = 1;
const STORE_CAMPAIGN = "campaign_store";
const STORE_ASSETS = "assets_store";
const LOCAL_STORAGE_KEY = "runequest_dragon_pass_campaign_v2";

/**
 * Open or upgrade the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_CAMPAIGN)) {
        db.createObjectStore(STORE_CAMPAIGN);
      }
      if (!db.objectStoreNames.contains(STORE_ASSETS)) {
        db.createObjectStore(STORE_ASSETS);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Store a key-value pair in an IndexedDB object store
 */
async function idbSet<T>(storeName: string, key: string, value: T): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn(`IndexedDB write to ${storeName} failed, continuing with fallback`, e);
  }
}

/**
 * Retrieve a value by key from an IndexedDB object store
 */
async function idbGet<T>(storeName: string, key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn(`IndexedDB read from ${storeName} failed`, e);
    return null;
  }
}

/**
 * Strips heavy data URLs from campaign object to prevent localStorage QuotaExceededError
 */
export function getLightweightCampaign(campaign: Campaign): Campaign {
  if (!campaign.mapBackground?.pdfDataUrl) {
    return campaign;
  }

  const sanitizedBackground: MapBackgroundConfig = {
    ...campaign.mapBackground,
    // Store metadata but exclude heavy base64 dataURL from localStorage
    pdfDataUrl: undefined,
  };

  return {
    ...campaign,
    mapBackground: sanitizedBackground,
  };
}

function cleanCustomPins(pins?: any[]): any[] {
  if (!pins || !Array.isArray(pins)) return [];
  const removedIds = new Set(["pin-1", "pin-2"]);
  const removedNames = ["bivouac de la patrouille du vent", "repaire présumé de broos", "repaire présumé des broos"];
  return pins.filter(
    (p) => !removedIds.has(p.id) && !removedNames.includes(p.name?.toLowerCase()?.trim())
  );
}

/**
 * Synchronous read from localStorage for instant initial render
 */
export function getInitialCampaignFromLocalStorage(): Campaign {
  if (typeof window === "undefined") return DEFAULT_CAMPAIGN;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Clean up legacy bloated entries from localStorage if present
      if (parsed?.mapBackground?.pdfDataUrl) {
        try {
          const sanitized = getLightweightCampaign(parsed);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
        } catch (_) {
          // ignore
        }
      }
      return {
        ...DEFAULT_CAMPAIGN,
        ...parsed,
        customPins: cleanCustomPins(parsed.customPins),
        mapBackground: parsed.mapBackground || DEFAULT_CAMPAIGN.mapBackground || {
          type: "default_svg",
          opacity: 1,
          brightness: 1,
          contrast: 1,
        },
        customLocations: parsed.customLocations || [],
      };
    }
  } catch (e) {
    console.warn("Could not read campaign from localStorage", e);
  }
  return DEFAULT_CAMPAIGN;
}

/**
 * Asynchronously loads the full campaign with stored map background from IndexedDB
 */
export async function loadFullCampaignFromStorage(): Promise<Campaign | null> {
  try {
    const fromIdb = await idbGet<Campaign>(STORE_CAMPAIGN, "active_campaign");
    if (fromIdb && fromIdb.id) {
      return {
        ...DEFAULT_CAMPAIGN,
        ...fromIdb,
        customPins: cleanCustomPins(fromIdb.customPins),
        mapBackground: fromIdb.mapBackground || {
          type: "default_svg",
          opacity: 1,
          brightness: 1,
          contrast: 1,
        },
        customLocations: fromIdb.customLocations || [],
      };
    }
  } catch (e) {
    console.warn("Failed to load campaign from IndexedDB", e);
  }

  // Fallback to localStorage
  return getInitialCampaignFromLocalStorage();
}

/**
 * Persists campaign to IndexedDB (unlimited size) and lightweight version to localStorage
 */
export async function saveCampaignToStorage(campaign: Campaign): Promise<void> {
  // 1. Save full campaign (including large PDF/Image DataURLs) to IndexedDB
  await idbSet(STORE_CAMPAIGN, "active_campaign", campaign);

  // 2. Save lightweight campaign to localStorage (with stripped dataUrl)
  if (typeof window !== "undefined") {
    try {
      const lightweight = getLightweightCampaign(campaign);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lightweight));
    } catch (e) {
      // If even lightweight exceeds or localStorage is disabled, ignore cleanly since IndexedDB has it
      console.warn("localStorage quota reached or unavailable; IndexedDB persistence is active.");
    }
  }
}

/**
 * Store raw PDF ArrayBuffer in IndexedDB for seamless page switching across sessions
 */
export async function savePdfBufferToStorage(buffer: ArrayBuffer, fileName: string): Promise<void> {
  await idbSet(STORE_ASSETS, "active_pdf_buffer", { buffer, fileName });
}

/**
 * Retrieve raw PDF ArrayBuffer from IndexedDB
 */
export async function loadPdfBufferFromStorage(): Promise<{ buffer: ArrayBuffer; fileName: string } | null> {
  return await idbGet<{ buffer: ArrayBuffer; fileName: string }>(STORE_ASSETS, "active_pdf_buffer");
}

/**
 * Clear cached PDF buffer from IndexedDB
 */
export async function clearPdfBufferFromStorage(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_ASSETS, "readwrite");
    tx.objectStore(STORE_ASSETS).delete("active_pdf_buffer");
  } catch (e) {
    console.warn("Failed to clear PDF buffer from storage", e);
  }
}

/**
 * Fast, chunk-safe ArrayBuffer to Base64 encoder
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunkSize = 0x8000; // 32KB chunks prevent call-stack overflows
  for (let i = 0; i < len; i += chunkSize) {
    binary += String.fromCharCode.apply(
      null,
      bytes.subarray(i, Math.min(i + chunkSize, len)) as unknown as number[]
    );
  }
  return btoa(binary);
}

/**
 * Base64 to ArrayBuffer decoder
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export interface BackupSummary {
  title: string;
  description?: string;
  heroesCount: number;
  questsCount: number;
  notesCount: number;
  customLocationsCount: number;
  customPinsCount: number;
  drawingsCount: number;
  radiusZonesCount: number;
  threatClocksCount: number;
  chroniclesCount: number;
  hasCustomPdfMap: boolean;
  pdfFileName?: string;
  pdfFileSizeApprox?: string;
}

export interface FullAppBackup {
  app: string;
  formatVersion: number;
  exportedAt: string;
  summary: BackupSummary;
  campaign: Campaign;
  pdfAsset?: {
    fileName: string;
    base64: string;
  };
  layersConfig?: any;
  uiPreferences?: {
    isGmMode?: boolean;
    activeView?: "map" | "dashboard" | "codex" | "gm-tools";
  };
}

/**
 * Builds a summary descriptor from a campaign and optional assets
 */
export function buildBackupSummary(
  campaign: Campaign,
  pdfAsset?: { fileName: string; sizeBytes?: number }
): BackupSummary {
  const customLocs = (campaign.customLocations || []).length;
  const pins = (campaign.customPins || []).length;
  const drawings = (campaign.drawings || []).length;
  const radiusZones = (campaign.radiusZones || []).length;
  const notes = (campaign.notes || []).length;
  const heroes = (campaign.heroes || []).length;
  const quests = (campaign.quests || []).length;
  const threatClocks = (campaign.threatClocks || []).length;
  const chronicles = (campaign.chronicles || []).length;

  let pdfFileSizeApprox: string | undefined;
  if (pdfAsset?.sizeBytes) {
    if (pdfAsset.sizeBytes > 1024 * 1024) {
      pdfFileSizeApprox = `${(pdfAsset.sizeBytes / (1024 * 1024)).toFixed(1)} Mo`;
    } else {
      pdfFileSizeApprox = `${Math.round(pdfAsset.sizeBytes / 1024)} Ko`;
    }
  }

  return {
    title: campaign.title || "Campagne RuneQuest",
    description: campaign.description,
    heroesCount: heroes,
    questsCount: quests,
    notesCount: notes,
    customLocationsCount: customLocs,
    customPinsCount: pins,
    drawingsCount: drawings,
    radiusZonesCount: radiusZones,
    threatClocksCount: threatClocks,
    chroniclesCount: chronicles,
    hasCustomPdfMap: !!pdfAsset || campaign.mapBackground?.type === "pdf",
    pdfFileName: pdfAsset?.fileName || campaign.mapBackground?.pdfFileName,
    pdfFileSizeApprox,
  };
}

/**
 * Creates an export bundle of the entire application state
 */
export async function exportFullAppState(
  currentCampaign: Campaign,
  options?: {
    includePdfBuffer?: boolean;
    includeLayersConfig?: boolean;
    uiPreferences?: { isGmMode?: boolean; activeView?: "map" | "dashboard" | "codex" | "gm-tools" };
  }
): Promise<FullAppBackup> {
  const includePdf = options?.includePdfBuffer !== false;
  const includeLayers = options?.includeLayersConfig !== false;

  // Prefer active in-memory campaign merged with persistent background
  let campaignToExport: Campaign = {
    ...currentCampaign,
    lastSaved: new Date().toISOString(),
  };

  let pdfAsset: { fileName: string; base64: string } | undefined;
  let pdfSize = 0;

  if (includePdf) {
    try {
      const cachedPdf = await loadPdfBufferFromStorage();
      if (cachedPdf?.buffer) {
        pdfSize = cachedPdf.buffer.byteLength;
        const base64 = arrayBufferToBase64(cachedPdf.buffer);
        pdfAsset = {
          fileName: cachedPdf.fileName || "map.pdf",
          base64,
        };
      }
    } catch (e) {
      console.warn("Could not retrieve PDF buffer for full backup", e);
    }
  }

  let layersConfig: any = undefined;
  if (includeLayers && typeof window !== "undefined") {
    try {
      const rawLayers = localStorage.getItem("glorantha_map_layers_config");
      if (rawLayers) {
        layersConfig = JSON.parse(rawLayers);
      }
    } catch (e) {
      console.warn("Could not read layers config for backup", e);
    }
  }

  const summary = buildBackupSummary(
    campaignToExport,
    pdfAsset ? { fileName: pdfAsset.fileName, sizeBytes: pdfSize } : undefined
  );

  return {
    app: "RuneQuest - Cartographie de la Passe du Dragon",
    formatVersion: 2,
    exportedAt: new Date().toISOString(),
    summary,
    campaign: campaignToExport,
    pdfAsset,
    layersConfig,
    uiPreferences: options?.uiPreferences,
  };
}

/**
 * Triggers a browser download of the full app backup
 */
export function downloadFullAppBackup(backup: FullAppBackup, customName?: string): void {
  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().slice(0, 10);
  const sanitizedTitle = (backup.summary?.title || "campagne")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/gi, "_");
  
  a.href = url;
  a.download = customName || `glorantha_${sanitizedTitle}_sauvegarde_complete_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Validates a parsed JSON object for backup compatibility
 */
export function validateBackupData(data: any): {
  isValid: boolean;
  isLegacyFormat: boolean;
  error?: string;
  summary?: BackupSummary;
  campaign?: Campaign;
  pdfAsset?: { fileName: string; base64: string };
  layersConfig?: any;
  uiPreferences?: any;
} {
  if (!data || typeof data !== "object") {
    return { isValid: false, isLegacyFormat: false, error: "Le fichier ne contient pas un objet JSON valide." };
  }

  // Check if it's the full backup bundle (formatVersion >= 2 or has .campaign)
  if (data.campaign && typeof data.campaign === "object") {
    const camp = data.campaign;
    if (!camp.title && !camp.id) {
      return { isValid: false, isLegacyFormat: false, error: "Données de campagne corrompues ou incomplètes." };
    }
    const summary = data.summary || buildBackupSummary(camp, data.pdfAsset ? { fileName: data.pdfAsset.fileName } : undefined);
    return {
      isValid: true,
      isLegacyFormat: false,
      summary,
      campaign: camp,
      pdfAsset: data.pdfAsset,
      layersConfig: data.layersConfig,
      uiPreferences: data.uiPreferences,
    };
  }

  // Legacy format: raw Campaign object directly exported
  if (data.title && (Array.isArray(data.heroes) || Array.isArray(data.quests) || Array.isArray(data.notes))) {
    const summary = buildBackupSummary(data);
    return {
      isValid: true,
      isLegacyFormat: true,
      summary,
      campaign: data,
    };
  }

  return {
    isValid: false,
    isLegacyFormat: false,
    error: "Ce fichier n'est pas une sauvegarde valide de l'application Passe du Dragon.",
  };
}

/**
 * Restores the entire application state from a backup
 */
export async function importFullAppState(backupRaw: any): Promise<{
  success: boolean;
  campaign: Campaign;
  restoredSummary: BackupSummary;
  hasRestoredPdf: boolean;
  hasRestoredLayers: boolean;
  uiPreferences?: any;
}> {
  const validation = validateBackupData(backupRaw);
  if (!validation.isValid || !validation.campaign) {
    throw new Error(validation.error || "Fichier de sauvegarde invalide.");
  }

  const rawCampaign = validation.campaign;
  const restoredCampaign: Campaign = {
    ...DEFAULT_CAMPAIGN,
    ...rawCampaign,
    customPins: cleanCustomPins(rawCampaign.customPins),
    customLocations: rawCampaign.customLocations || [],
    drawings: rawCampaign.drawings || [],
    radiusZones: rawCampaign.radiusZones || [],
    mapBackground: rawCampaign.mapBackground || DEFAULT_CAMPAIGN.mapBackground || {
      type: "default_svg",
      opacity: 1,
      brightness: 1,
      contrast: 1,
    },
    lastSaved: new Date().toISOString(),
  };

  // 1. Restore Campaign to storage (IndexedDB + localStorage)
  await saveCampaignToStorage(restoredCampaign);

  // 2. Restore PDF buffer if included in bundle
  let hasRestoredPdf = false;
  if (validation.pdfAsset?.base64 && validation.pdfAsset?.fileName) {
    try {
      const buffer = base64ToArrayBuffer(validation.pdfAsset.base64);
      await savePdfBufferToStorage(buffer, validation.pdfAsset.fileName);
      hasRestoredPdf = true;
    } catch (e) {
      console.warn("Failed to restore PDF buffer from backup", e);
    }
  }

  // 3. Restore layersConfig if included
  let hasRestoredLayers = false;
  if (validation.layersConfig && typeof window !== "undefined") {
    try {
      localStorage.setItem("glorantha_map_layers_config", JSON.stringify(validation.layersConfig));
      hasRestoredLayers = true;
      // Dispatch custom event to notify active MapViewer component
      window.dispatchEvent(
        new CustomEvent("glorantha_layers_restored", { detail: validation.layersConfig })
      );
    } catch (e) {
      console.warn("Failed to restore layers configuration", e);
    }
  }

  return {
    success: true,
    campaign: restoredCampaign,
    restoredSummary: validation.summary || buildBackupSummary(restoredCampaign),
    hasRestoredPdf,
    hasRestoredLayers,
    uiPreferences: validation.uiPreferences,
  };
}

/**
 * Resets the entire app back to official 1625 ST defaults
 */
export async function resetFullAppState(): Promise<Campaign> {
  await clearPdfBufferFromStorage();
  await saveCampaignToStorage(DEFAULT_CAMPAIGN);
  return DEFAULT_CAMPAIGN;
}


