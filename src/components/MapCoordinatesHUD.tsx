import React, { useState, useEffect } from "react";
import {
  Crosshair,
  Share2,
  Copy,
  Check,
  Navigation,
  Lock,
  Unlock,
  MapPin,
  ExternalLink,
  Sliders,
  Compass,
} from "lucide-react";

interface MapCoordinatesHUDProps {
  cursorCoords: { x: number; y: number } | null;
  lockedCoords: { x: number; y: number } | null;
  zoom: number;
  currentFloor: number;
  onSetLockedCoords: (coords: { x: number; y: number } | null) => void;
  onGoToCoords: (coords: { x: number; y: number }, zoom?: number) => void;
}

export const MapCoordinatesHUD: React.FC<MapCoordinatesHUDProps> = ({
  cursorCoords,
  lockedCoords,
  zoom,
  currentFloor,
  onSetLockedCoords,
  onGoToCoords,
}) => {
  const [copied, setCopied] = useState(false);
  const [showGoToModal, setShowGoToModal] = useState(false);
  const [inputX, setInputX] = useState("48.5");
  const [inputY, setInputY] = useState("47.5");
  const [inputZoom, setInputZoom] = useState(zoom.toFixed(1));

  const activePoint = lockedCoords || cursorCoords || { x: 50.0, y: 50.0 };

  // Calculate Glorantha Stades and KM relative to map canvas
  // Full map: 1600 x 1100 px = 320 km x 220 km (1728 x 1188 stades)
  const kmX = Math.round((activePoint.x / 100) * 320);
  const kmY = Math.round((activePoint.y / 100) * 220);
  const stadesX = Math.round(kmX * 5.4);
  const stadesY = Math.round(kmY * 5.4);

  // Distance from Boldhome (48.5, 47.5)
  const boldhomeDistKm = Math.round(
    Math.hypot(
      ((activePoint.x - 48.5) / 100) * 320,
      ((activePoint.y - 47.5) / 100) * 220
    )
  );

  const generateShareUrl = () => {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.href);
    url.hash = `x=${activePoint.x.toFixed(2)}&y=${activePoint.y.toFixed(2)}&z=${zoom.toFixed(1)}&floor=${currentFloor}`;
    return url.toString();
  };

  const handleCopyLink = () => {
    const shareUrl = generateShareUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleLock = () => {
    if (lockedCoords) {
      onSetLockedCoords(null);
    } else if (cursorCoords) {
      onSetLockedCoords(cursorCoords);
    }
  };

  const handleExecuteGoTo = (e: React.FormEvent) => {
    e.preventDefault();
    const x = parseFloat(inputX);
    const y = parseFloat(inputY);
    const z = parseFloat(inputZoom) || zoom;
    if (!isNaN(x) && !isNaN(y)) {
      onGoToCoords(
        {
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y)),
        },
        z
      );
      setShowGoToModal(false);
    }
  };

  return (
    <>
      {/* Live Coordinate Badge (Project Zomboid Map Style) */}
      <div
        id="map-coordinates-hud"
        className="flex items-center gap-1.5 bg-[#141419]/90 hover:bg-[#1a1a22] backdrop-blur-md border border-[#2d2d35] rounded-xl px-2.5 py-1.5 text-xs text-[#d1d1d6] shadow-xl transition select-none"
      >
        <button
          onClick={handleToggleLock}
          className={`p-1 rounded-lg transition ${
            lockedCoords
              ? "bg-amber-500 text-black font-bold"
              : "text-[#8e8e93] hover:text-[#e2ba7d] hover:bg-[#25252f]"
          }`}
          title={lockedCoords ? "Déverrouiller les coordonnées" : "Verrouiller les coordonnées à cet endroit"}
        >
          {lockedCoords ? <Lock className="w-3.5 h-3.5" /> : <Crosshair className="w-3.5 h-3.5" />}
        </button>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-[#8e8e93]">X:</span>
          <span className="font-bold text-[#e2ba7d]">{activePoint.x.toFixed(1)}%</span>
          <span className="text-[#8e8e93]">Y:</span>
          <span className="font-bold text-[#e2ba7d]">{activePoint.y.toFixed(1)}%</span>
          <span className="hidden md:inline text-[#8e8e93] text-[10px]">
            ({kmX} km, {stadesX} st.)
          </span>
        </div>

        <div className="h-3.5 w-px bg-[#2d2d35] mx-1" />

        {/* Go to coordinates button */}
        <button
          onClick={() => {
            setInputX(activePoint.x.toFixed(1));
            setInputY(activePoint.y.toFixed(1));
            setInputZoom(zoom.toFixed(1));
            setShowGoToModal(true);
          }}
          className="p-1 text-[#8e8e93] hover:text-[#e2ba7d] hover:bg-[#25252f] rounded-lg transition"
          title="Aller aux coordonnées précises (Go To X, Y)"
        >
          <Navigation className="w-3.5 h-3.5" />
        </button>

        {/* Copy share link button */}
        <button
          onClick={handleCopyLink}
          className={`p-1 rounded-lg transition flex items-center gap-1 ${
            copied
              ? "bg-emerald-500/20 text-emerald-400 font-bold"
              : "text-[#8e8e93] hover:text-[#e2ba7d] hover:bg-[#25252f]"
          }`}
          title="Copier le lien direct vers ces coordonnées"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Go-To Coordinates Modal */}
      {showGoToModal && (
        <div
          id="goto-coordinates-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in"
          onClick={() => setShowGoToModal(false)}
        >
          <div
            className="bg-[#18181e] border border-[#3a3a45] p-5 rounded-2xl shadow-2xl w-full max-w-sm text-[#d1d1d6]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2d2d35]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#e2ba7d] uppercase tracking-wider">
                <Navigation className="w-4 h-4" />
                <span>Aller aux Coordonnées</span>
              </div>
              <button
                onClick={() => setShowGoToModal(false)}
                className="text-[#8e8e93] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteGoTo} className="mt-4 space-y-3 text-xs">
              <p className="text-[#8e8e93] text-[11px]">
                Entrez des coordonnées cartographiques (0% à 100%) ou un niveau de zoom pour repositionner instantanément la carte de la Passe du Dragon.
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-[#8e8e93] uppercase mb-1">
                    Coordonnée X (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={inputX}
                    onChange={(e) => setInputX(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 bg-[#25252b] border border-[#3a3a45] rounded-lg text-white font-mono focus:border-[#e2ba7d] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#8e8e93] uppercase mb-1">
                    Coordonnée Y (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={inputY}
                    onChange={(e) => setInputY(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 bg-[#25252b] border border-[#3a3a45] rounded-lg text-white font-mono focus:border-[#e2ba7d] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#8e8e93] uppercase mb-1">
                  Niveau de Zoom (1.0x à 6.0x)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="6"
                  value={inputZoom}
                  onChange={(e) => setInputZoom(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#25252b] border border-[#3a3a45] rounded-lg text-white font-mono focus:border-[#e2ba7d] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGoToModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#3a3a45] text-[#8e8e93] hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#e2ba7d] hover:bg-[#f0cb92] text-black font-bold shadow-lg"
                >
                  Centrer la Carte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
