"use client";

import { useState, useEffect, useRef } from "react";
import AddKanjiForm from "@/components/AddKanjiForm";
import KanjiList from "@/components/KanjiList";
import EditKanjiModal from "@/components/EditKanjiModal";
import { useKanjis } from "@/hooks/useKanjis";
import { KanjiEntry } from "@/types/kanji";

// Simple test inline pour debug l'animation
function AnimationDebugTest() {
  const [svgContent, setSvgContent] = useState<string>('');
  const [testStatus, setTestStatus] = useState<string>('Prêt à tester...');

  const testAnimation = async () => {
    try {
      setTestStatus('Chargement SVG...');
      
      // Test avec le kanji 日
      const response = await fetch('https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/065e5.svg');
      if (!response.ok) throw new Error('Échec chargement SVG');
      
      const svgData = await response.text();
      setSvgContent(svgData);
      setTestStatus('SVG chargé! Attente KanjivgAnimate...');

      // Import dynamique de KanjivgAnimate
      setTimeout(async () => {
        try {
          const KanjivgAnimate = (await import('kanjivganimate')).default;
          setTestStatus('Bibliothèque importée! Animation prête.');
          
          // Attacher l'animation à l'élément SVG
          setTimeout(() => {
            const svgElement = document.querySelector('#debug-svg');
            if (svgElement) {
              const animation = new KanjivgAnimate('#debug-svg', 1500);
              setTestStatus('✅ Animation créée! Cliquez sur le kanji pour tester.');
              console.log('Animation créée:', animation);
            } else {
              setTestStatus('❌ Élément SVG non trouvé.');
            }
          }, 500);
          
        } catch (error: any) {
          setTestStatus(`❌ Erreur import: ${error.message}`);
          console.error('Erreur animation:', error);
        }
      }, 1000);
      
    } catch (error: any) {
      setTestStatus(`❌ Erreur: ${error.message}`);
      console.error('Erreur test:', error);
    }
  };

  return (
    <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-bold mb-4 text-yellow-800">🔧 Test Debug Animation</h3>
      
      <div className="mb-4">
        <button 
          onClick={testAnimation}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Tester Animation Kanji 日
        </button>
      </div>

      <div className="text-sm mb-4 text-gray-600">
        Status: <span className="font-mono">{testStatus}</span>
      </div>

      {svgContent && (
        <div className="flex justify-center mb-4">
          <div 
            id="debug-svg"
            className="cursor-pointer"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>
      )}

      <div className="text-xs text-yellow-700">
        Instructions: Cliquez sur "Tester Animation", puis cliquez sur le kanji affiché pour voir l'animation.
        Ouvrez la console (F12) pour voir les logs détaillés.
      </div>
    </div>
  );
}

export default function Home() {
  const [editingKanji, setEditingKanji] = useState<KanjiEntry | null>(null);
  const { kanjis, loading, error, updateKanji, deleteKanji, refreshKanjis } = useKanjis();

  const handleEdit = (kanji: KanjiEntry) => {
    setEditingKanji(kanji);
  };

  const handleSaveEdit = async (updatedKanji: KanjiEntry) => {
    await updateKanji(updatedKanji);
    setEditingKanji(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce kanji ?")) {
      await deleteKanji(id);
    }
  };

  const handleKanjiAdded = () => {
    refreshKanjis();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Japanese Sensei 🇯🇵 - Debug Animation
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug Component */}
        <AnimationDebugTest />

        <AddKanjiForm onKanjiAdded={handleKanjiAdded} />

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Votre collection de kanjis
          </h2>
          <KanjiList
            kanjis={kanjis}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </main>

      <EditKanjiModal
        kanji={editingKanji}
        isOpen={!!editingKanji}
        onClose={() => setEditingKanji(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}