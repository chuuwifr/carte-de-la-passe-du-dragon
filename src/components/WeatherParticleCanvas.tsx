import React, { useEffect, useRef } from "react";
import { WeatherType, RegionKey, GloranthaCalendar, WeatherSystemState } from "../types";

interface WeatherParticleCanvasProps {
  weather?: WeatherSystemState;
  calendar?: GloranthaCalendar;
  activeRegion?: RegionKey;
  intensity?: number; // 0.2 to 1.0
  enabled?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  color: string;
  sway?: number;
  swaySpeed?: number;
  length?: number;
  shape?: "line" | "circle" | "spark" | "flake" | "ash";
}

export const WeatherParticleCanvas: React.FC<WeatherParticleCanvasProps> = ({
  weather,
  calendar = { year: 1625, seasonIndex: 0, weekNumber: 1, dayIndex: 0 },
  activeRegion,
  intensity = 0.85,
  enabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const flashAlphaRef = useRef<number>(0);
  const lastFlashTimeRef = useRef<number>(0);

  // Determine active weather type based on active region or default season
  const currentRegion = activeRegion || weather?.selectedRegion || "sartar";
  const regionWeather = weather?.regionWeathers?.[currentRegion];

  let weatherType: WeatherType = "clear_sky";
  if (regionWeather?.weatherType) {
    weatherType = regionWeather.weatherType;
  } else {
    // Fallback based on season
    const defaultWeatherTypes: Record<number, WeatherType> = {
      0: "drizzle", // Mer
      1: "clear_sky", // Feu
      2: "gentle_breeze", // Terre
      3: "freezing_chill", // Obscurité
      4: "thunderstorm", // Tempêtes
      5: "mystic_aurora", // Temps Sacré
    };
    weatherType = defaultWeatherTypes[calendar.seasonIndex] || "clear_sky";
  }

  useEffect(() => {
    if (!enabled) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = (canvas.width = 1600);
    const height = (canvas.height = 1100);

    const handleResize = () => {
      canvas.width = 1600;
      canvas.height = 1100;
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Determine particle count and setup according to weather type
    let targetParticleCount = 0;
    switch (weatherType) {
      case "torrential_rain":
        targetParticleCount = Math.round(180 * intensity);
        break;
      case "thunderstorm":
        targetParticleCount = Math.round(160 * intensity);
        break;
      case "drizzle":
        targetParticleCount = Math.round(80 * intensity);
        break;
      case "blizzard":
        targetParticleCount = Math.round(160 * intensity);
        break;
      case "freezing_chill":
        targetParticleCount = Math.round(75 * intensity);
        break;
      case "dust_storm":
        targetParticleCount = Math.round(120 * intensity);
        break;
      case "heatwave":
        targetParticleCount = Math.round(60 * intensity);
        break;
      case "ash_and_smoke":
        targetParticleCount = Math.round(90 * intensity);
        break;
      case "mystic_aurora":
        targetParticleCount = Math.round(55 * intensity);
        break;
      case "gentle_breeze":
        targetParticleCount = Math.round(35 * intensity);
        break;
      case "thick_fog":
        targetParticleCount = Math.round(40 * intensity);
        break;
      case "heavy_clouds":
        targetParticleCount = Math.round(30 * intensity);
        break;
      default: // clear_sky
        targetParticleCount = Math.round(20 * intensity);
        break;
    }

    // Factory function to spawn / reset a particle
    const createParticle = (spawnRandomY = false): Particle => {
      const startY = spawnRandomY ? Math.random() * height : -20;

      switch (weatherType) {
        // --- RAIN & STORMS ---
        case "drizzle": {
          return {
            x: Math.random() * (width + 100) - 50,
            y: startY,
            vx: 0.8 + Math.random() * 0.8,
            vy: 7 + Math.random() * 4,
            size: 1,
            length: 8 + Math.random() * 6,
            alpha: 0.2 + Math.random() * 0.4,
            maxAlpha: 0.5,
            life: 0,
            maxLife: 200,
            color: "rgba(147, 197, 253, ",
            shape: "line",
          };
        }
        case "torrential_rain":
        case "thunderstorm": {
          return {
            x: Math.random() * (width + 200) - 100,
            y: startY,
            vx: 3 + Math.random() * 3,
            vy: 14 + Math.random() * 8,
            size: 1.5,
            length: 16 + Math.random() * 14,
            alpha: 0.35 + Math.random() * 0.45,
            maxAlpha: 0.8,
            life: 0,
            maxLife: 150,
            color: "rgba(186, 230, 253, ",
            shape: "line",
          };
        }

        // --- SNOW & BLIZZARD ---
        case "freezing_chill": {
          return {
            x: Math.random() * width,
            y: startY,
            vx: (Math.random() - 0.5) * 0.8,
            vy: 0.8 + Math.random() * 1.4,
            size: 1.5 + Math.random() * 2.5,
            alpha: 0.3 + Math.random() * 0.5,
            maxAlpha: 0.7,
            life: 0,
            maxLife: 300,
            sway: Math.random() * Math.PI * 2,
            swaySpeed: 0.02 + Math.random() * 0.03,
            color: "rgba(240, 249, 255, ",
            shape: "flake",
          };
        }
        case "blizzard": {
          return {
            x: Math.random() * (width + 300) - 100,
            y: startY,
            vx: 4 + Math.random() * 5,
            vy: 2 + Math.random() * 3.5,
            size: 1.8 + Math.random() * 3,
            alpha: 0.4 + Math.random() * 0.5,
            maxAlpha: 0.85,
            life: 0,
            maxLife: 200,
            sway: Math.random() * Math.PI * 2,
            swaySpeed: 0.05 + Math.random() * 0.05,
            color: "rgba(224, 242, 254, ",
            shape: "flake",
          };
        }

        // --- HEATWAVE & EMBERS ---
        case "heatwave": {
          return {
            x: Math.random() * width,
            y: spawnRandomY ? Math.random() * height : height + 10,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -(0.6 + Math.random() * 1.2),
            size: 1.5 + Math.random() * 3,
            alpha: 0.15 + Math.random() * 0.3,
            maxAlpha: 0.45,
            life: 0,
            maxLife: 250,
            sway: Math.random() * Math.PI * 2,
            swaySpeed: 0.03 + Math.random() * 0.02,
            color: "rgba(251, 191, 36, ",
            shape: "circle",
          };
        }
        case "ash_and_smoke": {
          const isEmber = Math.random() > 0.4;
          return {
            x: Math.random() * width,
            y: spawnRandomY ? Math.random() * height : height + 10,
            vx: (Math.random() - 0.4) * 1.5,
            vy: -(0.8 + Math.random() * 1.8),
            size: isEmber ? 1.5 + Math.random() * 2 : 2.5 + Math.random() * 4,
            alpha: 0.3 + Math.random() * 0.5,
            maxAlpha: isEmber ? 0.85 : 0.4,
            life: 0,
            maxLife: 280,
            sway: Math.random() * Math.PI * 2,
            swaySpeed: 0.02 + Math.random() * 0.03,
            color: isEmber ? "rgba(249, 115, 22, " : "rgba(100, 116, 139, ",
            shape: isEmber ? "spark" : "ash",
          };
        }

        // --- DUST STORM ---
        case "dust_storm": {
          return {
            x: spawnRandomY ? Math.random() * width : -20,
            y: Math.random() * height,
            vx: 5 + Math.random() * 6,
            vy: (Math.random() - 0.4) * 1.5,
            size: 1 + Math.random() * 2.5,
            alpha: 0.25 + Math.random() * 0.45,
            maxAlpha: 0.65,
            life: 0,
            maxLife: 180,
            color: Math.random() > 0.5 ? "rgba(217, 119, 6, " : "rgba(180, 83, 9, ",
            shape: "circle",
          };
        }

        // --- MYSTIC AURORA ---
        case "mystic_aurora": {
          const colors = [
            "rgba(192, 132, 252, ",
            "rgba(34, 211, 238, ",
            "rgba(251, 191, 36, ",
            "rgba(52, 211, 153, ",
          ];
          const color = colors[Math.floor(Math.random() * colors.length)];
          return {
            x: Math.random() * width,
            y: spawnRandomY ? Math.random() * height : height + 10,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -(0.5 + Math.random() * 1.0),
            size: 2 + Math.random() * 3,
            alpha: 0.2 + Math.random() * 0.5,
            maxAlpha: 0.75,
            life: 0,
            maxLife: 320,
            sway: Math.random() * Math.PI * 2,
            swaySpeed: 0.02 + Math.random() * 0.02,
            color,
            shape: "spark",
          };
        }

        // --- GENTLE BREEZE / CLEAR SKY / FOG ---
        default: {
          return {
            x: Math.random() * width,
            y: spawnRandomY ? Math.random() * height : Math.random() * height,
            vx: 0.8 + Math.random() * 0.8,
            vy: (Math.random() - 0.5) * 0.4,
            size: 1 + Math.random() * 2,
            alpha: 0.15 + Math.random() * 0.25,
            maxAlpha: 0.35,
            life: 0,
            maxLife: 400,
            sway: Math.random() * Math.PI * 2,
            swaySpeed: 0.015,
            color: "rgba(226, 232, 240, ",
            shape: "circle",
          };
        }
      }
    };

    // Initialize particles array
    particlesRef.current = [];
    for (let i = 0; i < targetParticleCount; i++) {
      particlesRef.current.push(createParticle(true));
    }

    // Animation Loop
    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Handle thunderstorm lightning flash
      if (weatherType === "thunderstorm") {
        if (time - lastFlashTimeRef.current > 4500 + Math.random() * 5000) {
          flashAlphaRef.current = 0.45;
          lastFlashTimeRef.current = time;
        }

        if (flashAlphaRef.current > 0.01) {
          ctx.fillStyle = `rgba(254, 240, 138, ${flashAlphaRef.current})`;
          ctx.fillRect(0, 0, width, height);
          flashAlphaRef.current *= 0.88; // fade out fast
        }
      }

      // Update & Draw Particles
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        // Sway adjustment
        if (p.sway !== undefined && p.swaySpeed !== undefined) {
          p.sway += p.swaySpeed;
          p.x += Math.sin(p.sway) * 0.6;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Fade in and out
        const halfLife = p.maxLife / 2;
        let currentAlpha = p.maxAlpha;
        if (p.life < 30) {
          currentAlpha = (p.life / 30) * p.maxAlpha;
        } else if (p.life > p.maxLife - 30) {
          currentAlpha = ((p.maxLife - p.life) / 30) * p.maxAlpha;
        }
        currentAlpha = Math.max(0, currentAlpha * intensity);

        // Draw particle based on shape
        if (p.shape === "line") {
          ctx.strokeStyle = `${p.color}${currentAlpha})`;
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 1.5, p.y - (p.length || 10));
          ctx.stroke();
        } else if (p.shape === "flake") {
          ctx.fillStyle = `${p.color}${currentAlpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Soft glow for larger flakes
          if (p.size > 2.2) {
            ctx.fillStyle = `${p.color}${currentAlpha * 0.3})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (p.shape === "spark") {
          ctx.fillStyle = `${p.color}${currentAlpha})`;
          ctx.shadowColor = p.color.includes("249") ? "#f97316" : "#a855f7";
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        } else {
          // Circle / ash / dust mote
          ctx.fillStyle = `${p.color}${currentAlpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Check if out of bounds or expired life
        const isOutOfBounds =
          p.y > height + 40 ||
          p.y < -40 ||
          p.x > width + 100 ||
          p.x < -100 ||
          p.life >= p.maxLife;

        if (isOutOfBounds) {
          particles[i] = createParticle(false);
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [weatherType, intensity, enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      id="weather-particle-canvas"
      width={1600}
      height={1100}
      className="absolute inset-0 pointer-events-none z-20 w-[1600px] h-[1100px]"
    />
  );
};
