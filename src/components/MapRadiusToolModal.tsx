import React, { useState } from "react";
import {
  Radio,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Skull,
  Flame,
  Shield,
  X,
  Volume2,
  Layers,
} from "lucide-react";
import { MapRadiusZone } from "../types";

interface MapRadiusToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  zones: MapRadiusZone[];
  onAddZone: (zone: Omit<MapRadiusZone, "id">) => void;
  onUpdateZone: (id: string, updates: Partial<MapRadiusZone>) => void;
  onDeleteZone: (id: string) => void;
  defaultCoords: { x: number; y: number };
}

export const MapRadiusToolModal: React.FC<MapRadiusToolModalProps> = ({
  isOpen,
  onClose,
  zones,
  onAddZone,
  onUpdateZone,
  onDeleteZone,
  defaultCoords,
}) => {
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");

  // Form State for new zone
  const [name, setName] = useState("");
  const [zoneType, setZoneType] = useState<MapRadiusZone["type"]>("magic_aura");
  const [radiusKm, setRadiusKm] = useState(20);
  const [color, setColor] = useState("#38bdf8");
  const [strokeColor, setStrokeColor] = useState("#0284c7");
  const [fillOpacity, setFillOpacity] = useState(0.18);
  const [pulseAnimation, setPulseAnimation] = useState(true);
  const [description, setDescription] = useState("");
  const [posX, setPosX] = useState(defaultCoords.x);
  const [posY, setPosY] = useState(defaultCoords.y);

  if (!isOpen) return null;

  const presets = [
    {
      label: "Aura de Culte / Sanctuaire Orlanth",
      type: "magic_aura" as const,
      radiusKm: 25,
      color: "#38bdf8",
      strokeColor: "#0284c7",
      name: "Aura Sacrée d'Orlanth",
      desc: "Zone d'influence et de soutien spirituel du culte des Tempêtes.",
    },
    {
      label: "Terreur du Chaos / Chauve-Souris Écarlate",
      type: "chaos_terror" as const,
      radiusKm: 30,
      color: "#dc2626",
      strokeColor: "#991b1b",
      name: "Aura de Folie du Chaos",
      desc: "Zone de dévoration et de démence mystique.",
    },
    {
      label: "Portée de Balise de Guet Sartarite",
      type: "watch_tower" as const,
      radiusKm: 18,
      color: "#eab308",
      strokeColor: "#ca8a04",
      name: "Ligne de Guet & Balises",
      desc: "Visibilité directe et relais de signaux d'alarme.",
    },
    {
      label: "Tambours de Guerre des Praxiens",
      type: "war_drum" as const,
      radiusKm: 15,
      color: "#f97316",
      strokeColor: "#c2410c",
      name: "Clameur des Tambours de Guerre",
      desc: "Propagation acoustique des hordes nomades de Prax.",
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setZoneType(p.type);
    setName(p.name);
    setRadiusKm(p.radiusKm);
    setColor(p.color);
    setStrokeColor(p.strokeColor);
    setDescription(p.desc);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddZone({
      name,
      type: zoneType,
      center: { x: posX, y: posY },
      radiusKm,
      radiusStades: Math.round(radiusKm * 5.4),
      color,
      strokeColor,
      fillOpacity,
      pulseAnimation,
      description,
      visible: true,
      label: `${name} (${radiusKm} km)`,
    });

    setName("");
    setActiveTab("list");
  };

  return (
    <div
      id="map-radius-tool-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in text-[#d1d1d6]"
      onClick={onClose}
    >
      <div
        className="bg-[#18181e] border border-[#3a3a45] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#2d2d35] bg-[#1a1a22] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Outil Rayons & Zones d'Effet
              </h3>
              <p className="text-[11px] text-[#8e8e93]">
                Inspiré des générateurs & rayons sonores (Auras magiques, Périls, Guet)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8e8e93] hover:text-white p-1 rounded-lg hover:bg-[#25252b]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 p-2 border-b border-[#2d2d35] bg-[#121216] gap-2">
          <button
            onClick={() => setActiveTab("list")}
            className={`py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "list"
                ? "bg-[#e2ba7d] text-black shadow-md"
                : "bg-[#1f1f27] text-[#8e8e93] hover:text-white"
            }`}
          >
            Zones Actives ({zones.length})
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              activeTab === "create"
                ? "bg-[#e2ba7d] text-black shadow-md"
                : "bg-[#1f1f27] text-[#8e8e93] hover:text-white"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Créer un Rayon</span>
          </button>
        </div>

        {/* Tab 1: Active List */}
        {activeTab === "list" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {zones.length === 0 ? (
              <div className="text-center py-10 text-[#8e8e93] text-xs">
                <Radio className="w-10 h-10 mx-auto mb-2 opacity-30 text-sky-400" />
                <p>Aucune zone ou rayon d'effet actif.</p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-[#e2ba7d] text-black font-bold text-xs"
                >
                  Ajouter une première zone
                </button>
              </div>
            ) : (
              zones.map((zone) => (
                <div
                  key={zone.id}
                  className="p-3 bg-[#1e1e26] border border-[#2d2d35] rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 border"
                      style={{ backgroundColor: `${zone.color}22`, borderColor: zone.strokeColor }}
                    >
                      {zone.type === "magic_aura" ? "⚡" : zone.type === "chaos_terror" ? "💀" : zone.type === "watch_tower" ? "👁️" : "🥁"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white truncate">{zone.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2a2a35] text-[#e2ba7d] font-mono">
                          {zone.radiusKm} km ({zone.radiusStades} st.)
                        </span>
                      </div>
                      <div className="text-[10px] text-[#8e8e93] truncate">
                        Centre: X {zone.center.x.toFixed(1)}%, Y {zone.center.y.toFixed(1)}% • {zone.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onUpdateZone(zone.id, { visible: !zone.visible })}
                      className={`p-1.5 rounded-lg border transition ${
                        zone.visible
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          : "bg-[#25252b] text-[#8e8e93] border-[#3a3a45]"
                      }`}
                      title={zone.visible ? "Masquer la zone" : "Afficher la zone"}
                    >
                      {zone.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => onDeleteZone(zone.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                      title="Supprimer cette zone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Create Zone Form */}
        {activeTab === "create" && (
          <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Presets */}
            <div>
              <label className="block text-[10px] font-bold text-[#8e8e93] uppercase mb-1.5">
                Modèles Préconfigurés Glorantha
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="p-2 rounded-lg bg-[#1f1f28] hover:bg-[#282834] border border-[#2d2d35] hover:border-[#e2ba7d]/50 text-left text-[11px] transition"
                  >
                    <div className="font-semibold text-white truncate">{p.label}</div>
                    <div className="text-[10px] text-[#8e8e93]">{p.radiusKm} km</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-[10px] font-bold text-[#8e8e93] uppercase mb-1">
                Nom du Rayon / Zone
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Aura du Temple d'Orlanth"
                required
                className="w-full px-3 py-2 bg-[#25252b] border border-[#3a3a45] rounded-lg text-white focus:border-[#e2ba7d] focus:outline-none"
              />
            </div>

            {/* Radius Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-[#8e8e93] uppercase">
                  Rayon d'Action :
                </label>
                <span className="font-bold text-[#e2ba7d] font-mono">
                  {radiusKm} km / {Math.round(radiusKm * 5.4)} stades
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                step="5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                className="w-full accent-[#e2ba7d] cursor-pointer"
              />
            </div>

            {/* Color & Pulse */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#8e8e93] uppercase mb-1">
                  Couleur
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      setColor(e.target.value);
                      setStrokeColor(e.target.value);
                    }}
                    className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-[#3a3a45]"
                  />
                  <span className="font-mono text-[11px] text-[#8e8e93]">{color}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8e8e93] uppercase mb-1">
                  Animation de pulsation
                </label>
                <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pulseAnimation}
                    onChange={(e) => setPulseAnimation(e.target.checked)}
                    className="rounded accent-[#e2ba7d] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[11px] text-[#d1d1d6]">Activer l'onde d'écho</span>
                </label>
              </div>
            </div>

            {/* Position Center */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-[#8e8e93] uppercase mb-1">
                  Centre X (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={posX}
                  onChange={(e) => setPosX(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-[#25252b] border border-[#3a3a45] rounded-lg text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#8e8e93] uppercase mb-1">
                  Centre Y (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={posY}
                  onChange={(e) => setPosY(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-[#25252b] border border-[#3a3a45] rounded-lg text-white font-mono text-xs"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-bold text-[#8e8e93] uppercase mb-1">
                Description / Notes MJ
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Conséquences pour les PJ dans cette zone..."
                rows={2}
                className="w-full px-3 py-1.5 bg-[#25252b] border border-[#3a3a45] rounded-lg text-white text-xs focus:border-[#e2ba7d] focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className="px-3 py-1.5 rounded-lg border border-[#3a3a45] text-[#8e8e93]"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#e2ba7d] text-black font-bold shadow-lg"
              >
                Placer le Rayon
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
