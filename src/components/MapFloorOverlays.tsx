import React from "react";
import { MapFloorLevel } from "../types";

interface MapFloorOverlaysProps {
  currentFloor: MapFloorLevel;
}

export const MapFloorOverlays: React.FC<MapFloorOverlaysProps> = ({ currentFloor }) => {
  if (currentFloor === 0) return null;

  return (
    <svg
      className="absolute inset-0 w-[1600px] h-[1100px] pointer-events-none z-10 select-none"
      viewBox="0 0 1600 1100"
    >
      <defs>
        {/* Glowing Filters */}
        <filter id="leyline-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="dungeon-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <pattern id="dungeon-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6b21a8" strokeWidth="0.8" opacity="0.3" />
        </pattern>
      </defs>

      {/* ============================================================ */}
      {/* FLOOR 1: VOIES SACRÉES & LIGNES DE RUNES DRACONIQUES        */}
      {/* ============================================================ */}
      {currentFloor === 1 && (
        <g id="floor-leylines" className="animate-fade-in">
          {/* Background tint for spiritual plane */}
          <rect x="0" y="0" width="1600" height="1100" fill="#0369a1" fillOpacity="0.04" />

          {/* Dragon Leyline 1: Kero Fin -> Boldhome -> Dragon's Eye -> Prax */}
          <path
            d="M 704 385 Q 776 522 840 590 T 1184 682"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="5"
            strokeDasharray="12,8"
            filter="url(#leyline-glow)"
            className="animate-pulse"
          />
          <path
            d="M 704 385 Q 776 522 840 590 T 1184 682"
            fill="none"
            stroke="#e0f2fe"
            strokeWidth="2"
          />

          {/* Dragon Leyline 2: Snakepipe -> Jonstown -> Clearwine -> Nochet */}
          <path
            d="M 608 242 Q 680 456 608 533 T 424 748"
            fill="none"
            stroke="#818cf8"
            strokeWidth="4"
            strokeDasharray="10,6"
            filter="url(#leyline-glow)"
          />

          {/* Dragon Spine Great Leyline */}
          <path
            d="M 400 150 Q 800 500 1250 850"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeDasharray="16,6"
            filter="url(#leyline-glow)"
            opacity="0.8"
          />

          {/* Spiritual Nodes */}
          {[
            { x: 704, y: 385, name: "Nœud de Kero Fin (Mère des Vents)", rune: "⚡" },
            { x: 776, y: 522, name: "Nœud de Boldhome (Flamme Sacrée)", rune: "🔥" },
            { x: 1184, y: 682, name: "Nœud de Pavis (Cité Fondatrice)", rune: "🏛️" },
            { x: 608, y: 242, name: "Nœud du Chaos de Snakepipe", rune: "🐍" },
            { x: 424, y: 748, name: "Nœud d'Esrolia (Reines de la Terre)", rune: "🌾" },
          ].map((node, idx) => (
            <g key={idx} transform={`translate(${node.x}, ${node.y})`}>
              <circle r="22" fill="#0284c7" fillOpacity="0.2" stroke="#38bdf8" strokeWidth="2" />
              <circle r="36" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4,4" className="animate-spin" />
              <text textAnchor="middle" dy="5" fontSize="14">
                {node.rune}
              </text>
              <rect x="-90" y="28" width="180" height="20" rx="4" fill="#0c4a6e" fillOpacity="0.9" stroke="#38bdf8" strokeWidth="1" />
              <text x="0" y="42" textAnchor="middle" fill="#e0f2fe" fontSize="10" fontWeight="bold">
                {node.name}
              </text>
            </g>
          ))}
        </g>
      )}

      {/* ============================================================ */}
      {/* FLOOR 2: SOUTERRAINS, GROTTES ET DONJONS GLORANTHIS          */}
      {/* ============================================================ */}
      {currentFloor === 2 && (
        <g id="floor-underground-dungeons" className="animate-fade-in">
          {/* Dark cavernous atmospheric tint */}
          <rect x="0" y="0" width="1600" height="1100" fill="#180c24" fillOpacity="0.3" />

          {/* Snakepipe Hollow Dungeon Depth Network */}
          <g transform="translate(608, 242)">
            <ellipse rx="90" ry="65" fill="#4a044e" fillOpacity="0.4" stroke="#a21caf" strokeWidth="2" strokeDasharray="6,4" />
            <path
              d="M -40 -20 Q 0 40 50 10 Q 70 60 20 80 Q -60 50 -40 -20 Z"
              fill="#581c87"
              fillOpacity="0.5"
              stroke="#c084fc"
              strokeWidth="2"
              filter="url(#dungeon-glow)"
            />
            <text x="0" y="-75" textAnchor="middle" fill="#f472b6" fontSize="12" fontWeight="bold">
              💀 Les Tréfonds de Snakepipe Hollow (Donjon Niveau 1-5)
            </text>
          </g>

          {/* Lead Castle Troll Under-Halls (Dagori Inkarth) */}
          <g transform="translate(856, 341)">
            <ellipse rx="80" ry="60" fill="#1e1b4b" fillOpacity="0.6" stroke="#4338ca" strokeWidth="2" />
            <path
              d="M -30 -30 L 30 -30 L 40 30 L -40 30 Z"
              fill="#312e81"
              fillOpacity="0.7"
              stroke="#818cf8"
              strokeWidth="2"
            />
            <text x="0" y="-70" textAnchor="middle" fill="#a5b4fc" fontSize="12" fontWeight="bold">
              🪨 Labyrinthes d'Obsidienne des Trolls Noirs
            </text>
          </g>

          {/* Boldhome Royal Vaults & Dwarf Passages */}
          <g transform="translate(776, 522)">
            <ellipse rx="65" ry="45" fill="#78350f" fillOpacity="0.4" stroke="#d97706" strokeWidth="2" />
            <path
              d="M -20 -15 L 20 -15 L 15 20 L -15 20 Z"
              fill="#92400e"
              fillOpacity="0.6"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />
            <text x="0" y="60" textAnchor="middle" fill="#fde68a" fontSize="11" fontWeight="bold">
              🏰 Catacombes Royales & Voies Naines de Boldhome
            </text>
          </g>

          {/* Great Ruin of Pavis Ancient Vaults */}
          <g transform="translate(1168, 665)">
            <rect x="-80" y="-60" width="160" height="120" rx="8" fill="#3f3f46" fillOpacity="0.5" stroke="#a1a1aa" strokeWidth="2" strokeDasharray="8,4" />
            <text x="0" y="-70" textAnchor="middle" fill="#e4e4e7" fontSize="12" fontWeight="bold">
              🏺 Crypte du Berceau & Ruines Antiques de Pavis
            </text>
          </g>
        </g>
      )}

      {/* ============================================================ */}
      {/* FLOOR 3: FRONTIÈRES POLITIQUES & FACTIONS 1625 ST            */}
      {/* ============================================================ */}
      {currentFloor === 3 && (
        <g id="floor-political-factions" className="animate-fade-in">
          {/* Sartar Free Kingdom Territory */}
          <polygon
            points="600,420 880,430 920,620 720,640 580,520"
            fill="#0284c7"
            fillOpacity="0.16"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeDasharray="8,4"
          />
          <text x="740" y="500" textAnchor="middle" fill="#38bdf8" fontSize="18" fontWeight="bold" opacity="0.9" letterSpacing="4">
            ROYAUME DE SARTAR (LIBÉRÉ 1625 ST)
          </text>

          {/* Tarsh Lunar Provincial Zone */}
          <polygon
            points="550,180 850,200 820,380 540,360"
            fill="#e11d48"
            fillOpacity="0.15"
            stroke="#f43f5e"
            strokeWidth="3"
            strokeDasharray="8,4"
          />
          <text x="680" y="290" textAnchor="middle" fill="#f43f5e" fontSize="18" fontWeight="bold" opacity="0.9" letterSpacing="4">
            PROVINCES LUNARS DE TARSH
          </text>

          {/* Esrolian Matriarchy */}
          <polygon
            points="320,600 560,610 520,850 280,820"
            fill="#16a34a"
            fillOpacity="0.15"
            stroke="#22c55e"
            strokeWidth="3"
            strokeDasharray="8,4"
          />
          <text x="420" y="720" textAnchor="middle" fill="#22c55e" fontSize="18" fontWeight="bold" opacity="0.9" letterSpacing="3">
            ESROLIA (TERRES DES REINES)
          </text>

          {/* Prax Plains Nomads */}
          <polygon
            points="980,480 1350,500 1320,850 960,820"
            fill="#ca8a04"
            fillOpacity="0.14"
            stroke="#eab308"
            strokeWidth="3"
            strokeDasharray="8,4"
          />
          <text x="1140" y="620" textAnchor="middle" fill="#eab308" fontSize="18" fontWeight="bold" opacity="0.9" letterSpacing="4">
            PLAINES DES NOMADES DE PRAX
          </text>
        </g>
      )}
    </svg>
  );
};
