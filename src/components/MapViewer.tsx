import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  MapPin,
  Eye,
  Layers,
  Search,
  Ruler,
  Star,
  Plus,
  Crosshair,
  FileText,
  Move,
  Edit3,
  Sliders,
  Check,
  Info,
  CloudSun,
  Cloud,
  CloudRain,
  Sparkles,
  Wind,
  Sun,
  Dices,
  ChevronDown,
  SlidersHorizontal,
  EyeOff,
  Navigation,
  Maximize,
  Minimize,
  Radio,
  PenTool,
  ListFilter,
  Route,
  Lock,
  Unlock,
  Copy,
} from "lucide-react";
import {
  PointOfInterest,
  CustomPin,
  POICategory,
  RegionKey,
  MapBackgroundConfig,
  Campaign,
  WeatherType,
  MapFloorLevel,
  MapDrawingElement,
  MapRadiusZone,
  TacticalWaypoint,
  TacticalRouteStyle,
  TacticalTravelMode,
} from "../types";
import { POI_CATEGORIES, getCategoryMeta } from "../data/categories";
import { MapWeatherOverlay } from "./MapWeatherOverlay";
import { WeatherParticleCanvas } from "./WeatherParticleCanvas";
import { WeatherDynamicOverlay } from "./WeatherDynamicOverlay";
import { GmWeatherWidget } from "./GmWeatherWidget";
import { RouteOverlayLayer } from "./RouteOverlayLayer";
import { RoutePlannerDrawer } from "./RoutePlannerDrawer";
import {
  MapMeasureCanvasLayer,
  MapMeasureHUD,
} from "./MapMeasureOverlay";
import {
  MeasurePoint,
  MeasureTerrainType,
} from "../data/measureTerrainData";
import {
  MapLayersMenu,
  MapDisplayLayersState,
  DEFAULT_MAP_LAYERS_STATE,
} from "./MapLayersMenu";
import { PdfMapBackgroundLayer } from "./PdfMapBackgroundLayer";
import { MapTownScoutBar } from "./MapTownScoutBar";
import { MapCoordinatesHUD } from "./MapCoordinatesHUD";
import { MapFloorSwitcher } from "./MapFloorSwitcher";
import { MapFloorOverlays } from "./MapFloorOverlays";
import { MapPoiDirectoryDrawer } from "./MapPoiDirectoryDrawer";
import { MapDrawingCanvasLayer } from "./MapDrawingCanvasLayer";
import { MapDrawingToolbar, DrawingToolMode } from "./MapDrawingToolbar";
import { TacticalRouteHUD } from "./TacticalRouteHUD";
import { TacticalRouteDetailModal } from "./TacticalRouteDetailModal";
import { findClosestPoi } from "../data/tacticalRouteData";
import { MapRadiusOverlayLayer } from "./MapRadiusOverlayLayer";
import { MapRadiusToolModal } from "./MapRadiusToolModal";
import { MapMinimapRadar } from "./MapMinimapRadar";
import { MapHexGridOverlay } from "./MapHexGridOverlay";
import { computeOptimalRoute, TravelMode } from "../data/routeNetwork";
import { GLORANTHA_WEATHER_CATALOG, generateRandomWeather } from "../data/weatherData";
import { GLORANTHA_SEASONS } from "../data/gloranthaLore";

interface MapViewerProps {
  locations: PointOfInterest[];
  customPins: CustomPin[];
  favorites: string[];
  selectedLocation: PointOfInterest | null;
  onSelectLocation: (loc: PointOfInterest) => void;
  onToggleFavorite: (id: string) => void;
  onAddCustomPin: (pin: Omit<CustomPin, "id" | "createdAt">) => void;
  onDeleteCustomPin: (id: string) => void;
  isGmMode: boolean;
  activeFilterCategory: string;
  activeFilterRegion: string;
  activeFilterRune: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  backgroundConfig: MapBackgroundConfig;
  onUpdateBackgroundConfig: (config: MapBackgroundConfig) => void;
  onOpenPdfSettings: () => void;
  onOpenPoiEditor: (poi?: PointOfInterest | null, coords?: { x: number; y: number } | null) => void;
  onUpdateLocationCoords: (locId: string, coords: { x: number; y: number }) => void;
  onResetPoiCoords?: () => void;
  campaign?: Campaign;
  onUpdateCampaign?: (updater: (prev: Campaign) => Campaign) => void;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  locations,
  customPins,
  favorites,
  selectedLocation,
  onSelectLocation,
  onToggleFavorite,
  onAddCustomPin,
  onDeleteCustomPin,
  isGmMode,
  activeFilterCategory,
  activeFilterRegion,
  activeFilterRune,
  searchQuery,
  onSearchChange,
  backgroundConfig,
  onUpdateBackgroundConfig,
  onOpenPdfSettings,
  onOpenPoiEditor,
  onUpdateLocationCoords,
  onResetPoiCoords,
  campaign,
  onUpdateCampaign,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragStartClientPosRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  // Smooth programmatic animation state (for zoom buttons / scout bar pan)
  const [isSmoothAnimating, setIsSmoothAnimating] = useState(false);
  const smoothAnimationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerSmoothAnimation = useCallback(() => {
    setIsSmoothAnimating(true);
    if (smoothAnimationTimerRef.current) {
      clearTimeout(smoothAnimationTimerRef.current);
    }
    smoothAnimationTimerRef.current = setTimeout(() => {
      setIsSmoothAnimating(false);
    }, 320);
  }, []);

  const applyTransform = useCallback((nextPan: { x: number; y: number }, nextZoom: number) => {
    panRef.current = nextPan;
    zoomRef.current = nextZoom;
    setPan(nextPan);
    setZoom(nextZoom);
  }, []);

  // Repositioning / Move Mode State
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [draggingPoiId, setDraggingPoiId] = useState<string | null>(null);
  const [draggedPoiCoords, setDraggedPoiCoords] = useState<{ x: number; y: number } | null>(null);
  const [poiMoveToast, setPoiMoveToast] = useState<{ name: string; x: number; y: number } | null>(null);

  // Map Layers and Display Settings State (with localStorage persistence)
  const [layersState, setLayersState] = useState<MapDisplayLayersState>(() => {
    try {
      const saved = localStorage.getItem("glorantha_map_layers_config");
      if (saved) {
        return { ...DEFAULT_MAP_LAYERS_STATE, ...JSON.parse(saved) };
      }
    } catch (err) {
      console.warn("Could not load map layers state from localStorage", err);
    }
    return DEFAULT_MAP_LAYERS_STATE;
  });

  const [isLayersMenuOpen, setIsLayersMenuOpen] = useState(false);

  // Save layersState to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("glorantha_map_layers_config", JSON.stringify(layersState));
    } catch (err) {
      // ignore
    }
  }, [layersState]);

  // Listen for full backup layers restoration
  useEffect(() => {
    const handleLayersRestored = (event: Event) => {
      const customEvt = event as CustomEvent;
      if (customEvt.detail) {
        setLayersState(customEvt.detail);
      }
    };
    window.addEventListener("glorantha_layers_restored", handleLayersRestored);
    return () => {
      window.removeEventListener("glorantha_layers_restored", handleLayersRestored);
    };
  }, []);

  // Weather & Atmosphere Active Region State
  const [activeWeatherRegion, setActiveWeatherRegion] = useState<RegionKey>(
    campaign?.weather?.selectedRegion || "sartar"
  );
  const [showWeatherDropdown, setShowWeatherDropdown] = useState(false);

  // Sync activeWeatherRegion if campaign changes
  useEffect(() => {
    if (campaign?.weather?.selectedRegion) {
      setActiveWeatherRegion(campaign.weather.selectedRegion);
    }
  }, [campaign?.weather?.selectedRegion]);

  // Distance Measurement Tool State
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<MeasurePoint[]>([]);
  const [cursorHoverMeasurePoint, setCursorHoverMeasurePoint] = useState<{ x: number; y: number } | null>(null);
  const [measureTerrain, setMeasureTerrain] = useState<MeasureTerrainType>("plaine");
  const [measureContextMenuPos, setMeasureContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [mapContextMenu, setMapContextMenu] = useState<{
    clientX: number;
    clientY: number;
    coords: { x: number; y: number };
  } | null>(null);
  const [copiedCoordsToast, setCopiedCoordsToast] = useState(false);
  const [isPlacingPin, setIsPlacingPin] = useState(false);
  const [newPinCoords, setNewPinCoords] = useState<{ x: number; y: number } | null>(null);
  const [newPinName, setNewPinName] = useState("");
  const [newPinNote, setNewPinNote] = useState("");
  const [newPinCategory, setNewPinCategory] = useState<POICategory>("settlement");
  const [newPinStatus, setNewPinStatus] = useState<"visited" | "pending" | "danger" | "quest">("pending");

  // Itinerary & Route Planner State
  const [isRouting, setIsRouting] = useState(false);
  const [routeStartPoint, setRouteStartPoint] = useState<{ x: number; y: number; name: string; id?: string } | null>(null);
  const [routeTargetPoint, setRouteTargetPoint] = useState<{ x: number; y: number; name: string; id?: string } | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>("foot_normal");
  const [avoidChaos, setAvoidChaos] = useState(true);

  // Hovered POI tooltip
  const [hoveredLocation, setHoveredLocation] = useState<PointOfInterest | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // GM Weather Control Widget popup state
  const [showGmWeatherWidget, setShowGmWeatherWidget] = useState(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const prevContainerSizeRef = useRef<{ width: number; height: number } | null>(null);

  // =========================================================================
  // PROJECT ZOMBOID MAP TOOLS STATE (Floor, Scout, Coordinates, Drawings, Radius, Drawer)
  // =========================================================================
  // Floor / Level Switcher State (0: Surface, 1: Leylines/Runes, 2: Dungeons/Caves, 3: Factions)
  const [currentFloor, setCurrentFloor] = useState<MapFloorLevel>(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const match = window.location.hash.match(/floor=(\d+)/);
      if (match) {
        const f = parseInt(match[1]) as MapFloorLevel;
        if (f >= 0 && f <= 3) return f;
      }
    }
    return 0;
  });

  // Real-time & Locked Coordinates State
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number } | null>(null);
  const [lockedCoords, setLockedCoords] = useState<{ x: number; y: number } | null>(null);

  // Container dimensions for minimap radar
  const [containerDimensions, setContainerDimensions] = useState({ width: 1200, height: 800 });

  // POI Directory Drawer State
  const [isPoiDrawerOpen, setIsPoiDrawerOpen] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [activeRegionFilter, setActiveRegionFilter] = useState<string>("all");
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set());

  // Radar Ping for smooth scout navigation & POI highlight
  const [radarPingCoords, setRadarPingCoords] = useState<{ x: number; y: number } | null>(null);

  // Drawings & Markings State
  const [activeDrawingTool, setActiveDrawingTool] = useState<DrawingToolMode>(null);
  const [drawingColor, setDrawingColor] = useState("#38bdf8");
  const [drawingStrokeWidth, setDrawingStrokeWidth] = useState(3);
  const [drawingStampSymbol, setDrawingStampSymbol] = useState("air");
  const [currentDrawingDraft, setCurrentDrawingDraft] = useState<MapDrawingElement | null>(null);
  const [isDrawingMouseDown, setIsDrawingMouseDown] = useState(false);

  // Tactical Routes State (Animated Dashed / Dotted Lines connecting POIs)
  const [tacticalWaypoints, setTacticalWaypoints] = useState<TacticalWaypoint[]>([]);
  const [selectedDrawingForModal, setSelectedDrawingForModal] = useState<MapDrawingElement | null>(null);

  // Local fallback state for drawings if campaign not persistent
  const [localDrawings, setLocalDrawings] = useState<MapDrawingElement[]>(() => campaign?.drawings || []);

  // Radius Zones State
  const [isRadiusModalOpen, setIsRadiusModalOpen] = useState(false);
  const [selectedRadiusZone, setSelectedRadiusZone] = useState<MapRadiusZone | null>(null);
  const [localRadiusZones, setLocalRadiusZones] = useState<MapRadiusZone[]>(() => campaign?.radiusZones || []);

  // Sync with campaign props if campaign changes
  useEffect(() => {
    if (campaign?.drawings) {
      setLocalDrawings(campaign.drawings);
    }
  }, [campaign?.drawings]);

  useEffect(() => {
    if (campaign?.radiusZones) {
      setLocalRadiusZones(campaign.radiusZones);
    }
  }, [campaign?.radiusZones]);

  // Active drawings & radius list
  const activeDrawings = campaign?.drawings || localDrawings;
  const activeRadiusZones = campaign?.radiusZones || localRadiusZones;

  // Add / Update / Delete drawing helper
  const handleAddDrawing = useCallback((drawing: MapDrawingElement) => {
    if (onUpdateCampaign) {
      onUpdateCampaign((prev) => ({
        ...prev,
        drawings: [...(prev.drawings || []), drawing],
        lastSaved: new Date().toISOString(),
      }));
    } else {
      setLocalDrawings((prev) => [...prev, drawing]);
    }
  }, [onUpdateCampaign]);

  const handleUpdateDrawing = useCallback((id: string, updated: Partial<MapDrawingElement>) => {
    if (onUpdateCampaign) {
      onUpdateCampaign((prev) => ({
        ...prev,
        drawings: (prev.drawings || []).map((d) => (d.id === id ? { ...d, ...updated } : d)),
        lastSaved: new Date().toISOString(),
      }));
    } else {
      setLocalDrawings((prev) => prev.map((d) => (d.id === id ? { ...d, ...updated } : d)));
    }
  }, [onUpdateCampaign]);

  const handleDeleteDrawing = useCallback((id: string) => {
    if (onUpdateCampaign) {
      onUpdateCampaign((prev) => ({
        ...prev,
        drawings: (prev.drawings || []).filter((d) => d.id !== id),
        lastSaved: new Date().toISOString(),
      }));
    } else {
      setLocalDrawings((prev) => prev.filter((d) => d.id !== id));
    }
  }, [onUpdateCampaign]);

  const handleSaveTacticalRoute = useCallback((routeData: {
    label: string;
    color: string;
    strokeWidth: number;
    routeStyle: TacticalRouteStyle;
    routeSpeed: "slow" | "normal" | "fast";
    travelMode: TacticalTravelMode;
    reverseDirection: boolean;
  }) => {
    if (tacticalWaypoints.length < 2) return;
    const newRoute: MapDrawingElement = {
      id: `tactical-route-${Date.now()}`,
      type: "tactical_route",
      label: routeData.label,
      color: routeData.color,
      strokeWidth: routeData.strokeWidth,
      routeStyle: routeData.routeStyle,
      routeSpeed: routeData.routeSpeed,
      travelMode: routeData.travelMode,
      reverseDirection: routeData.reverseDirection,
      routeWaypoints: [...tacticalWaypoints],
      points: [...tacticalWaypoints],
      createdAt: new Date().toISOString(),
    };
    handleAddDrawing(newRoute);
    setTacticalWaypoints([]);
    setActiveDrawingTool(null);
  }, [tacticalWaypoints, handleAddDrawing]);

  // Live draft preview for tactical routes connecting waypoints + cursor
  const liveTacticalDraft: MapDrawingElement | null = useMemo(() => {
    if (activeDrawingTool !== "tactical_route" || tacticalWaypoints.length === 0) return null;
    return {
      id: "live-tactical-draft",
      type: "tactical_route",
      color: drawingColor || "#eab308",
      strokeWidth: drawingStrokeWidth || 3.5,
      routeStyle: "animated_dash",
      routeSpeed: "normal",
      routeWaypoints: tacticalWaypoints,
      createdAt: new Date().toISOString(),
    };
  }, [activeDrawingTool, tacticalWaypoints, drawingColor, drawingStrokeWidth]);

  const handleUndoDrawing = useCallback(() => {
    if (onUpdateCampaign) {
      onUpdateCampaign((prev) => ({
        ...prev,
        drawings: (prev.drawings || []).slice(0, -1),
        lastSaved: new Date().toISOString(),
      }));
    } else {
      setLocalDrawings((prev) => prev.slice(0, -1));
    }
  }, [onUpdateCampaign]);

  const handleClearAllDrawings = useCallback(() => {
    if (onUpdateCampaign) {
      onUpdateCampaign((prev) => ({
        ...prev,
        drawings: [],
        lastSaved: new Date().toISOString(),
      }));
    } else {
      setLocalDrawings([]);
    }
  }, [onUpdateCampaign]);

  const handleExportDrawings = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeDrawings, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "dragon_pass_annotations.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [activeDrawings]);

  const handleImportDrawings = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          if (onUpdateCampaign) {
            onUpdateCampaign((prev) => ({
              ...prev,
              drawings: [...(prev.drawings || []), ...imported],
              lastSaved: new Date().toISOString(),
            }));
          } else {
            setLocalDrawings((prev) => [...prev, ...imported]);
          }
        }
      } catch (err) {
        console.error("Failed to import annotations", err);
      }
    };
    reader.readAsText(file);
  }, [onUpdateCampaign]);

  // Radius Zone CRUD helper
  const handleAddRadiusZone = useCallback((zone: Omit<MapRadiusZone, "id">) => {
    const newZone: MapRadiusZone = {
      ...zone,
      id: `zone-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };
    if (onUpdateCampaign) {
      onUpdateCampaign((prev) => ({
        ...prev,
        radiusZones: [...(prev.radiusZones || []), newZone],
        lastSaved: new Date().toISOString(),
      }));
    } else {
      setLocalRadiusZones((prev) => [...prev, newZone]);
    }
  }, [onUpdateCampaign]);

  const handleUpdateRadiusZone = useCallback((id: string, updates: Partial<MapRadiusZone>) => {
    if (onUpdateCampaign) {
      onUpdateCampaign((prev) => ({
        ...prev,
        radiusZones: (prev.radiusZones || []).map((z) => (z.id === id ? { ...z, ...updates } : z)),
        lastSaved: new Date().toISOString(),
      }));
    } else {
      setLocalRadiusZones((prev) => prev.map((z) => (z.id === id ? { ...z, ...updates } : z)));
    }
  }, [onUpdateCampaign]);

  const handleDeleteRadiusZone = useCallback((id: string) => {
    if (onUpdateCampaign) {
      onUpdateCampaign((prev) => ({
        ...prev,
        radiusZones: (prev.radiusZones || []).filter((z) => z.id !== id),
        lastSaved: new Date().toISOString(),
      }));
    } else {
      setLocalRadiusZones((prev) => prev.filter((z) => z.id !== id));
    }
  }, [onUpdateCampaign]);

  // Smooth Pan to Coordinate with optional radar ping
  const panToCoords = useCallback((coords: { x: number; y: number }, targetZoom = 2.5) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mapWidth = 1600;
    const mapHeight = 1100;
    const targetPixelX = (coords.x / 100) * mapWidth;
    const targetPixelY = (coords.y / 100) * mapHeight;

    const newPanX = rect.width / 2 - targetPixelX * targetZoom;
    const newPanY = rect.height / 2 - targetPixelY * targetZoom;

    triggerSmoothAnimation();
    applyTransform({ x: newPanX, y: newPanY }, targetZoom);

    // Trigger radar ping animation
    setRadarPingCoords(coords);
    setTimeout(() => setRadarPingCoords(null), 3000);
  }, [triggerSmoothAnimation, applyTransform]);

  // Parse URL hash for coordinate deep-linking on initial mount
  useEffect(() => {
    if (typeof window === "undefined" || !window.location.hash) return;
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const x = parseFloat(params.get("x") || "");
    const y = parseFloat(params.get("y") || "");
    const z = parseFloat(params.get("z") || "");
    const fl = parseInt(params.get("floor") || "");

    if (!isNaN(x) && !isNaN(y)) {
      setTimeout(() => {
        panToCoords({ x, y }, !isNaN(z) ? z : 2.5);
      }, 200);
    }
    if (!isNaN(fl) && fl >= 0 && fl <= 3) {
      setCurrentFloor(fl as MapFloorLevel);
    }
  }, [panToCoords]);

  // Fullscreen toggle handler
  const toggleFullscreen = useCallback(async () => {
    const container = document.getElementById("dragon-pass-map-container");
    if (!container) return;

    if (!document.fullscreenElement) {
      try {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        }
      } catch (err) {
        console.warn("Fullscreen request failed", err);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } catch (err) {
        console.warn("Exit fullscreen failed", err);
      }
    }
  }, []);

  // Fit the 1600x1100 map stage centered in container
  const fitMapToContainer = useCallback((smooth = true) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const mapWidth = 1600;
    const mapHeight = 1100;

    // Calculate scale to fit container with clean margin
    const scale = Math.min(rect.width / mapWidth, rect.height / mapHeight) * 0.96;
    const panX = (rect.width - mapWidth * scale) / 2;
    const panY = (rect.height - mapHeight * scale) / 2;

    if (smooth) {
      triggerSmoothAnimation();
    }
    applyTransform({ x: panX, y: panY }, scale);
    prevContainerSizeRef.current = { width: rect.width, height: rect.height };
  }, [triggerSmoothAnimation, applyTransform]);

  // Zoom centered around a specific screen coordinate (or container center by default)
  const zoomAroundPoint = useCallback((factor: number, clientX?: number, clientY?: number, smooth = true) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = clientX !== undefined ? clientX - rect.left : rect.width / 2;
    const mouseY = clientY !== undefined ? clientY - rect.top : rect.height / 2;

    const currentZoom = zoomRef.current;
    const currentPan = panRef.current;
    const nextZoom = Math.max(0.15, Math.min(10.0, currentZoom * factor));
    if (Math.abs(nextZoom - currentZoom) < 0.0001) return;

    const scaleRatio = nextZoom / currentZoom;
    const nextPan = {
      x: mouseX - (mouseX - currentPan.x) * scaleRatio,
      y: mouseY - (mouseY - currentPan.y) * scaleRatio,
    };

    if (smooth) {
      triggerSmoothAnimation();
    }
    applyTransform(nextPan, nextZoom);
  }, [triggerSmoothAnimation, applyTransform]);

  // Listen to native fullscreen changes and auto-refit
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      // Give DOM time to update dimensions before refitting
      setTimeout(() => {
        fitMapToContainer();
      }, 50);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [fitMapToContainer]);

  // Global keyboard shortcuts for Map
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "0" || e.key === "r" || e.key === "R") {
        e.preventDefault();
        fitMapToContainer();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setIsMeasuring((prev) => {
          if (prev) {
            setMeasurePoints([]);
            setCursorHoverMeasurePoint(null);
            setMeasureContextMenuPos(null);
          }
          return !prev;
        });
      } else if (e.key === "Escape") {
        if (mapContextMenu) {
          e.preventDefault();
          setMapContextMenu(null);
        } else if (measureContextMenuPos) {
          e.preventDefault();
          setMeasureContextMenuPos(null);
        } else if (isMeasuring) {
          e.preventDefault();
          setIsMeasuring(false);
          setMeasurePoints([]);
          setCursorHoverMeasurePoint(null);
        } else if (isPlacingPin) {
          e.preventDefault();
          setIsPlacingPin(false);
          setNewPinCoords(null);
        }
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomAroundPoint(1.25);
      } else if (e.key === "-") {
        e.preventDefault();
        zoomAroundPoint(0.8);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const nextPan = { ...panRef.current, y: panRef.current.y + 120 };
        triggerSmoothAnimation();
        applyTransform(nextPan, zoomRef.current);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextPan = { ...panRef.current, y: panRef.current.y - 120 };
        triggerSmoothAnimation();
        applyTransform(nextPan, zoomRef.current);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const nextPan = { ...panRef.current, x: panRef.current.x + 120 };
        triggerSmoothAnimation();
        applyTransform(nextPan, zoomRef.current);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const nextPan = { ...panRef.current, x: panRef.current.x - 120 };
        triggerSmoothAnimation();
        applyTransform(nextPan, zoomRef.current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleFullscreen, fitMapToContainer, zoomAroundPoint, triggerSmoothAnimation, applyTransform]);

  // Auto-fit on initial mount
  useEffect(() => {
    fitMapToContainer(false);
  }, [fitMapToContainer]);

  // Handle container resizing (e.g. entering/exiting fullscreen or window resize) preserving center point
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width <= 0 || height <= 0) continue;

        const prev = prevContainerSizeRef.current;
        if (prev && prev.width > 0 && prev.height > 0) {
          // If dimension change is less than 1px, ignore sub-pixel rounding jitter
          if (Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1) {
            continue;
          }
          // Calculate the map coordinate that was at the center of the previous viewport
          const prevCenterX = prev.width / 2;
          const prevCenterY = prev.height / 2;
          const currentPan = panRef.current;
          const currentZoom = zoomRef.current;
          const mapStageCenterX = (prevCenterX - currentPan.x) / currentZoom;
          const mapStageCenterY = (prevCenterY - currentPan.y) / currentZoom;

          // Keep that exact map point centered in the new viewport dimensions
          const nextPan = {
            x: width / 2 - mapStageCenterX * currentZoom,
            y: height / 2 - mapStageCenterY * currentZoom,
          };
          applyTransform(nextPan, currentZoom);
        } else {
          fitMapToContainer(false);
        }
        setContainerDimensions({ width, height });
        prevContainerSizeRef.current = { width, height };
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [fitMapToContainer, applyTransform]);

  // Zoom handlers
  const handleZoomIn = () => zoomAroundPoint(1.25);
  const handleZoomOut = () => zoomAroundPoint(0.8);
  const handleResetZoom = () => {
    fitMapToContainer(true);
  };

  // High-precision fluid wheel zoom centered with 0 offset under cursor
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault();

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Continuous fluid zoom calculation based on scroll delta
      const delta = e.deltaMode === 1 ? e.deltaY * 18 : e.deltaMode === 2 ? e.deltaY * 60 : e.deltaY;
      const zoomSensitivity = e.ctrlKey ? 0.005 : 0.0016;
      const factor = Math.exp(-delta * zoomSensitivity);

      const currentZoom = zoomRef.current;
      const currentPan = panRef.current;
      const nextZoom = Math.max(0.15, Math.min(10.0, currentZoom * factor));
      if (Math.abs(nextZoom - currentZoom) < 0.0001) return;

      const scaleRatio = nextZoom / currentZoom;
      const nextPan = {
        x: mouseX - (mouseX - currentPan.x) * scaleRatio,
        y: mouseY - (mouseY - currentPan.y) * scaleRatio,
      };

      // Direct synchronous update - guarantees zero lag, zero offset drift
      panRef.current = nextPan;
      zoomRef.current = nextZoom;
      setPan(nextPan);
      setZoom(nextZoom);
    };

    container.addEventListener("wheel", onWheelNative, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheelNative);
    };
  }, []);

  // Double click to zoom directly into clicked location
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isPlacingPin || isMeasuring || isMoveMode || draggingPoiId || activeDrawingTool) return;
    zoomAroundPoint(1.5, e.clientX, e.clientY);
  };

  // Convert screen coordinates to relative map percentage (0-100) mapped to 1600x1100 stage
  const getMapCoordinatesFromEvent = (clientX: number, clientY: number): { x: number; y: number } | null => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const currentPan = panRef.current;
    const currentZoom = zoomRef.current;
    const screenRelX = clientX - rect.left - currentPan.x;
    const screenRelY = clientY - rect.top - currentPan.y;

    // Convert from screen pixels to the 1600x1100 virtual map stage coordinates
    const stageX = screenRelX / currentZoom;
    const stageY = screenRelY / currentZoom;

    const xPercent = Math.max(0, Math.min(100, (stageX / 1600) * 100));
    const yPercent = Math.max(0, Math.min(100, (stageY / 1100) * 100));

    return {
      x: Math.round(xPercent * 10) / 10,
      y: Math.round(yPercent * 10) / 10,
    };
  };

  // Calculate map coordinate currently in center of viewport
  const getViewportCenterCoords = useCallback((): { x: number; y: number } => {
    if (!containerRef.current) return { x: 50, y: 50 };
    const rect = containerRef.current.getBoundingClientRect();
    const centerScreenX = rect.left + rect.width / 2;
    const centerScreenY = rect.top + rect.height / 2;
    const coords = getMapCoordinatesFromEvent(centerScreenX, centerScreenY);
    return coords || { x: 50, y: 50 };
  }, []);

  // Pan, Drag & Drawing Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartClientPosRef.current = { x: e.clientX, y: e.clientY };
    hasDraggedRef.current = false;

    const coords = getMapCoordinatesFromEvent(e.clientX, e.clientY);

    // If drawing tool active
    if (activeDrawingTool && coords && e.button === 0) {
      if (activeDrawingTool === "tactical_route") {
        // Tactical routes allow panning via drag, or clicking to place waypoints
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y };
        return;
      }
      setIsDrawingMouseDown(true);
      const id = `draw-${Date.now()}`;

      if (activeDrawingTool === "freehand") {
        setCurrentDrawingDraft({
          id,
          type: "freehand",
          points: [coords],
          color: drawingColor,
          strokeWidth: drawingStrokeWidth,
          createdAt: new Date().toISOString(),
        });
      } else if (activeDrawingTool === "line" || activeDrawingTool === "arrow") {
        setCurrentDrawingDraft({
          id,
          type: activeDrawingTool,
          points: [coords, coords],
          color: drawingColor,
          strokeWidth: drawingStrokeWidth,
          createdAt: new Date().toISOString(),
        });
      } else if (activeDrawingTool === "rect") {
        setCurrentDrawingDraft({
          id,
          type: "rect",
          x: coords.x,
          y: coords.y,
          width: 0,
          height: 0,
          color: drawingColor,
          fillColor: `${drawingColor}25`,
          strokeWidth: drawingStrokeWidth,
          createdAt: new Date().toISOString(),
        });
      } else if (activeDrawingTool === "circle") {
        setCurrentDrawingDraft({
          id,
          type: "circle",
          x: coords.x,
          y: coords.y,
          radius: 0,
          color: drawingColor,
          fillColor: `${drawingColor}25`,
          strokeWidth: drawingStrokeWidth,
          createdAt: new Date().toISOString(),
        });
      } else if (activeDrawingTool === "label") {
        const text = window.prompt("Texte de l'annotation :", "Note de campagne");
        if (text && text.trim()) {
          handleAddDrawing({
            id,
            type: "label",
            x: coords.x,
            y: coords.y,
            text: text.trim(),
            color: drawingColor,
            strokeWidth: 2,
            fontSize: 12,
            createdAt: new Date().toISOString(),
          });
        }
        setIsDrawingMouseDown(false);
      } else if (activeDrawingTool === "stamp") {
        handleAddDrawing({
          id,
          type: "stamp",
          x: coords.x,
          y: coords.y,
          stampSymbol: drawingStampSymbol,
          color: drawingColor,
          strokeWidth: 2,
          createdAt: new Date().toISOString(),
        });
        setIsDrawingMouseDown(false);
      }
      return;
    }

    if (e.button === 0 && !isPlacingPin && !draggingPoiId && !activeDrawingTool) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - panRef.current.x,
        y: e.clientY - panRef.current.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      if (
        Math.hypot(
          e.clientX - dragStartClientPosRef.current.x,
          e.clientY - dragStartClientPosRef.current.y
        ) > 8
      ) {
        hasDraggedRef.current = true;
      }
    }

    const coords = getMapCoordinatesFromEvent(e.clientX, e.clientY);
    if (coords) {
      setCursorCoords(coords);
    }

    // Active Drawing Tool Drag update
    if (activeDrawingTool && isDrawingMouseDown && currentDrawingDraft && coords) {
      if (currentDrawingDraft.type === "freehand") {
        const pts = currentDrawingDraft.points || [];
        const last = pts[pts.length - 1];
        if (!last || Math.hypot(last.x - coords.x, last.y - coords.y) > 0.3) {
          setCurrentDrawingDraft({
            ...currentDrawingDraft,
            points: [...pts, coords],
          });
        }
      } else if (currentDrawingDraft.type === "line" || currentDrawingDraft.type === "arrow") {
        const startPt = currentDrawingDraft.points?.[0] || coords;
        setCurrentDrawingDraft({
          ...currentDrawingDraft,
          points: [startPt, coords],
        });
      } else if (currentDrawingDraft.type === "rect" && currentDrawingDraft.x !== undefined && currentDrawingDraft.y !== undefined) {
        setCurrentDrawingDraft({
          ...currentDrawingDraft,
          width: coords.x - currentDrawingDraft.x,
          height: coords.y - currentDrawingDraft.y,
        });
      } else if (currentDrawingDraft.type === "circle" && currentDrawingDraft.x !== undefined && currentDrawingDraft.y !== undefined) {
        const dist = Math.hypot(coords.x - currentDrawingDraft.x, coords.y - currentDrawingDraft.y);
        setCurrentDrawingDraft({
          ...currentDrawingDraft,
          radius: dist,
        });
      }
      return;
    }

    if (draggingPoiId) {
      if (coords) {
        setDraggedPoiCoords(coords);
      }
    } else if (isDragging) {
      const nextPan = {
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      };
      panRef.current = nextPan;
      setPan(nextPan);
    }

    if (isMeasuring && measurePoints.length === 1 && coords) {
      setCursorHoverMeasurePoint(coords);
    }
  };

  const handleMouseUp = () => {
    if (activeDrawingTool && isDrawingMouseDown) {
      if (currentDrawingDraft) {
        handleAddDrawing(currentDrawingDraft);
        setCurrentDrawingDraft(null);
      }
      setIsDrawingMouseDown(false);
      return;
    }

    if (draggingPoiId && draggedPoiCoords) {
      // Commit POI position
      onUpdateLocationCoords(draggingPoiId, draggedPoiCoords);
      const poi = locations.find((l) => l.id === draggingPoiId);
      if (poi) {
        setPoiMoveToast({
          name: poi.nameFr,
          x: draggedPoiCoords.x,
          y: draggedPoiCoords.y,
        });
        setTimeout(() => setPoiMoveToast(null), 3000);
      }
      setDraggingPoiId(null);
      setDraggedPoiCoords(null);
    }
    setIsDragging(false);
  };

  // Global window mouseup listener to prevent dragging getting stuck
  useEffect(() => {
    const onWindowMouseUp = () => {
      setIsDragging(false);
    };
    window.addEventListener("mouseup", onWindowMouseUp);
    return () => window.removeEventListener("mouseup", onWindowMouseUp);
  }, []);

  // Multi-Touch Handlers (Mobile, iPad, Touchscreen laptops)
  const touchStateRef = useRef<{
    startDist: number;
    startZoom: number;
    startPan: { x: number; y: number };
    midpoint: { x: number; y: number };
    isPinching: boolean;
  }>({
    startDist: 0,
    startZoom: 1,
    startPan: { x: 0, y: 0 },
    midpoint: { x: 0, y: 0 },
    isPinching: false,
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && !draggingPoiId && !activeDrawingTool) {
      const touch = e.touches[0];
      dragStartClientPosRef.current = { x: touch.clientX, y: touch.clientY };
      hasDraggedRef.current = false;
      if (!isPlacingPin) {
        setIsDragging(true);
        dragStartRef.current = {
          x: touch.clientX - panRef.current.x,
          y: touch.clientY - panRef.current.y,
        };
      }
    } else if (e.touches.length === 2 && !activeDrawingTool) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const rect = containerRef.current?.getBoundingClientRect();
      const midX = rect ? (t1.clientX + t2.clientX) / 2 - rect.left : 0;
      const midY = rect ? (t1.clientY + t2.clientY) / 2 - rect.top : 0;

      touchStateRef.current = {
        startDist: Math.max(10, dist),
        startZoom: zoomRef.current,
        startPan: { ...panRef.current },
        midpoint: { x: midX, y: midY },
        isPinching: true,
      };
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      if (
        Math.hypot(
          touch.clientX - dragStartClientPosRef.current.x,
          touch.clientY - dragStartClientPosRef.current.y
        ) > 10
      ) {
        hasDraggedRef.current = true;
      }
      const nextPan = {
        x: touch.clientX - dragStartRef.current.x,
        y: touch.clientY - dragStartRef.current.y,
      };
      panRef.current = nextPan;
      setPan(nextPan);

      const coords = getMapCoordinatesFromEvent(touch.clientX, touch.clientY);
      if (coords) setCursorCoords(coords);
    } else if (e.touches.length === 2 && touchStateRef.current.isPinching) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const newDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const ratio = newDist / touchStateRef.current.startDist;

      const { startZoom, startPan, midpoint } = touchStateRef.current;
      const nextZoom = Math.max(0.15, Math.min(10.0, startZoom * ratio));
      const scaleRatio = nextZoom / startZoom;

      const nextPan = {
        x: midpoint.x - (midpoint.x - startPan.x) * scaleRatio,
        y: midpoint.y - (midpoint.y - startPan.y) * scaleRatio,
      };

      panRef.current = nextPan;
      zoomRef.current = nextZoom;
      setPan(nextPan);
      setZoom(nextZoom);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
      touchStateRef.current.isPinching = false;
    } else if (e.touches.length === 1) {
      touchStateRef.current.isPinching = false;
      const touch = e.touches[0];
      dragStartRef.current = {
        x: touch.clientX - panRef.current.x,
        y: touch.clientY - panRef.current.y,
      };
      setIsDragging(true);
    }
  };

  // Handle map click for measuring or placing custom pins or new POI or routing
  const handleMapClick = (e: React.MouseEvent) => {
    // If context menu was open, close it
    if (mapContextMenu) {
      setMapContextMenu(null);
    }

    // If user dragged the map, do not treat mouse release as a map click
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }

    // If measure context menu was open, close it
    if (measureContextMenuPos) {
      setMeasureContextMenuPos(null);
    }

    const coords = getMapCoordinatesFromEvent(e.clientX, e.clientY);
    if (!coords) return;

    if (activeDrawingTool === "tactical_route") {
      const closest = findClosestPoi(coords, locations, 3.5);
      const newWp: TacticalWaypoint = {
        x: closest ? closest.coords.x : coords.x,
        y: closest ? closest.coords.y : coords.y,
        name: closest ? closest.nameFr : `Point (${coords.x.toFixed(1)}%, ${coords.y.toFixed(1)}%)`,
        poiId: closest?.id,
      };
      setTacticalWaypoints((prev) => [...prev, newWp]);
      return;
    }

    if (isMeasuring) {
      // Find if there's a close POI nearby (< 3% distance)
      let name = `Point (${coords.x.toFixed(1)}%, ${coords.y.toFixed(1)}%)`;
      let closestDist = Infinity;
      for (const l of locations) {
        const d = Math.hypot(l.coords.x - coords.x, l.coords.y - coords.y);
        if (d < 3.0 && d < closestDist) {
          closestDist = d;
          name = `Près de ${l.nameFr}`;
        }
      }

      const pointData: MeasurePoint = { x: coords.x, y: coords.y, name };
      if (measurePoints.length === 0 || measurePoints.length >= 2) {
        setMeasurePoints([pointData]);
        setCursorHoverMeasurePoint(null);
      } else {
        setMeasurePoints((prev) => [...prev, pointData]);
        setCursorHoverMeasurePoint(null);
      }
    } else if (isRouting) {
      if (!routeStartPoint) {
        setRouteStartPoint({ x: coords.x, y: coords.y, name: `Point (${coords.x}%, ${coords.y}%)` });
      } else if (!routeTargetPoint) {
        setRouteTargetPoint({ x: coords.x, y: coords.y, name: `Point (${coords.x}%, ${coords.y}%)` });
      } else {
        setRouteTargetPoint({ x: coords.x, y: coords.y, name: `Point (${coords.x}%, ${coords.y}%)` });
      }
    } else if (isPlacingPin) {
      setNewPinCoords(coords);
    }
  };

  // Compute calculated optimal route
  const routeResult = useMemo(() => {
    if (!routeStartPoint || !routeTargetPoint) return null;
    return computeOptimalRoute(routeStartPoint, routeTargetPoint, {
      travelMode,
      avoidChaosAndSwamps: avoidChaos,
      regionWeathers: campaign?.weather?.regionWeathers,
    });
  }, [routeStartPoint, routeTargetPoint, travelMode, avoidChaos, campaign?.weather?.regionWeathers]);

  // Active layer counter calculation for the layers menu badge
  const activeLayersCount = useMemo(() => {
    let count = 0;
    if (layersState.showAllPois) {
      Object.values(layersState.visibleCategories).forEach((v) => {
        if (v) count++;
      });
    }
    if (layersState.showCustomPins && customPins.length > 0) count++;
    if (layersState.showWeatherClouds) count++;
    if (layersState.showWeatherParticles) count++;
    if (layersState.showWeatherBadges) count++;
    if (layersState.showRoads) count++;
    if (layersState.showObstacles) count++;
    if (layersState.showRegions) count++;
    if (layersState.showRegionLabels) count++;
    if (layersState.showMapCartouche) count++;
    if (layersState.showGrid) count++;
    return count;
  }, [layersState, customPins.length]);

  // Filtered locations based on search query, region, rune, category, and display layers
  const filteredLocations = useMemo(() => {
    if (!layersState.showAllPois) return [];

    return locations.filter((loc) => {
      // Category visibility toggle from Layers Menu
      if (layersState.visibleCategories[loc.category] === false) {
        return false;
      }
      // Favorites filter
      if (layersState.showOnlyFavorites && !favorites.includes(loc.id)) {
        return false;
      }
      // Custom POIs filter
      if (layersState.showOnlyCustomPois && !loc.isCustom && !loc.isModified) {
        return false;
      }
      // Text search query
      if (
        searchQuery &&
        !loc.nameFr.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !loc.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !loc.summary.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !loc.regionLabelFr.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // Category filter from top banner
      if (activeFilterCategory !== "all" && loc.category !== activeFilterCategory) {
        return false;
      }
      // Region filter
      if (activeFilterRegion !== "all" && loc.region !== activeFilterRegion) {
        return false;
      }
      // Rune filter
      if (activeFilterRune !== "all" && !loc.runes.includes(activeFilterRune)) {
        return false;
      }
      return true;
    });
  }, [
    locations,
    layersState.showAllPois,
    layersState.visibleCategories,
    layersState.showOnlyFavorites,
    layersState.showOnlyCustomPois,
    favorites,
    searchQuery,
    activeFilterCategory,
    activeFilterRegion,
    activeFilterRune,
  ]);

  return (
    <div
      id="dragon-pass-map-container"
      className={`relative w-full ${isFullscreen ? "h-screen w-screen" : "h-[calc(100vh-4rem)]"} bg-[#0c0c0e] overflow-hidden select-none flex flex-col font-sans`}
    >
      {/* Background Dot Texture */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(#4d4d5a 0.5px, transparent 0.5px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Top Floating Controls Bar */}
      <div
        id="map-top-bar"
        className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none"
      >
        {/* GROUP 1: Search & POI Directory (Left) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 bg-[#16161a]/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#2d2d35] shadow-2xl">
            <Search className="w-3.5 h-3.5 text-[#e2ba7d]" />
            <input
              id="map-quick-search-input"
              type="text"
              placeholder="Rechercher lieu, ruine..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent text-xs text-[#d1d1d6] placeholder-[#8e8e93] outline-none w-32 sm:w-48"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="text-[#8e8e93] hover:text-[#d1d1d6] text-xs px-1"
              >
                ✕
              </button>
            )}
            <span className="text-[10px] text-[#e2ba7d] font-mono pl-1.5 border-l border-[#2d2d35]">
              {filteredLocations.length}/{locations.length}
            </span>
          </div>

          <button
            id="btn-poi-directory-drawer"
            onClick={() => setIsPoiDrawerOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition font-semibold backdrop-blur-md shadow-2xl ${
              isPoiDrawerOpen
                ? "bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                : "bg-[#16161a]/95 border border-[#2d2d35] text-[#e2ba7d] hover:border-amber-400/50 hover:bg-[#202028]"
            }`}
            title="Répertoire & Explorateur des Lieux de Glorantha"
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Répertoire</span>
          </button>
        </div>

        {/* GROUP 2: CALQUES, NIVEAUX & FOND DE CARTE (Center Group - "Sélectionneur de couche") */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-[#16161a]/95 backdrop-blur-md p-1 rounded-full border border-[#2d2d35] shadow-2xl flex-wrap">
          {/* Project Zomboid Map Style Floor Switcher */}
          <MapFloorSwitcher
            currentFloor={currentFloor}
            onChangeFloor={setCurrentFloor}
          />

          {/* Map Layers & Display Selector Menu Button */}
          <button
            id="btn-open-map-layers-menu"
            onClick={() => setIsLayersMenuOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition font-semibold ${
              isLayersMenuOpen
                ? "bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                : "border border-amber-500/50 bg-[#25252b] text-[#e2ba7d] hover:bg-[#2e2e36] hover:border-amber-400"
            }`}
            title="Ouvrir le menu de sélection de tous les calques et informations affichées sur la carte"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Calques</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-mono font-bold">
              {activeLayersCount}
            </span>
          </button>

          {/* PDF / Custom Map Background Switcher Button */}
          <button
            id="btn-pdf-background-settings"
            onClick={onOpenPdfSettings}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition font-semibold ${
              backgroundConfig.type === "pdf"
                ? "bg-violet-600 text-white shadow-md border border-violet-400"
                : backgroundConfig.type === "image"
                ? "bg-teal-600 text-white shadow-md border border-teal-400"
                : "border border-[#e2ba7d50] text-[#e2ba7d] hover:bg-[#e2ba7d10]"
            }`}
            title="Changer le fond de carte : Importer un PDF de jeu ou une image"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">
              {backgroundConfig.type === "pdf"
                ? `PDF (p.${backgroundConfig.pdfPageIndex || 1})`
                : backgroundConfig.type === "image"
                ? "Image"
                : "Fond"}
            </span>
          </button>
        </div>

        {/* GROUP 3: OUTILS TACTIQUES, ATMOSPHÈRE & AFFICHAGE (Right Group) */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-[#16161a]/95 backdrop-blur-md p-1 rounded-full border border-[#2d2d35] shadow-2xl flex-wrap">
          {/* Create New Custom POI Button */}
          <button
            id="btn-create-new-poi"
            onClick={() => onOpenPoiEditor(null, getViewportCenterCoords())}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition font-bold bg-[#e2ba7d] text-black hover:bg-[#edd09e] shadow-md active:scale-95 cursor-pointer"
            title="Créer un nouveau Point d'Intérêt personnalisé au centre de la vue actuelle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Lieu</span>
          </button>

          {/* Itinerary & Route Planner Button */}
          <button
            id="btn-itinerary-tool"
            onClick={() => {
              setIsRouting(!isRouting);
              setIsMeasuring(false);
              setIsPlacingPin(false);
              setIsMoveMode(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition font-semibold ${
              isRouting
                ? "bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                : "border border-[#e2ba7d50] text-[#e2ba7d] hover:bg-[#e2ba7d10]"
            }`}
            title="Calculer des itinéraires selon les routes et les obstacles"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Trajet</span>
          </button>

          {/* Measure Tool Button */}
          <button
            id="btn-measure-tool"
            onClick={() => {
              setIsMeasuring(!isMeasuring);
              setMeasurePoints([]);
              setIsPlacingPin(false);
              setIsMoveMode(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition font-semibold ${
              isMeasuring
                ? "bg-[#e2ba7d] text-black shadow-md"
                : "border border-[#e2ba7d50] text-[#e2ba7d] hover:bg-[#e2ba7d10]"
            }`}
            title="Mesurer les distances en kilomètres et temps de voyage"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Règle</span>
          </button>

          {/* Custom Quick Marker Pin */}
          <button
            id="btn-place-pin-tool"
            onClick={() => {
              setIsPlacingPin(!isPlacingPin);
              setIsMeasuring(false);
              setIsMoveMode(false);
              setActiveDrawingTool(null);
              setMeasurePoints([]);
            }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition font-semibold ${
              isPlacingPin
                ? "bg-[#e2ba7d] text-black shadow-md"
                : "border border-[#e2ba7d50] text-[#e2ba7d] hover:bg-[#e2ba7d10]"
            }`}
            title="Poser un repère rapide sur la carte"
          >
            <MapPin className="w-3.5 h-3.5" />
          </button>

          {/* Drawing & Annotation Tool Button (PZ Map Style) */}
          <button
            id="btn-drawing-tool"
            onClick={() => {
              setActiveDrawingTool((prev) => (prev ? null : "freehand"));
              setIsMeasuring(false);
              setIsPlacingPin(false);
              setIsMoveMode(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition font-semibold ${
              activeDrawingTool && activeDrawingTool !== "tactical_route"
                ? "bg-sky-400 text-black shadow-[0_0_12px_rgba(56,189,248,0.6)]"
                : "border border-[#e2ba7d50] text-[#e2ba7d] hover:bg-[#e2ba7d10]"
            }`}
            title="Outils de dessin & annotations tactiques (comme Project Zomboid Map)"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Dessin</span>
            {activeDrawings.length > 0 && (
              <span className="text-[9px] px-1 bg-black/40 rounded-full font-mono">
                {activeDrawings.length}
              </span>
            )}
          </button>

          {/* Tactical Animated Routes Tool Button */}
          <button
            id="btn-tactical-route-tool"
            onClick={() => {
              setActiveDrawingTool((prev) => (prev === "tactical_route" ? null : "tactical_route"));
              setIsMeasuring(false);
              setIsPlacingPin(false);
              setIsMoveMode(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition font-semibold ${
              activeDrawingTool === "tactical_route"
                ? "bg-amber-400 text-black shadow-[0_0_14px_rgba(251,191,36,0.7)] ring-2 ring-amber-300"
                : "border border-amber-500/50 text-amber-300 hover:bg-amber-500/10"
            }`}
            title="Outil de tracé de routes tactiques animées (lignes pointillées reliant les POI)"
          >
            <Route className="w-3.5 h-3.5 text-amber-400 group-hover:animate-pulse" />
            <span className="hidden xl:inline">Routes Tactiques</span>
            {activeDrawings.filter((d) => d.type === "tactical_route").length > 0 && (
              <span className="text-[9px] px-1 bg-amber-950/80 text-amber-300 border border-amber-500/40 rounded-full font-mono font-bold">
                {activeDrawings.filter((d) => d.type === "tactical_route").length}
              </span>
            )}
          </button>

          {/* Radius & Danger Zones Tool Button */}
          <button
            id="btn-radius-zones-tool"
            onClick={() => setIsRadiusModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition font-semibold ${
              isRadiusModalOpen
                ? "bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                : "border border-[#e2ba7d50] text-[#e2ba7d] hover:bg-[#e2ba7d10]"
            }`}
            title="Gérer les zones de rayon, auras magiques et périls"
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Rayons</span>
            {activeRadiusZones.length > 0 && (
              <span className="text-[9px] px-1 bg-black/40 rounded-full font-mono">
                {activeRadiusZones.length}
              </span>
            )}
          </button>

          {/* Weather & Cloud Layer Toggle Button */}
          <div className="relative">
            <div className="flex items-center">
              <button
                id="btn-toggle-weather-clouds"
                onClick={() => setLayersState((prev) => ({ ...prev, showWeatherClouds: !prev.showWeatherClouds }))}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-l-full text-xs transition font-semibold ${
                  layersState.showWeatherClouds
                    ? "bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                    : "border border-[#e2ba7d50] text-[#e2ba7d] hover:bg-[#e2ba7d10]"
                }`}
                title={
                  layersState.showWeatherClouds
                    ? "Désactiver l'affichage des nuages et de la météo sur la carte"
                    : "Afficher les nuages et la météo sur la carte"
                }
              >
                <CloudSun className={`w-3.5 h-3.5 ${layersState.showWeatherClouds ? "text-black" : "text-[#e2ba7d]"}`} />
                <span className="hidden 2xl:inline">
                  {layersState.showWeatherClouds ? "Météo" : "Météo"}
                </span>
              </button>
              <button
                id="btn-weather-options-dropdown"
                onClick={() => setShowWeatherDropdown(!showWeatherDropdown)}
                className={`px-1 py-1 rounded-r-full text-xs transition font-semibold border-l ${
                  layersState.showWeatherClouds
                    ? "bg-amber-500 text-black border-amber-600 hover:bg-amber-400"
                    : "border border-[#e2ba7d50] border-l-[#e2ba7d30] text-[#e2ba7d] hover:bg-[#e2ba7d10]"
                }`}
                title="Options d'affichage de la météo (opacité, badges régionaux)"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Weather Options Dropdown Menu */}
            {showWeatherDropdown && (
              <div className="absolute top-8 right-0 w-72 bg-[#16161a]/95 border border-amber-500/50 rounded-xl p-3.5 shadow-2xl text-xs text-[#d1d1d6] z-50 backdrop-blur-md animate-fade-in space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#2d2d35]">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5" />
                    Atmosphère & Overlays CSS
                  </span>
                  <button
                    onClick={() => setShowWeatherDropdown(false)}
                    className="text-[#8e8e93] hover:text-white text-xs px-1"
                  >
                    ✕
                  </button>
                </div>

                {/* Quick Link to open full GM Weather Widget */}
                {isGmMode && (
                  <button
                    onClick={() => {
                      setShowGmWeatherWidget(true);
                      setShowWeatherDropdown(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-1.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs rounded-lg border border-amber-500/40 font-bold transition shadow-sm"
                  >
                    <CloudSun className="w-4 h-4 text-amber-400" />
                    <span>Ouvrir Widget Contrôle MJ</span>
                  </button>
                )}

                {/* Region Focus for Particle Ambiance */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[#8e8e93]">Région d'ambiance :</span>
                    <span className="font-semibold text-amber-300 text-[10px]">
                      {activeWeatherRegion.toUpperCase()}
                    </span>
                  </div>
                  <select
                    value={activeWeatherRegion}
                    onChange={(e) => setActiveWeatherRegion(e.target.value as RegionKey)}
                    className="w-full bg-[#25252b] border border-[#3a3a45] text-amber-200 text-[11px] rounded-lg px-2 py-1 outline-none focus:border-amber-400"
                  >
                    <option value="sartar">Sartar (Montagnes & Tempêtes)</option>
                    <option value="tarsh">Tarsh (Collines & Neiges)</option>
                    <option value="prax">Prax (Plaines & Tempêtes de Poussière)</option>
                    <option value="esrolia">Esrolia (Terres Fertiles & Pluies)</option>
                    <option value="paturages">Pâturages (Prairies & Brises)</option>
                    <option value="vallee_betes">Vallée des Bêtes (Brume & Forêt)</option>
                    <option value="dagori_inkarth">Dâgori Inkarth (Ténèbres & Givre)</option>
                    <option value="pays_heort">Pays d'Héort (Ciel Nuageux)</option>
                    <option value="comte_soleil">Comté du Soleil (Chaleur & Soleil)</option>
                    <option value="comte_pavis">Pavis & Zola Fel (Désert & Oasis)</option>
                  </select>
                </div>

                {/* Toggle on/off main clouds */}
                <div className="flex items-center justify-between">
                  <span className="text-[#8e8e93]">Nuages & Brouillard :</span>
                  <button
                    onClick={() => setLayersState((prev) => ({ ...prev, showWeatherClouds: !prev.showWeatherClouds }))}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      layersState.showWeatherClouds
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    }`}
                  >
                    {layersState.showWeatherClouds ? "Activé" : "Désactivé"}
                  </button>
                </div>

                {/* Toggle on/off particles (Rain, Snow, Heat, Dust) */}
                <div className="flex items-center justify-between">
                  <span className="text-[#8e8e93]">Particules dynamiques :</span>
                  <button
                    onClick={() => setLayersState((prev) => ({ ...prev, showWeatherParticles: !prev.showWeatherParticles }))}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      layersState.showWeatherParticles
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    }`}
                    title="Activer ou désactiver les gouttes de pluie, flocons de neige, braises et vagues de chaleur"
                  >
                    {layersState.showWeatherParticles ? "Particules ON" : "Particules OFF"}
                  </button>
                </div>

                {/* Toggle region badges */}
                <div className="flex items-center justify-between">
                  <span className="text-[#8e8e93]">Pastilles régionales :</span>
                  <button
                    onClick={() => setLayersState((prev) => ({ ...prev, showWeatherBadges: !prev.showWeatherBadges }))}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      layersState.showWeatherBadges
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-[#25252b] text-[#8e8e93] border border-[#3a3a45]"
                    }`}
                  >
                    {layersState.showWeatherBadges ? "Visibles" : "Masquées"}
                  </button>
                </div>

                {/* Particle Intensity Slider */}
                {layersState.showWeatherParticles && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#8e8e93]">Intensité particules :</span>
                      <span className="font-mono text-cyan-300 text-[10px]">
                        {Math.round(layersState.weatherParticleIntensity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="1.0"
                      step="0.05"
                      value={layersState.weatherParticleIntensity}
                      onChange={(e) =>
                        setLayersState((prev) => ({ ...prev, weatherParticleIntensity: parseFloat(e.target.value) }))
                      }
                      className="w-full accent-cyan-400 h-1 bg-[#25252b] rounded-lg cursor-pointer"
                    />
                  </div>
                )}

                {/* Cloud Density / Opacity Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[#8e8e93]">Opacité des nuages :</span>
                    <span className="font-mono text-amber-300 text-[10px]">
                      {Math.round(layersState.weatherCloudOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={layersState.weatherCloudOpacity}
                    onChange={(e) =>
                      setLayersState((prev) => ({ ...prev, weatherCloudOpacity: parseFloat(e.target.value) }))
                    }
                    className="w-full accent-amber-400 h-1 bg-[#25252b] rounded-lg cursor-pointer"
                  />
                </div>

                {/* Roll All Regions Weather button for GM */}
                {isGmMode && onUpdateCampaign && (
                  <div className="pt-2 border-t border-[#2d2d35]">
                    <button
                      onClick={() => {
                        const seasonIdx = campaign?.calendar.seasonIndex ?? 0;
                        const regions: RegionKey[] = [
                          "sartar",
                          "tarsh",
                          "prax",
                          "esrolia",
                          "paturages",
                          "vallee_betes",
                          "dagori_inkarth",
                          "pays_heort",
                          "comte_soleil",
                          "comte_pavis",
                        ];
                        const newWeathers: Partial<Record<RegionKey, any>> = {};
                        regions.forEach((r) => {
                          newWeathers[r] = generateRandomWeather(r, seasonIdx);
                        });
                        onUpdateCampaign((prev) => ({
                          ...prev,
                          weather: {
                            selectedRegion: prev.weather?.selectedRegion || "sartar",
                            isAutoSeasonSync: prev.weather?.isAutoSeasonSync ?? true,
                            regionWeathers: newWeathers,
                          },
                          lastSaved: new Date().toISOString(),
                        }));
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[10px] rounded-lg border border-amber-500/30 font-semibold transition"
                    >
                      <Dices className="w-3.5 h-3.5" />
                      <span>Régénérer Météo de la Passe</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lock / Unlock Icon Position Toggle */}
          <button
            id="btn-toggle-move-mode"
            onClick={() => {
              setIsMoveMode(!isMoveMode);
              setIsPlacingPin(false);
              setIsMeasuring(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition font-semibold ${
              isMoveMode
                ? "bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                : "border border-[#e2ba7d40] text-[#e2ba7d] bg-[#16161a]/80 hover:bg-[#e2ba7d15]"
            }`}
            title={
              isMoveMode
                ? "Mode Déplacement actif : Cliquez pour reverrouiller les icônes fixes"
                : "Icônes fixes et verrouillées. Cliquer pour déverrouiller et déplacer manuellement."
            }
          >
            {isMoveMode ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-black" />
                <span className="hidden sm:inline">Icônes Libres</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-[#e2ba7d]" />
                <span className="hidden sm:inline">Icônes Fixes</span>
              </>
            )}
          </button>

          {/* Reset all canonical coordinates */}
          {onResetPoiCoords && (
            <button
              id="btn-reset-canonical-coords"
              onClick={onResetPoiCoords}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition font-semibold border border-[#e2ba7d30] text-[#8e8e93] hover:text-[#e2ba7d] hover:bg-white/5"
              title="Recaler tous les points d'intérêt à leurs coordonnées géographiques d'origine"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Recaler</span>
            </button>
          )}

          {/* GM Weather Control Widget Direct Button */}
          {isGmMode && (
            <button
              id="btn-open-gm-weather-widget"
              onClick={() => setShowGmWeatherWidget(!showGmWeatherWidget)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition font-semibold ${
                showGmWeatherWidget
                  ? "bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                  : "border border-amber-500/60 bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 hover:border-amber-400 shadow-md"
              }`}
              title="Ouvrir le widget de contrôle météo du Maître de Jeu (pluie, neige, tempête de sable, orages...)"
            >
              <CloudSun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Météo MJ</span>
            </button>
          )}

          {/* Hexagonal Grid Toggle */}
          <button
            id="btn-toggle-hex-grid"
            onClick={() => setLayersState((prev) => ({ ...prev, showHexGrid: !prev.showHexGrid }))}
            className={`p-1.5 rounded-full text-xs transition border ${
              layersState.showHexGrid
                ? "bg-amber-400 text-black border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                : "border-[#e2ba7d50] text-[#e2ba7d] hover:bg-[#e2ba7d10]"
            }`}
            title={layersState.showHexGrid ? "Masquer la grille hexagonale 10km" : "Afficher la grille hexagonale 10km (Hex-crawl)"}
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Mode Toggle */}
          <button
            id="btn-toggle-fullscreen-toolbar"
            onClick={toggleFullscreen}
            className={`p-1.5 rounded-full text-xs transition border ${
              isFullscreen
                ? "bg-amber-500 text-black border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                : "border-[#e2ba7d50] text-[#e2ba7d] hover:bg-[#e2ba7d10]"
            }`}
            title={isFullscreen ? "Quitter le plein écran" : "Passer en mode plein écran (F)"}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Move Mode Active Banner */}
      {isMoveMode && (
        <div
          id="move-mode-notice-banner"
          className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-amber-950/90 text-amber-200 border border-amber-500/80 px-4 py-2 rounded-full shadow-2xl text-xs flex items-center gap-2 backdrop-blur-md animate-fade-in"
        >
          <Move className="w-4 h-4 text-amber-300 animate-spin" />
          <span className="font-bold">Mode Déplacement :</span>
          <span>Cliquez et glissez un marqueur de lieu pour changer sa position</span>
          <button
            onClick={() => setIsMoveMode(false)}
            className="ml-2 px-2 py-0.5 rounded-full bg-amber-400 text-black font-bold text-[10px] hover:bg-amber-300"
          >
            Terminer
          </button>
        </div>
      )}

      {/* Repositioning Success Toast */}
      {poiMoveToast && (
        <div
          id="poi-moved-toast"
          className="absolute top-16 right-4 z-40 bg-[#16161a]/95 text-[#e2ba7d] border border-[#e2ba7d] px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-fade-in"
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="font-bold">{poiMoveToast.name}</span> repositionné !
            <span className="block text-[10px] text-[#8e8e93]">
              X: {poiMoveToast.x}% • Y: {poiMoveToast.y}%
            </span>
          </div>
        </div>
      )}

      {/* Quick Pin Modal */}
      {newPinCoords && (
        <div
          id="modal-new-pin"
          className="absolute top-16 left-3 z-30 bg-[#16161a]/95 backdrop-blur-md border border-[#2d2d35] p-4 rounded-xl shadow-2xl text-[#d1d1d6] text-xs w-80 pointer-events-auto animate-fade-in"
        >
          <div className="flex items-center justify-between font-bold text-[#e2ba7d] uppercase tracking-wider text-xs pb-2 border-b border-[#2d2d35]">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#e2ba7d]" /> Nouveau Repère Rapide
            </span>
            <button onClick={() => setNewPinCoords(null)} className="text-[#8e8e93] hover:text-[#d1d1d6]">
              ✕
            </button>
          </div>
          <div className="mt-3 space-y-2.5">
            <div>
              <label className="text-[11px] text-[#8e8e93] block mb-1">Nom du repère</label>
              <input
                type="text"
                value={newPinName}
                onChange={(e) => setNewPinName(e.target.value)}
                placeholder="Ex: Campement de la tribu, Cachette..."
                className="w-full bg-[#25252b] border border-[#3a3a45] rounded-lg px-3 py-1.5 text-xs text-[#d1d1d6] focus:border-[#e2ba7d] outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#8e8e93] block mb-1">Note de session</label>
              <textarea
                value={newPinNote}
                onChange={(e) => setNewPinNote(e.target.value)}
                rows={2}
                placeholder="Détails, PNJ rencontrés, indices..."
                className="w-full bg-[#25252b] border border-[#3a3a45] rounded-lg p-2 text-xs text-[#d1d1d6] outline-none resize-none focus:border-[#e2ba7d]"
              />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[#2d2d35]">
              <button
                onClick={() => {
                  // Switch to full POI editor
                  onOpenPoiEditor(null, newPinCoords);
                  setNewPinCoords(null);
                  setIsPlacingPin(false);
                }}
                className="text-xs text-[#e2ba7d] hover:underline font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Créer comme lieu complet
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setNewPinCoords(null)}
                  className="px-3 py-1 rounded-full bg-[#25252b] hover:bg-white/5 text-[#8e8e93] text-xs border border-[#3a3a45]"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    if (!newPinName.trim()) return;
                    onAddCustomPin({
                      name: newPinName.trim(),
                      category: newPinCategory,
                      x: newPinCoords.x,
                      y: newPinCoords.y,
                      note: newPinNote.trim(),
                      status: newPinStatus,
                    });
                    setNewPinCoords(null);
                    setNewPinName("");
                    setNewPinNote("");
                    setIsPlacingPin(false);
                  }}
                  className="px-4 py-1 rounded-full bg-[#e2ba7d] text-black font-bold text-xs shadow-lg hover:bg-[#edd09e]"
                >
                  Poser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Map Canvas Viewport */}
      <div
        id="interactive-map-viewport"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
        onClick={handleMapClick}
        onContextMenu={(e) => {
          e.preventDefault();
          if (isMeasuring) {
            setMeasureContextMenuPos({ x: e.clientX, y: e.clientY });
            return;
          }
          const coords = getMapCoordinatesFromEvent(e.clientX, e.clientY);
          if (coords) {
            setMapContextMenu({
              clientX: e.clientX,
              clientY: e.clientY,
              coords,
            });
          }
        }}
        className={`relative flex-1 w-full h-full cursor-${
          isPlacingPin ? "crosshair" : isMeasuring ? "crosshair" : isMoveMode ? "move" : isDragging ? "grabbing" : "grab"
        } overflow-hidden`}
      >
        <div
          id="map-transform-layer"
          className={`absolute origin-top-left will-change-transform ${
            isSmoothAnimating
              ? "transition-transform duration-300 ease-out"
              : "transition-none"
          }`}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            width: "1600px",
            height: "1100px",
            minWidth: "1600px",
            minHeight: "1100px",
            transitionTimingFunction: isSmoothAnimating
              ? "cubic-bezier(0.16, 1, 0.3, 1)"
              : "linear",
          }}
        >
          {/* ============================================================ */}
          {/* MAP BACKGROUND LAYER: PDF / Image OR Default Vector Topo SVG */}
          {/* ============================================================ */}
          {backgroundConfig.type === "pdf" || backgroundConfig.type === "image" ? (
            <PdfMapBackgroundLayer
              backgroundConfig={backgroundConfig}
              currentZoom={zoom}
            />
          ) : (
            /* Authentic Default Vector Map Canvas for Dragon Pass 1625 ST */
            <svg
              id="dragon-pass-svg-canvas"
              viewBox="0 0 1600 1100"
              width="1600"
              height="1100"
              className="absolute inset-0 w-[1600px] h-[1100px] pointer-events-none drop-shadow-2xl"
            >
              <defs>
                <linearGradient id="parchment-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d6c6a5" />
                  <stop offset="35%" stopColor="#cbb892" />
                  <stop offset="70%" stopColor="#bfa87e" />
                  <stop offset="100%" stopColor="#ae946a" />
                </linearGradient>

                <linearGradient id="river-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#679199" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#456c75" stopOpacity="0.9" />
                </linearGradient>

                <linearGradient id="mountain-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#69655f" />
                  <stop offset="100%" stopColor="#8f877d" />
                </linearGradient>

                <pattern id="forest-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path
                    d="M15,5 L10,18 L13,18 L8,26 L22,26 L17,18 L20,18 Z"
                    fill="#475f46"
                    opacity="0.65"
                  />
                </pattern>

                <pattern id="hex-grid" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path
                    d="M 100 0 L 0 0 0 100"
                    fill="none"
                    stroke="rgba(110, 85, 45, 0.2)"
                    strokeWidth="0.75"
                    strokeDasharray="4,4"
                  />
                </pattern>
              </defs>

              {/* Base Parchment Canvas */}
              <rect width="1600" height="1100" fill="url(#parchment-grad)" />

              {/* Borders */}
              <rect
                x="20"
                y="20"
                width="1560"
                height="1060"
                fill="none"
                stroke="#543e26"
                strokeWidth="10"
                opacity="0.85"
              />
              <rect
                x="28"
                y="28"
                width="1544"
                height="1044"
                fill="none"
                stroke="#8a6c47"
                strokeWidth="2"
                strokeDasharray="6,4"
              />

              {/* Terrain: Mirror Sea Bay */}
              <path
                d="M 20,850 C 150,830 280,880 340,950 C 400,1020 420,1080 430,1100 L 20,1100 Z"
                fill="url(#river-grad)"
                stroke="#325057"
                strokeWidth="3"
              />
              <text
                x="180"
                y="980"
                fill="#264249"
                fontSize="24"
                fontFamily="serif"
                fontStyle="italic"
                fontWeight="bold"
                letterSpacing="3"
              >
                Baie de la Mer miroir
              </text>

              {/* Rivers */}
              <path
                d="M 240,40 Q 250,150 290,240 T 360,350 T 480,420 T 600,410 T 680,480"
                fill="none"
                stroke="url(#river-grad)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <text x="260" y="120" fill="#325057" fontSize="13" fontStyle="italic">
                Fleuve Oslir
              </text>

              <path
                d="M 1250,200 Q 1320,380 1340,550 T 1390,750 T 1450,1000"
                fill="none"
                stroke="url(#river-grad)"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <text x="1350" y="650" fill="#325057" fontSize="15" fontStyle="italic" letterSpacing="2">
                Rivière des Berceaux (Zola Fel)
              </text>

              {/* Mountains */}
              <path
                d="M 800,40 Q 950,120 1150,80 T 1400,110 L 1400,160 Q 1150,140 950,170 T 800,90 Z"
                fill="url(#mountain-grad)"
                opacity="0.8"
              />
              <text
                x="920"
                y="95"
                fill="#3a3024"
                fontSize="22"
                fontFamily="serif"
                fontWeight="bold"
                letterSpacing="3"
              >
                Bois de Pierre (Rockwood)
              </text>

              <path
                d="M 680,520 Q 800,600 950,560 T 1150,680 L 1140,730 Q 950,620 800,660 T 660,570 Z"
                fill="url(#mountain-grad)"
                opacity="0.8"
              />

              {/* Region Labels on Map */}
              {layersState.showRegionLabels && (
                <g id="region-labels-layer" opacity="0.85">
                  <g transform="translate(680, 520)">
                    <text
                      x="0"
                      y="0"
                      fill="#382d1c"
                      fontSize="42"
                      fontFamily="serif"
                      fontWeight="bold"
                      letterSpacing="8"
                      textAnchor="middle"
                    >
                      SARTAR
                    </text>
                  </g>
                  <g transform="translate(320, 180)">
                    <text
                      x="0"
                      y="0"
                      fill="#4a2e1b"
                      fontSize="38"
                      fontFamily="serif"
                      fontWeight="bold"
                      letterSpacing="6"
                    >
                      TARSH
                    </text>
                  </g>
                  <g transform="translate(1180, 480)">
                    <text
                      x="0"
                      y="0"
                      fill="#59441f"
                      fontSize="40"
                      fontFamily="serif"
                      fontWeight="bold"
                      letterSpacing="8"
                    >
                      PRAX
                    </text>
                  </g>
                  <g transform="translate(240, 820)">
                    <text
                      x="0"
                      y="0"
                      fill="#264532"
                      fontSize="38"
                      fontFamily="serif"
                      fontWeight="bold"
                      letterSpacing="6"
                    >
                      ESROLIA
                    </text>
                  </g>
                </g>
              )}

              {/* Map Title Cartouche */}
              {layersState.showMapCartouche && (
                <g transform="translate(50, 45)">
                  <rect
                    x="0"
                    y="0"
                    width="280"
                    height="80"
                    rx="6"
                    fill="#2b1f13"
                    stroke="#d4af37"
                    strokeWidth="3"
                    opacity="0.95"
                  />
                  <rect
                    x="4"
                    y="4"
                    width="272"
                    height="72"
                    rx="4"
                    fill="none"
                    stroke="#8f7336"
                    strokeWidth="1"
                  />
                  <text x="20" y="24" fill="#a89260" fontSize="11" fontFamily="sans-serif" letterSpacing="2">
                    CARTE OFFICIELLE
                  </text>
                  <text
                    x="20"
                    y="48"
                    fill="#fcedc7"
                    fontSize="20"
                    fontFamily="serif"
                    fontWeight="bold"
                    letterSpacing="2"
                  >
                    Passe du Dragon
                  </text>
                  <text
                    x="20"
                    y="68"
                    fill="#d4af37"
                    fontSize="12"
                    fontFamily="serif"
                    fontStyle="italic"
                  >
                    1625 ST • An du Réveil du Dragon
                  </text>
                </g>
              )}
            </svg>
          )}

          {/* Optional Grid Overlay */}
          {layersState.showGrid && (
            <div
              className="absolute inset-0 w-[1600px] h-[1100px] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(226, 186, 125, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(226, 186, 125, 0.15) 1px, transparent 1px)",
                backgroundSize: "5% 5%",
              }}
            />
          )}

          {/* ============================================================ */}
          {/* ATMOSPHERIC WEATHER & CLOUDS LAYER                           */}
          {/* ============================================================ */}
          {layersState.showWeatherClouds && (
            <MapWeatherOverlay
              weather={campaign?.weather}
              calendar={campaign?.calendar}
              opacityMultiplier={layersState.weatherCloudOpacity}
              showBadges={layersState.showWeatherBadges}
              isGmMode={isGmMode}
              activeRegion={activeWeatherRegion}
              onSelectRegion={(reg) => setActiveWeatherRegion(reg)}
              onUpdateWeather={(region, newType) => {
                if (onUpdateCampaign) {
                  onUpdateCampaign((prev) => {
                    const existingWeathers = prev.weather?.regionWeathers || {};
                    const existingRegionState = existingWeathers[region] || {
                      region,
                      weatherType: newType,
                      temperature: "tempere",
                      wind: "brise",
                      precipitation: "aucune",
                    };
                    return {
                      ...prev,
                      weather: {
                        selectedRegion: region,
                        isAutoSeasonSync: prev.weather?.isAutoSeasonSync ?? true,
                        regionWeathers: {
                          ...existingWeathers,
                          [region]: {
                            ...existingRegionState,
                            weatherType: newType,
                          },
                        },
                      },
                      lastSaved: new Date().toISOString(),
                    };
                  });
                }
              }}
            />
          )}

          {/* Dynamic CSS Weather Overlay (Rain, Snow, Sandstorm, Lightning, Fog, Heatwave, Aurora) */}
          <WeatherDynamicOverlay
            weather={campaign?.weather}
            calendar={campaign?.calendar}
            activeRegion={activeWeatherRegion}
            opacityMultiplier={layersState.weatherCloudOpacity}
            enabled={layersState.showWeatherClouds}
          />

          {/* Atmospheric Particle Engine (Precipitation & Motes) */}
          {layersState.showWeatherParticles && (
            <WeatherParticleCanvas
              weather={campaign?.weather}
              calendar={campaign?.calendar}
              activeRegion={activeWeatherRegion}
              intensity={layersState.weatherParticleIntensity}
              enabled={layersState.showWeatherParticles}
            />
          )}

          {/* ============================================================ */}
          {/* ROUTE PLANNING OVERLAY LAYER (Roads, Obstacles, Calculated Route) */}
          {/* ============================================================ */}
          {(isRouting || layersState.showRoads || (layersState.showActiveRoute && !!routeResult)) && (
            <RouteOverlayLayer
              routeResult={layersState.showActiveRoute ? routeResult : null}
              startPoint={routeStartPoint}
              targetPoint={routeTargetPoint}
              showRoads={layersState.showRoads || isRouting}
              showObstacles={layersState.showObstacles}
            />
          )}

          {/* ============================================================ */}
          {/* INTERACTIVE MARKERS LAYER: Points of Interest & Custom Pins   */}
          {/* ============================================================ */}
          <div className="absolute inset-0 w-[1600px] h-[1100px] pointer-events-none">
            {filteredLocations.map((loc) => {
              const isSelected = selectedLocation?.id === loc.id;
              const isFav = favorites.includes(loc.id);
              const isDraggingThis = draggingPoiId === loc.id;
              const catMeta = getCategoryMeta(loc.category);
              const customColor = loc.color;

              const isTransparent =
                loc.isTransparentIcon ||
                layersState.poiTransparentBackground ||
                layersState.poiIconStyle === "transparent" ||
                layersState.poiIconStyle === "minimal_ring" ||
                layersState.poiIconStyle === "glow_rune";

              const effectiveOpacity = Math.min(
                1,
                (loc.iconOpacity ?? 1.0) * (layersState.poiIconOpacity ?? 1.0)
              );

              const currentCoords = isDraggingThis && draggedPoiCoords ? draggedPoiCoords : loc.coords;

              return (
                <div
                  key={loc.id}
                  id={`marker-${loc.id}`}
                  style={{
                    left: `${currentCoords.x}%`,
                    top: `${currentCoords.y}%`,
                    opacity: effectiveOpacity,
                    transform: `translate(-50%, -50%) ${
                      layersState.poiFixedScale !== false
                        ? `scale(${Math.max(0.45, Math.min(1.6, 1 / Math.sqrt(zoom)))})`
                        : ""
                    }`,
                  }}
                  className={`absolute pointer-events-auto group z-10 ${
                    isMoveMode ? "cursor-grab active:cursor-grabbing hover:scale-125 hover:z-40" : "cursor-pointer hover:z-30"
                  }`}
                  onMouseDown={(e) => {
                    if (isMoveMode) {
                      e.stopPropagation();
                      setDraggingPoiId(loc.id);
                      setDraggedPoiCoords(loc.coords);
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hasDraggedRef.current) return;
                    if (activeDrawingTool === "tactical_route") {
                      setTacticalWaypoints((prev) => [
                        ...prev,
                        {
                          x: loc.coords.x,
                          y: loc.coords.y,
                          name: loc.nameFr,
                          poiId: loc.id,
                        },
                      ]);
                      return;
                    }
                    if (isMeasuring) {
                      const pt: MeasurePoint = {
                        x: loc.coords.x,
                        y: loc.coords.y,
                        name: loc.nameFr,
                        poiId: loc.id,
                      };
                      if (measurePoints.length === 0 || measurePoints.length >= 2) {
                        setMeasurePoints([pt]);
                        setCursorHoverMeasurePoint(null);
                      } else {
                        setMeasurePoints((prev) => [...prev, pt]);
                        setCursorHoverMeasurePoint(null);
                      }
                      return;
                    }
                    if (isRouting) {
                      if (!routeStartPoint) {
                        setRouteStartPoint({ x: loc.coords.x, y: loc.coords.y, name: loc.nameFr, id: loc.id });
                      } else {
                        setRouteTargetPoint({ x: loc.coords.x, y: loc.coords.y, name: loc.nameFr, id: loc.id });
                      }
                      return;
                    }
                    if (!isMoveMode) {
                      onSelectLocation(loc);
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenPoiEditor(loc);
                  }}
                  onMouseEnter={(e) => {
                    if (!isMoveMode) {
                      setHoveredLocation(loc);
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipPos({ x: rect.left, y: rect.top });
                    }
                  }}
                  onMouseLeave={() => setHoveredLocation(null)}
                >
                  {/* Outer Glow Ring for Selected */}
                  {isSelected && (
                    <span className="absolute -inset-1.5 rounded-full border-2 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)] pointer-events-none" />
                  )}

                  {/* Marker Pin Badge (Standard, Transparent or Custom Image Token) */}
                  {loc.customIconImage ? (
                    <div
                      className={`relative flex items-center justify-center transition-all overflow-hidden ${
                        isTransparent ? "shadow-none" : "shadow-xl"
                      } ${
                        loc.iconSize === "sm"
                          ? "w-3 h-3"
                          : loc.iconSize === "lg"
                          ? "w-5 h-5"
                          : loc.iconSize === "xl"
                          ? "w-6 h-6"
                          : "w-3.5 h-3.5"
                      } ${
                        loc.iconShape === "square"
                          ? "rounded-md"
                          : loc.iconShape === "shield"
                          ? "rounded-t-xs rounded-b-xl"
                          : loc.iconShape === "pin"
                          ? "rounded-full ring-1 ring-offset-1"
                          : "rounded-full"
                      } ${
                        isSelected
                          ? "scale-125 ring-2 ring-amber-300 ring-offset-1 ring-offset-stone-950 z-30"
                          : "hover:scale-135 hover:z-20"
                      }`}
                      style={{
                        borderWidth: isTransparent ? "1px" : "1.5px",
                        borderColor: loc.iconBorderColor || customColor || catMeta.accentColor,
                        backgroundColor: isTransparent ? "transparent" : "#16161a",
                        boxShadow: isSelected
                          ? `0 0 12px ${loc.iconBorderColor || customColor || catMeta.accentColor}`
                          : isTransparent
                          ? `0 0 4px ${loc.iconBorderColor || customColor || catMeta.accentColor}40`
                          : "0 2px 6px rgba(0,0,0,0.6)",
                      }}
                    >
                      <img
                        src={loc.customIconImage}
                        alt={loc.nameFr}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />

                      {/* Subtle shading overlay for depth only if not pure transparent */}
                      {!isTransparent && (
                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/30 pointer-events-none" />
                      )}

                      {isMoveMode && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Move className="w-2 h-2 text-amber-300 animate-pulse" />
                        </div>
                      )}

                      {/* Star favorite indicator badge */}
                      {isFav && (
                        <span className="absolute -top-1 -right-0.5 text-[6px] text-amber-300 drop-shadow-md z-10">
                          ★
                        </span>
                      )}

                      {/* Custom / Modified Badge Indicator */}
                      {(loc.isCustom || loc.isModified) && (
                        <span
                          className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 border border-black shadow z-10"
                          title="Lieu personnalisé"
                        />
                      )}
                    </div>
                  ) : isTransparent || layersState.poiIconStyle === "minimal_ring" || layersState.poiIconStyle === "transparent" ? (
                    /* Transparent / Minimal Ring Marker Mode (100% empty center) */
                    <div
                      className={`relative flex items-center justify-center rounded-full transition-all ${
                        isSelected
                          ? "w-3.5 h-3.5 scale-125 ring-2 ring-amber-300 ring-offset-1"
                          : "w-2.5 h-2.5 hover:scale-135"
                      }`}
                      style={{
                        borderWidth: "1.5px",
                        borderColor: loc.iconBorderColor || customColor || catMeta.accentColor,
                        backgroundColor: "transparent",
                        boxShadow: isSelected
                          ? `0 0 10px ${loc.iconBorderColor || customColor || catMeta.accentColor}`
                          : `0 0 3px ${loc.iconBorderColor || customColor || catMeta.accentColor}80`,
                      }}
                    >
                      {isMoveMode && (
                        <Move className="w-1.5 h-1.5 text-amber-200 animate-pulse" />
                      )}

                      {/* Star favorite indicator badge */}
                      {isFav && (
                        <span className="absolute -top-1.5 -right-1 text-[6px] text-amber-300 drop-shadow">
                          ★
                        </span>
                      )}

                      {/* Custom / Modified Badge Indicator */}
                      {(loc.isCustom || loc.isModified) && (
                        <span
                          className="absolute -bottom-0.5 -left-0.5 w-1 h-1 rounded-full bg-cyan-400 shadow"
                          title="Lieu personnalisé"
                        />
                      )}
                    </div>
                  ) : (
                    /* Standard Solid Marker Dot */
                    <div
                      className={`relative flex items-center justify-center rounded-full shadow border transition-all ${
                        isSelected
                          ? "w-3 h-3 scale-125 ring-2 ring-amber-300 ring-offset-1 ring-offset-stone-900"
                          : "w-2 h-2 hover:scale-135"
                      } ${catMeta.markerColor}`}
                      style={{
                        borderColor: customColor || catMeta.accentColor,
                        backgroundColor: customColor ? `${customColor}33` : undefined,
                      }}
                    >
                      {isMoveMode ? (
                        <Move className="w-1.5 h-1.5 text-amber-200 animate-pulse" />
                      ) : (
                        <div
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: customColor || catMeta.accentColor }}
                        />
                      )}

                      {/* Star favorite indicator badge */}
                      {isFav && (
                        <span className="absolute -top-1 -right-0.5 text-[6px] text-amber-300 drop-shadow">
                          ★
                        </span>
                      )}

                      {/* Custom / Modified Badge Indicator */}
                      {(loc.isCustom || loc.isModified) && (
                        <span
                          className="absolute -bottom-0.5 -left-0.5 w-1 h-1 rounded-full bg-cyan-400 border border-black shadow"
                          title="Lieu personnalisé"
                        />
                      )}
                    </div>
                  )}

                  {/* Name Label display based on poiLabelMode */}
                  {(layersState.poiLabelMode === "always" || isSelected) && (
                    <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap z-20">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-serif font-bold text-[#fcedc7] bg-black/85 border border-[#e2ba7d]/60 shadow-md backdrop-blur-xs tracking-tight">
                        {loc.nameFr}
                      </span>
                    </div>
                  )}

                  {/* Move Mode Coordinates indicator only when moving */}
                  {isMoveMode && isDraggingThis && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black/90 text-amber-300 border border-amber-500/50 text-[8px] font-mono whitespace-nowrap shadow">
                      {currentCoords.x}%, {currentCoords.y}%
                    </div>
                  )}
                </div>
              );
            })}

            {/* Custom Session Pins */}
            {layersState.showCustomPins &&
              customPins.map((pin) => {
                const getPinColor = () => {
                  switch (pin.status) {
                    case "visited":
                      return "bg-emerald-600 border-emerald-300 text-white shadow-[0_0_8px_rgba(34,197,94,0.5)]";
                    case "danger":
                      return "bg-red-600 border-red-300 text-white shadow-[0_0_12px_#ef4444] ring-2 ring-red-400/80";
                    case "quest":
                      return "bg-[#e2ba7d] border-amber-200 text-black shadow-[0_0_10px_#e2ba7d]";
                    default:
                      return "bg-sky-600 border-sky-300 text-white";
                  }
                };

                return (
                  <div
                    key={pin.id}
                    id={`custom-pin-${pin.id}`}
                    style={{
                      left: `${pin.x}%`,
                      top: `${pin.y}%`,
                      transform: `translate(-50%, -50%) ${
                        layersState.poiFixedScale !== false
                          ? `scale(${Math.max(0.45, Math.min(1.6, 1 / Math.sqrt(zoom)))})`
                          : ""
                      }`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasDraggedRef.current) return;
                      if (activeDrawingTool === "tactical_route") {
                        setTacticalWaypoints((prev) => [
                          ...prev,
                          {
                            x: pin.x,
                            y: pin.y,
                            name: pin.name,
                          },
                        ]);
                        return;
                      }
                      if (isMeasuring) {
                        const pt: MeasurePoint = {
                          x: pin.x,
                          y: pin.y,
                          name: pin.name,
                        };
                        if (measurePoints.length === 0 || measurePoints.length >= 2) {
                          setMeasurePoints([pt]);
                          setCursorHoverMeasurePoint(null);
                        } else {
                          setMeasurePoints((prev) => [...prev, pt]);
                          setCursorHoverMeasurePoint(null);
                        }
                        return;
                      }
                      if (isRouting) {
                        if (!routeStartPoint) {
                          setRouteStartPoint({ x: pin.x, y: pin.y, name: pin.name });
                        } else {
                          setRouteTargetPoint({ x: pin.x, y: pin.y, name: pin.name });
                        }
                      }
                    }}
                    className="absolute pointer-events-auto cursor-pointer group z-20"
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center border shadow-lg ${getPinColor()}`}
                      title={`${pin.name}: ${pin.note}`}
                    >
                      <MapPin className="w-2.5 h-2.5" />
                    </div>
                    <div className="mt-0.5 px-1.5 py-0.5 bg-[#16161a]/95 text-[#e2ba7d] border border-[#2d2d35] rounded text-[8px] font-bold whitespace-nowrap shadow-md">
                      {pin.name}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Project Zomboid Level/Floor Overlay Layer */}
          <MapFloorOverlays currentFloor={currentFloor} />

          {/* Cartographic Hex-Crawl Grid Overlay */}
          <MapHexGridOverlay visible={layersState.showHexGrid} />

          {/* Interactive Radius & Aura Danger Zones Layer */}
          {layersState.showRadiusZones && (
            <MapRadiusOverlayLayer
              zones={activeRadiusZones}
              selectedZoneId={selectedRadiusZone?.id}
              onSelectZone={(zone) => {
                setSelectedRadiusZone(zone);
                setIsRadiusModalOpen(true);
              }}
            />
          )}

          {/* Vector Drawing & Tactician Markings Canvas Layer */}
          {layersState.showDrawings && (
            <MapDrawingCanvasLayer
              drawings={activeDrawings}
              currentDrawing={currentDrawingDraft || liveTacticalDraft}
              isDrawingActive={!!activeDrawingTool}
              onSelectDrawing={(draw) => {
                if (draw.type === "tactical_route") {
                  setSelectedDrawingForModal(draw);
                }
              }}
            />
          )}

          {/* Radar Navigation Ping Animation */}
          {radarPingCoords && (
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40"
              style={{ left: `${radarPingCoords.x}%`, top: `${radarPingCoords.y}%` }}
            >
              <div className="w-16 h-16 rounded-full border-2 border-amber-400 animate-ping opacity-75" />
              <div className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-amber-400/40 border border-amber-300 shadow-[0_0_15px_#fbbf24] animate-pulse" />
            </div>
          )}

          {/* Interactive Distance Measurement SVG & Canvas Layer */}
          {isMeasuring && (
            <MapMeasureCanvasLayer
              points={measurePoints}
              cursorHoverPoint={cursorHoverMeasurePoint}
              selectedTerrain={measureTerrain}
              onOpenContextMenuAt={(clientX, clientY) =>
                setMeasureContextMenuPos({ x: clientX, y: clientY })
              }
            />
          )}
        </div>
      </div>

      {/* Quick Town & Major Settlements Scout Bar */}
      <div className="absolute top-16 left-3 right-3 z-25 pointer-events-auto flex justify-center">
        <MapTownScoutBar
          locations={locations}
          onSelectTown={(coords) => panToCoords(coords, 2.8)}
        />
      </div>

      {/* Floor / Level Switcher Control on the right */}
      <MapFloorSwitcher
        currentFloor={currentFloor}
        onChangeFloor={(floor) => {
          setCurrentFloor(floor);
          if (typeof window !== "undefined") {
            const hash = new URLSearchParams(window.location.hash.substring(1));
            hash.set("floor", floor.toString());
            window.location.hash = hash.toString();
          }
        }}
      />

      {/* Tactical Drawing & Annotations Toolbar */}
      {activeDrawingTool && activeDrawingTool !== "tactical_route" && (
        <MapDrawingToolbar
          activeTool={activeDrawingTool}
          onSelectTool={(tool) => setActiveDrawingTool(tool)}
          color={drawingColor}
          onChangeColor={setDrawingColor}
          strokeWidth={drawingStrokeWidth}
          onChangeStrokeWidth={setDrawingStrokeWidth}
          stampSymbol={drawingStampSymbol}
          onChangeStampSymbol={setDrawingStampSymbol}
          onUndo={handleUndoDrawing}
          onClearAll={handleClearAllDrawings}
          onExport={handleExportDrawings}
          onImport={handleImportDrawings}
          drawingsCount={activeDrawings.length}
        />
      )}

      {/* Floating Hover Tooltip */}
      {hoveredLocation && !isMoveMode && (
        <div
          id="poi-hover-tooltip"
          className="fixed z-50 pointer-events-none bg-[#16161a]/95 backdrop-blur-md border border-[#e2ba7d] rounded-xl shadow-2xl text-[#d1d1d6] text-xs w-72 transition-all transform -translate-x-1/2 -translate-y-full mt-[-10px] overflow-hidden"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
          }}
        >
          {/* Optional Tooltip Image Banner */}
          {(hoveredLocation.coverImage || (hoveredLocation.images && hoveredLocation.images.length > 0)) && (
            <div className="w-full h-24 bg-black relative border-b border-[#2d2d35]">
              <img
                src={hoveredLocation.coverImage || hoveredLocation.images![0]}
                alt={hoveredLocation.nameFr}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#16161a] via-transparent to-transparent" />
            </div>
          )}

          <div className="p-3.5">
            <div className="flex items-center justify-between border-b border-[#2d2d35] pb-2 mb-2">
              <span className="font-bold text-[#e2ba7d] text-sm flex items-center gap-1.5">
                {hoveredLocation.nameFr}
              </span>
              <span className="text-[10px] text-[#8e8e93] font-mono">
                {hoveredLocation.regionLabelFr}
              </span>
            </div>
            <p className="text-[11px] text-[#8e8e93] line-clamp-2 leading-relaxed">
              {hoveredLocation.summary}
            </p>
            <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#e2ba7d]">
              <span className="px-2 py-0.5 rounded bg-[#25252b] border border-[#3a3a45]">
                {getCategoryMeta(hoveredLocation.category).labelFr}
              </span>
              <span className="text-[#8e8e93] italic">Cliquer pour ouvrir ↗</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Navigation HUD / Zoom Controls & Mini-Map */}
      <div
        id="map-bottom-controls"
        className="absolute bottom-4 right-4 z-30 flex items-end gap-3 pointer-events-none"
      >
        {/* Quick Zoom Buttons */}
        <div className="flex flex-col gap-1 pointer-events-auto bg-[#16161a]/95 backdrop-blur-md p-1.5 rounded-full border border-[#2d2d35] shadow-2xl">
          <button
            id="btn-zoom-in"
            onClick={handleZoomIn}
            className="p-2 rounded-full hover:bg-white/5 text-[#8e8e93] hover:text-[#e2ba7d] transition"
            title="Zoomer (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="btn-zoom-out"
            onClick={handleZoomOut}
            className="p-2 rounded-full hover:bg-white/5 text-[#8e8e93] hover:text-[#e2ba7d] transition"
            title="Dézoomer (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            id="btn-reset-zoom"
            onClick={handleResetZoom}
            className="p-2 rounded-full hover:bg-white/5 text-[#8e8e93] hover:text-[#e2ba7d] transition"
            title="Réinitialiser la vue"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            id="btn-toggle-fullscreen-bottom"
            onClick={toggleFullscreen}
            className="p-2 rounded-full hover:bg-white/5 text-[#8e8e93] hover:text-[#e2ba7d] transition"
            title={isFullscreen ? "Quitter le plein écran" : "Passer en plein écran"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>

        {/* Project Zomboid Style Interactive Minimap Radar */}
        <MapMinimapRadar
          pan={pan}
          zoom={zoom}
          containerWidth={containerDimensions.width}
          containerHeight={containerDimensions.height}
          onPanTo={(newPan) => {
            panRef.current = newPan;
            setPan(newPan);
          }}
          locations={filteredLocations}
        />
      </div>

      {/* Real-Time Coordinates HUD (X/Y %, Km, Stades, Go-To & Share Link) */}
      <MapCoordinatesHUD
        cursorCoords={cursorCoords}
        lockedCoords={lockedCoords}
        zoom={zoom}
        currentFloor={currentFloor}
        onSetLockedCoords={setLockedCoords}
        onGoToCoords={(coords) => panToCoords(coords, zoom)}
      />

      {/* POI Directory & Category Filter Drawer */}
      <MapPoiDirectoryDrawer
        isOpen={isPoiDrawerOpen}
        onClose={() => setIsPoiDrawerOpen(false)}
        locations={locations}
        selectedLocation={selectedLocation}
        onSelectLocation={(loc) => {
          onSelectLocation(loc);
          panToCoords(loc.coords, 3.0);
        }}
        activeCategoryFilter={activeCategoryFilter}
        onCategoryFilterChange={(cat) => setActiveCategoryFilter(cat)}
        activeRegionFilter={activeRegionFilter}
        onRegionFilterChange={(reg) => setActiveRegionFilter(reg)}
        hiddenCategories={hiddenCategories}
        onToggleCategoryVisibility={(cat) => {
          setHiddenCategories((prev) => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat);
            else next.add(cat);
            return next;
          });
        }}
        onShowAllCategories={() => setHiddenCategories(new Set())}
        onHideAllCategories={() => {
          const allCats = new Set(POI_CATEGORIES.map((c) => c.id));
          setHiddenCategories(allCats);
        }}
        onOpenPoiEditor={() => onOpenPoiEditor(null, getViewportCenterCoords())}
      />

      {/* Radius & Danger Zone Creation Modal */}
      <MapRadiusToolModal
        isOpen={isRadiusModalOpen}
        onClose={() => {
          setIsRadiusModalOpen(false);
          setSelectedRadiusZone(null);
        }}
        zones={activeRadiusZones}
        onAddZone={handleAddRadiusZone}
        onUpdateZone={handleUpdateRadiusZone}
        onDeleteZone={handleDeleteRadiusZone}
        defaultCoords={cursorCoords || { x: 50, y: 50 }}
      />

      {/* Dynamic Weather Particle Canvas (Rain, Snow, Heat, Dust, Aurora, etc.) */}
      <WeatherParticleCanvas
        weather={campaign?.weather}
        calendar={campaign?.calendar}
        activeRegion={activeWeatherRegion}
        intensity={layersState.weatherParticleIntensity}
        enabled={layersState.showWeatherClouds && layersState.showWeatherParticles}
      />

      {/* Mode GM & Weather Active Indicators in Bottom Left */}
      <div className="absolute bottom-4 left-4 z-30 pointer-events-auto flex flex-col gap-2">
        {/* Weather Cloud & Particle Indicator Pill */}
        {layersState.showWeatherClouds && (
          <div
            id="weather-map-hud-pill"
            className="bg-[#16161a]/95 text-[#d1d1d6] border border-amber-500/40 px-3.5 py-2 rounded-xl shadow-2xl text-xs flex items-center gap-3 backdrop-blur-md animate-fade-in"
          >
            <CloudSun className="w-5 h-5 text-amber-400 animate-pulse flex-shrink-0" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-amber-300 text-[11px]">
                  {activeWeatherRegion.toUpperCase()} :{" "}
                  {GLORANTHA_WEATHER_CATALOG[
                    campaign?.weather?.regionWeathers?.[activeWeatherRegion]?.weatherType || "clear_sky"
                  ]?.nameFr || "Météo locale"}
                </span>
                {layersState.showWeatherParticles && (
                  <span className="inline-flex items-center px-1.5 py-0.2 bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 rounded text-[9px] font-semibold">
                    Particules ON
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#8e8e93]">
                {GLORANTHA_SEASONS[campaign?.calendar.seasonIndex ?? 0]?.nameFr || "Saison"} •{" "}
                {GLORANTHA_WEATHER_CATALOG[
                  campaign?.weather?.regionWeathers?.[activeWeatherRegion]?.weatherType || "clear_sky"
                ]?.effect.travelSpeedLabelFr || "Voyage normal"}
              </span>
            </div>

            <div className="flex items-center gap-1 ml-1 border-l border-[#2d2d35] pl-2">
              <button
                onClick={() => setLayersState((prev) => ({ ...prev, showWeatherParticles: !prev.showWeatherParticles }))}
                className={`text-[10px] px-2 py-0.5 rounded border transition font-semibold ${
                  layersState.showWeatherParticles
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30"
                    : "bg-[#25252b] text-[#8e8e93] border-[#3a3a45] hover:text-white"
                }`}
                title="Activer/Désactiver les effets de particules (pluie, neige, braises...)"
              >
                {layersState.showWeatherParticles ? "Particules" : "Sans particules"}
              </button>
              <button
                onClick={() => setLayersState((prev) => ({ ...prev, showWeatherClouds: false }))}
                className="text-[10px] text-rose-400 hover:text-rose-300 px-1.5 py-0.5 rounded bg-rose-950/50 border border-rose-800/40 hover:bg-rose-900/60 transition"
                title="Masquer complètement l'affichage météo"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Mode GM Active Indicator */}
        {isGmMode && (
          <div
            id="gm-mode-banner"
            className="bg-[#16161a]/95 text-red-400 border border-red-500/50 px-3.5 py-1.5 rounded-full shadow-2xl text-xs flex items-center gap-2 backdrop-blur-md"
          >
            <Eye className="w-4 h-4 text-red-400" />
            <span className="font-bold tracking-wider uppercase text-[11px]">Mode MJ Actif</span>
            <span className="text-[10px] text-[#8e8e93]">(Secrets révélés)</span>
          </div>
        )}
      </div>

      {/* Map Layers & Display Customization Modal Menu */}
      <MapLayersMenu
        isOpen={isLayersMenuOpen}
        onClose={() => setIsLayersMenuOpen(false)}
        layersState={layersState}
        onChangeLayersState={setLayersState}
        locations={locations}
        customPinsCount={customPins.length}
        favoritesCount={favorites?.length || 0}
        isGmMode={isGmMode}
        currentFloor={currentFloor}
        onChangeFloor={setCurrentFloor}
      />

      {/* GM Weather Control Floating Modal Widget */}
      {showGmWeatherWidget && (
        <div
          id="gm-weather-widget-overlay"
          className="absolute top-16 right-4 z-50 w-full max-w-md shadow-2xl animate-fade-in"
        >
          <div className="relative">
            <button
              onClick={() => setShowGmWeatherWidget(false)}
              className="absolute top-3 right-3 z-10 p-1 text-[#8e8e93] hover:text-white rounded-md bg-[#25252b] hover:bg-[#32323a] border border-[#3a3a45] transition text-xs"
              title="Fermer le contrôle météo"
            >
              ✕
            </button>
            <GmWeatherWidget
              weather={campaign?.weather}
              calendar={campaign?.calendar}
              activeRegion={activeWeatherRegion}
              onSelectRegion={(reg) => setActiveWeatherRegion(reg)}
              onUpdateCampaign={onUpdateCampaign}
              layersState={layersState}
              onChangeLayersState={setLayersState}
            />
          </div>
        </div>
      )}

      {/* Itinerary & Route Planner Drawer */}
      <RoutePlannerDrawer
        isOpen={isRouting}
        onClose={() => setIsRouting(false)}
        locations={locations}
        startPoint={routeStartPoint}
        targetPoint={routeTargetPoint}
        onSelectStart={(pt) => setRouteStartPoint(pt)}
        onSelectTarget={(pt) => setRouteTargetPoint(pt)}
        travelMode={travelMode}
        onChangeTravelMode={(m) => setTravelMode(m)}
        avoidChaos={avoidChaos}
        onToggleAvoidChaos={(v) => setAvoidChaos(v)}
        showObstaclesOnMap={layersState.showObstacles}
        onToggleShowObstacles={(v) => setLayersState((prev) => ({ ...prev, showObstacles: v }))}
        showRoadsOnMap={layersState.showRoads}
        onToggleShowRoads={(v) => setLayersState((prev) => ({ ...prev, showRoads: v }))}
        routeResult={routeResult}
        campaign={campaign}
        onUpdateCampaign={onUpdateCampaign}
      />

      {/* Distance Measurement Floating HUD & Context Menu */}
      {isMeasuring && (
        <MapMeasureHUD
          points={measurePoints}
          selectedTerrain={measureTerrain}
          onChangeTerrain={(t) => setMeasureTerrain(t)}
          onClearPoints={() => {
            setMeasurePoints([]);
            setCursorHoverMeasurePoint(null);
          }}
          onSwapPoints={() => {
            if (measurePoints.length >= 2) {
              setMeasurePoints([measurePoints[1], measurePoints[0]]);
            }
          }}
          onClose={() => {
            setIsMeasuring(false);
            setMeasurePoints([]);
            setCursorHoverMeasurePoint(null);
            setMeasureContextMenuPos(null);
          }}
          onConvertToRoute={(pA, pB) => {
            setRouteStartPoint({ x: pA.x, y: pA.y, name: pA.name || "Point A", id: pA.poiId });
            setRouteTargetPoint({ x: pB.x, y: pB.y, name: pB.name || "Point B", id: pB.poiId });
            setIsMeasuring(false);
            setIsRouting(true);
          }}
          contextMenuPos={measureContextMenuPos}
          onCloseContextMenu={() => setMeasureContextMenuPos(null)}
          onOpenContextMenuAt={(clientX, clientY) =>
            setMeasureContextMenuPos({ x: clientX, y: clientY })
          }
        />
      )}

      {/* Tactical Route Drawing Floating HUD (Create animated routes connecting POIs) */}
      {activeDrawingTool === "tactical_route" && (
        <TacticalRouteHUD
          waypoints={tacticalWaypoints}
          onAddWaypoint={(wp) => setTacticalWaypoints((prev) => [...prev, wp])}
          onRemoveWaypoint={(idx) => setTacticalWaypoints((prev) => prev.filter((_, i) => i !== idx))}
          onUndoLastWaypoint={() => setTacticalWaypoints((prev) => prev.slice(0, -1))}
          onClearWaypoints={() => setTacticalWaypoints([])}
          onReverseRoute={() => setTacticalWaypoints((prev) => [...prev].reverse())}
          onSaveRoute={handleSaveTacticalRoute}
          onCancel={() => {
            setActiveDrawingTool(null);
            setTacticalWaypoints([]);
          }}
          locations={locations}
        />
      )}

      {/* Tactical Route Detail & Edit Modal */}
      {selectedDrawingForModal && selectedDrawingForModal.type === "tactical_route" && (
        <TacticalRouteDetailModal
          route={selectedDrawingForModal}
          onClose={() => setSelectedDrawingForModal(null)}
          onUpdateRoute={(updated) => {
            handleUpdateDrawing(selectedDrawingForModal.id, updated);
            setSelectedDrawingForModal((prev) => (prev ? { ...prev, ...updated } : null));
          }}
          onDeleteRoute={(id) => {
            handleDeleteDrawing(id);
            setSelectedDrawingForModal(null);
          }}
          onPanToWaypoint={(coords) => {
            panToCoords(coords, 3.2);
          }}
        />
      )}

      {/* Right-Click Map Context Menu */}
      {mapContextMenu && (
        <div
          id="map-context-menu"
          className="fixed z-50 bg-[#16161a]/95 backdrop-blur-md border border-[#3a3a45] rounded-xl shadow-2xl p-1.5 w-64 text-xs text-[#d1d1d6] animate-fade-in"
          style={{
            left: Math.min(mapContextMenu.clientX, window.innerWidth - 270),
            top: Math.min(mapContextMenu.clientY, window.innerHeight - 260),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2.5 py-1.5 border-b border-[#2d2d35] flex items-center justify-between text-[11px] text-[#8e8e93]">
            <span className="font-mono text-[#e2ba7d]">
              X: {mapContextMenu.coords.x}% • Y: {mapContextMenu.coords.y}%
            </span>
            <button
              onClick={() => setMapContextMenu(null)}
              className="text-[#8e8e93] hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="py-1 space-y-0.5">
            <button
              onClick={() => {
                const c = mapContextMenu.coords;
                setMapContextMenu(null);
                onOpenPoiEditor(null, c);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#e2ba7d]/20 text-left font-semibold text-[#e2ba7d] transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Créer un lieu ici</span>
            </button>
            <button
              onClick={() => {
                const c = mapContextMenu.coords;
                setMapContextMenu(null);
                setNewPinCoords(c);
                setIsPlacingPin(true);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-left text-[#d1d1d6] transition"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Poser un repère rapide</span>
            </button>
            <button
              onClick={() => {
                const c = mapContextMenu.coords;
                setMapContextMenu(null);
                setRouteStartPoint({ x: c.x, y: c.y, name: `Départ (${c.x}%, ${c.y}%)` });
                setIsRouting(true);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-left text-[#d1d1d6] transition"
            >
              <Navigation className="w-3.5 h-3.5 text-sky-400" />
              <span>Partir d'ici en voyage</span>
            </button>
            <button
              onClick={() => {
                const c = mapContextMenu.coords;
                setMapContextMenu(null);
                setRouteTargetPoint({ x: c.x, y: c.y, name: `Destination (${c.x}%, ${c.y}%)` });
                setIsRouting(true);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-left text-[#d1d1d6] transition"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Aller ici en voyage</span>
            </button>
            <button
              onClick={() => {
                const c = mapContextMenu.coords;
                setMapContextMenu(null);
                setMeasurePoints([{ x: c.x, y: c.y, name: `Point (${c.x}%, ${c.y}%)` }]);
                setIsMeasuring(true);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-left text-[#d1d1d6] transition"
            >
              <Ruler className="w-3.5 h-3.5 text-yellow-400" />
              <span>Mesurer depuis ce point</span>
            </button>
            <button
              onClick={() => {
                const text = `X: ${mapContextMenu.coords.x}%, Y: ${mapContextMenu.coords.y}%`;
                navigator.clipboard?.writeText(text);
                setCopiedCoordsToast(true);
                setTimeout(() => setCopiedCoordsToast(false), 2000);
                setMapContextMenu(null);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-left text-[#8e8e93] hover:text-[#d1d1d6] transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copier coordonnées</span>
            </button>
          </div>
        </div>
      )}

      {/* Copied Coords Toast */}
      {copiedCoordsToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#16161a]/95 border border-[#e2ba7d] text-[#e2ba7d] px-4 py-2 rounded-full text-xs font-semibold shadow-2xl animate-fade-in flex items-center gap-2 pointer-events-none">
          <Copy className="w-3.5 h-3.5" />
          <span>Coordonnées copiées dans le presse-papiers !</span>
        </div>
      )}
    </div>
  );
};
