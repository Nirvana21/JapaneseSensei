'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface KanjiCanvasProps {
  width?: number;
  height?: number;
  onDrawingComplete?: (imageData: string) => void;
  className?: string;
}

export default function KanjiCanvas({ 
  width = 300, 
  height = 300, 
  onDrawingComplete,
  className = '' 
}: KanjiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuration du contexte de dessin
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Fond blanc
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    setContext(ctx);
  }, [width, height]);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!context) return;
    
    setIsDrawing(true);
    
    const rect = canvasRef.current!.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    context.beginPath();
    context.moveTo(x, y);
  }, [context]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;
    
    const rect = canvasRef.current!.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      e.preventDefault(); // Empêcher le scroll sur mobile
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    context.lineTo(x, y);
    context.stroke();
  }, [isDrawing, context]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing || !context) return;
    
    setIsDrawing(false);
    context.beginPath();
    
    // Optionnel: notifier que le dessin est terminé
    if (onDrawingComplete && canvasRef.current) {
      const imageData = canvasRef.current.toDataURL();
      onDrawingComplete(imageData);
    }
  }, [isDrawing, context, onDrawingComplete]);

  const clearCanvas = () => {
    if (!context) return;
    
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
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

  return (
    <div className={`kanjicanvas-container ${className}`}>
      {/* Canvas principal */}
      <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
        {/* Grille d'aide (optionnelle) */}
        <div className="absolute inset-0 pointer-events-none">
          <svg width={width} height={height} className="opacity-20">
            {/* Ligne centrale verticale */}
            <line 
              x1={width/2} y1="0" 
              x2={width/2} y2={height} 
              stroke="#ccc" 
              strokeWidth="1" 
              strokeDasharray="5,5"
            />
            {/* Ligne centrale horizontale */}
            <line 
              x1="0" y1={height/2} 
              x2={width} y2={height/2} 
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
          className="block cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* Boutons de contrôle */}
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          🗑️ Effacer
        </button>
        
        <button
          onClick={() => {
            if (onDrawingComplete) {
              const data = getDrawingData();
              if (data) onDrawingComplete(data);
            }
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          💾 Sauvegarder
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-2 text-center">
        <p className="text-sm text-gray-600">
          ✏️ Dessinez le kanji avec votre souris ou votre doigt
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Utilisez les lignes de guidage pour respecter les proportions
        </p>
      </div>
    </div>
  );
}