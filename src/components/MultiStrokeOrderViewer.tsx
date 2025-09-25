'use client';

import { useState, useEffect } from 'react';
import { StrokeOrderService, MultiStrokeOrderData } from '@/services/strokeOrderService';
import StrokeOrderViewer from './StrokeOrderViewer';

interface MultiStrokeOrderViewerProps {
  text: string;
  className?: string;
  onLoadComplete?: (success: boolean) => void;
}

export default function MultiStrokeOrderViewer({ 
  text, 
  className = '',
  onLoadComplete 
}: MultiStrokeOrderViewerProps) {
  const [multiStrokeData, setMultiStrokeData] = useState<MultiStrokeOrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMultiStrokeOrderData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const loadMultiStrokeOrderData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Chargement stroke order pour texte: "${text}"`);
      const data = await StrokeOrderService.fetchMultipleStrokeOrderData(text);
      
      if (data.kanjis && data.kanjis.length > 0) {
        setMultiStrokeData(data);
        console.log(`✅ Données chargées pour ${data.kanjis.length} kanji(s):`, data);
        onLoadComplete?.(true);
      } else {
        console.log(`❌ Aucun kanji trouvé dans "${text}"`);
        setError('Aucun kanji trouvé dans ce texte');
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

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-sm text-gray-500">Chargement de l&apos;ordre des traits...</p>
      </div>
    );
  }

  if (error || !multiStrokeData) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 text-gray-500 ${className}`}>
        <div className="text-6xl mb-4">❌</div>
        <p className="text-center">{error || 'Aucune donnée disponible'}</p>
      </div>
    );
  }

  const { kanjis } = multiStrokeData;

  return (
    <div className={`stroke-order-container ${className}`}>
      {/* En-tête avec informations */}
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Ordre des traits - {text}
        </h3>
        <p className="text-sm text-gray-600">
          {kanjis.length} kanji{kanjis.length > 1 ? 's' : ''} • 
          {kanjis.reduce((total: number, k: any) => total + k.strokeCount, 0)} traits au total
        </p>
      </div>

      {/* Affichage unique pour un seul kanji */}
      {kanjis.length === 1 && (
        <div className="flex justify-center">
          <StrokeOrderViewer
            kanji={kanjis[0].kanji}
            className="w-full max-w-sm"
          />
        </div>
      )}

      {/* Affichage grille pour plusieurs kanjis */}
      {kanjis.length > 1 && (
        <div className="space-y-6">
          {/* Grille responsive */}
          <div className={`grid gap-4 ${
            kanjis.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
            kanjis.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {kanjis.map((kanjiData: any, index: number) => (
              <div key={`kanji-${index}-${kanjiData.kanji}`} className="flex flex-col items-center">
                <div className="mb-2">
                  <span className="text-lg font-medium text-gray-700">
                    {kanjiData.kanji}
                  </span>
                </div>
                <StrokeOrderViewer
                  kanji={kanjiData.kanji}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          {/* Informations supplémentaires */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">💡 Conseil d&apos;étude</h4>
            <p className="text-sm text-blue-700">
              Pour bien mémoriser, pratiquez d&apos;abord chaque kanji individuellement, 
              puis écrivez le mot complet &quot;{text}&quot; en respectant l&apos;ordre des traits.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}