"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface KanjiCanvasProps {
  width?: number;
  height?: number;
  className?: string;
  clearTrigger?: number; // Prop pour déclencher le nettoyage
  showControls?: boolean; // Afficher les boutons internes (Effacer)
}

export default function KanjiCanvas({
  width = 300,
  height = 300,
  className = "",
  clearTrigger = 0,
  showControls = true,
}: KanjiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [velocity, setVelocity] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Configuration du contexte de dessin pour style pinceau
    ctx.strokeStyle = "#1a1a1a";
    ctx.fillStyle = "#1a1a1a";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation = "source-over";

    // Fond blanc avec texture légère
    ctx.fillStyle = "#fefefe";
    ctx.fillRect(0, 0, width, height);

    // Ajouter une texture papier subtile
    ctx.fillStyle = "#f8f8f8";
    for (let i = 0; i < width; i += 3) {
      for (let j = 0; j < height; j += 3) {
        if (Math.random() > 0.97) {
          ctx.fillRect(i, j, 1, 1);
        }
      }
    }

    setContext(ctx);
  }, [width, height]);

  // Fonction pour dessiner avec effet pinceau calligraphique
  const drawBrushStroke = (x: number, y: number, pressure: number = 1) => {
    if (!context || !lastPoint) return;

    const distance = Math.sqrt(
      Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2)
    );

    // Ne dessiner que si on a bougé suffisamment
    if (distance < 1) return;

    // Calculer la vitesse de manière plus stable
    const currentVelocity = distance;
    const smoothVelocity = currentVelocity * 0.3 + velocity * 0.7;
    setVelocity(smoothVelocity);

    // Épaisseur plus importante pour un trait visible
    const baseWidth = 12;
    const maxWidth = 18;
    const minWidth = 6;
    const speedFactor = Math.min(smoothVelocity / 8, 1);
    const brushWidth = baseWidth - speedFactor * (baseWidth - minWidth) * 0.4; // Réduction moins agressive
    const finalWidth = Math.max(
      minWidth,
      Math.min(maxWidth, brushWidth * pressure)
    );

    // Dessiner une ligne lisse entre les deux points
    context.beginPath();
    context.lineWidth = finalWidth;
    context.strokeStyle = `rgba(26, 26, 26, ${0.9})`;
    context.moveTo(lastPoint.x, lastPoint.y);
    context.lineTo(x, y);
    context.stroke();

    // Ajouter des points aux extrémités pour un rendu plus lisse
    context.beginPath();
    context.arc(x, y, finalWidth / 2, 0, Math.PI * 2);
    context.fillStyle = `rgba(26, 26, 26, 0.85)`;
    context.fill();

    setLastPoint({ x, y });
  };

  const startDrawing = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>
    ) => {
      if (!context) return;

      e.preventDefault();
      setIsDrawing(true);
      setVelocity(0);

      const rect = canvasRef.current!.getBoundingClientRect();
      let x, y;

      if ("touches" in e) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }

      setLastPoint({ x, y });

      // Point de départ plus visible
      context.beginPath();
      context.arc(x, y, 6, 0, Math.PI * 2);
      context.fillStyle = "rgba(26, 26, 26, 0.9)";
      context.fill();
    },
    [context]
  );

  const draw = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>
    ) => {
      if (!isDrawing || !context || !lastPoint) return;

      e.preventDefault();

      const rect = canvasRef.current!.getBoundingClientRect();
      let x,
        y,
        pressure = 1;

      if ("touches" in e) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
        // Pression plus stable sur tactile
        pressure = 0.9;
      } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
        pressure = 1.0;
      }

      drawBrushStroke(x, y, pressure);
    },
    [isDrawing, context, lastPoint, velocity]
  );

  const stopDrawingMouse = useCallback(() => {
    if (!isDrawing || !context) return;

    setIsDrawing(false);
    setLastPoint(null);
    setVelocity(0);
  }, [isDrawing, context]);

  const stopDrawingTouch = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();

      if (!isDrawing || !context) return;

      setIsDrawing(false);
      setLastPoint(null);
      setVelocity(0);
    },
    [isDrawing, context]
  );

  const clearCanvas = () => {
    if (!context) return;

    // Fond blanc avec texture légère
    context.fillStyle = "#fefefe";
    context.fillRect(0, 0, width, height);

    // Ajouter une texture papier subtile
    context.fillStyle = "#f8f8f8";
    for (let i = 0; i < width; i += 3) {
      for (let j = 0; j < height; j += 3) {
        if (Math.random() > 0.97) {
          context.fillRect(i, j, 1, 1);
        }
      }
    }
  };

  const getDrawingData = () => {
    if (!canvasRef.current) return null;
    return canvasRef.current.toDataURL();
  };

  // Expose les méthodes via useImperativeHandle si nécessaire
  useEffect(() => {
    if (canvasRef.current) {
      (canvasRef.current as any).clearCanvas = clearCanvas;
      (canvasRef.current as any).getDrawingData = getDrawingData;
    }
  }, [context, width, height]);

  // Effet pour nettoyer le canvas quand clearTrigger change
  useEffect(() => {
    if (clearTrigger > 0) {
      clearCanvas();
    }
  }, [clearTrigger]);

  return (
    <div className={`kanjicanvas-container ${className}`}>
      {/* Canvas principal */}
      <div
        className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-white touch-none"
        style={{
          touchAction: "none", // Empêche le scroll, zoom et autres gestes sur mobile
          userSelect: "none", // Empêche la sélection de texte
        }}
      >
        {/* Grille d'aide (optionnelle) */}
        <div className="absolute inset-0 pointer-events-none">
          <svg width={width} height={height} className="opacity-20">
            {/* Ligne centrale verticale */}
            <line
              x1={width / 2}
              y1="0"
              x2={width / 2}
              y2={height}
              stroke="#ccc"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
            {/* Ligne centrale horizontale */}
            <line
              x1="0"
              y1={height / 2}
              x2={width}
              y2={height / 2}
              stroke="#ccc"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
            {/* Cadre de guidage */}
            <rect
              x={width * 0.1}
              y={height * 0.1}
              width={width * 0.8}
              height={height * 0.8}
              fill="none"
              stroke="#ddd"
              strokeWidth="1"
            />
          </svg>
        </div>

        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="block cursor-crosshair touch-none"
          style={{ touchAction: "none" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawingMouse}
          onMouseLeave={stopDrawingMouse}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawingTouch}
        />
      </div>

      {/* Boutons de contrôle */}
      {showControls && (
        <div className="flex justify-center mt-4">
          <button
            onClick={clearCanvas}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 font-medium"
          >
            🗑️ Effacer
          </button>
        </div>
      )}
    </div>
  );
}
