'use client';

import { useState, useEffect, useRef } from 'react';
import { StrokeOrderService, StrokeOrderData } from '@/services/strokeOrderService';

interface StrokeOrderViewerProps {
  kanji: string;
  className?: string;
  showAnimation?: boolean;
  onLoadComplete?: (success: boolean) => void;
}

export default function StrokeOrderViewer({ 
  kanji, 
  className = '', 
  showAnimation = true,
  onLoadComplete 
}: StrokeOrderViewerProps) {
  const [strokeData, setStrokeData] = useState<StrokeOrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animationLoaded, setAnimationLoaded] = useState(false);
  
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const animationInstanceRef = useRef<any>(null);

  // ID unique pour chaque instance du composant
  const svgId = `stroke-order-${kanji}-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    loadStrokeOrderData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kanji]);

  useEffect(() => {
    if (strokeData && showAnimation && !animationLoaded) {
      loadKanjivgAnimate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokeData, showAnimation, animationLoaded]);

  const loadStrokeOrderData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await StrokeOrderService.fetchStrokeOrderData(kanji);
      
      if (data) {
        setStrokeData(data);
        onLoadComplete?.(true);
      } else {
        // Utiliser un SVG de fallback
        const fallbackSvg = StrokeOrderService.generateFallbackSVG(kanji);
        setStrokeData({
          kanji,
          svgData: fallbackSvg,
          strokeCount: 0,
          hasAnimation: false
        });
        onLoadComplete?.(false);
      }
    } catch (err) {
      setError('Erreur lors du chargement des données stroke order');
      console.error(err);
      onLoadComplete?.(false);
    } finally {
      setLoading(false);
    }
  };

  const loadKanjivgAnimate = async () => {
    try {
      console.log('Tentative chargement KanjivgAnimate...');
      
      // Charger dynamiquement KanjivgAnimate
      const KanjivgAnimate = (await import('kanjivganimate')).default;
      console.log('KanjivgAnimate importé:', KanjivgAnimate);
      
      if (svgContainerRef.current) {
        // Nettoyer l'animation précédente
        if (animationInstanceRef.current) {
          animationInstanceRef.current = null;
        }

        // Attendre que le DOM soit mis à jour
        setTimeout(() => {
          const svgElement = document.getElementById(svgId);
          console.log('Élément SVG trouvé:', svgElement);
          
          if (svgElement) {
            try {
              console.log(`Initialisation animation pour #${svgId}...`);
              animationInstanceRef.current = new KanjivgAnimate(`#${svgId}`, 800);
              setAnimationLoaded(true);
              console.log(`Animation KanjiVG initialisée pour ${kanji}`);
            } catch (animError) {
              console.error('Erreur initialisation animation:', animError);
            }
          } else {
            console.error('SVG élément non trouvé avec ID:', svgId);
          }
        }, 500); // Augmenter le délai
      }
    } catch (err) {
      console.error('KanjivgAnimate non disponible:', err);
    }
  };

  const handleManualAnimate = () => {
    console.log('Tentative animation manuelle...');
    
    if (animationInstanceRef.current) {
      console.log('Instance animation trouvée, déclenchement...');
      // Déclencher l'animation manuellement
      const svgElement = document.getElementById(svgId);
      if (svgElement) {
        console.log('Élément SVG trouvé, clic simulé');
        svgElement.click();
      } else {
        console.error('Élément SVG non trouvé pour animation:', svgId);
      }
    } else {
      console.warn('Instance animation non disponible, rechargement...');
      // Essayer de recharger l'animation
      if (strokeData && showAnimation) {
        loadKanjivgAnimate();
      }
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 text-sm">Chargement stroke order...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2">
          <span className="text-red-600 text-sm">⚠️</span>
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (!strokeData) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <span className="text-gray-600 text-sm">Aucune donnée stroke order disponible</span>
      </div>
    );
  }

  const optimizedSvg = StrokeOrderService.optimizeSVGForDisplay(strokeData.svgData);
  const svgWithId = StrokeOrderService.prepareForAnimation(optimizedSvg, svgId);

  return (
    <div className={`stroke-order-viewer ${className}`}>
      {/* Header avec informations */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h4 className="font-medium text-gray-800">
            Ordre des traits
          </h4>
          {strokeData.strokeCount > 0 && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
              {strokeData.strokeCount} traits
            </span>
          )}
        </div>
        
        {strokeData.hasAnimation && showAnimation && (
          <button
            onClick={handleManualAnimate}
            disabled={!animationLoaded}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              animationLoaded
                ? 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer'
                : 'bg-gray-100 text-gray-500 cursor-not-allowed'
            }`}
            title={animationLoaded ? 'Cliquer pour animer' : 'Animation en cours de chargement...'}
          >
            {animationLoaded ? '▶️ Animer' : '⏳ Chargement...'}
          </button>
        )}
      </div>

      {/* Conteneur SVG */}
      <div 
        ref={svgContainerRef}
        className="stroke-order-container bg-white border-2 border-gray-200 rounded-lg p-4 flex items-center justify-center"
        style={{ minHeight: '120px' }}
      >
        <div 
          dangerouslySetInnerHTML={{ __html: svgWithId }}
          className="stroke-order-svg"
        />
      </div>

      {/* Informations additionnelles */}
      <div className="mt-2 text-xs text-gray-500 space-y-1">
        {strokeData.hasAnimation && showAnimation ? (
          <div className="flex items-center gap-1">
            <span>💡</span>
            <span>Cliquez sur le kanji ou le bouton &quot;Animer&quot; pour voir l&apos;ordre des traits</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <span>ℹ️</span>
            <span>Affichage statique de l&apos;ordre des traits</span>
          </div>
        )}
        
        {!strokeData.hasAnimation && (
          <div className="text-amber-600">
            <span>⚠️ Animation non disponible pour ce caractère</span>
          </div>
        )}
      </div>
    </div>
  );
}