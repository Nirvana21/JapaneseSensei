'use client';

import { useState, useEffect } from 'react';
import { StrokeOrderService, MultiStrokeOrderData } from '@/services/strokeOrderService';
import StrokeOrderViewer from './StrokeOrderViewer';

interface MultiStrokeOrderViewerProps {
  text: string;
  className?: string;
  showAnimation?: boolean;
  onLoadComplete?: (success: boolean) => void;
}

export default function MultiStrokeOrderViewer({ 
  text, 
  className = '', 
  showAnimation = true,
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

      console.log(`Chargement stroke order pour le texte: "${text}"`);
      const data = await StrokeOrderService.fetchMultipleStrokeOrderData(text);
      
      setMultiStrokeData(data);
      onLoadComplete?.(data.kanjis.length > 0);
      
    } catch (err) {
      setError('Erreur lors du chargement des données stroke order');
      console.error(err);
      onLoadComplete?.(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 text-sm">Chargement stroke orders...</span>
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

  if (!multiStrokeData || multiStrokeData.kanjis.length === 0) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <span className="text-gray-600 text-sm">Aucun kanji trouvé dans &quot;{text}&quot;</span>
      </div>
    );
  }

  return (
    <div className={`multi-stroke-order-viewer ${className}`}>
      {/* Header avec informations générales */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h4 className="font-medium text-gray-800">
            Ordre des traits
          </h4>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
              {multiStrokeData.kanjis.length} kanji(s)
            </span>
            {multiStrokeData.totalStrokes > 0 && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                {multiStrokeData.totalStrokes} traits total
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Décomposition du texte original */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-blue-800 font-medium text-sm">Décomposition de &quot;{multiStrokeData.originalText}&quot; :</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {multiStrokeData.kanjis.map((kanjiData, index) => (
            <div key={index} className="flex items-center gap-1">
              <span className="text-2xl font-bold text-blue-700">{kanjiData.kanji}</span>
              {kanjiData.strokeCount > 0 && (
                <span className="text-xs text-blue-600 bg-blue-100 px-1 rounded">
                  {kanjiData.strokeCount}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Grille des stroke orders individuels */}
      <div className="grid gap-6">
        {multiStrokeData.kanjis.length === 1 ? (
          // Un seul kanji : affichage normal
          <StrokeOrderViewer 
            kanji={multiStrokeData.kanjis[0].kanji}
            className="w-full"
            showAnimation={showAnimation}
          />
        ) : (
          // Plusieurs kanjis : disposition en grille
          <div className={`grid gap-4 ${
            multiStrokeData.kanjis.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 
            multiStrokeData.kanjis.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {multiStrokeData.kanjis.map((kanjiData, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="text-center mb-3">
                  <span className="text-3xl font-bold text-gray-800">{kanjiData.kanji}</span>
                  {kanjiData.strokeCount > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Kanji {index + 1} • {kanjiData.strokeCount} traits
                    </div>
                  )}
                </div>
                <StrokeOrderViewer 
                  kanji={kanjiData.kanji}
                  className="w-full"
                  showAnimation={showAnimation}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conseils d'utilisation */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="text-amber-600 text-sm">💡</span>
          <div className="text-amber-800 text-sm">
            <div className="font-medium mb-1">Conseils pour l&apos;étude :</div>
            <ul className="text-xs space-y-1">
              <li>• Étudiez chaque kanji individuellement avant de passer au suivant</li>
              <li>• Répétez l&apos;animation plusieurs fois pour mémoriser l&apos;ordre</li>
              <li>• Entraînez-vous à tracer chaque kanji sur papier</li>
              {multiStrokeData.kanjis.length > 1 && (
                <li>• Pratiquez l&apos;écriture du mot complet &quot;{multiStrokeData.originalText}&quot;</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}