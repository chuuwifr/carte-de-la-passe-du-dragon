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

