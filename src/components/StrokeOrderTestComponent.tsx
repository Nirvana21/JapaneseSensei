'use client';

import { useState, useEffect, useRef } from 'react';

// Composant de test pour diagnostiquer les problèmes KanjivgAnimate
export default function StrokeOrderTestComponent() {
  const [testResult, setTestResult] = useState<string>('Test en cours...');
  const [svgContent, setSvgContent] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    testKanjivgAnimate();
  }, []);

  const testKanjivgAnimate = async () => {
    try {
      // Test 1: Récupérer un SVG KanjiVG directement
      setTestResult('Test 1: Récupération SVG...');
      
      const testKanji = '日'; // Kanji simple pour test
      const kanjiCode = testKanji.codePointAt(0)?.toString(16).padStart(5, '0');
      
      // Essayer différentes sources
      const sources = [
        `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${kanjiCode}.svg`,
        `https://kanjivg.tagaini.net/kanjivg/kanji/${kanjiCode}.svg`
      ];

      let svgData = '';
      let sourceUsed = '';

      for (const source of sources) {
        try {
          console.log(`Test récupération depuis: ${source}`);
          const response = await fetch(source);
          if (response.ok) {
            svgData = await response.text();
            sourceUsed = source;
            console.log('SVG récupéré avec succès:', svgData.substring(0, 300));
            break;
          }
        } catch (e) {
          console.log(`Échec source ${source}:`, e);
        }
      }

      if (!svgData) {
        setTestResult('❌ Impossible de récupérer le SVG depuis les sources KanjiVG');
        return;
      }

      setSvgContent(svgData);
      setTestResult(`✅ SVG récupéré depuis: ${sourceUsed}`);

      // Test 2: Tester KanjivgAnimate
      setTimeout(async () => {
        try {
          setTestResult(prev => prev + '\n\nTest 2: Import KanjivgAnimate...');
          
          const KanjivgAnimate = (await import('kanjivganimate')).default;
          console.log('KanjivgAnimate importé:', KanjivgAnimate);
          
          setTestResult(prev => prev + '\n✅ KanjivgAnimate importé avec succès');

          // Test 3: Initialiser l'animation
          setTimeout(() => {
            try {
              setTestResult(prev => prev + '\n\nTest 3: Initialisation animation...');
              
              const svgElement = document.getElementById('test-kanji-svg');
              if (!svgElement) {
                setTestResult(prev => prev + '\n❌ Élément SVG non trouvé');
                return;
              }

              console.log('Élément SVG trouvé:', svgElement);
              
              const animation = new KanjivgAnimate('#test-kanji-svg', 1000);
              console.log('Animation créée:', animation);
              
              setTestResult(prev => prev + '\n✅ Animation initialisée avec succès !\n\n👆 Cliquez sur le kanji ci-dessus pour tester l\'animation');
              
            } catch (animError: any) {
              console.error('Erreur animation:', animError);
              setTestResult(prev => prev + `\n❌ Erreur initialisation animation: ${animError.message}`);
            }
          }, 1000);

        } catch (importError: any) {
          console.error('Erreur import:', importError);
          setTestResult(prev => prev + `\n❌ Erreur import KanjivgAnimate: ${importError.message}`);
        }
      }, 500);

    } catch (error: any) {
      console.error('Erreur test général:', error);
      setTestResult(`❌ Erreur générale: ${error.message}`);
    }
  };

  return (
    <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-bold mb-4">🔧 Test de Debug - Stroke Order Animation</h3>
      
      {/* Zone SVG de test */}
      <div className="mb-6 p-4 bg-white border rounded-lg">
        <h4 className="font-medium mb-2">SVG de test :</h4>
        {svgContent ? (
          <div 
            ref={containerRef}
            className="flex justify-center"
            dangerouslySetInnerHTML={{ 
              __html: svgContent.replace(/<svg([^>]*)>/, '<svg$1 id="test-kanji-svg" class="cursor-pointer">') 
            }}
          />
        ) : (
          <div className="text-gray-500 text-center py-8">Chargement SVG...</div>
        )}
      </div>

      {/* Résultats des tests */}
      <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg">
        <pre>{testResult}</pre>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-blue-800 text-sm">
          <strong>Instructions:</strong>
          <ul className="mt-2 space-y-1">
            <li>• Ce composant teste la récupération et l'animation des SVG KanjiVG</li>
            <li>• Regardez les logs dans la console du navigateur (F12)</li>
            <li>• Si l'animation fonctionne, cliquez sur le kanji pour la tester</li>
          </ul>
        </div>
      </div>
    </div>
  );
}