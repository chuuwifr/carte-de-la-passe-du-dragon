import React from "react";

interface MapHexGridOverlayProps {
  visible: boolean;
  opacity?: number;
}

export const MapHexGridOverlay: React.FC<MapHexGridOverlayProps> = ({
  visible,
  opacity = 0.35,
}) => {
  if (!visible) return null;

  // Hex size calculations
  // Width 1600, Height 1100
  const hexRadius = 50; // ~10km in scale
  const hexWidth = Math.sqrt(3) * hexRadius; // ~86.6px
  const hexHeight = 2 * hexRadius; // 100px
  const rowStep = 1.5 * hexRadius; // 75px

  // Generate columns A-S and rows 1-15
  const cols = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R"];

  const hexes: { cx: number; cy: number; label: string }[] = [];

  let rowIdx = 0;
  for (let y = hexRadius; y < 1100 + hexRadius; y += rowStep) {
    rowIdx++;
    const isOdd = rowIdx % 2 !== 0;
    const xOffset = isOdd ? hexWidth / 2 : hexWidth;

    let colIdx = 0;
    for (let x = xOffset; x < 1600 + hexWidth; x += hexWidth) {
      if (colIdx < cols.length) {
        hexes.push({
          cx: x,
          cy: y,
          label: `${cols[colIdx]}${rowIdx}`,
        });
      }
      colIdx++;
    }
  }

  // Hexagon point string generator
  const getHexPoints = (cx: number, cy: number, r: number) => {
    const points: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      const px = cx + r * Math.cos(angle);
      const py = cy + r * Math.sin(angle);
      points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }
    return points.join(" ");
  };

  return (
    <svg
      id="map-hex-grid-overlay"
      className="absolute inset-0 w-[1600px] h-[1100px] pointer-events-none z-12 select-none"
      viewBox="0 0 1600 1100"
      style={{ opacity }}
    >
      {hexes.map((hex) => (
        <g key={hex.label}>
          <polygon
            points={getHexPoints(hex.cx, hex.cy, hexRadius)}
            fill="none"
            stroke="#e2ba7d"
            strokeWidth="0.75"
            strokeDasharray="4,4"
          />
          <text
            x={hex.cx}
            y={hex.cy - hexRadius + 14}
            textAnchor="middle"
            fill="#e2ba7d"
            fontSize="9"
            fontFamily="monospace"
            opacity="0.6"
          >
            {hex.label}
          </text>
        </g>
      ))}
    </svg>
  );
};
