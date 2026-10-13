import React, { useState, useRef } from "react";
import {
  PenTool,
  Pencil,
  ArrowUpRight,
  Minus,
  Square,
  Circle,
  Type,
  Stamp,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  X,
  Sparkles,
  Route,
} from "lucide-react";
import { MapDrawingElement } from "../types";

export type DrawingToolMode =
  | "freehand"
  | "line"
  | "arrow"
  | "rect"
  | "circle"
  | "label"
  | "stamp"
  | "tactical_route"
  | null;

interface MapDrawingToolbarProps {
  activeTool: DrawingToolMode;
  onSelectTool: (tool: DrawingToolMode) => void;
  color: string;
  onChangeColor: (c: string) => void;
  strokeWidth: number;
  onChangeStrokeWidth: (w: number) => void;
  stampSymbol: string;
  onChangeStampSymbol: (s: string) => void;
  onUndo: () => void;
  onClearAll: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  drawingsCount: number;
}

export const MapDrawingToolbar: React.FC<MapDrawingToolbarProps> = ({
  activeTool,
  onSelectTool,
  color,
  onChangeColor,
  strokeWidth,
  onChangeStrokeWidth,
  stampSymbol,
  onChangeStampSymbol,
  onUndo,
  onClearAll,
  onExport,
  onImport,
  drawingsCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = [
    { label: "Bleu Tempête (Orlanth)", hex: "#38bdf8" },
    { label: "Or Sartar", hex: "#eab308" },
    { label: "Pourpre Lunar", hex: "#f43f5e" },
    { label: "Vert Ernalda", hex: "#22c55e" },
    { label: "Violet Chaos", hex: "#a855f7" },
    { label: "Noir Sombre Troll", hex: "#64748b" },
    { label: "Blanc Neige", hex: "#f8fafc" },
  ];

  const stamps = [
    { id: "air", icon: "⚡", label: "Orlanth / Vents" },
    { id: "earth", icon: "🌾", label: "Ernalda / Terre" },
    { id: "death", icon: "💀", label: "Humakt / Mort" },
    { id: "moon", icon: "🌙", label: "Lune Rouge" },
    { id: "fire", icon: "☀️", label: "Yelm / Vérité" },
    { id: "chaos", icon: "⚠️", label: "Péril du Chaos" },
    { id: "camp", icon: "⛺", label: "Campement" },
    { id: "sword", icon: "⚔️", label: "Bataille" },
    { id: "treasure", icon: "💎", label: "Trésor" },
    { id: "shield", icon: "🛡️", label: "Bastion" },
  ];

  if (!activeTool) return null;

  return (
    <div
      id="map-drawing-toolbar"
      className="absolute top-16 left-1/2 -translate-x-1/2 bg-[#141419]/98 backdrop-blur-xl border border-[#3a3a45] rounded-2xl shadow-2xl p-2.5 z-40 flex flex-wrap items-center gap-2 text-xs text-[#d1d1d6] animate-fade-in"
    >
      {/* Hidden File Input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onImport}
        accept=".json"
        className="hidden"
      />

      {/* Tool Selectors */}
      <div className="flex items-center gap-1 bg-[#1a1a22] p-1 rounded-xl border border-[#2d2d35]">
        <button
          onClick={() => onSelectTool("tactical_route")}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition ${
            activeTool === "tactical_route"
              ? "bg-amber-400 text-black font-bold shadow-[0_0_12px_rgba(251,191,36,0.6)]"
              : "hover:bg-[#25252f] text-amber-300 hover:text-white"
          }`}
          title="Route Tactique Animée : Relier des points d'intérêt avec des pointillés dynamiques"
        >
          <Route className="w-4 h-4" />
          <span className="font-bold text-[11px] hidden sm:inline">Route Tactique</span>
        </button>
        <button
          onClick={() => onSelectTool("freehand")}
          className={`p-2 rounded-lg transition ${
            activeTool === "freehand"
              ? "bg-[#e2ba7d] text-black font-bold shadow"
              : "hover:bg-[#25252f] text-[#8e8e93] hover:text-white"
          }`}
          title="Crayon à main levée"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectTool("arrow")}
          className={`p-2 rounded-lg transition ${
            activeTool === "arrow"
              ? "bg-[#e2ba7d] text-black font-bold shadow"
              : "hover:bg-[#25252f] text-[#8e8e93] hover:text-white"
          }`}
          title="Flèche de manœuvre / Mouvement tactique"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectTool("line")}
          className={`p-2 rounded-lg transition ${
            activeTool === "line"
              ? "bg-[#e2ba7d] text-black font-bold shadow"
              : "hover:bg-[#25252f] text-[#8e8e93] hover:text-white"
          }`}
          title="Ligne droite"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectTool("rect")}
          className={`p-2 rounded-lg transition ${
            activeTool === "rect"
              ? "bg-[#e2ba7d] text-black font-bold shadow"
              : "hover:bg-[#25252f] text-[#8e8e93] hover:text-white"
          }`}
          title="Zone rectangle / Territoire"
        >
          <Square className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectTool("circle")}
          className={`p-2 rounded-lg transition ${
            activeTool === "circle"
              ? "bg-[#e2ba7d] text-black font-bold shadow"
              : "hover:bg-[#25252f] text-[#8e8e93] hover:text-white"
          }`}
          title="Cercle de zone"
        >
          <Circle className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectTool("label")}
          className={`p-2 rounded-lg transition ${
            activeTool === "label"
              ? "bg-[#e2ba7d] text-black font-bold shadow"
              : "hover:bg-[#25252f] text-[#8e8e93] hover:text-white"
          }`}
          title="Étiquette de texte"
        >
          <Type className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectTool("stamp")}
          className={`p-2 rounded-lg transition ${
            activeTool === "stamp"
              ? "bg-[#e2ba7d] text-black font-bold shadow"
              : "hover:bg-[#25252f] text-[#8e8e93] hover:text-white"
          }`}
          title="Tampon de Rune ou Symbole"
        >
          <Stamp className="w-4 h-4" />
        </button>
      </div>

      {/* Stamp selector if stamp tool active */}
      {activeTool === "stamp" && (
        <div className="flex items-center gap-1 bg-[#1a1a22] p-1 rounded-xl border border-[#2d2d35]">
          {stamps.map((s) => (
            <button
              key={s.id}
              onClick={() => onChangeStampSymbol(s.id)}
              className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition ${
                stampSymbol === s.id
                  ? "bg-[#e2ba7d] text-black font-bold scale-110"
                  : "hover:bg-[#25252f] text-[#d1d1d6]"
              }`}
              title={s.label}
            >
              {s.icon}
            </button>
          ))}
        </div>
      )}

      {/* Color Palette */}
      <div className="flex items-center gap-1.5 bg-[#1a1a22] p-1 rounded-xl border border-[#2d2d35]">
        {colors.map((c) => (
          <button
            key={c.hex}
            onClick={() => onChangeColor(c.hex)}
            className={`w-6 h-6 rounded-full transition-transform ${
              color === c.hex ? "ring-2 ring-white scale-110" : "hover:scale-105"
            }`}
            style={{ backgroundColor: c.hex }}
            title={c.label}
          />
        ))}
      </div>

      {/* Stroke Width */}
      <div className="flex items-center gap-1 bg-[#1a1a22] p-1 rounded-xl border border-[#2d2d35]">
        {[2, 4, 6, 8].map((w) => (
          <button
            key={w}
            onClick={() => onChangeStrokeWidth(w)}
            className={`w-6 h-6 rounded-lg text-[10px] font-bold transition flex items-center justify-center ${
              strokeWidth === w
                ? "bg-[#e2ba7d] text-black"
                : "text-[#8e8e93] hover:text-white"
            }`}
          >
            {w}px
          </button>
        ))}
      </div>

      {/* Actions: Undo, Clear, Export, Import */}
      <div className="flex items-center gap-1 bg-[#1a1a22] p-1 rounded-xl border border-[#2d2d35]">
        <button
          onClick={onUndo}
          disabled={drawingsCount === 0}
          className="p-1.5 rounded-lg text-[#8e8e93] hover:text-white hover:bg-[#25252f] disabled:opacity-30"
          title="Annuler le dernier tracé (Undo)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onClearAll}
          disabled={drawingsCount === 0}
          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 disabled:opacity-30"
          title="Effacer tous les tracés"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onExport}
          disabled={drawingsCount === 0}
          className="p-1.5 rounded-lg text-sky-400 hover:bg-sky-500/20 disabled:opacity-30"
          title="Exporter les tracés en fichier JSON"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-500/20"
          title="Importer des tracés (JSON)"
        >
          <Upload className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Close Drawing Mode */}
      <button
        onClick={() => onSelectTool(null)}
        className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30"
        title="Quitter le mode dessin"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
