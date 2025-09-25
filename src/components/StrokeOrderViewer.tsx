'use client';

import { useState, useEffect } from 'react';
import { StrokeOrderService, StrokeOrderData } from '@/services/strokeOrderService';

interface StrokeOrderViewerProps {
  kanji: string;
  className?: string;
  onLoadComplete?: (success: boolean) => void;
}

export default function StrokeOrderViewer({ 
  kanji, 
  className = '',
  onLoadComplete 
}: StrokeOrderViewerProps) {
  const [strokeData, setStrokeData] = useState<StrokeOrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStrokeOrder = async () => {
      if (!kanji) return;

      setLoading(true);
      setError(null);
      
      try {
        console.log(`Chargement stroke order pour: ${kanji}`);
        const data = await StrokeOrderService.fetchStrokeOrderData(kanji);
        
        if (data) {
          setStrokeData(data);
          console.log(`✅ Stroke order chargé pour ${kanji}`);
          onLoadComplete?.(true);
        } else {
          setError('Ordre des traits non disponible');
          console.log(`❌ Pas de stroke order trouvé pour ${kanji}`);
          onLoadComplete?.(false);
        }
      } catch (err: any) {
        console.error('Erreur chargement stroke order:', err);
        setError(err.message || 'Erreur de chargement');
        onLoadComplete?.(false);
      } finally {
        setLoading(false);
      }
    };

    loadStrokeOrder();
  }, [kanji, onLoadComplete]);

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-sm text-gray-500 mt-2">Chargement...</p>
      </div>
    );
  }

  if (error || !strokeData) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 text-gray-500 ${className}`}>
        <div className="text-4xl mb-2">❌</div>
        <p className="text-xs text-center">{error || 'Pas d\'ordre des traits'}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* SVG Stroke Order */}
      <div className="bg-white border border-gray-200 rounded-lg flex items-center justify-center p-4">
        <div 
          className="stroke-order-svg max-w-full max-h-full"
          dangerouslySetInnerHTML={{ __html: strokeData.svgData }}
          style={{
            width: '200px',
            height: '200px'
          }}
        />
      </div>

      {/* Informations */}
      <div className="mt-2 text-center">
        <div className="text-sm text-gray-600">
          📝 {strokeData.strokeCount} traits
        </div>
      </div>
    </div>
  );
}